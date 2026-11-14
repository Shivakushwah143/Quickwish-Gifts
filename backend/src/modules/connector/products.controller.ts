import type { Request, Response } from "express";
import { product } from "../../db.js";
import {
  buildUniqueProductSlug,
  escapeRegExp,
  getNextProductDisplayOrder,
  isSkuTaken,
  mergeProductImages,
  productImageFields,
  sanitizeText,
} from "../../services/product.service.js";
import {
  buildProductFields,
  findProductByReference,
  isAllowedCategory,
  serializeConnectorProduct,
} from "./productPayload.js";

/**
 * Connector product endpoints. All write paths create drafts; publishing is a
 * separate, explicit action so a model cannot put unready products live.
 */

const fail = (
  res: Response,
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {}
) => res.status(status).json({ success: false, code, message, ...extra });

const isDuplicateKeyError = (error: unknown): boolean =>
  Boolean(
    error &&
      typeof error === "object" &&
      (error as { code?: number }).code === 11000
  );

const clampInt = (
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(max, Math.max(min, Math.trunc(parsed)));
};

const CONNECTOR_SORT_OPTIONS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  "price-asc": { price: 1, _id: 1 },
  "price-desc": { price: -1, _id: 1 },
  "name-asc": { name: 1, _id: 1 },
};

export const connectorListProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = req.query;
  const filter: Record<string, unknown> = {};

  const status = typeof query.status === "string" ? query.status : "all";

  if (status === "draft") {
    filter.status = "draft";
  } else if (status === "published") {
    filter.status = { $ne: "draft" };
  } else if (status !== "all") {
    fail(res, 400, "INVALID_STATUS", "status must be draft, published or all");
    return;
  }

  if (query.includeArchived !== "true") {
    filter.isArchived = { $ne: true };
  }

  if (typeof query.category === "string" && query.category.trim()) {
    filter.category = query.category.trim();
  }

  if (typeof query.tag === "string" && query.tag.trim()) {
    filter.tags = query.tag.trim();
  }

  if (typeof query.sku === "string" && query.sku.trim()) {
    filter.sku = query.sku.trim().toUpperCase();
  }

  if (typeof query.q === "string" && query.q.trim()) {
    const escaped = escapeRegExp(query.q.trim());
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { sku: { $regex: escaped, $options: "i" } },
      { slug: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
      { tags: { $regex: escaped, $options: "i" } },
    ];
  }

  const limit = clampInt(query.limit, 20, 1, 100);
  const offset = clampInt(query.offset, 0, 0, 100_000);
  const sortKey = typeof query.sort === "string" ? query.sort : "newest";
  const sort = CONNECTOR_SORT_OPTIONS[sortKey];

  if (!sort) {
    fail(
      res,
      400,
      "INVALID_SORT",
      `sort must be one of: ${Object.keys(CONNECTOR_SORT_OPTIONS).join(", ")}`
    );
    return;
  }

  try {
    const [items, total] = await Promise.all([
      product.find(filter).sort(sort).skip(offset).limit(limit),
      product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      products: items.map(serializeConnectorProduct),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      },
    });
  } catch {
    fail(res, 500, "PRODUCT_LIST_FAILED", "Failed to list products");
  }
};

export const connectorGetProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const existing = await findProductByReference(req.params.productId ?? "");

    if (!existing) {
      fail(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
      return;
    }

    res.status(200).json({
      success: true,
      product: serializeConnectorProduct(existing),
    });
  } catch {
    fail(res, 500, "PRODUCT_READ_FAILED", "Failed to read product");
  }
};

export const connectorCreateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = (req.body || {}) as Record<string, unknown>;
  const built = buildProductFields(body, { partial: false });

  if (!built.ok) {
    fail(res, 400, built.error.code, built.error.message);
    return;
  }

  const { fields, images } = built.value;
  const sku = typeof fields.sku === "string" ? fields.sku : null;
  const price = Number(fields.price);
  const mrp = fields.mrp !== undefined ? Number(fields.mrp) : undefined;

  if (mrp !== undefined && Number.isFinite(price) && mrp < price) {
    fail(res, 400, "INVALID_MRP", "mrp must be greater than or equal to price");
    return;
  }

  try {
    if (sku && (await isSkuTaken(sku))) {
      fail(res, 409, "SKU_CONFLICT", `A product with sku ${sku} already exists`);
      return;
    }

    const slug = await buildUniqueProductSlug(
      typeof fields.slug === "string" ? fields.slug : String(fields.name)
    );

    const createdProduct = new product({
      ...fields,
      slug,
      ...(images ? productImageFields(images) : { images: [] }),
      status: "draft",
      publishedAt: null,
      isArchived: false,
      displayOrder: await getNextProductDisplayOrder(),
    });

    await createdProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created as draft",
      product: serializeConnectorProduct(createdProduct),
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      fail(
        res,
        409,
        "DUPLICATE_PRODUCT",
        "A product with the same slug or sku already exists"
      );
      return;
    }

    fail(res, 500, "PRODUCT_CREATE_FAILED", "Failed to create product");
  }
};

export const connectorUpdateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = (req.body || {}) as Record<string, unknown>;

  try {
    const existing = await findProductByReference(req.params.productId ?? "");

    if (!existing) {
      fail(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
      return;
    }

    const built = buildProductFields(body, { partial: true });

    if (!built.ok) {
      fail(res, 400, built.error.code, built.error.message);
      return;
    }

    const { fields, images } = built.value;
    const price =
      fields.price !== undefined ? Number(fields.price) : Number(existing.price);
    const mrp =
      fields.mrp !== undefined ? Number(fields.mrp) : Number(existing.mrp);

    if (Number.isFinite(mrp) && Number.isFinite(price) && mrp < price) {
      fail(res, 400, "INVALID_MRP", "mrp must be greater than or equal to price");
      return;
    }

    const sku = typeof fields.sku === "string" ? fields.sku : null;

    if (sku && (await isSkuTaken(sku, String(existing._id)))) {
      fail(res, 409, "SKU_CONFLICT", `A product with sku ${sku} already exists`);
      return;
    }

    if (typeof fields.slug === "string") {
      fields.slug = await buildUniqueProductSlug(fields.slug, String(existing._id));
    }

    if (images) {
      Object.assign(fields, productImageFields(images));
    }

    if (Object.keys(fields).length === 0) {
      fail(res, 400, "NO_CHANGES", "No updatable fields were provided");
      return;
    }

    const updatedProduct = await product.findByIdAndUpdate(
      existing._id,
      { $set: fields },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      fail(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
      return;
    }

    res.status(200).json({
      success: true,
      product: serializeConnectorProduct(updatedProduct),
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      fail(
        res,
        409,
        "DUPLICATE_PRODUCT",
        "A product with the same slug or sku already exists"
      );
      return;
    }

    fail(res, 500, "PRODUCT_UPDATE_FAILED", "Failed to update product");
  }
};

export const connectorPublishProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const existing = await findProductByReference(req.params.productId ?? "");

    if (!existing) {
      fail(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
      return;
    }

    if (existing.isArchived === true) {
      fail(
        res,
        409,
        "PRODUCT_ARCHIVED",
        "Archived products cannot be published"
      );
      return;
    }

    const issues: string[] = [];
    const images = mergeProductImages(existing.images, existing.imageMeta);

    if (!sanitizeText(existing.name, 200)) {
      issues.push("name is required");
    }

    if (!Number.isFinite(Number(existing.price)) || Number(existing.price) <= 0) {
      issues.push("price must be greater than 0");
    }

    if (!isAllowedCategory(existing.category)) {
      issues.push("category is invalid");
    }

    if (!Number.isInteger(Number(existing.stock)) || Number(existing.stock) < 0) {
      issues.push("stock must be a non-negative integer");
    }

    if (images.length === 0) {
      issues.push("at least one image is required");
    }

    if (
      Array.isArray(existing.variants) &&
      existing.variants.some(
        (variant: any) =>
          !Number.isFinite(Number(variant?.price)) || Number(variant.price) < 0
      )
    ) {
      issues.push("every variant needs a valid price");
    }

    if (issues.length > 0) {
      fail(
        res,
        400,
        "PUBLISH_VALIDATION_FAILED",
        "Product is not ready to publish",
        { issues }
      );
      return;
    }

    const alreadyPublished = existing.status !== "draft";

    existing.status = "published";
    existing.publishedAt = existing.publishedAt || new Date();

    if (!existing.slug) {
      existing.slug = await buildUniqueProductSlug(
        existing.name,
        String(existing._id)
      );
    }

    await existing.save();

    res.status(200).json({
      success: true,
      message: alreadyPublished
        ? "Product is already published"
        : "Product published",
      product: serializeConnectorProduct(existing),
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      fail(
        res,
        409,
        "DUPLICATE_PRODUCT",
        "A product with the same slug or sku already exists"
      );
      return;
    }

    fail(res, 500, "PRODUCT_PUBLISH_FAILED", "Failed to publish product");
  }
};
