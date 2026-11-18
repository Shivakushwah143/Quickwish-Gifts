# Retired: custom QuickWish OAuth server

This is a historical guide for the removed custom authorization server. Its
routes, environment settings and test commands no longer apply to this source.
Use the [Auth0 resource-server guide](auth0-mcp.md) for the pending migration.

#  https://www.xvideos-india.com/video.kdiuomfba19/hot_skinny_indian_teen_pussy_spermed

Production resource: `https://api.quickwish.shop/mcp`. Issuer:
`https://api.quickwish.shop`. POST `/mcp` uses stateless Streamable HTTP.

## Discovery and execution boundary

`initialize`, initialized notifications and `tools/list` are public protocol
operations. Descriptors expose all eleven names, input schemas, annotations and
top-level `securitySchemes` (mirrored in `_meta` for compatible clients). They do
not return catalog records. SDK 1.32.2 lacks a typed top-level registration
option; `toolRegistry.ts` uses its public registration, JSON-schema conversion
and request-handler APIs to serialize that extension explicitly.

Every product tool validates OAuth on invocation, before calling the unchanged
connector controller. Read tools (`listProducts`, `getProduct`, `listCategories`,
`listTags`) require `products:read`; all seven mutations require `products:write`.
Invalid, missing, expired, wrong-resource and insufficient-scope credentials
receive an SDK `CallToolResult` with `isError`, no product payload, and
`_meta["mcp/www_authenticate"]`. The challenge contains the resource metadata URL,
required scope, `error` and `error_description`. HTTP `WWW-Authenticate` is also
set. A tool challenge uses HTTP 200 so the client can process the MCP result.
Unavailable configuration/storage fails closed and never reaches a controller.

The REST `/api/v1/connector/*` middleware still uses `CONNECTOR_API_KEYS` /
`CONNECTOR_API_KEY` and existing Bearer/scoped authentication. OAuth changes do
not alter customer or frontend authentication.

## OAuth endpoints

- GET `/.well-known/oauth-protected-resource` and
  `/.well-known/oauth-protected-resource/mcp`: RFC 9728 resource metadata.
- GET `/.well-known/oauth-authorization-server`: RFC 8414 metadata.
- POST `/oauth/register`: RFC 7591 DCR restricted to configured exact HTTPS
  redirects; public `none`, confidential `client_secret_post` and
  `client_secret_basic` clients are supported.
- GET `/oauth/authorize`: code request with mandatory S256 PKCE, exact redirect,
  requested scope and `resource=https://api.quickwish.shop/mcp`.
- POST `/oauth/authorize`: owner authentication/consent, bound to a Secure,
  HttpOnly, SameSite cookie, a hashed transaction and a CSRF token. It requires
  the exact issuer Origin. No public signup or reusable admin session exists.
- POST `/oauth/token`: code exchange requires matching client, PKCE, exact
  redirect and resource. Clients registered for `refresh_token` also receive a
  rotating refresh token. Refresh exchanges require the same client/resource
  and cannot expand scopes. Code consumption and refresh rotation are atomic.
- POST `/oauth/revoke`: client-bound, idempotent access/refresh token revocation.

Successful and denied authorization redirects carry `iss` and the original
`state`. Codes expire after 120 seconds; consent forms after five minutes.
Opaque random 256-bit access tokens expire after one hour. Registered clients
may use the `refresh_token` grant; refresh credentials are random 256-bit values
with an absolute 30-day expiry, replaced on every successful exchange. Reuse of
a consumed refresh credential revokes its family and associated access tokens.
No client-credentials or implicit grants are supported. Only hashes
of tokens, codes, browser/CSRF credentials and confidential client secrets are
persisted in dedicated MongoDB collections, including refresh credentials.
Expiry is checked on each request;
TTL cleanup timing does not affect validity. Rate limits are shared in MongoDB.

## Environment and proxy

Retain existing production values; do not rotate or print secrets for deployment.

- `MCP_OAUTH_ISSUER=https://api.quickwish.shop`
- `MCP_OAUTH_REDIRECT_URIS`: JSON array of exact approved callbacks. Production
  uses `["https://chatgpt.com/connector_platform_oauth_redirect"]`. Copy the exact
  callback from ChatGPT management if an additional callback is needed; do not
  use wildcard redirects.
- `MCP_OAUTH_ADMIN_SECRET_SHA256`: SHA-256 hex digest of the separate strong
  owner login secret; the owner enters the original secret on QuickWish's
  authorization page. Do not reuse REST or customer credentials.
- Existing MongoDB/backend environment and connector key configuration remain
  unchanged. No OAuth secret belongs in a plugin file or Git.

Nginx must proxy `/mcp`, `/oauth/*`, and `/.well-known/oauth-*` to this backend,
preserving `Authorization`, `Host`, `X-Forwarded-For`, and
`X-Forwarded-Proto: https`. The app trusts one existing proxy hop. URLs are built
from the configured HTTPS issuer, never incoming host headers. Log paths/status
only for OAuth: do not log request bodies, Authorization/Cookie headers or
authorization/token query strings. Do not expose the backend port publicly.

## Plugin package

Canonical source: `plugins/quickwish-product-manager/`. Version `0.1.4`, same
plugin identity. `plugin.json`, `mcp.json` and the two skills are sufficient for
Agent Plugins; no legacy compatibility files are needed in this source.

The exact per-server auth configuration in canonical `mcp.json` is:

```json
{
  "type": "oauth",
  "client": { "mode": "dcr" },
  "baseScopes": ["products:read", "products:write"]
}
```

No client ID or secret is supplied in the package. Update the existing private
QuickWish Product Manager plugin with `quickwish-product-manager-0.1.4.zip`;
do not create a duplicate. Refresh the existing connection/tool scan if the host
retains the prior server descriptors. Invoke `listCategories` to start OAuth.

## Validate and deploy

```bash
cd /opt/quickwish-gifts/backend
npm run build
npm test -- tests/connector.test.ts tests/mcp.test.ts tests/oauth.test.ts
cd /opt/quickwish-gifts
docker compose build quickwish-backend
docker compose up -d --no-deps --force-recreate quickwish-backend
node backend/scripts/verify-mcp-production.mjs
```

The verifier uses actual production HTTPS, public metadata/discovery and
unauthorized read/write tool calls only. It never creates products, collects
secrets or completes owner authorization. Authenticated execution, PKCE, token
expiry, revocation and business behavior are covered against isolated MongoDB
by the automated suites.

References: [OpenAI authentication](https://developers.openai.com/plugins/build/auth),
[MCP authorization](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization).
