import { Router } from "express";
import { MAX_IMAGE_COUNT, upload } from "../../config/productUpload.js";
import { requireConnectorScope } from "../../middleware/connectorAuth.js";
import {
  connectorAttachProductImage,
  connectorReorderProductImages,
  connectorUpdateImageAlt,
  connectorUploadProductImages,
} from "./images.controller.js";
import { connectorOpenApiSpec } from "./openapi.js";
import {
  connectorCreateProduct,
  connectorGetProduct,
  connectorListProducts,
  connectorPublishProduct,
  connectorUpdateProduct,
} from "./products.controller.js";
import {
  connectorListCategories,
  connectorListTags,
} from "./taxonomy.controller.js";

/**
 * ChatGPT product connector API.
 *
 * Mounted at /api/v1/connector. Authentication is a scoped connector API key —
 * admin JWTs are never accepted here and connector keys cannot reach admin
 * routes. The OpenAPI document is public because it contains no tenant data.
 */
const router = Router();

router.get("/openapi.json", connectorOpenApiSpec);

router.get("/categories", requireConnectorScope("products:read"), connectorListCategories);
router.get("/tags", requireConnectorScope("products:read"), connectorListTags);

router.get("/products", requireConnectorScope("products:read"), connectorListProducts);
router.get("/products/:productId", requireConnectorScope("products:read"), connectorGetProduct);
router.post("/products", requireConnectorScope("products:write"), connectorCreateProduct);
router.patch("/products/:productId", requireConnectorScope("products:write"), connectorUpdateProduct);
router.post(
  "/products/:productId/publish",
  requireConnectorScope("products:write"),
  connectorPublishProduct
);

router.post(
  "/products/:productId/images",
  requireConnectorScope("products:write"),
  upload.array("images", MAX_IMAGE_COUNT),
  connectorUploadProductImages
);
router.post(
  "/products/:productId/images/attach",
  requireConnectorScope("products:write"),
  connectorAttachProductImage
);
router.put(
  "/products/:productId/images/reorder",
  requireConnectorScope("products:write"),
  connectorReorderProductImages
);
router.patch(
  "/products/:productId/images/:imageIndex",
  requireConnectorScope("products:write"),
  connectorUpdateImageAlt
);

export default router;
