import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Request, Response } from "express";

/**
 * Serves the OpenAPI description that ChatGPT uses to discover and call the
 * connector. The spec is a single static file at backend/docs so it can be
 * imported into ChatGPT/other tooling without running the server.
 */

let cachedSpec: string | null = null;

export const connectorOpenApiSpec = (_req: Request, res: Response): void => {
  try {
    if (!cachedSpec) {
      const specPath = fileURLToPath(
        new URL("../../../docs/connector.openapi.json", import.meta.url)
      );
      cachedSpec = readFileSync(specPath, "utf8");
    }

    res.status(200).type("application/json").send(cachedSpec);
  } catch {
    res.status(500).json({
      success: false,
      code: "OPENAPI_UNAVAILABLE",
      message: "OpenAPI document is unavailable",
    });
  }
};
