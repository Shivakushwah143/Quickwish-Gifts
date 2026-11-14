import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

/**
 * Scoped API-key authentication for the ChatGPT product connector.
 *
 * Deliberately separate from the admin JWT middleware: a connector key can
 * never be used to reach admin routes, and an admin JWT is never accepted here.
 * Only SHA-256 hashes of keys are stored in configuration.
 */

export type ConnectorScope = "products:read" | "products:write";

export const CONNECTOR_SCOPES: ConnectorScope[] = [
  "products:read",
  "products:write",
];

type ConnectorKey = {
  id: string;
  sha256: string;
  scopes: ConnectorScope[];
};

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

const isConnectorScope = (value: unknown): value is ConnectorScope =>
  value === "products:read" || value === "products:write";

const sha256Hex = (value: string): string =>
  crypto.createHash("sha256").update(value, "utf8").digest("hex");

/**
 * Reads connector keys from the environment on each request so tests and
 * ops can rotate keys without a restart.
 *
 * CONNECTOR_API_KEYS (preferred) is a JSON array:
 *   [{ "id": "chatgpt", "sha256": "<64 hex chars>", "scopes": ["products:read", "products:write"] }]
 *
 * CONNECTOR_API_KEY is a single plaintext key for local development only and
 * grants both scopes.
 */
const loadConnectorKeys = (): ConnectorKey[] => {
  const keys: ConnectorKey[] = [];
  const raw = process.env.CONNECTOR_API_KEYS?.trim();

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          const record = entry as Record<string, unknown> | null;
          const id = typeof record?.id === "string" ? record.id.trim() : "";
          const sha256 =
            typeof record?.sha256 === "string"
              ? record.sha256.trim().toLowerCase()
              : "";
          const scopes = Array.isArray(record?.scopes)
            ? record.scopes.filter(isConnectorScope)
            : [];

          if (id && SHA256_PATTERN.test(sha256) && scopes.length > 0) {
            keys.push({ id, sha256, scopes });
          }
        }
      }
    } catch {
      return [];
    }
  }

  const singleKey = process.env.CONNECTOR_API_KEY?.trim();

  if (singleKey) {
    keys.push({
      id: "default",
      sha256: sha256Hex(singleKey),
      scopes: [...CONNECTOR_SCOPES],
    });
  }

  return keys;
};

const readPresentedKey = (req: Request): string | null => {
  const headerKey = req.headers["x-api-key"];

  if (typeof headerKey === "string" && headerKey.trim()) {
    return headerKey.trim();
  }

  const authHeader = req.headers.authorization;

  if (typeof authHeader !== "string") return null;

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) return null;

  const trimmed = token.trim();

  return trimmed.length > 0 ? trimmed : null;
};

const sendUnauthorized = (res: Response, message: string): void => {
  res.status(401).json({
    success: false,
    code: "CONNECTOR_UNAUTHENTICATED",
    message,
  });
};

/**
 * Express middleware factory enforcing one connector scope.
 */
export const requireConnectorScope =
  (scope: ConnectorScope) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const keys = loadConnectorKeys();

    if (keys.length === 0) {
      res.status(503).json({
        success: false,
        code: "CONNECTOR_NOT_CONFIGURED",
        message: "Connector API keys are not configured",
      });
      return;
    }

    const presentedKey = readPresentedKey(req);

    if (!presentedKey) {
      sendUnauthorized(res, "A connector API key is required");
      return;
    }

    const presentedHash = Buffer.from(sha256Hex(presentedKey), "hex");
    let matchedKey: ConnectorKey | null = null;

    // Compare against every configured key in constant time so response timing
    // does not reveal which key (or prefix) matched.
    for (const key of keys) {
      const expectedHash = Buffer.from(key.sha256, "hex");
      const matches =
        expectedHash.length === presentedHash.length &&
        crypto.timingSafeEqual(expectedHash, presentedHash);

      if (matches) {
        matchedKey = key;
      }
    }

    if (!matchedKey) {
      sendUnauthorized(res, "Invalid connector API key");
      return;
    }

    if (!matchedKey.scopes.includes(scope)) {
      res.status(403).json({
        success: false,
        code: "CONNECTOR_SCOPE_REQUIRED",
        message: `This API key is missing the ${scope} scope`,
      });
      return;
    }

    req.connector = { keyId: matchedKey.id, scopes: matchedKey.scopes };
    next();
  };
