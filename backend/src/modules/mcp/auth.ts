import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { ConnectorScope } from "../../middleware/connectorAuth.js";
import { MCP_RESOURCE_METADATA, validateAuth0Token } from "./auth0.js";

/** Discovery is public; authorization is evaluated inside every tool invocation. */
export type McpAuthContext = {
  token: string | null;
  onChallenge?: (challenge: string) => void;
};

export const authorizeMcpTool = async (
  context: McpAuthContext,
  scope: ConnectorScope
): Promise<CallToolResult | null> => {
  try {
    const auth = await validateAuth0Token(context.token || "");
    if (auth?.scopes.includes(scope)) return null;
    const error = auth ? "insufficient_scope" : "invalid_token";
    const message = auth ? `The ${scope} scope is required` : "OAuth authorization is required";
    const challenge = `Bearer resource_metadata="${MCP_RESOURCE_METADATA}", scope="${scope}", error="${error}", error_description="${message}"`;
    context.onChallenge?.(challenge);
    return {
      isError: true,
      content: [{ type: "text", text: message }],
      _meta: { "mcp/www_authenticate": [challenge] },
    };
  } catch {
    // No product operation is attempted when configuration/storage is unavailable.
    return { isError: true, content: [{ type: "text", text: "MCP OAuth is unavailable" }] };
  }
};
