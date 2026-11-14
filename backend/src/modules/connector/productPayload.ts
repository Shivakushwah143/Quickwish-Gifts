import mongoose from "mongoose";
import { PRODUCT_CATEGORIES, product } from "../../db.js";
import {
  mergeProductImages,
  normalizeSku,
  parseComparisons,
  parseProductImages,
  parseProductSeo,
  parseProductVariants,
  parseStorefrontGroups,
  parseTags,
  sanitizeText,
  slugify,
  toNumberOrUndefined,
  type ProductImageEntry,
} from "../../services/product.service.js";

/**
 * Shared request validation and response shaping for the connector product
 * endpoints. Reuses the product service normalisers so the connector applies
 * exactly the same rules as the admin product API.
 */

export type ProductFieldError = { code: string; message: string };

export type BuiltProductFields = {
  fields: Record<string, unknown>;
  images?: ProductImageEntry[];
};

export type BuildResult =
  | { ok: true; value: BuiltProductFields }
  | { ok: false; error: ProductFieldError };

const invalid = (code: string, message: string) =>
  ({ ok: false as const, error: { code, message } });

export const isAllowedCategory = (value: unknown): value is string =>
  typeof value === "string" && PRODUCT_CATEGORIES.includes(value);

export const READ_ONLY_PRODUCT_FIELDS = [
  "isArchived",
  "displayOrder",
  "publishedAt",
  "createdAt",
  "updatedAt",
] as const;

export const buildProductFields = (
  body: Record<string, unknown>,
  options: { partial: boolean }
): BuildResult => {
  const { partial } = options;
  const fields: Record<string, unknown> = {};
  let images: ProductImageEntry[] | undefined;

  if (!partial || body.name !== undefined) {
    const name = sanitizeText(body.name, 200);

    if (!name) {
      return invalid("INVALID_NAME", "name is required");
    }

    fields.name = name;
  }

  if (!partial || body.category !== undefined) {
    if (!isAllowedCategory(body.category)) {
      return invalid(
        "INVALID_CATEGORY",
        `category must be one of: ${PRODUCT_CATEGORIES.join(", ")}`
      );
    }

    fields.category = body.category;
  }

  if (!partial || body.price !== undefined) {
    const price = Number(body.price);

    if (!Number.isFinite(price) || price < 0) {
      return invalid("INVALID_PRICE", "price must be a non-negative number");
    }

    fields.price = price;
  }

  if (body.mrp !== undefined) {
    const mrp = Number(body.mrp);

    if (!Number.isFinite(mrp) || mrp < 0) {
      return invalid("INVALID_MRP", "mrp must be a non-negative number");
    }

    fields.mrp = mrp;
  }

  if (body.originalPrice !== undefined) {
    const originalPrice = toNumberOrUndefined(body.originalPrice);

    if (originalPrice === undefined || originalPrice < 0) {
      return invalid(
        "INVALID_ORIGINAL_PRICE",
        "originalPrice must be a non-negative number"
      );
    }

    fields.originalPrice = originalPrice;
  }

  if (body.offPrice !== undefined) {
    const offPrice = toNumberOrUndefined(body.offPrice);

    if (offPrice === undefined || offPrice < 0) {
      return invalid("INVALID_OFF_PRICE", "offPrice must be a non-negative number");
    }

    fields.offPrice = offPrice;
  }

  if (body.discountPercent !== undefined) {
    const discountPercent = Number(body.discountPercent);

    if (
      !Number.isFinite(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      return invalid(
        "INVALID_DISCOUNT",
        "discountPercent must be a number between 0 and 100"
      );
    }

    fields.discountPercent = discountPercent;
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock);

    if (!Number.isInteger(stock) || stock < 0) {
      return invalid("INVALID_STOCK", "stock must be a non-negative integer");
    }

    fields.stock = stock;
  }

  if (body.sku !== undefined) {
    if (body.sku === null || body.sku === "") {
      return invalid("INVALID_SKU", "sku cannot be empty");
    }

    const sku = normalizeSku(body.sku);

    if (!sku) {
      return invalid(
        "INVALID_SKU",
        "sku must contain only letters, numbers, dot, underscore or dash (max 64 characters)"
      );
    }

    fields.sku = sku;
  }

  if (body.slug !== undefined) {
    const slug = slugify(body.slug);

    if (!slug) {
      return invalid("INVALID_SLUG", "slug must contain letters or numbers");
    }

    fields.slug = slug;
  }

  if (body.description !== undefined) {
    fields.description = sanitizeText(body.description, 5000);
  }

  if (body.badge !== undefined) {
    fields.badge = sanitizeText(body.badge, 60);
  }

  if (body.tags !== undefined) {
    fields.tags = parseTags(body.tags).slice(0, 30);
  }

  if (body.storefrontGroups !== undefined) {
    fields.storefrontGroups = parseStorefrontGroups(body.storefrontGroups);
  }

  if (body.comparisons !== undefined) {
    fields.comparisons = parseComparisons(body.comparisons);
  }

  if (body.deliveryOptions !== undefined) {
    let parsedDeliveryOptions: unknown = body.deliveryOptions;

    if (typeof parsedDeliveryOptions === "string") {
      try {
        parsedDeliveryOptions = JSON.parse(parsedDeliveryOptions);
      } catch {
        return invalid(
          "INVALID_DELIVERY_OPTIONS",
          "deliveryOptions must be valid JSON"
        );
      }
    }

    if (
      !parsedDeliveryOptions ||
      typeof parsedDeliveryOptions !== "object" ||
      Array.isArray(parsedDeliveryOptions)
    ) {
      return invalid(
        "INVALID_DELIVERY_OPTIONS",
        "deliveryOptions must be an object"
      );
    }

    fields.deliveryOptions = parsedDeliveryOptions;
  }

  if (body.seo !== undefined) {
    const seo = parseProductSeo(body.seo);

    if (!seo) {
      return invalid(
        "INVALID_SEO",
        "seo must be an object with title, description and keywords"
      );
    }

    fields.seo = seo;
  }

  if (body.variants !== undefined) {
    const parsedVariants = parseProductVariants(body.variants);

    if (!parsedVariants.ok) {
      return invalid("INVALID_VARIANTS", parsedVariants.message);
    }

    fields.variants = parsedVariants.value;
  }

  if (body.images !== undefined) {
    const parsedImages = parseProductImages(body.images);

    if (!parsedImages.ok) {
      return invalid("INVALID_IMAGES", parsedImages.message);
    }

    images = parsedImages.value;
  }

  if (body.status !== undefined) {
    return invalid(
      "USE_PUBLISH_ENDPOINT",
      "status cannot be set here. Use POST /api/v1/connector/products/{productId}/publish to publish a draft."
    );
  }

  for (const field of READ_ONLY_PRODUCT_FIELDS) {
    if (body[field] !== undefined) {
      return invalid("READ_ONLY_FIELD", `${field} cannot be changed through this endpoint`);
    }
  }

  const value: BuiltProductFields = { fields };

  if (images) {
    value.images = images;
  }

  return { ok: true, value };
};

export const findProductByReference = async (reference: string) => {
  const value = String(reference || "").trim();

  if (!value) return null;

  if (mongoose.isValidObjectId(value)) {
    const byId = await product.findById(value);

    if (byId) return byId;
  }

  return product.findOne({ slug: value.toLowerCase() });
};

type SerializedImage = { url: string; alt: string; position: number };

type SerializedVariant = {
  sku: string;
  name: string;
  price: number;
  mrp: number | null;
  stock: number;
  attributes: Array<{ name: string; value: string }>;
};

export type SerializedConnectorProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  category: string;
  status: "draft" | "published";
  archived: boolean;
  price: number;
  mrp: number | null;
  originalPrice: number | null;
  discountPercent: number | null;
  stock: number;
  tags: string[];
  storefrontGroups: string[];
  images: SerializedImage[];
  variants: SerializedVariant[];
  seo: { title: string; description: string; keywords: string[] };
  badge: string | null;
  deliveryOptions: unknown;
  comparisons: unknown;
  displayOrder: number;
  publishedAt: Date | null;
  createdAt: Date | null;
};

const toNumberOrNull = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const serializeConnectorProduct = (
  doc: any
): SerializedConnectorProduct => ({
  id: String(doc._id),
  name: doc.name || "",
  slug: doc.slug || "",
  sku: doc.sku || null,
  description: doc.description || "",
  category: doc.category || "",
  status: doc.status === "draft" ? "draft" : "published",
  archived: doc.isArchived === true,
  price: toNumberOrNull(doc.price) ?? 0,
  mrp: toNumberOrNull(doc.mrp),
  originalPrice: toNumberOrNull(doc.originalPrice),
  discountPercent: toNumberOrNull(doc.discountPercent),
  stock: toNumberOrNull(doc.stock) ?? 0,
  tags: Array.isArray(doc.tags) ? doc.tags.map((tag: unknown) => String(tag)) : [],
  storefrontGroups: Array.isArray(doc.storefrontGroups)
    ? doc.storefrontGroups.map((group: unknown) => String(group))
    : [],
  images: mergeProductImages(doc.images, doc.imageMeta),
  variants: Array.isArray(doc.variants)
    ? doc.variants.map((variant: any) => ({
        sku: variant?.sku || "",
        name: variant?.name || "",
        price: toNumberOrNull(variant?.price) ?? 0,
        mrp: toNumberOrNull(variant?.mrp),
        stock: toNumberOrNull(variant?.stock) ?? 0,
        attributes: Array.isArray(variant?.attributes)
          ? variant.attributes.map((attribute: any) => ({
              name: String(attribute?.name || ""),
              value: String(attribute?.value || ""),
            }))
          : [],
      }))
    : [],
  seo: {
    title: doc?.seo?.title || "",
    description: doc?.seo?.description || "",
    keywords: Array.isArray(doc?.seo?.keywords)
      ? doc.seo.keywords.map((keyword: unknown) => String(keyword))
      : [],
  },
  badge: doc.badge ?? null,
  deliveryOptions: doc.deliveryOptions ?? null,
  comparisons: Array.isArray(doc.comparisons) ? doc.comparisons : [],
  displayOrder: toNumberOrNull(doc.displayOrder) ?? 0,
  publishedAt: doc.publishedAt ?? null,
  createdAt: doc.createdAt ?? null,
});
