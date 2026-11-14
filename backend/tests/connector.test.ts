import crypto from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { product } from "../src/db.js";
import {
  api,
  createAdmin,
  createProduct,
  resetTestDb,
  startTestDb,
  stopTestDb,
} from "./helpers.js";

// The connector reuses the Cloudinary upload service; mock the network call.
vi.mock("../src/config/uploadImages.js", () => ({
  uploadProductImages: async (files: Array<{ buffer: Buffer }>) =>
    files.map(
      (_file, index) =>
        `https://cdn.quickwish.test/products/mock-${index}.jpg`
    ),
  default: {},
}));

const READ_KEY = "qw-connector-read-key";
const WRITE_KEY = "qw-connector-write-key";

const sha256 = (value: string): string =>
  crypto.createHash("sha256").update(value, "utf8").digest("hex");

const asConnector = (key = WRITE_KEY) => ({ Authorization: `Bearer ${key}` });

const validDraft = {
  name: "Sunrise Rose Bouquet",
  category: "Flower Bouquets",
  description: "A dozen fresh red roses hand-tied with seasonal greens.",
  price: 1299,
  mrp: 1599,
  sku: "QW-ROSE-001",
  stock: 12,
  tags: ["roses", "same-day"],
  seo: {
    title: "Sunrise Rose Bouquet | QuickWish",
    description: "Order a dozen fresh roses with same-day delivery.",
    keywords: ["rose bouquet", "same day roses"],
  },
  images: [
    {
      url: "https://cdn.quickwish.test/products/rose.jpg",
      alt: "Dozen red roses in kraft paper",
    },
  ],
};

const createDraft = async (overrides: Record<string, unknown> = {}) => {
  const response = await api()
    .post("/api/v1/connector/products")
    .set(asConnector())
    .send({ ...validDraft, ...overrides });

  return response;
};

beforeAll(async () => {
  process.env.CONNECTOR_API_KEYS = JSON.stringify([
    {
      id: "chatgpt-writer",
      sha256: sha256(WRITE_KEY),
      scopes: ["products:read", "products:write"],
    },
    {
      id: "chatgpt-reader",
      sha256: sha256(READ_KEY),
      scopes: ["products:read"],
    },
  ]);
  delete process.env.CONNECTOR_API_KEY;

  await startTestDb();
});

beforeEach(async () => {
  await resetTestDb();
});

afterAll(async () => {
  await stopTestDb();
});

describe("connector authentication", () => {
  it("rejects requests without an API key", async () => {
    const response = await api().get("/api/v1/connector/products");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("CONNECTOR_UNAUTHENTICATED");
  });

  it("never accepts an admin JWT as connector credentials", async () => {
    const admin = await createAdmin();
    const response = await api()
      .post("/api/v1/connector/products")
      .set("Authorization", `Bearer ${admin.token}`)
      .send(validDraft);

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("CONNECTOR_UNAUTHENTICATED");
  });

  it("enforces scopes: a read-only key cannot write", async () => {
    const read = await api()
      .get("/api/v1/connector/products")
      .set(asConnector(READ_KEY));
    expect(read.status).toBe(200);

    const write = await api()
      .post("/api/v1/connector/products")
      .set(asConnector(READ_KEY))
      .send(validDraft);

    expect(write.status).toBe(403);
    expect(write.body.code).toBe("CONNECTOR_SCOPE_REQUIRED");
  });

  it("fails closed when connector keys are not configured", async () => {
    const original = process.env.CONNECTOR_API_KEYS;
    delete process.env.CONNECTOR_API_KEYS;

    try {
      const response = await api()
        .get("/api/v1/connector/products")
        .set(asConnector());
      expect(response.status).toBe(503);
      expect(response.body.code).toBe("CONNECTOR_NOT_CONFIGURED");
    } finally {
      if (original) {
        process.env.CONNECTOR_API_KEYS = original;
      }
    }
  });
});

describe("draft creation", () => {
  it("creates products as drafts that stay off the public storefront", async () => {
    const response = await createDraft();
    expect(response.status).toBe(201);
    expect(response.body.product.status).toBe("draft");

    const productId = response.body.product.id;
    expect(response.body.product.sku).toBe("QW-ROSE-001");
    expect(response.body.product.slug).toBe("sunrise-rose-bouquet");
    expect(response.body.product.mrp).toBe(1599);
    expect(response.body.product.images).toHaveLength(1);
    expect(response.body.product.images[0].alt).toBe("Dozen red roses in kraft paper");

    const publicList = await api().get("/api/v1/product");
    const publicIds = publicList.body.products.map((item: any) => String(item._id));
    expect(publicIds).not.toContain(productId);

    const publicDetail = await api().get(`/api/v1/product/${productId}`);
    expect(publicDetail.status).toBe(404);

    const connectorDetail = await api()
      .get(`/api/v1/connector/products/${productId}`)
      .set(asConnector(READ_KEY));
    expect(connectorDetail.status).toBe(200);
    expect(connectorDetail.body.product.status).toBe("draft");
  });

  it("rejects a non-draft status at creation time", async () => {
    const response = await createDraft({ status: "published" });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("USE_PUBLISH_ENDPOINT");
  });

  it("rejects unknown categories", async () => {
    const response = await createDraft({ category: "Spaceships" });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_CATEGORY");
  });

  it("rejects mrp below price and duplicate skus", async () => {
    const badMrp = await createDraft({ mrp: 10 });
    expect(badMrp.status).toBe(400);
    expect(badMrp.body.code).toBe("INVALID_MRP");

    const first = await createDraft();
    expect(first.status).toBe(201);

    const duplicate = await createDraft({ name: "Another Bouquet", slug: "another-bouquet" });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.code).toBe("SKU_CONFLICT");
  });

  it("defaults stock and requires name, category and price", async () => {
    const missing = await api()
      .post("/api/v1/connector/products")
      .set(asConnector())
      .send({ name: "No price" });
    expect(missing.status).toBe(400);
    expect(missing.body.code).toBe("INVALID_CATEGORY");
  });
});

describe("publish action", () => {
  it("publishes a draft and makes it visible on the storefront", async () => {
    const created = await createDraft();
    const productId = created.body.product.id;

    const published = await api()
      .post(`/api/v1/connector/products/${productId}/publish`)
      .set(asConnector())
      .send({});

    expect(published.status).toBe(200);
    expect(published.body.product.status).toBe("published");
    expect(published.body.product.publishedAt).toBeTruthy();

    const publicList = await api().get("/api/v1/product");
    const publicIds = publicList.body.products.map((item: any) => String(item._id));
    expect(publicIds).toContain(productId);

    const publicDetail = await api().get(`/api/v1/product/${productId}`);
    expect(publicDetail.status).toBe(200);

    const again = await api()
      .post(`/api/v1/connector/products/${productId}/publish`)
      .set(asConnector())
      .send({});
    expect(again.status).toBe(200);
  });

  it("blocks publishing a product without an image until one is attached", async () => {
    const created = await createDraft({ images: [] });
    const productId = created.body.product.id;

    const blocked = await api()
      .post(`/api/v1/connector/products/${productId}/publish`)
      .set(asConnector())
      .send({});

    expect(blocked.status).toBe(400);
    expect(blocked.body.code).toBe("PUBLISH_VALIDATION_FAILED");
    expect(blocked.body.issues).toContain("at least one image is required");

    const attached = await api()
      .post(`/api/v1/connector/products/${productId}/images/attach`)
      .set(asConnector())
      .send({
        url: "https://cdn.quickwish.test/products/rose.jpg",
        alt: "Dozen red roses",
      });
    expect(attached.status).toBe(201);

    const published = await api()
      .post(`/api/v1/connector/products/${productId}/publish`)
      .set(asConnector())
      .send({});
    expect(published.status).toBe(200);
  });

  it("rejects publishing an unknown product", async () => {
    const response = await api()
      .post("/api/v1/connector/products/does-not-exist/publish")
      .set(asConnector())
      .send({});
    expect(response.status).toBe(404);
  });
});

describe("product updates", () => {
  it("updates pricing, inventory, tags, SEO and variants", async () => {
    const created = await createDraft();
    const productId = created.body.product.id;

    const response = await api()
      .patch(`/api/v1/connector/products/${productId}`)
      .set(asConnector())
      .send({
        price: 1199,
        mrp: 1499,
        stock: 20,
        tags: ["roses", "premium"],
        seo: {
          title: "Sunrise Roses | QuickWish",
          description: "Premium roses delivered same day.",
          keywords: ["premium roses"],
        },
        variants: [
          {
            sku: "QW-ROSE-001-24",
            name: "24 roses",
            price: 2199,
            mrp: 2599,
            stock: 4,
            attributes: [{ name: "Size", value: "24 stems" }],
          },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.product.price).toBe(1199);
    expect(response.body.product.mrp).toBe(1499);
    expect(response.body.product.stock).toBe(20);
    expect(response.body.product.tags).toContain("premium");
    expect(response.body.product.seo.title).toBe("Sunrise Roses | QuickWish");
    expect(response.body.product.variants).toHaveLength(1);
    expect(response.body.product.variants[0].sku).toBe("QW-ROSE-001-24");
    expect(response.body.product.variants[0].mrp).toBe(2599);
  });

  it("refuses status changes through update", async () => {
    const created = await createDraft();
    const response = await api()
      .patch(`/api/v1/connector/products/${created.body.product.id}`)
      .set(asConnector())
      .send({ status: "published" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("USE_PUBLISH_ENDPOINT");
  });

  it("validates mrp against the existing price and variant skus", async () => {
    const created = await createDraft();
    const productId = created.body.product.id;

    const badMrp = await api()
      .patch(`/api/v1/connector/products/${productId}`)
      .set(asConnector())
      .send({ mrp: 100 });
    expect(badMrp.status).toBe(400);
    expect(badMrp.body.code).toBe("INVALID_MRP");

    const badVariants = await api()
      .patch(`/api/v1/connector/products/${productId}`)
      .set(asConnector())
      .send({
        variants: [
          { sku: "DUP-1", price: 100 },
          { sku: "DUP-1", price: 200 },
        ],
      });
    expect(badVariants.status).toBe(400);
    expect(badVariants.body.code).toBe("INVALID_VARIANTS");
  });

  it("rejects skus already used by another product", async () => {
    await createDraft();
    const second = await createDraft({ name: "Second Gift", sku: undefined });

    const response = await api()
      .patch(`/api/v1/connector/products/${second.body.product.id}`)
      .set(asConnector())
      .send({ sku: "QW-ROSE-001" });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("SKU_CONFLICT");
  });
});

describe("images", () => {
  it("uploads images with alt text through the shared upload service", async () => {
    const created = await createDraft({ images: [] });
    const productId = created.body.product.id;

    const response = await api()
      .post(`/api/v1/connector/products/${productId}/images`)
      .set(asConnector())
      .field("alts", JSON.stringify(["Uploaded bouquet alt"]))
      .attach("images", Buffer.from("fake-image-bytes"), {
        filename: "bouquet.jpg",
        contentType: "image/jpeg",
      });

    expect(response.status).toBe(201);
    expect(response.body.images).toHaveLength(1);
    expect(response.body.images[0].url).toContain("mock-0.jpg");
    expect(response.body.images[0].alt).toBe("Uploaded bouquet alt");

    const stored = await product.findById(productId).lean();
    expect(stored?.images).toEqual(["https://cdn.quickwish.test/products/mock-0.jpg"]);
  });

  it("attaches, reorders and sets alt text on images", async () => {
    const created = await createDraft();
    const productId = created.body.product.id;
    const secondUrl = "https://cdn.quickwish.test/products/rose-2.jpg";

    const attached = await api()
      .post(`/api/v1/connector/products/${productId}/images/attach`)
      .set(asConnector())
      .send({ url: secondUrl, alt: "Second angle" });
    expect(attached.status).toBe(201);
    expect(attached.body.images).toHaveLength(2);

    const reordered = await api()
      .put(`/api/v1/connector/products/${productId}/images/reorder`)
      .set(asConnector())
      .send({ urls: [secondUrl, "https://cdn.quickwish.test/products/rose.jpg"] });
    expect(reordered.status).toBe(200);
    expect(reordered.body.images[0].url).toBe(secondUrl);
    expect(reordered.body.images[1].url).toBe(
      "https://cdn.quickwish.test/products/rose.jpg"
    );

    const alt = await api()
      .patch(`/api/v1/connector/products/${productId}/images/0`)
      .set(asConnector())
      .send({ alt: "Bouquet hero shot" });
    expect(alt.status).toBe(200);
    expect(alt.body.images[0].alt).toBe("Bouquet hero shot");

    const incomplete = await api()
      .put(`/api/v1/connector/products/${productId}/images/reorder`)
      .set(asConnector())
      .send({ urls: [secondUrl] });
    expect(incomplete.status).toBe(400);
    expect(incomplete.body.code).toBe("INVALID_IMAGE_ORDER");
  });

  it("rejects attaching the same image twice", async () => {
    const created = await createDraft();
    const response = await api()
      .post(`/api/v1/connector/products/${created.body.product.id}/images/attach`)
      .set(asConnector())
      .send({ url: validDraft.images[0].url });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("IMAGE_ALREADY_ATTACHED");
  });
});

describe("taxonomy and documentation", () => {
  it("lists the schema categories with counts", async () => {
    await createDraft();
    await createProduct({ category: "Cakes" });

    const response = await api()
      .get("/api/v1/connector/categories")
      .set(asConnector(READ_KEY));

    expect(response.status).toBe(200);
    const categories = response.body.categories;
    const bouquet = categories.find(
      (category: any) => category.name === "Flower Bouquets"
    );
    const cakes = categories.find((category: any) => category.name === "Cakes");

    expect(bouquet).toMatchObject({ productCount: 1, publishedCount: 0 });
    expect(cakes).toMatchObject({ productCount: 1, publishedCount: 1 });
  });

  it("lists existing tags", async () => {
    await createDraft();
    const response = await api()
      .get("/api/v1/connector/tags")
      .set(asConnector(READ_KEY));

    expect(response.status).toBe(200);
    expect(response.body.tags).toContain("roses");
    expect(response.body.tags).toContain("same-day");
  });

  it("serves the OpenAPI document without a key", async () => {
    const response = await api().get("/api/v1/connector/openapi.json");
    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.1.0");
    expect(response.body.servers[0]).toMatchObject({ url: "https://api.quickwish.shop" });
    expect(response.body.paths["/api/v1/connector/products"]).toBeTruthy();
    expect(response.body.paths["/api/v1/connector/products/{productId}/publish"]).toBeTruthy();
  });
});
