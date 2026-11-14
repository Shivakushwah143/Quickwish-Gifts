import multer from "multer";
import { MAX_PRODUCT_IMAGES } from "../services/product.service.js";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_COUNT = MAX_PRODUCT_IMAGES;

/**
 * Shared multer instance for product images. Used by the admin routes and the
 * connector API so both enforce the same mime/size/count limits.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
    files: MAX_IMAGE_COUNT,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, WebP, GIF, HEIC) are allowed"));
    }
  },
});
