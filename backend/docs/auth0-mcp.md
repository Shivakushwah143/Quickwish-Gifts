# QuickWish MCP as an Auth0 resource server

This migration is prepared locally and has **not been deployed**. Supply the
tenant configuration and complete the Auth0 setup below before deployment.
The running production backend remains on the previous implementation.

## Resource boundary

The endpoint stays `https://api.quickwish.shop/mcp`, with the same eleven product
tools, descriptions, input schemas, annotations, and per-tool `securitySchemes`.
`initialize` and `tools/list` stay anonymous. Every product tool verifies the
Auth0 access token before invoking the unchanged connector controller.

The existing scope names remain `products:read` and `products:write`; these are
distinct permissions. Reads require the former, mutations/publishing the latter.
Auth0's `scope` claim is used when present. If `permissions` is also present it
further restricts access; it never widens the requested scope. A permissions-only
token may grant the corresponding permissions when no scope claim is present.
Missing permissions fail closed.

`jose` verifies RS256 signatures against the configured HTTPS JWKS, requires
issuer, audience and expiration, and checks expiration/not-before on every call.
Only public signing keys are cached (10 minutes, 30-second unknown-key cooldown,
5-second fetch timeout). Token-provided `jku`/`x5u` URLs never select the key
source. Missing/invalid configuration or unavailable/untrusted keys cannot grant
product access. No token material or claims are logged or persisted by QuickWish.

Both public resource metadata URLs return the fixed MCP resource identifier,
the configured Auth0 issuer, and both product scopes:

- `/.well-known/oauth-protected-resource`
- `/.well-known/oauth-protected-resource/mcp`

Authentication failures retain HTTP `WWW-Authenticate` plus the MCP tool result's
`_meta["mcp/www_authenticate"]`, always pointing to QuickWish's resource metadata.
Invalid credentials use `invalid_token`; missing permissions use
`insufficient_scope`. HTTP 200 carries these MCP error results as before.

## Environment (all four required)

Use the same Auth0 tenant/custom domain consistently:

```dotenv
AUTH0_DOMAIN=YOUR_TENANT.region.auth0.com
AUTH0_ISSUER=https://YOUR_TENANT.region.auth0.com/
AUTH0_AUDIENCE=https://api.quickwish.shop/mcp
AUTH0_JWKS_URI=https://YOUR_TENANT.region.auth0.com/.well-known/jwks.json
```

The issuer must match the access token's `iss` exactly, including its trailing
slash. The domain must match the issuer hostname. JWKS must be the HTTPS
`/.well-known/jwks.json` endpoint on that issuer's origin. The audience is the
Auth0 API Identifier, not a client ID or the Management API audience. An audience
array is accepted only if it contains this configured identifier.

These four values are configuration identifiers, not client secrets. QuickWish
does not need an Auth0 client secret, management token, signing private key or
administrator password. Do not put any secrets in source/plugin files or logs.
Production environment files were not changed by this migration.

## Auth0 Dashboard setup still required

1. **Applications → APIs → Create API**: name `QuickWish MCP`, Identifier
   `https://api.quickwish.shop/mcp`, signing algorithm **RS256**. If reusing a
   QuickWish API, its Identifier must instead match `AUTH0_AUDIENCE` exactly and
   its resource-indicator mapping must cover the MCP resource.
2. On this API's **Permissions** tab create `products:read` and `products:write`.
   In **Settings**, enable **RBAC**, **Add Permissions in the Access Token**, and
   **Allow Offline Access** for refresh tokens. Choose an appropriate access
   token lifetime (for example one hour).
3. **User Management → Roles**: create a QuickWish administrator role with these
   two API permissions and assign it only to the trusted owner account. Use
   Auth0 Universal Login with the intended connection; disable public database
   signup for this private workflow. Do not grant this role to ordinary users.
4. **Settings → Advanced → Settings**: enable **Dynamic Client Registration**
   and **Resource Parameter Compatibility Profile**. MCP clients use
   `resource=https://api.quickwish.shop/mcp`; that must select this API rather
   than `/userinfo`. Keep third-party client security in strict mode. Legacy
   tenants may need Auth0's `dynamic_client_registration_security_mode=strict`
   tenant setting via Management API/Support; that affects newly registered
   clients, so recreate stale DCR clients after correcting it.
5. On the API's **Settings → Default Permissions for third-party applications**,
   allow **User-delegated Access** to exactly `products:read` and
   `products:write`, and leave **Client Access** unauthorized. The default grant
   is for `subject_type=user`, not client credentials. Keep per-application API
   access policy/client grants consistent with that restriction. DCR by itself
   does not grant API permissions; user RBAC must also authorize the scopes.
6. The ChatGPT client uses **Authorization Code + PKCE S256** and may request
   `refresh_token`. Its Auth0 application must allow both grants. Configure
   refresh-token rotation with expiring credentials in Auth0 for this public
   client. For refresh issuance, the authorization request must include
   `offline_access`, and the API must allow offline access. DCR application
   settings/policy must permit the intended login connection.
7. Register/allow only the exact ChatGPT callback shown in its connection setup.
   The previously used callback is
   `https://chatgpt.com/connector_platform_oauth_redirect`; if ChatGPT shows a
   callback-specific URL, use that exact value as well. Do not use wildcards.
   Auth0 performs redirect validation; QuickWish no longer has a redirect
   allowlist or consent page.
8. Confirm the tenant's `/.well-known/oauth-authorization-server` or
   `/.well-known/openid-configuration` advertises the correct issuer, authorization,
   token, registration and JWKS endpoints and S256 support. Copy the four
   environment values above from that tenant/API before scheduling deployment.

Auth0 manages consent, authorization codes, refresh rotation and revocation.
QuickWish does not add `offline_access` to the existing plugin in this task;
request it in the host's OAuth configuration when persistent refresh is needed.
The product-scope model and plugin files are unchanged. The existing bundled
OAuth DCR configuration relies on resource metadata to discover Auth0.

## Retired custom server and migration

The four `/oauth/register`, `/oauth/authorize`, `/oauth/token`, `/oauth/revoke`
routes and `/.well-known/oauth-authorization-server` now return **HTTP 410**.
They neither issue nor proxy credentials. `oauthStore.ts` and the old
authorization-server tests/helpers were removed. There is no runtime use of
OAuthGrant, OAuthClient, OAuthToken, OAuthRefreshToken, custom consent secrets,
opaque token issuance, or temporary OAuth diagnostics.

No production data or environment secrets were deleted. Legacy MongoDB
collections remain untouched while the old deployment is running. After a
deliberate cutover, old opaque tokens will be rejected and users must reconnect
through Auth0. Remove obsolete `MCP_OAUTH_*` configuration and archive/drop legacy
OAuth collections separately after the new deployment is verified. Preserve
`CONNECTOR_API_KEYS`, REST routes, and customer/admin authentication unchanged.

## Validation and pending release

Only these checks were authorized:

```bash
cd /opt/quickwish-gifts/backend
npm run build
npm test -- tests/mcp-auth.test.ts
```

Focused tests use ephemeral signing keys, real jose JWT/JWKS verification,
stubbed HTTPS JWKS responses and controller spies. They use no Auth0 account or
production database. The existing MCP behavior suite's fixtures were migrated
to Auth0 JWTs, but that suite and full project suites were not run.

Do not deploy before the required tenant values are supplied. After approval
of that configured cutover, deploy only the backend; the existing production
verifier now expects Auth0 environment values, for example via Node's
`--env-file=backend/.env.production` option. It was not run against the unchanged
production deployment as part of this task.

Sources:
- [Auth0 access-token validation](https://auth0.com/docs/secure/tokens/access-tokens/validate-access-tokens)
- [Auth0 resource-parameter configuration](https://support.auth0.com/center/s/article/mcp-audience-error-with-auth0)
- [Auth0 DCR setup](https://auth0.com/ai/docs/mcp/guides/test-your-mcp-server-with-mcp-inspector)
- [API access policies and third-party default grants](https://auth0.com/blog/developers-guide-api-access-policies-auth0/)
- [Legacy DCR strict mode](https://support.auth0.com/center/s/article/enable-strict-dcr-mode-for-tenant)
- [jose JWT/JWKS implementation](https://github.com/panva/jose)
