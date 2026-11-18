import { Router } from "express";
import type { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { type McpAuthContext } from "./auth.js";
import { createMcpServer } from "./server.js";

/**
 * Streamable HTTP MCP endpoint.
 *
 * Stateless: each POST gets its own McpServer + transport, which keeps the
 * endpoint safe behind the existing Nginx/Docker setup and across replicas.
 * Responses are plain JSON (no server-initiated SSE stream), so GET/DELETE are
 * answered with 405 as the transport specification allows.
 */
const router = Router();

const methodNotAllowed = (res: Response): void => {
  res.setHeader("Allow", "POST");
  res.status(405).json({
    jsonrpc: "2.0",
    id: null,
    error: {
      code: -32000,
      message:
        "Method not allowed. This MCP server is stateless and only accepts POST /mcp.",
    },
  });
};

router.post("/", async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  const auth: McpAuthContext = {
    token: typeof header === "string" ? /^Bearer ([^\s]+)$/i.exec(header)?.[1] || null : null,
    onChallenge: value => { if (!res.headersSent) res.setHeader("WWW-Authenticate", value); },
  };
  const server = createMcpServer(auth);
  // No sessionIdGenerator => stateless mode (no Mcp-Session-Id required).
  const transport = new StreamableHTTPServerTransport({
    enableJsonResponse: true,
  });

  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch {
    // Transport errors may contain request material. Never log credentials.
    console.error("[mcp] request failed");

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32603, message: "Internal MCP error" },
      });
    }
  }
});

router.get("/", (_req: Request, res: Response) => methodNotAllowed(res));
router.delete("/", (_req: Request, res: Response) => methodNotAllowed(res));

export default router;
