---
name: connect-quickwish
description: Set up or reconnect QuickWish Product Manager through OAuth when catalog tools require authorization.
---

# Connect QuickWish Product Manager

The bundled server `quickwish-products` connects to `https://api.quickwish.shop/mcp`
using Streamable HTTP, OAuth 2.1 Authorization Code with S256 PKCE, Dynamic Client
Registration, and the scopes `products:read` and `products:write`.

ChatGPT can initialize the server and discover all eleven tool definitions before
authorization. Product operations remain protected. Invoking a protected tool
should automatically initiate ChatGPT's OAuth authorization flow when access is
missing, expired, or insufficient.

1. Invoke `listCategories` as a read-only connection check. If authorization is
   required, its result supplies the OAuth challenge for ChatGPT to start linking.
2. Complete the QuickWish administrator consent page opened by ChatGPT. Enter
   the OAuth administrator secret only on that HTTPS authorization page.
3. After OAuth completes, retry `listCategories`. A successful tool response
   confirms the connection. Continue with the user's catalog task.
4. If ChatGPT does not attach tools or offer OAuth after the challenge, report
   that the current host has not activated the bundled connection. Do not invent
   tool results, credential prompts, setup URLs, or global server setup steps.

Never request credentials in chat. Never print, persist, or package access
tokens, authorization codes, client secrets, or the administrator secret. Let
the host discover the authorization server and register its client automatically.

Setup must not create, update, publish, reorder, or otherwise mutate products.
Create products as drafts. Publish only when the user explicitly requests it.
Preserve image order and write descriptive, accurate alt text.
