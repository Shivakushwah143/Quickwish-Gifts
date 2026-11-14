import { product } from "../db.js";

/**
 * Shared product-domain helpers.
 *
 * These functions were previously private to the admin product routes in
 * index.ts. They now live here so the admin API and the ChatGPT connector API
 * share one implementation of validation, normalisation, image metadata and
 * catalogue ordering — the connector must never grow a second, divergent copy.
 */

export const MAX_PRODUCT_IMAGES = 5;

export type ProductImageEntry = {
  url: string;
  alt: string;
  position: number;
};

export type ProductVariantValue = {
  sku: string;
  name: string;
  price: number;
  mrp: number | null;
  stock: number;
  attributes: Array<{ name: string; value: string }>;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

export const sanitizeText = (value: unknown, maxLength = 80): string => {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
};

export const sanitizeUrl = (value: unknown): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return "";
  }

  return "";
};

export const parseTags = (tags: unknown): string[] => {
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0);
  }

  return [];
};

export const normalizeStorefrontGroup = (value: unknown): string => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const parseStorefrontGroups = (groups: unknown): string[] => {
  let values: unknown[] = [];

  if (typeof groups === "string") {
    const trimmed = groups.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      values = Array.isArray(parsed) ? parsed : trimmed.split(",");
    } catch {
      values = trimmed.split(",");
    }
  } else if (Array.isArray(groups)) {
    values = groups;
  }

  return Array.from(
    new Set(
      values.map(normalizeStorefrontGroup).filter((group) => group.length > 0)
    )
  );
};

export const parseComparisons = (
  comparisons: unknown
): Array<{ siteName: string; price: number; url: string }> => {
  let values: unknown[] = [];

  if (typeof comparisons === "string") {
    const trimmed = comparisons.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      values = Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  } else if (Array.isArray(comparisons)) {
    values = comparisons;
  }

  return values
    .map((entry: any) => {
      const siteName = sanitizeText(entry?.siteName);
      const price = Number(entry?.price);
      const rawUrl = String(entry?.url || "").trim();

      let url = "";
      try {
        const parsedUrl = new URL(rawUrl);
        if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
          url = parsedUrl.toString();
        }
      } catch {
        url = "";
      }

      if (!siteName || !Number.isFinite(price) || price <= 0 || !url) {
        return null;
      }

      return { siteName, price, url };
    })
    .filter(
      (entry): entry is { siteName: string; price: number; url: string } =>
        entry !== null
    );
};

export const toNumberOrUndefined = (value: unknown): number | undefined => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
};

export const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const slugify = (value: unknown): string =>
  String(value || "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const normalizeSku = (value: unknown): string | null => {
  if (typeof value !== "string") return null;

  const sku = value.trim().toUpperCase();

  if (!sku) return null;

  return /^[A-Z0-9][A-Z0-9._-]{0,63}$/.test(sku) ? sku : null;
};

export const buildUniqueProductSlug = async (
  source: string,
  excludeProductId?: string
): Promise<string> => {
  const root = slugify(source) || "product";
  const exclude = excludeProductId ? { _id: { $ne: excludeProductId } } : {};
  let candidate = root;
  let suffix = 1;

  while (await product.exists({ slug: candidate, ...exclude })) {
    suffix += 1;
    candidate = `${root}-${suffix}`;

    if (suffix > 500) {
      return `${root}-${Date.now()}`;
    }
  }

  return candidate;
};

export const isSkuTaken = async (
  sku: string,
  excludeProductId?: string
): Promise<boolean> => {
  const exclude = excludeProductId ? { _id: { $ne: excludeProductId } } : {};
  return Boolean(await product.exists({ sku, ...exclude }));
};

const sanitizeAltText = (value: unknown): string => sanitizeText(value, 160);

/**
 * Builds the ordered image list from the legacy `images` string array plus the
 * connector-maintained `imageMeta` alt-text records. Products created before
 * the connector existed have no imageMeta and still return clean entries.
 */
export const mergeProductImages = (
  images: unknown,
  imageMeta: unknown
): ProductImageEntry[] => {
  const altByUrl = new Map<string, string>();

  if (Array.isArray(imageMeta)) {
    for (const item of imageMeta) {
      const url = sanitizeUrl((item as { url?: unknown } | null)?.url);
      if (url) altByUrl.set(url, sanitizeAltText((item as { alt?: unknown } | null)?.alt));
    }
  }

  const urls: string[] = [];

  if (Array.isArray(images)) {
    for (const image of images) {
      const url = sanitizeUrl(image);
      if (url && !urls.includes(url)) urls.push(url);
    }
  }

  // Alt text is looked up per URL; imageMeta entries for URLs no longer in
  // `images` (for example after an admin edit) are intentionally ignored.
  return urls.map((url, index) => ({
    url,
    alt: altByUrl.get(url) || "",
    position: index,
  }));
};

export const productImageFields = (entries: ProductImageEntry[]) => ({
  images: entries.map((entry) => entry.url),
  imageMeta: entries.map((entry) => ({ url: entry.url, alt: entry.alt })),
});

export const parseProductImages = (
  value: unknown
): ParseResult<ProductImageEntry[]> => {
  if (!Array.isArray(value)) {
    return { ok: false, message: "images must be an array" };
  }

  if (value.length > MAX_PRODUCT_IMAGES) {
    return {
      ok: false,
      message: `A product can have at most ${MAX_PRODUCT_IMAGES} images`,
    };
  }

  const entries: ProductImageEntry[] = [];

  for (const raw of value) {
    const url = sanitizeUrl(
      typeof raw === "string" ? raw : (raw as { url?: unknown } | null)?.url
    );

    if (!url) {
      return { ok: false, message: "Each image must be a valid http(s) URL" };
    }

    if (entries.some((entry) => entry.url === url)) {
      return { ok: false, message: `Duplicate image URL: ${url}` };
    }

    const alt =
      typeof raw === "object" && raw !== null
        ? sanitizeAltText((raw as { alt?: unknown }).alt)
        : "";

    entries.push({ url, alt, position: entries.length });
  }

  return { ok: true, value: entries };
};

export const parseProductVariants = (
  value: unknown
): ParseResult<ProductVariantValue[]> => {
  if (!Array.isArray(value)) {
    return { ok: false, message: "variants must be an array" };
  }

  if (value.length > 50) {
    return { ok: false, message: "A product can have at most 50 variants" };
  }

  const variants: ProductVariantValue[] = [];

  for (const raw of value) {
    const entry = raw as Record<string, unknown> | null;
    const sku = normalizeSku(entry?.sku);

    if (!sku) {
      return {
        ok: false,
        message:
          "Each variant needs a valid sku (letters, numbers, dot, underscore or dash)",
      };
    }

    if (variants.some((variant) => variant.sku === sku)) {
      return { ok: false, message: `Duplicate variant sku: ${sku}` };
    }

    const price = Number(entry?.price);

    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, message: `Variant ${sku} needs a valid price` };
    }

    let mrp: number | null = null;

    if (entry?.mrp !== undefined && entry?.mrp !== null && entry?.mrp !== "") {
      const parsedMrp = Number(entry.mrp);

      if (!Number.isFinite(parsedMrp) || parsedMrp < price) {
        return {
          ok: false,
          message: `Variant ${sku} mrp must be greater than or equal to its price`,
        };
      }

      mrp = parsedMrp;
    }

    const rawStock =
      entry?.stock === undefined || entry?.stock === null || entry?.stock === ""
        ? 0
        : Number(entry.stock);

    if (!Number.isInteger(rawStock) || rawStock < 0) {
      return {
        ok: false,
        message: `Variant ${sku} stock must be a non-negative integer`,
      };
    }

    const attributes = Array.isArray(entry?.attributes)
      ? entry.attributes
          .map((attribute) => ({
            name: sanitizeText((attribute as { name?: unknown } | null)?.name, 40),
            value: sanitizeText(
              (attribute as { value?: unknown } | null)?.value,
              80
            ),
          }))
          .filter((attribute) => attribute.name && attribute.value)
      : [];

    variants.push({
      sku,
      name: sanitizeText(entry?.name, 120),
      price,
      mrp,
      stock: rawStock,
      attributes,
    });
  }

  return { ok: true, value: variants };
};

export const parseProductSeo = (
  value: unknown
): { title: string; description: string; keywords: string[] } | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const entry = value as Record<string, unknown>;

  return {
    title: sanitizeText(entry.title, 70),
    description: sanitizeText(entry.description, 320),
    keywords: parseTags(entry.keywords).slice(0, 20),
  };
};

export const PRODUCT_DEFAULT_SORT = {
  displayOrder: 1,
  createdAt: 1,
  _id: 1,
} as const;

export const backfillProductDisplayOrder = async () => {
  const missing = await product
    .find({
      $or: [
        { displayOrder: { $exists: false } },
        { displayOrder: null },
        { displayOrder: 0 },
      ],
    })
    .sort({ createdAt: 1, _id: 1 })
    .select("_id")
    .lean();

  if (missing.length === 0) return;

  const ordered = await product
    .find({})
    .sort({ displayOrder: 1, createdAt: 1, _id: 1 })
    .select("_id displayOrder")
    .lean();
  let nextOrder =
    ordered.reduce(
      (max, item: any) => Math.max(max, Number(item.displayOrder) || 0),
      0
    ) + 1;

  await Promise.all(
    missing.map((item: any) =>
      product.updateOne(
        {
          _id: item._id,
          $or: [
            { displayOrder: { $exists: false } },
            { displayOrder: null },
            { displayOrder: 0 },
          ],
        },
        { displayOrder: nextOrder++ }
      )
    )
  );
};

export const getNextProductDisplayOrder = async (): Promise<number> => {
  await backfillProductDisplayOrder();

  const lastProduct = await product
    .findOne({})
    .sort({ displayOrder: -1, createdAt: -1, _id: -1 })
    .select("displayOrder")
    .lean();

  return (Number((lastProduct as { displayOrder?: number } | null)?.displayOrder) || 0) + 1;
};

export const reorderProductsByIds = async (orderedIds: string[]) => {
  await backfillProductDisplayOrder();

  const existingProducts = await product
    .find({})
    .sort(PRODUCT_DEFAULT_SORT)
    .select("_id")
    .lean();
  const existingIds = existingProducts.map((item: any) => String(item._id));
  const existingIdSet = new Set(existingIds);

  if (orderedIds.some((id: string) => !existingIdSet.has(id))) {
    return { kind: "invalid" as const };
  }

  const orderedIdSet = new Set(orderedIds);
  const mergedIds = [
    ...orderedIds,
    ...existingIds.filter((id: string) => !orderedIdSet.has(id)),
  ];

  await product.bulkWrite(
    mergedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { displayOrder: index + 1 } },
      },
    }))
  );

  const products = await product.find({}).sort(PRODUCT_DEFAULT_SORT);
  return { kind: "ok" as const, products };
};
