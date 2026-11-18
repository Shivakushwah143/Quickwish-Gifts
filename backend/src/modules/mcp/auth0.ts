import { createRemoteJWKSet, jwtVerify } from "jose";
import type { ConnectorScope } from "../../middleware/connectorAuth.js";

// Public resource identifiers, never authorization-server endpoints.
export const MCP_RESOURCE = "https://api.quickwish.shop/mcp";
export const MCP_RESOURCE_METADATA = "https://api.quickwish.shop/.well-known/oauth-protected-resource/mcp";
export const MCP_SCOPES: ConnectorScope[] = ["products:read", "products:write"];

function configurationError(): never { throw new Error("Auth0 MCP authentication is not configured correctly"); }

export const getAuth0Config = () => {
  const domain = process.env.AUTH0_DOMAIN?.trim();
  const issuer = process.env.AUTH0_ISSUER?.trim();
  const audience = process.env.AUTH0_AUDIENCE?.trim();
  const jwksUri = process.env.AUTH0_JWKS_URI?.trim();
  if (!domain || !issuer || !audience || !jwksUri) return configurationError();
  try {
    const issuerUrl = new URL(issuer);
    const jwksUrl = new URL(jwksUri);
    if (issuerUrl.protocol !== "https:" || issuer !== `${issuerUrl.origin}/` ||
        issuerUrl.hostname !== domain || issuerUrl.port || issuerUrl.username || issuerUrl.password ||
        jwksUrl.origin !== issuerUrl.origin || jwksUrl.pathname !== "/.well-known/jwks.json" ||
        jwksUrl.username || jwksUrl.password || jwksUrl.search || jwksUrl.hash) return configurationError();
    return { issuer, audience, jwksUri: jwksUrl.href };
  } catch { return configurationError(); }
};

let cached: { config: string; keys: ReturnType<typeof createRemoteJWKSet> } | undefined;

/** Auth0 alone issues tokens. QuickWish validates every invocation locally. */
export const validateAuth0Token = async (token: string): Promise<{ scopes: ConnectorScope[] } | null> => {
  if (!token) return null;
  // Configuration failures never fall back to connector/customer credentials.
  const config = getAuth0Config();
  if (token.length > 16_384) return null;
  const identity = JSON.stringify(config);
  if (cached?.config !== identity) {
    cached = { config: identity, keys: createRemoteJWKSet(new URL(config.jwksUri), {
      timeoutDuration: 5000, cooldownDuration: 30_000, cacheMaxAge: 600_000,
    }) };
  }
  try {
    // Only configured JWKS are trusted; JWT jku/x5u headers cannot choose keys.
    const { payload } = await jwtVerify(token, cached.keys, {
      issuer: config.issuer, audience: config.audience, algorithms: ["RS256"],
      requiredClaims: ["iss", "aud", "exp"], clockTolerance: 0,
    });
    if (payload.scope !== undefined && typeof payload.scope !== "string") return null;
    if (payload.permissions !== undefined && (!Array.isArray(payload.permissions) ||
        !payload.permissions.every(p => typeof p === "string"))) return null;
    const requested = typeof payload.scope === "string" ? payload.scope.split(/\s+/) : undefined;
    const permissions = payload.permissions as string[] | undefined;
    // Permissions must never widen an explicitly narrower scope claim.
    const grants = MCP_SCOPES.filter(scope => requested ? requested.includes(scope) &&
      (!permissions || permissions.includes(scope)) : !!permissions?.includes(scope));
    return { scopes: grants };
  } catch {
    // No token material, claims, signatures, hashes or library errors in logs.
    return null;
  }
};
