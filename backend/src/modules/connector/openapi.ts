import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Request, Response } from "express";

/**
 * Serves the OpenAPI description that ChatGPT uses to discover and call the
 * connector. The spec is a single static file at backend/docs so it can be
 * imported into ChatGPT/other tooling without running the server.
 *
 * The document is public (it contains no tenant data) while every product route
 * behind it requires a scoped connector API key.
 *
 * Candidate paths keep this working from source (`tsx`, `vitest`), from a
 * compiled `dist/` tree, and from a container that ships `dist/` plus `docs/`.
 */

let cachedSpec: string | null = null;

const specCandidates = (): string[] => {
  const moduleDir = dirname(fileURLToPath(import.meta.url));

  return [
    // src/modules/connector -> backend/docs (also dist/modules/connector -> backend/docs)
    resolve(moduleDir, "../../../docs/connector.openapi.json"),
    // Running with the backend directory as the working directory.
    resolve(process.cwd(), "docs/connector.openapi.json"),
    // Running from the repository root (`npm --prefix backend start`).
    resolve(process.cwd(), "backend/docs/connector.openapi.json"),
    // A build that copied the docs next to the compiled output.
    resolve(moduleDir, "../docs/connector.openapi.json"),
  ];
};

const readSpec = (): string | null => {
  for (const candidate of specCandidates()) {
    try {
      return readFileSync(candidate, "utf8");
    } catch {
      // Try the next known location.
    }
  }

  return null;
};

export const connectorOpenApiSpec = (_req: Request, res: Response): void => {
  try {
    if (!cachedSpec) {
      cachedSpec = readSpec();
    }

    if (!cachedSpec) {
      res.status(500).json({
        success: false,
        code: "OPENAPI_UNAVAILABLE",
        message: "OpenAPI document is unavailable",
      });
      return;
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
