import { Router } from "express";
import { getAuth0Config, MCP_RESOURCE, MCP_SCOPES } from "./auth0.js";

// QuickWish is only a resource server. Auth0 owns login and token issuance.
const router = Router();
router.get(["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp"], (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    const { issuer } = getAuth0Config();
    res.json({ resource: MCP_RESOURCE, authorization_servers: [issuer], scopes_supported: MCP_SCOPES,
      bearer_methods_supported: ["header"], resource_name: "QuickWish Product Manager" });
  } catch {
    res.status(503).json({ error: "temporarily_unavailable" });
  }
});

// Do not redirect credential-bearing requests or advertise a local issuer.
router.all(["/oauth/register", "/oauth/authorize", "/oauth/token", "/oauth/revoke",
  "/.well-known/oauth-authorization-server"], (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(410).json({ error: "authorization_server_retired" });
});
export default router;
