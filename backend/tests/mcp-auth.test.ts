import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPair, SignJWT } from "jose";
import { api } from "./helpers.js";
import { configureAuth0, issueAuth0Token } from "./auth0Helpers.js";
import { MCP_RESOURCE, MCP_RESOURCE_METADATA } from "../src/modules/mcp/auth0.js";

const { read, write } = vi.hoisted(() => ({
  read: vi.fn(async (_req: unknown, res: any) => { res.json({ success: true, categories: ["test-fixture"] }); }),
  write: vi.fn(async (_req: unknown, res: any) => { res.json({ success: true, product: { status: "draft" } }); }),
}));
vi.mock("../src/modules/connector/taxonomy.controller.js", async original => ({
  ...await original<Record<string, unknown>>(), connectorListCategories: read,
}));
vi.mock("../src/modules/connector/products.controller.js", async original => ({
  ...await original<Record<string, unknown>>(), connectorCreateProduct: write,
}));

let fixture: Awaited<ReturnType<typeof configureAuth0>>;
beforeEach(async () => { fixture = await configureAuth0(); read.mockClear(); write.mockClear(); });
afterEach(() => { vi.unstubAllGlobals(); });
const rpc = (method: string, params = {}, token?: string) => {
  const request = api().post("/mcp").set("Accept", "application/json, text/event-stream")
    .set("MCP-Protocol-Version", "2025-06-18");
  if (token) request.set("Authorization", `Bearer ${token}`);
  return request.send({ jsonrpc: "2.0", id: 1, method, params });
};
const call = (name: string, token?: string) => rpc("tools/call", { name, arguments: name === "createProductDraft" ?
  { name: "Auth fixture", category: "Flower Bouquets", price: 100 } : {} }, token);
const challenge = (response: any, scope: string, error = "invalid_token") => {
  expect(response.status).toBe(200);
  expect(response.body.result.isError).toBe(true);
  expect(response.body.result.structuredContent).toBeUndefined();
  const value = response.body.result._meta["mcp/www_authenticate"][0];
  expect(value).toContain(`resource_metadata="${MCP_RESOURCE_METADATA}"`);
  expect(value).toContain(`scope="${scope}"`); expect(value).toContain(`error="${error}"`);
  expect(response.headers["www-authenticate"]).toBe(value);
};

describe("Auth0 protected resource and MCP discovery", () => {
  it("advertises the Auth0 issuer while preserving the QuickWish resource and scopes", async () => {
    for (const path of ["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp"]) {
      const response = await api().get(path);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ resource: MCP_RESOURCE, authorization_servers: [fixture.issuer],
        scopes_supported: ["products:read", "products:write"], bearer_methods_supported: ["header"] });
    }
  });
  it("keeps initialize and all eleven OAuth tool descriptors anonymous even when unconfigured", async () => {
    delete process.env.AUTH0_AUDIENCE;
    const initialized = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {},
      clientInfo: { name: "auth-fixture", version: "1" } });
    expect(initialized.status).toBe(200);
    expect(initialized.body.result.serverInfo.name).toBe("quickwish-connector");
    const listed = await rpc("tools/list");
    const readTools = ["listProducts", "getProduct", "listCategories", "listTags"];
    const writeTools = ["createProductDraft", "updateProduct", "publishProduct", "uploadProductImages",
      "attachProductImage", "reorderProductImages", "updateImageAltText"];
    expect(listed.body.result.tools.map((t: any) => t.name).sort()).toEqual([...readTools, ...writeTools].sort());
    for (const tool of listed.body.result.tools) {
      const scopes = [readTools.includes(tool.name) ? "products:read" : "products:write"];
      expect(tool.securitySchemes).toEqual([{ type: "oauth2", scopes }]);
      expect(tool._meta.securitySchemes).toEqual(tool.securitySchemes);
      expect(tool.inputSchema.type).toBe("object"); expect(tool.description).toBeTruthy(); expect(tool.annotations).toBeTruthy();
    }
    expect(read).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled();
  });
  it.each(["/oauth/register", "/oauth/authorize", "/oauth/token", "/oauth/revoke",
    "/.well-known/oauth-authorization-server"])("retires custom authorization-server route %s", async path => {
    expect((await api().get(path)).status).toBe(410);
    expect((await api().post(path).send({})).status).toBe(410);
    expect(read).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled();
  });
  it("returns metadata unavailable without Auth0 configuration and still challenges anonymous calls", async () => {
    delete process.env.AUTH0_DOMAIN;
    expect((await api().get("/.well-known/oauth-protected-resource/mcp")).status).toBe(503);
    challenge(await call("listCategories"), "products:read");
    expect(read).not.toHaveBeenCalled();
  });
});

describe("Auth0 JWT verification at protected MCP execution", () => {
  it("challenges anonymous read and write calls before invoking controllers", async () => {
    challenge(await call("listCategories"), "products:read");
    challenge(await call("createProductDraft"), "products:write");
    expect(read).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled();
  });
  it("verifies a real RS256 JWT through HTTPS JWKS and accepts JWT dots in the Bearer header", async () => {
    const token = await issueAuth0Token("products:read");
    const response = await call("listCategories", token);
    expect(response.body.result.isError).toBeFalsy(); expect(read).toHaveBeenCalledTimes(1);
    expect(fixture.fetch).toHaveBeenCalledTimes(1);
    expect(String(fixture.fetch.mock.calls[0]?.[0])).toBe(fixture.jwksUri);
    await call("listCategories", token);
    expect(fixture.fetch).toHaveBeenCalledTimes(1); // Public keys cached, tokens still validated.
  });
  it("permits write-scoped tokens only on mutations", async () => {
    const token = await issueAuth0Token("products:write");
    expect((await call("createProductDraft", token)).body.result.isError).toBeFalsy();
    expect(write).toHaveBeenCalledTimes(1);
    challenge(await call("listCategories", token), "products:read", "insufficient_scope");
    expect(read).not.toHaveBeenCalled();
  });
  it.each([
    { iss: "https://other.auth0.invalid/" }, { aud: "https://other-api.invalid" },
    { exp: Math.floor(Date.now() / 1000) - 60 }, { exp: undefined },
    { nbf: Math.floor(Date.now() / 1000) + 3600 }, { aud: undefined }, { iss: undefined },
  ])("rejects invalid JWT issuer/audience/time claims %#", async claims => {
    challenge(await call("listCategories", await issueAuth0Token("products:read", claims)), "products:read");
    expect(read).not.toHaveBeenCalled();
  });
  it("rejects invalid signatures even when issuer, audience, kid and claims look correct", async () => {
    const attacker = await generateKeyPair("RS256");
    challenge(await call("listCategories", await issueAuth0Token("products:read", {}, attacker.privateKey)), "products:read");
    expect(read).not.toHaveBeenCalled();
  });
  it("rejects HS256 algorithm confusion, unsigned JWTs and legacy opaque credentials", async () => {
    const token = await new SignJWT({ iss: fixture.issuer, aud: fixture.audience, scope: "products:read" })
      .setProtectedHeader({ alg: "HS256", kid: "fixture" }).setExpirationTime("1h").sign(crypto.randomBytes(32));
    for (const invalid of [token, "eyJhbGciOiJub25lIn0.e30.", "retired-opaque-token"]) {
      challenge(await call("listCategories", invalid), "products:read");
    }
    expect(read).not.toHaveBeenCalled();
  });
  it("rejects missing permissions and read-only tokens on writes", async () => {
    challenge(await call("listCategories", await issueAuth0Token(undefined)), "products:read", "insufficient_scope");
    challenge(await call("createProductDraft", await issueAuth0Token("products:read")), "products:write", "insufficient_scope");
    expect(read).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled();
  });
  it("maps Auth0 permissions without widening explicitly restricted scopes", async () => {
    expect((await call("listCategories", await issueAuth0Token(undefined, { permissions: ["products:read"] })))
      .body.result.isError).toBeFalsy();
    const narrowed = await issueAuth0Token("products:read", { permissions: ["products:read", "products:write"] });
    challenge(await call("createProductDraft", narrowed), "products:write", "insufficient_scope");
    const restricted = await issueAuth0Token("products:read products:write", { permissions: ["products:read"] });
    challenge(await call("createProductDraft", restricted), "products:write", "insufficient_scope");
    expect(write).not.toHaveBeenCalled();
  });
  it("supports a matching API audience inside an aud array", async () => {
    expect((await call("listCategories", await issueAuth0Token("products:read", {
      aud: [fixture.audience, `${fixture.issuer}userinfo`],
    }))).body.result.isError).toBeFalsy();
    expect(read).toHaveBeenCalledTimes(1);
  });
  it("fails closed on JWKS outages and does not trust token-provided key URLs", async () => {
    fixture.fetch.mockRejectedValue(new Error("JWKS unavailable"));
    challenge(await call("listCategories", await issueAuth0Token("products:read")), "products:read");
    expect(read).not.toHaveBeenCalled();
  });
  it("fails closed when configuration is missing or JWKS points outside the issuer", async () => {
    const token = await issueAuth0Token("products:read");
    process.env.AUTH0_JWKS_URI = "https://attacker.invalid/.well-known/jwks.json";
    const response = await call("listCategories", token);
    expect(response.body.result.isError).toBe(true); expect(response.body.result.structuredContent).toBeUndefined();
    expect(read).not.toHaveBeenCalled(); expect(fixture.fetch).not.toHaveBeenCalled();
  });
  it("keeps connector API-key credentials separate from Auth0 access tokens", async () => {
    const key = crypto.randomBytes(32).toString("hex");
    const previous = process.env.CONNECTOR_API_KEYS;
    const single = process.env.CONNECTOR_API_KEY;
    process.env.CONNECTOR_API_KEYS = JSON.stringify([{ id: "fixture", sha256: crypto.createHash("sha256").update(key).digest("hex"), scopes: ["products:read"] }]);
    delete process.env.CONNECTOR_API_KEY;
    try {
      const jwt = await issueAuth0Token("products:read");
      expect((await api().get("/api/v1/connector/categories").set("Authorization", `Bearer ${jwt}`)).status).toBe(401);
      expect(read).not.toHaveBeenCalled();
      challenge(await call("listCategories", key), "products:read");
      expect(read).not.toHaveBeenCalled();
      expect((await api().get("/api/v1/connector/categories").set("Authorization", `Bearer ${key}`)).status).toBe(200);
    } finally {
      if (previous === undefined) delete process.env.CONNECTOR_API_KEYS; else process.env.CONNECTOR_API_KEYS = previous;
      if (single === undefined) delete process.env.CONNECTOR_API_KEY; else process.env.CONNECTOR_API_KEY = single;
    }
  });
});
