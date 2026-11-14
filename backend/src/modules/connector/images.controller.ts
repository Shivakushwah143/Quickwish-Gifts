import type { Request, Response } from "express";
import { product } from "../../db.js";
import { uploadProductImages } from "../../config/uploadImages.js";
import {
  MAX_PRODUCT_IMAGES,
  mergeProductImages,
  productImageFields,
  sanitizeText,
  sanitizeUrl,
  type ProductImageEntry,
} from "../../services/product.service.js";
import { findProductByReference } from "./productPayload.js";

/**
 * Connector image endpoints. Uploads reuse the existing Cloudinary pipeline;
 * attach/reorder/alt-text operate on the stored image list.
 */

const fail = (
  res: Response,
  status: number,
  code: string,
  message: string
) => res.status(status).json({ success: false, code, message });

const normalizeEntries = (entries: ProductImageEntry[]): ProductImageEntry[] =>
  entries.map((entry, index) => ({ ...entry, position: index }));

const persistImages = async (
  productId: unknown,
  entries: ProductImageEntry[]
): Promise<void> => {
  await product.updateOne(
    { _id: productId },
    { $set: productImageFields(entries) }
  );
};

const loadImages = async (reference: string) => {
  const existing = await findProductByReference(reference);

  if (!existing) return null;

  return {
    product: existing,
    entries: mergeProductImages(existing.images, existing.imageMeta),
  };
};

export const connectorUploadProductImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (files.length === 0) {
    fail(res, 400, "IMAGE_REQUIRED", "At least one image file is required");
    return;
  }

  try {
    const loaded = await loadImages(req.params.productId ?? "");

    if (!loaded) {
      fail(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
      return;
    }

    if (loaded.entries.length + files.length > MAX_PRODUCT_IMAGES) {
      fail(
        res,
        400,
        "IMAGE_LIMIT_EXCEEDED",
        `A product can have at most ${MAX_PRODUCT_IMAGES} images`
      );
      return;
    }

    const body = (req.body || {}) as Record<string, unknown>;
    let alts: string[] = [];

    if (typeof body.alts === "string" && body.alts.trim()) {
      try {
        const parsedAlts: unknown = JSON.parse(body.alts);

        if (!Array.isArray(parsedAlts)) {
          fail(res, 400, "INVALID_ALTS", "alts must be a JSON array of strings");
          return;
        }

        alts = parsedAlts.map((alt) => sanitizeText(alt, 160));
      } catch {
        fail(res, 400, "INVALID_ALTS", "alts must be a JSON array of strings");
        return;
      }
    } else if (typeof body.alt === "string" && files.length === 1) {
      alts = [sanitizeText(body.alt, 160)];
    }

    let urls: string[];

    try {
      urls = await uploadProductImages(files);
    } catch {
      fail(res, 502, "IMAGE_UPLOAD_FAILED", "Image upload failed");
      return;
    }

    const entries = normalizeEntries([
      ...loaded.entries,
      ...urls.map((url, index) => ({
        url,
        alt: alts[index] || "",
        position: 0,
      })),
    ]);

    await persistImages(loaded.product._id, entries);

    res.status(201).json({ success: true, images: entries });
  } catch {
    fail(res, 500, "IMAGE_ATTACH_FAILED", "Failed to attach images");
  }
};

export const connectorAttachProductImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = (req.body || {}) as Record<string, unknown>;
  const url = sanitizeUrl(body.url);

  if (!url) {
    fail(res, 400, "INVALID_IMAGE_URL", "url must be a valid http(s) URL");
    return;
  }

  try {
    const loaded = await loadImages(req.params.productId ?? "");

    if (!loaded) {
      fail(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
      return;
    }

    if (loaded.entries.length >= MAX_PRODUCT_IMAGES) {
      fail(
        res,
        400,
        "IMAGE_LIMIT_EXCEEDED",
        `A product can have at most ${MAX_PRODUCT_IMAGES} images`
      );
      return;
    }

    if (loaded.entries.some((entry) => entry.url === url)) {
      fail(res, 409, "IMAGE_ALREADY_ATTACHED", "This image is already attached");
      return;
    }

    const entries = normalizeEntries([
      ...loaded.entries,
      { url, alt: sanitizeText(body.alt, 160), position: 0 },
    ]);

    await persistImages(loaded.product._id, entries);

    res.status(201).json({ success: true, images: entries });
  } catch {
    fail(res, 500, "IMAGE_ATTACH_FAILED", "Failed to attach image");
  }
};

export const connectorReorderProductImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = (req.body || {}) as Record<string, unknown>;
  const urls = Array.isArray(body.urls)
    ? body.urls.map((url) => sanitizeUrl(url)).filter((url) => url.length > 0)
    : null;

  if (!urls) {
    fail(res, 400, "INVALID_IMAGE_ORDER", "urls must be an array of image URLs");
    return;
  }

  try {
    const loaded = await loadImages(req.params.productId ?? "");

    if (!loaded) {
      fail(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
      return;
    }

    const currentUrls = loaded.entries.map((entry) => entry.url);
    const isCompleteList =
      urls.length === currentUrls.length &&
      new Set(urls).size === urls.length &&
      currentUrls.every((url) => urls.includes(url));

    if (!isCompleteList) {
      fail(
        res,
        400,
        "INVALID_IMAGE_ORDER",
        "urls must list every product image exactly once"
      );
      return;
    }

    const entriesByUrl = new Map(loaded.entries.map((entry) => [entry.url, entry]));
    const entries = normalizeEntries(
      urls.map((url) => entriesByUrl.get(url) ?? { url, alt: "", position: 0 })
    );

    await persistImages(loaded.product._id, entries);

    res.status(200).json({ success: true, images: entries });
  } catch {
    fail(res, 500, "IMAGE_REORDER_FAILED", "Failed to reorder images");
  }
};

export const connectorUpdateImageAlt = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = (req.body || {}) as Record<string, unknown>;
  const index = Number(req.params.imageIndex);

  try {
    const loaded = await loadImages(req.params.productId ?? "");

    if (!loaded) {
      fail(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
      return;
    }

    if (!Number.isInteger(index) || index < 0 || index >= loaded.entries.length) {
      fail(res, 404, "IMAGE_NOT_FOUND", "Image index is out of range");
      return;
    }

    if (typeof body.alt !== "string") {
      fail(res, 400, "INVALID_IMAGE_ALT", "alt must be a string");
      return;
    }

    const alt = sanitizeText(body.alt, 160);
    const entries = loaded.entries.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, alt } : entry
    );

    await persistImages(loaded.product._id, entries);

    res.status(200).json({ success: true, images: entries });
  } catch {
    fail(res, 500, "IMAGE_ALT_UPDATE_FAILED", "Failed to update image alt text");
  }
};
