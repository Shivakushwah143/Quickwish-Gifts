import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PRODUCT_CATEGORIES, product } from "../src/db.js";
import {
  api,
  createProduct,
  resetTestDb,
  startTestDb,
  stopTestDb,
} from "./helpers.js";

import { configureAuth0, issueAuth0Token } from "./auth0Helpers.js";
import { vi } from "vitest";

let READ_KEY: string;
let WRITE_KEY: string;

let nextId = 1;

type RpcBody = {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: Record<string, unknown>;
};

const rpc = async (
  body: RpcBody,
  key: string | null = WRITE_KEY,
  extraHeaders: Record<string, string> = {}
) => {
  const request = api()
    .post("/mcp")
    .set("Accept", "application/json, text/event-stream");

  if (key) {
    request.set("Authorization", `Bearer ${key}`);
  }

  for (const [name, value] of Object.entries(extraHeaders)) {
    request.set(name, value);
  }

  return request.send(body);
};

const initialize = (key: string | null = null) =>
  rpc({
    jsonrpc: "2.0",
    id: nextId++,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "vitest", version: "1.0.0" },
    },
  }, key);

const listTools = () =>
  rpc(
    { jsonrpc: "2.0", id: nextId++, method: "tools/list", params: {} },
    null,
    { "MCP-Protocol-Version": "2025-06-18" }
  );

const callTool = (
  name: string,
  args: Record<string, unknown>,
  key: string = WRITE_KEY
) =>
  rpc(
    {
      jsonrpc: "2.0",
      id: nextId++,
      method: "tools/call",
      params: { name, arguments: args },
    },
    key,
    { "MCP-Protocol-Version": "2025-06-18" }
  );

const validDraft = {
  name: "MCP Rose Bouquet",
  category: "Flower Bouquets",
  description: "A dozen fresh roses created through the MCP endpoint.",
  price: 1299,
  sku: "QW-MCP-001",
  stock: 8,
  tags: ["roses", "mcp"],
  images: [
    {
      url: "https://cdn.quickwish.test/products/mcp-rose.jpg",
      alt: "Dozen red roses",
    },
  ],
};

type ToolContent = Array<{ type: string; text?: string }>;

const toolText = (result: { content?: ToolContent }): string =>
  result.content?.map((item) => item.text ?? "").join("\n") ?? "";

beforeAll(async () => {
  await configureAuth0();
  await startTestDb();
  READ_KEY = await issueAuth0Token("products:read");
  WRITE_KEY = await issueAuth0Token("products:read products:write");
});

beforeEach(async () => {
  await resetTestDb();
});

afterAll(async () => {
  vi.unstubAllGlobals();
  await stopTestDb();
});

describe("MCP initialization", () => {
  it("completes the initialize handshake over Streamable HTTP", async () => {
    const response = await initialize();

    expect(response.status).toBe(200);
    expect(response.body.jsonrpc).toBe("2.0");
    expect(response.body.result.serverInfo.name).toBe("quickwish-connector");
    expect(response.body.result.protocolVersion).toBeTruthy();
    expect(response.body.result.capabilities.tools).toBeTruthy();
  });
});

describe("MCP tool discovery", () => {
  it("exposes exactly the connector tools with descriptions and schemas", async () => {
    const response = await listTools();

    expect(response.status).toBe(200);

    const tools: Array<{
      name: string;
      description?: string;
      inputSchema?: { type?: string; properties?: Record<string, unknown> };
    }> = response.body.result.tools;

    expect(tools.map((tool) => tool.name).sort()).toEqual(
      [
        "attachProductImage",
        "createProductDraft",
        "getProduct",
        "listCategories",
        "listProducts",
        "listTags",
        "publishProduct",
        "reorderProductImages",
        "updateImageAltText",
        "updateProduct",
        "uploadProductImages",
      ].sort()
    );

    for (const tool of tools) {
      expect(typeof tool.description).toBe("string");
      expect((tool.description ?? "").length).toBeGreaterThan(20);
      expect(tool.inputSchema?.type).toBe("object");
      const scope = ["listProducts", "getProduct", "listCategories", "listTags"].includes(tool.name) ? "products:read" : "products:write";
      expect((tool as any).securitySchemes).toEqual([{ type: "oauth2", scopes: [scope] }]);
      expect((tool as any)._meta.securitySchemes).toEqual((tool as any).securitySchemes);
      expect(JSON.stringify(tool)).not.toContain("api_key");
    }
  });
});

describe("MCP authentication", () => {
  it("returns a read OAuth challenge for an unauthenticated tool call", async () => {
    const direct = await callTool("listCategories", {}, "");
    expect(direct.status).toBe(200);
    expect(direct.body.result.isError).toBe(true);
    expect(direct.body.result._meta["mcp/www_authenticate"][0]).toContain('scope="products:read"');
    expect(direct.body.result.structuredContent).toBeUndefined();
  });

  it("rejects an invalid OAuth token", async () => {
    const response = await callTool("listCategories", {}, "not-a-real-token");
    expect(response.status).toBe(200);
    expect(response.body.result.isError).toBe(true);
    expect(response.body.result._meta["mcp/www_authenticate"][0]).toContain("invalid_token");
  });

  it("accepts a read-scoped token for read tools", async () => {
    const response = await callTool("listCategories", {}, READ_KEY);

    expect(response.status).toBe(200);
    expect(response.body.result.isError).toBeFalsy();
    expect(response.body.result.structuredContent.success).toBe(true);
    expect(
      response.body.result.structuredContent.categories.length
    ).toBe(PRODUCT_CATEGORIES.length);
  });

  it("rejects a read-only token for mutating tools without changing data", async () => {
    const response = await callTool("createProductDraft", validDraft, READ_KEY);

    expect(response.status).toBe(200);
    expect(response.body.result.isError).toBe(true);
    expect(toolText(response.body.result)).toContain("products:write");
    await expect(product.countDocuments({})).resolves.toBe(0);
  });

  it("fails closed when Auth0 configuration is unavailable", async () => {
    const original = process.env.AUTH0_AUDIENCE;
    delete process.env.AUTH0_AUDIENCE;
    try {
      const response = await callTool("listCategories", {}, READ_KEY);
      expect(response.body.result.isError).toBe(true);
      expect(toolText(response.body.result)).toContain("MCP OAuth is unavailable");
    } finally {
      process.env.AUTH0_AUDIENCE = original;
    }
  });
});

describe("MCP taxonomy and reads", () => {
  it("lists categories with counts", async () => {
    await createProduct({ category: "Cakes" });

    const response = await callTool("listCategories", {}, READ_KEY);
    const categories: Array<{ name: string; productCount: number; publishedCount: number }> =
      response.body.result.structuredContent.categories;

    expect(categories).toHaveLength(PRODUCT_CATEGORIES.length);
    expect(categories.find((category) => category.name === "Cakes")).toMatchObject({
      productCount: 1,
      publishedCount: 1,
    });
  });

  it("lists products, including drafts, with filters", async () => {
    const created = await callTool("createProductDraft", validDraft);
    expect(created.body.result.isError).toBeFalsy();

    const response = await callTool(
      "listProducts",
      { status: "draft", q: "MCP Rose" },
      READ_KEY
    );

    expect(response.status).toBe(200);
    expect(response.body.result.isError).toBeFalsy();

    const payload = response.body.result.structuredContent;
    expect(payload.products).toHaveLength(1);
    expect(payload.products[0].name).toBe("MCP Rose Bouquet");
    expect(payload.products[0].status).toBe("draft");
    expect(payload.pagination.total).toBe(1);
  });
});

describe("MCP draft-first workflow", () => {
  it("creates drafts and keeps them off the storefront", async () => {
    const response = await callTool("createProductDraft", validDraft);

    expect(response.body.result.isError).toBeFalsy();

    const created = response.body.result.structuredContent.product;
    expect(created.status).toBe("draft");
    expect(created.publishedAt).toBeNull();

    const stored = await product.findById(created.id).lean();
    expect(stored?.status).toBe("draft");

    const publicList = await api().get("/api/v1/product");
    const publicIds = publicList.body.products.map((item: any) => String(item._id));
    expect(publicIds).not.toContain(created.id);
  });

  it("publishes only through the separate publishProduct tool", async () => {
    const created = await callTool("createProductDraft", validDraft);
    const productId = created.body.result.structuredContent.product.id;

    const published = await callTool("publishProduct", { productId });

    expect(published.body.result.isError).toBeFalsy();
    expect(published.body.result.structuredContent.product.status).toBe(
      "published"
    );

    const publicList = await api().get("/api/v1/product");
    const publicIds = publicList.body.products.map((item: any) => String(item._id));
    expect(publicIds).toContain(productId);

    // Idempotent when the product is already published.
    const again = await callTool("publishProduct", { productId });
    expect(again.body.result.isError).toBeFalsy();
    expect(again.body.result.structuredContent.product.status).toBe("published");
  });

  it("preserves image order and alt text through the image tools", async () => {
    const created = await callTool("createProductDraft", {
      ...validDraft,
      images: [],
    });
    const productId = created.body.result.structuredContent.product.id;
    const first = "https://cdn.quickwish.test/products/first.jpg";
    const second = "https://cdn.quickwish.test/products/second.jpg";

    const attached = await callTool("uploadProductImages", {
      productId,
      imageUrls: [first, second],
      alts: ["First image", "Second image"],
    });
    expect(attached.body.result.isError).toBeFalsy();
    expect(attached.body.result.structuredContent.images).toHaveLength(2);

    const reordered = await callTool("reorderProductImages", {
      productId,
      urls: [second, first],
    });
    expect(reordered.body.result.structuredContent.images[0].url).toBe(second);

    const alt = await callTool("updateImageAltText", {
      productId,
      imageIndex: 0,
      alt: "Second image hero",
    });
    expect(alt.body.result.structuredContent.images[0]).toMatchObject({
      url: second,
      alt: "Second image hero",
      position: 0,
    });
    expect(alt.body.result.structuredContent.images[1].alt).toBe("First image");
  });
});

describe("MCP schema consistency", () => {
  it("mirrors the connector request schema and never exposes status", async () => {
    const response = await listTools();
    const tools: Array<{
      name: string;
      inputSchema: {
        properties?: Record<string, any>;
        required?: string[];
      };
    }> = response.body.result.tools;

    const byName = new Map(tools.map((tool) => [tool.name, tool]));
    const create = byName.get("createProductDraft")!;
    const update = byName.get("updateProduct")!;
    const publish = byName.get("publishProduct")!;

    expect(create.inputSchema.required).toEqual(
      expect.arrayContaining(["name", "category", "price"])
    );
    expect(create.inputSchema.properties?.category.enum).toEqual(
      PRODUCT_CATEGORIES
    );
    expect(create.inputSchema.properties?.status).toBeUndefined();
    expect(update.inputSchema.properties?.status).toBeUndefined();
    expect(publish.inputSchema.required).toEqual(["productId"]);
    // Only the product reference is mandatory; every product field is optional.
    expect(update.inputSchema.required).toEqual(["productId"]);
    expect(update.inputSchema.properties?.images.items.properties.url).toBeTruthy();
  });

  it("rejects unsupported methods on the MCP endpoint", async () => {
    const response = await api().get("/mcp");

    expect(response.status).toBe(405);
    expect(response.headers.allow).toBe("POST");
  });
});
