import assert from "node:assert/strict";
import { getAuth0Config } from "../dist/modules/mcp/auth0.js";

const base = "https://api.quickwish.shop";
const resource = `${base}/mcp`;
const reads = ["listProducts", "getProduct", "listCategories", "listTags"];
const writes = ["createProductDraft", "updateProduct", "publishProduct", "uploadProductImages",
  "attachProductImage", "reorderProductImages", "updateImageAltText"];
let id = 0;
const get = async path => {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(15000) });
  return { response, body: await response.json() };
};
const rpc = async (method, params, token) => {
  const response = await fetch(resource, { method: "POST", signal: AbortSignal.timeout(15000), headers: {
    "Content-Type": "application/json", Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": "2025-06-18", ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }, body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }) });
  assert.equal(response.status, 200, `MCP ${method} must return HTTP 200`);
  return { response, body: await response.json() };
};

try {
  const { issuer } = getAuth0Config();
  const health = await get("/api/v1/health");
  assert.equal(health.response.status, 200);
  assert.equal(health.body.db, "connected");
  console.log("PASS health: HTTP 200, database connected");
  for (const path of ["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp"]) {
    const { response, body } = await get(path);
    assert.equal(response.status, 200); assert.equal(body.resource, resource);
    assert.deepEqual(body.authorization_servers, [issuer]);
    assert.deepEqual(body.scopes_supported, ["products:read", "products:write"]);
  }
  const metadata = await fetch(new URL(".well-known/oauth-authorization-server", issuer), { signal: AbortSignal.timeout(15000) });
  assert.equal(metadata.status, 200);
  const as = await metadata.json();
  assert.equal(as.issuer, issuer);
  for (const field of ["authorization_endpoint", "token_endpoint", "registration_endpoint", "jwks_uri"]) {
    const endpoint = new URL(as[field]);
    assert.equal(endpoint.protocol, "https:");
    assert.equal(endpoint.origin, new URL(issuer).origin);
  }
  assert(as.response_types_supported.includes("code"));
  assert(as.grant_types_supported.includes("authorization_code"));
  assert(as.grant_types_supported.includes("refresh_token"));
  assert(as.code_challenge_methods_supported.includes("S256"));
  assert.equal((await get("/.well-known/oauth-authorization-server")).response.status, 410);
  console.log("PASS QuickWish protected-resource metadata, Auth0 discovery and retired local issuer");
  const initialization = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {},
    clientInfo: { name: "quickwish-production-verifier", version: "0.1.4" } });
  assert.equal(initialization.body.result.serverInfo.name, "quickwish-connector");
  const listed = await rpc("tools/list", {});
  const tools = listed.body.result.tools;
  assert.deepEqual(tools.map(t => t.name).sort(), [...reads, ...writes].sort());
  for (const tool of tools) {
    const scope = reads.includes(tool.name) ? "products:read" : "products:write";
    assert.deepEqual(tool.securitySchemes, [{ type: "oauth2", scopes: [scope] }]);
    assert.deepEqual(tool._meta.securitySchemes, tool.securitySchemes);
    assert.equal(tool.inputSchema.type, "object"); assert(tool.description); assert(tool.annotations);
    assert(!JSON.stringify(tool).includes("api_key"));
  }
  console.log("PASS anonymous initialize and tools/list: all 11 descriptors expose explicit OAuth securitySchemes");
  for (const token of [undefined, "deliberately-invalid-token"]) {
    for (const [name, args, scope] of [
      ["listCategories", {}, "products:read"],
      ["createProductDraft", { name: "Unauthorized request", category: "Flower Bouquets", price: 100 }, "products:write"],
    ]) {
      const { response, body } = await rpc("tools/call", { name, arguments: args }, token);
      const result = body.result;
      assert.equal(result.isError, true); assert.equal(result.structuredContent, undefined);
      const challenges = result._meta["mcp/www_authenticate"];
      assert.equal(challenges.length, 1);
      assert(challenges[0].includes(`resource_metadata="${base}/.well-known/oauth-protected-resource/mcp"`));
      assert(challenges[0].includes(`scope="${scope}"`));
      assert(challenges[0].includes('error="invalid_token"'));
      assert(challenges[0].includes("error_description="));
      assert.equal(response.headers.get("www-authenticate"), challenges[0]);
      assert.deepEqual(Object.keys(result).sort(), ["_meta", "content", "isError"]);
    }
  }
  console.log("PASS missing/invalid credentials: read and write operations return MCP OAuth challenges without product payloads");
  const rest = await get("/api/v1/connector/categories");
  assert.equal(rest.response.status, 401, "REST connector must retain configured, fail-closed authentication");
  assert.equal(rest.body.code, "CONNECTOR_UNAUTHENTICATED");
  console.log("PASS REST connector retains scoped credential authentication (unauthenticated HTTP 401)");
} catch (error) {
  // Assertions print only the check name/message; never dump response bodies.
  console.error("FAIL production verification:", error.message);
  process.exitCode = 1;
}
