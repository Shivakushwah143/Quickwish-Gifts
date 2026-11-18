import type { Request, Response } from "express";
import type { OAuthMcpServer } from "./toolRegistry.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { PRODUCT_CATEGORIES } from "../../db.js";
import {
  connectorAttachProductImage,
  connectorReorderProductImages,
  connectorUpdateImageAlt,
} from "../connector/images.controller.js";
import {
  connectorCreateProduct,
  connectorGetProduct,
  connectorListProducts,
  connectorPublishProduct,
  connectorUpdateProduct,
} from "../connector/products.controller.js";
import {
  connectorListCategories,
  connectorListTags,
} from "../connector/taxonomy.controller.js";
import type { McpAuthContext } from "./auth.js";
import { authorizeMcpTool } from "./auth.js";

/**
 * MCP tool surface for the QuickWish product connector.
 *
 * Every tool delegates to the existing connector controllers through a small
 * Express adapter, so validation, draft-first behaviour, image ordering and
 * error codes are exactly the same as the REST connector. No business logic is
 * reimplemented here.
 *
 * Tool schemas mirror the fields the connector payload builder accepts; fields
 * the REST API rejects (for example `status`) are intentionally absent.
 */

type ConnectorHandler = (req: Request, res: Response) => Promise<void>;

type HandlerCall = {
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
};

type HandlerResult = { status: number; body: Record<string, unknown> };

/**
 * Runs a connector controller without duplicating it: the controller only
 * touches `params`, `query` and `body` and answers with `status` + `json`.
 */
const invoke = async (
  handler: ConnectorHandler,
  call: HandlerCall
): Promise<HandlerResult> => {
  let status = 200;
  let payload: unknown = null;

  const req = {
    params: call.params ?? {},
    query: call.query ?? {},
    body: call.body ?? {},
    headers: {},
    files: [],
  } as unknown as Request;

  const res = {
    status(code: number) {
      status = code;
      return this;
    },
    json(value: unknown) {
      payload = value;
      return this;
    },
  } as unknown as Response;

  await handler(req, res);

  return {
    status,
    body:
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : {},
  };
};

const toToolResult = (result: HandlerResult): CallToolResult => {
  if (result.status >= 400) {
    const message = String(result.body.message ?? "Request failed");
    const code = String(result.body.code ?? "CONNECTOR_ERROR");

    return {
      isError: true,
      content: [{ type: "text", text: `${code}: ${message}` }],
      structuredContent: result.body,
    };
  }

  return {
    content: [{ type: "text", text: JSON.stringify(result.body) }],
    structuredContent: result.body,
  };
};

const requireWrite = (auth: McpAuthContext, _toolName: string) =>
  authorizeMcpTool(auth, "products:write");
const requireRead = (auth: McpAuthContext) =>
  authorizeMcpTool(auth, "products:read");

const categorySchema = z.enum(
  PRODUCT_CATEGORIES as [string, ...string[]]
);

const imageInputSchema = z.object({
  url: z.string().url().describe("Public http(s) image URL"),
  alt: z.string().max(160).optional().describe("Alt text for accessibility and SEO"),
});

const variantSchema = z.object({
  sku: z.string().describe("Unique variant SKU, uppercase letters, numbers, dot, dash or underscore"),
  name: z.string().optional(),
  price: z.number().min(0),
  mrp: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0).optional().describe("Defaults to 0"),
  attributes: z
    .array(z.object({ name: z.string(), value: z.string() }))
    .optional(),
});

const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

/**
 * Writable product fields, shared by create and update. Update makes all of
 * them optional; create keeps name, category and price required.
 */
const productFieldShape = {
  name: z.string().min(1).max(200).optional(),
  category: categorySchema.optional(),
  description: z.string().max(5000).optional(),
  price: z.number().min(0).optional(),
  mrp: z
    .number()
    .min(0)
    .optional()
    .describe("Must be greater than or equal to price"),
  originalPrice: z.number().min(0).optional(),
  offPrice: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  sku: z
    .string()
    .regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/)
    .optional()
    .describe("Unique product SKU"),
  slug: z.string().optional().describe("Optional; generated from the name when omitted"),
  stock: z.number().int().min(0).optional().describe("Defaults to 1 on create"),
  tags: z.array(z.string()).max(30).optional(),
  storefrontGroups: z.array(z.string()).optional(),
  badge: z.string().max(60).optional(),
  deliveryOptions: z.record(z.unknown()).optional(),
  comparisons: z.array(z.record(z.unknown())).optional(),
  seo: seoSchema.optional(),
  variants: z.array(variantSchema).max(50).optional(),
  images: z
    .array(imageInputSchema)
    .max(5)
    .optional()
    .describe("Replaces the image list; array order is the display order"),
};

const productIdSchema = z
  .string()
  .min(1)
  .describe("Product id (MongoDB ObjectId) or product slug");

export const registerConnectorTools = (
  server: OAuthMcpServer,
  auth: McpAuthContext
): void => {
  server.registerTool(
    "listProducts",
    {
      securitySchemes: [{ type: "oauth2", scopes: ["products:read"] }],
      title: "List products",
      description:
        "Read-only. List catalog products with optional filters and pagination. Status defaults to \"all\", which includes drafts; drafts are never visible on the storefront until publishProduct is called.",
      inputSchema: {
        status: z
          .enum(["draft", "published", "all"])
          .optional()
          .describe("Filter by status; defaults to all"),
        category: z.string().optional(),
        tag: z.string().optional(),
        sku: z.string().optional(),
        q: z.string().optional().describe("Search in name, sku, slug, description and tags"),
        sort: z
          .enum(["newest", "oldest", "price-asc", "price-desc", "name-asc"])
          .optional()
          .describe("Defaults to newest"),
        limit: z.number().int().min(1).max(100).optional().describe("Defaults to 20"),
        offset: z.number().int().min(0).optional().describe("Defaults to 0"),
        includeArchived: z.boolean().optional().describe("Defaults to false"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      const denied = await requireRead(auth);
      if (denied) return denied;
      const query: Record<string, unknown> = {};

      if (args.status) query.status = args.status;
      if (args.category) query.category = args.category;
      if (args.tag) query.tag = args.tag;
      if (args.sku) query.sku = args.sku;
      if (args.q) query.q = args.q;
      if (args.sort) query.sort = args.sort;
      if (args.limit !== undefined) query.limit = args.limit;
      if (args.offset !== undefined) query.offset = args.offset;
      if (args.includeArchived) query.includeArchived = "true";

      return toToolResult(await invoke(connectorListProducts, { query }));
    }
  );

  server.registerTool(
    "getProduct",
    {
      securitySchemes: [{ type: "oauth2", scopes: ["products:read"] }],
      title: "Get product",
      description:
        "Read-only. Fetch one product by id or slug, including drafts, images (with alt text and position), variants and SEO fields.",
      inputSchema: { productId: productIdSchema },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      const denied = await requireRead(auth);
      if (denied) return denied;
      return toToolResult(await invoke(connectorGetProduct, {
        params: { productId: args.productId },
      }));
    }
  );

  server.registerTool(
    "createProductDraft",
    {
      securitySchemes: [{ type: "oauth2", scopes: ["products:write"] }],
      title: "Create product draft",
      description:
        "Mutating. Create a new product as a draft — it is not visible on the storefront. Publishing is a separate, explicit step: call publishProduct when the draft is ready. A status field is not accepted here.",
      inputSchema: {
        ...productFieldShape,
        name: z.string().min(1).max(200),
        category: categorySchema,
        price: z.number().min(0),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (args) => {
      const denied = await requireWrite(auth, "createProductDraft");
      if (denied) return denied;

      return toToolResult(
        await invoke(connectorCreateProduct, { body: args })
      );
    }
  );

  server.registerTool(
    "updateProduct",
    {
      securitySchemes: [{ type: "oauth2", scopes: ["products:write"] }],
      title: "Update product",
      description:
        "Mutating. Update fields on an existing product. A draft stays a draft: this tool never publishes and does not accept status. Supplying images replaces the whole image list in array order.",
      inputSchema: {
        ...productFieldShape,
        productId: productIdSchema,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (args) => {
      const denied = await requireWrite(auth, "updateProduct");
      if (denied) return denied;

      const { productId, ...body } = args;

      return toToolResult(
        await invoke(connectorUpdateProduct, {
          params: { productId },
          body,
        })
      );
    }
  );

  server.registerTool(
    "publishProduct",
    {
      securitySchemes: [{ type: "oauth2", scopes: ["products:write"] }],
      title: "Publish product",
      description:
        "Mutating. Publish an existing draft, making it live on the storefront. This is the only tool that changes a product to published. Requires name, a price above 0, a valid category, non-negative stock and at least one image; otherwise the product is rejected with the list of issues.",
      inputSchema: { productId: productIdSchema },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const denied = await requireWrite(auth, "publishProduct");
      if (denied) return denied;

      return toToolResult(
        await invoke(connectorPublishProduct, {
          params: { productId: args.productId },
        })
      );
    }
  );

  server.registerTool(
    "uploadProductImages",
    {
      securitySchemes: [{ type: "oauth2", scopes: ["products:write"] }],
      title: "Upload product images",
      description:
        "Mutating. Append up to 5 images to a product from public http(s) URLs, preserving order and optional alt text. Over MCP only URL-based images are supported: binary multipart upload is not available in the MCP tool interface, so upload the file to Cloudinary (or any public CDN) first and pass its URL, or use the REST multipart endpoint POST /api/v1/connector/products/{productId}/images.",
      inputSchema: {
        productId: productIdSchema,
        imageUrls: z
          .array(z.string().url())
          .min(1)
          .max(5)
          .describe("Public http(s) image URLs, in display order"),
        alts: z
          .array(z.string().max(160))
          .max(5)
          .optional()
          .describe("Optional alt text, positionally matched to imageUrls"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      const denied = await requireWrite(auth, "uploadProductImages");
      if (denied) return denied;

      let last: HandlerResult = { status: 201, body: { success: true } };

      for (let index = 0; index < args.imageUrls.length; index += 1) {
        const url = args.imageUrls[index] ?? "";
        const alt = args.alts?.[index];

        last = await invoke(connectorAttachProductImage, {
          params: { productId: args.productId },
          body: { url, alt: alt ?? "" },
        });

        if (last.status >= 400) {
          const code = String(last.body.code ?? "IMAGE_ATTACH_FAILED");
          const message = String(last.body.message ?? "Failed to attach image");

          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `${code}: ${message} (${index} of ${args.imageUrls.length} images attached before the error)`,
              },
            ],
            structuredContent: {
              ...last.body,
              attachedCount: index,
            },
          };
        }
      }

      return toToolResult(last);
    }
  );

  server.registerTool(
    "attachProductImage",
    {
      securitySchemes: [{ type: "oauth2", scopes: ["products:write"] }],
      title: "Attach product image",
      description:
        "Mutating. Append one image to a product by public http(s) URL, with optional alt text. The image is added to the end of the current order.",
      inputSchema: {
        productId: productIdSchema,
        url: z.string().url().describe("Public http(s) image URL"),
        alt: z.string().max(160).optional(),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      const denied = await requireWrite(auth, "attachProductImage");
      if (denied) return denied;

      return toToolResult(
        await invoke(connectorAttachProductImage, {
          params: { productId: args.productId },
          body: { url: args.url, alt: args.alt ?? "" },
        })
      );
    }
  );

  server.registerTool(
    "reorderProductImages",
    {
      securitySchemes: [{ type: "oauth2", scopes: ["products:write"] }],
      title: "Reorder product images",
      description:
        "Mutating. Set the display order of a product's images. urls must list every current image URL exactly once, in the new order; alt text is preserved.",
      inputSchema: {
        productId: productIdSchema,
        urls: z
          .array(z.string().url())
          .min(1)
          .describe("Every current image URL exactly once, in the new order"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const denied = await requireWrite(auth, "reorderProductImages");
      if (denied) return denied;

      return toToolResult(
        await invoke(connectorReorderProductImages, {
          params: { productId: args.productId },
          body: { urls: args.urls },
        })
      );
    }
  );

  server.registerTool(
    "updateImageAltText",
    {
      securitySchemes: [{ type: "oauth2", scopes: ["products:write"] }],
      title: "Update image alt text",
      description:
        "Mutating. Replace the alt text of one image, addressed by its zero-based position in the current image order. Send an empty string to clear it.",
      inputSchema: {
        productId: productIdSchema,
        imageIndex: z
          .number()
          .int()
          .min(0)
          .describe("Zero-based index in the current image order"),
        alt: z.string().max(160),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const denied = await requireWrite(auth, "updateImageAltText");
      if (denied) return denied;

      return toToolResult(
        await invoke(connectorUpdateImageAlt, {
          params: {
            productId: args.productId,
            imageIndex: String(args.imageIndex),
          },
          body: { alt: args.alt },
        })
      );
    }
  );

  server.registerTool(
    "listCategories",
    {
      securitySchemes: [{ type: "oauth2", scopes: ["products:read"] }],
      title: "List categories",
      description:
        "Read-only. List the allowed product categories with total and published product counts. Only these categories can be used when creating or updating a product.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => (await requireRead(auth)) ?? toToolResult(await invoke(connectorListCategories, {}))
  );

  server.registerTool(
    "listTags",
    {
      securitySchemes: [{ type: "oauth2", scopes: ["products:read"] }],
      title: "List tags",
      description:
        "Read-only. List every tag currently used by a product, sorted alphabetically.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => (await requireRead(auth)) ?? toToolResult(await invoke(connectorListTags, {}))
  );
};
