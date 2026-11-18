import { OAuthMcpServer } from "./toolRegistry.js";
import type { McpAuthContext } from "./auth.js";
import { registerConnectorTools } from "./tools.js";

/**
 * Builds an MCP server instance for one request (including anonymous protocol discovery).
 *
 * The endpoint runs stateless (no session affinity), so a fresh instance per
 * request also guarantees that no caller authentication state can leak across requests.
 * All descriptors are public; each tool checks its scope before product access.
 */
export const createMcpServer = (auth: McpAuthContext): OAuthMcpServer => {
  const server = new OAuthMcpServer(
    { name: "quickwish-connector", version: "1.0.0" },
    {
      instructions:
        "QuickWish product catalog tools. createProductDraft always creates a draft; use publishProduct explicitly when a draft is ready to go live. Drafts are never visible on the storefront.",
    }
  );

  registerConnectorTools(server, auth);

  server.enableOAuthDiscovery();
  return server;
};
