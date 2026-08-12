import type { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { admin, User } from "../db.js";
import type { JwtPayload } from "../types/index.js";

/**
 * JWT secret is security-critical configuration. A missing secret must fail
 * fast at startup instead of silently falling back to a known default.
 */
export const getJwtSecret = (): string => {
  const secret = process.env.SECRET?.trim();

  if (!secret) {
    throw new Error(
      "SECRET environment variable is required. Refusing to start without a JWT secret."
    );
  }

  return secret;
};

export interface AuthPrincipal {
  userId: string;
  role: "CUSTOMER" | "ADMIN" | "CREATOR";
  email?: string;
  username?: string;
  creatorId?: string;
}

const extractBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
    return null;
  }

  return parts[1];
};

const unauthorized = (res: Response, message = "Authentication required"): void => {
  res.status(401).json({
    success: false,
    code: "UNAUTHENTICATED",
    message,
  });
};

const forbidden = (res: Response, message = "Access denied"): void => {
  res.status(403).json({
    success: false,
    code: "FORBIDDEN",
    message,
  });
};

/**
 * Authenticated CUSTOMER only. Verifies the JWT signature and that the user
 * still exists server-side. Sets req.user with server-derived identity.
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractBearerToken(req);

  if (!token) {
    unauthorized(res);
    return;
  }

  let payload: JwtPayload;

  try {
    payload = Jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    unauthorized(res, "Invalid or expired token");
    return;
  }

  if (payload.role && payload.role !== "CUSTOMER") {
    forbidden(res, "Customer access required");
    return;
  }

  if (!payload.userId) {
    unauthorized(res, "Invalid token payload");
    return;
  }

  try {
    const user = await User.findById(payload.userId).lean();

    if (!user) {
      unauthorized(res, "Account no longer exists");
      return;
    }

    req.user = {
      userId: String(user._id),
      role: "CUSTOMER",
      ...(user.email ? { email: user.email } : {}),
      ...(user.username ? { username: user.username } : {}),
    };

    next();
  } catch {
    res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Could not verify account",
    });
  }
};

/**
 * ADMIN only. Verifies the JWT signature, requires the signed role claim to be
 * ADMIN, and confirms the admin still exists in the admin collection.
 *
 * A valid CUSTOMER token is rejected with 403 — never silently allowed.
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractBearerToken(req);

  if (!token) {
    unauthorized(res);
    return;
  }

  let payload: JwtPayload;

  try {
    payload = Jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    unauthorized(res, "Invalid or expired token");
    return;
  }

  if (payload.role !== "ADMIN") {
    forbidden(res, "Admin access required");
    return;
  }

  const adminId = String(payload.userId || payload.userID || "");

  if (!adminId) {
    forbidden(res, "Admin access required");
    return;
  }

  try {
    const adminRecord = await admin.findById(adminId).lean();

    if (!adminRecord) {
      forbidden(res, "Admin access required");
      return;
    }

    req.admin = {
      userId: adminId,
      role: "ADMIN",
      ...(adminRecord.username ? { username: adminRecord.username } : {}),
    };

    next();
  } catch {
    res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Could not verify admin",
    });
  }
};

/**
 * CREATOR only. Requires a signed role claim of CREATOR plus a creatorId.
 */
export const requireCreator = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = extractBearerToken(req);

  if (!token) {
    unauthorized(res);
    return;
  }

  try {
    const payload = Jwt.verify(token, getJwtSecret()) as JwtPayload;

    if (payload.role !== "CREATOR" || !payload.creatorId) {
      forbidden(res, "Creator access required");
      return;
    }

    req.user = {
      userId: payload.creatorId,
      role: "CREATOR",
      ...(payload.email ? { email: payload.email } : {}),
      creatorId: payload.creatorId,
    };

    next();
  } catch {
    unauthorized(res, "Invalid or expired token");
  }
};

/**
 * Accepts either an authenticated CUSTOMER or an ADMIN. Used for endpoints
 * that customers may access but admins may also view (e.g. order detail).
 */
export const authenticateUserOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractBearerToken(req);

  if (!token) {
    unauthorized(res);
    return;
  }

  let payload: JwtPayload;

  try {
    payload = Jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    unauthorized(res, "Invalid or expired token");
    return;
  }

  if (payload.role === "ADMIN") {
    const adminId = String(payload.userId || payload.userID || "");

    if (!adminId) {
      forbidden(res, "Admin access required");
      return;
    }

    try {
      const adminRecord = await admin.findById(adminId).lean();

      if (!adminRecord) {
        forbidden(res, "Admin access required");
        return;
      }

      req.admin = {
        userId: adminId,
        role: "ADMIN",
        ...(adminRecord.username ? { username: adminRecord.username } : {}),
      };

      next();
      return;
    } catch {
      res.status(500).json({
        success: false,
        code: "INTERNAL_ERROR",
        message: "Could not verify admin",
      });
      return;
    }
  }

  if (payload.role && payload.role !== "CUSTOMER") {
    forbidden(res);
    return;
  }

  if (!payload.userId) {
    unauthorized(res, "Invalid token payload");
    return;
  }

  try {
    const user = await User.findById(payload.userId).lean();

    if (!user) {
      unauthorized(res, "Account no longer exists");
      return;
    }

    req.user = {
      userId: String(user._id),
      role: "CUSTOMER",
      ...(user.email ? { email: user.email } : {}),
      ...(user.username ? { username: user.username } : {}),
    };

    next();
  } catch {
    res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Could not verify account",
    });
  }
};

/**
 * Best-effort authentication: sets req.user when a valid customer/admin token
 * is present, otherwise continues as anonymous. Never rejects.
 */
export const optionalUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractBearerToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = Jwt.verify(token, getJwtSecret()) as JwtPayload;

    if (payload.userId && (!payload.role || payload.role === "CUSTOMER")) {
      req.user = {
        userId: payload.userId,
        role: "CUSTOMER",
        ...(payload.email ? { email: payload.email } : {}),
      };
    }
  } catch {
    // Ignore invalid tokens for optional auth — treated as anonymous.
  }

  next();
};
