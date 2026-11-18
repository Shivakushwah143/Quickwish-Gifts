---
name: quickwish-product-management
description: Use when managing QuickWish products, categories, tags, product images, drafts, or publishing through the QuickWish MCP tools.
---

# QuickWish Product Manager

Use the connected QuickWish MCP tools as the source of truth. Do not invent product IDs, categories, tags, endpoints, fields, or image URLs.

## Connection readiness

For initial setup or missing/expired authorization, follow
[Connect QuickWish](../connect-quickwish/SKILL.md). Invoke a protected read tool
so its OAuth challenge can start ChatGPT's authorization flow. Continue catalog
operations only after the OAuth-authorized tool succeeds.
## Core workflow

- New products must be created with `createProductDraft`.
- Creating or updating a product must never publish it.
- Use `publishProduct` only when the user explicitly asks to publish, make live, or otherwise clearly authorizes publication.
- Before publishing, ensure the draft meets the server's publish requirements. If the server returns validation issues, report them and keep the product as a draft.
- Prefer `listCategories` before creating or changing a category when the valid category is uncertain.
- Prefer `listTags` when reusing existing catalog tags would help.

## Product editing

- Use `getProduct` before a potentially ambiguous update so the current state is known.
- Preserve fields the user did not ask to change.
- Preserve product image order unless the user asks for a change.
- `updateProduct` must not be used to simulate publishing.

## Images

- For MCP image operations, images must be available at public HTTP(S) URLs.
- `uploadProductImages` appends URL-based images in the supplied order.
- `attachProductImage` appends one public image URL.
- Use concise, descriptive alt text that describes the product image for accessibility and SEO without keyword stuffing.
- Use `reorderProductImages` only with every current image URL exactly once.
- Use `updateImageAltText` for targeted alt-text edits.
- If the user provides a local image that cannot be represented as a public URL through available tools, explain that it must first be uploaded to a public CDN/Cloudinary or sent through the REST multipart upload flow.

## Safety and confirmation

- Treat `publishProduct` as a consequential write action. Publish only on explicit user instruction.
- Never reveal, print, echo, or store OAuth credentials in responses or plugin files.
- Use only the OAuth connection authorized by the host for MCP operations.

## Tool selection

- `listProducts`: browse/search/filter products.
- `getProduct`: retrieve one product by ID or slug.
- `createProductDraft`: create a new draft product.
- `updateProduct`: edit an existing product without publishing.
- `publishProduct`: explicitly publish an existing draft.
- `uploadProductImages`: append multiple public image URLs.
- `attachProductImage`: append one public image URL.
- `reorderProductImages`: change image display order.
- `updateImageAltText`: edit alt text for one image.
- `listCategories`: inspect valid categories and counts.
- `listTags`: inspect existing product tags.
