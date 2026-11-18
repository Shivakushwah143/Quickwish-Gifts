import { generateKeyPair, exportJWK, SignJWT } from "jose";
import { vi } from "vitest";

let keys: Awaited<ReturnType<typeof generateKeyPair>>;
let sequence = 0;
export const fixtureKeys = async () => keys ??= await generateKeyPair("RS256", { extractable: true });

// No Auth0 account/network/credentials are used in tests. Real jose JWT/JWKS
// verification runs against an HTTPS JWKS response stub with ephemeral keys.
export const configureAuth0 = async () => {
  const pair = await fixtureKeys();
  const domain = `quickwish-fixture-${++sequence}.auth0.invalid`;
  process.env.AUTH0_DOMAIN = domain;
  process.env.AUTH0_ISSUER = `https://${domain}/`;
  process.env.AUTH0_AUDIENCE = "https://api.quickwish.shop/mcp";
  process.env.AUTH0_JWKS_URI = `https://${domain}/.well-known/jwks.json`;
  const publicKey = { ...await exportJWK(pair.publicKey), kid: "fixture", alg: "RS256", use: "sig" };
  const jwksUri = process.env.AUTH0_JWKS_URI;
  const fetch = vi.fn(async (url: unknown) => {
    if (String(url) !== jwksUri) throw new Error("Unexpected test network request");
    return new Response(JSON.stringify({ keys: [publicKey] }), { headers: { "Content-Type": "application/json" } });
  });
  vi.stubGlobal("fetch", fetch);
  return { fetch, issuer: process.env.AUTH0_ISSUER, audience: process.env.AUTH0_AUDIENCE, jwksUri };
};

export const issueAuth0Token = async (scope: string | undefined, claims: Record<string, unknown> = {},
  signingKey?: CryptoKey) => {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ iss: process.env.AUTH0_ISSUER, aud: process.env.AUTH0_AUDIENCE,
    sub: "trusted-admin-fixture", iat: now, exp: now + 3600, scope, ...claims })
    .setProtectedHeader({ alg: "RS256", kid: "fixture" })
    .sign(signingKey ?? (await fixtureKeys()).privateKey);
};
