import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisteredTool, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AnySchema, ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import { normalizeObjectSchema } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import { toJsonSchemaCompat } from "@modelcontextprotocol/sdk/server/zod-json-schema-compat.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { Tool, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import type { ConnectorScope } from "../../middleware/connectorAuth.js";

type SecurityScheme = { type: "oauth2"; scopes: ConnectorScope[] };

/**
 * SDK 1.32.2 registerTool has no top-level securitySchemes option and omits
 * unknown fields when serializing descriptors. Use its public registration,
 * schema-conversion and request-handler APIs to expose the OpenAI extension.
 * Tool execution and input validation remain in the SDK's original handler.
 */
export class OAuthMcpServer extends McpServer {
  private readonly catalog = new Map<string, { tool: RegisteredTool; schemes: SecurityScheme[] }>();

  override registerTool<Output extends ZodRawShapeCompat | AnySchema,
    Input extends undefined | ZodRawShapeCompat | AnySchema = undefined>(
    name: string,
    config: {
      title?: string;
      description?: string;
      inputSchema?: Input;
      outputSchema?: Output;
      annotations?: ToolAnnotations;
      _meta?: Record<string, unknown>;
      securitySchemes?: SecurityScheme[];
    },
    callback: ToolCallback<Input>
  ): RegisteredTool {
    const schemes = config.securitySchemes;
    if (!schemes?.length) throw new Error("Every QuickWish tool must declare OAuth scopes");
    const tool = super.registerTool(name, {
      ...config, _meta: { ...config._meta, securitySchemes: schemes },
    }, callback);
    this.catalog.set(name, { tool, schemes });
    return tool;
  }

  enableOAuthDiscovery(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, () => ({
      tools: [...this.catalog].filter(([, entry]) => entry.tool.enabled).map(([name, { tool, schemes }]) => {
        const input = normalizeObjectSchema(tool.inputSchema);
        const output = normalizeObjectSchema(tool.outputSchema);
        return {
          name, title: tool.title, description: tool.description,
          inputSchema: (input ? toJsonSchemaCompat(input, { strictUnions: true, pipeStrategy: "input" }) :
            { type: "object", properties: {} }) as Tool["inputSchema"],
          ...(output ? { outputSchema: toJsonSchemaCompat(output, { strictUnions: true, pipeStrategy: "output" }) } : {}),
          annotations: tool.annotations, execution: tool.execution,
          securitySchemes: schemes, _meta: tool._meta,
        };
      }),
    }));
  }
}
