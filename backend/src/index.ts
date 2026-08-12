import Express from "express";
import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { admin, ChatMemory, Coupon, Creator, Order, product, User } from "./db.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import multer from "multer";
import { uploadProductImages } from "./config/uploadImages.js";
import whatsappRouter from "./modules/whatsapp/routes.js";
import { generateAssistantReply, type AssistantMessage } from "./services/assistant.service.js";
import { getWhatsAppConfig } from "./modules/whatsapp/config.js";
import {
  authenticateUser,
  authenticateUserOrAdmin,
  optionalUser,
  requireAdmin,
  requireCreator,
} from "./middleware/auth.js";
import {
  getUnitPrice,
  normalizeCouponCode,
  validateCouponForAmount,
} from "./services/pricing.js";
import {
  buildOrderPublicView,
  cancelOrder,
  confirmOrder,
  createOrder,
} from "./services/order.service.js";
import {
  createPaymentInstructions,
  getAwaitingVerificationOrders,
  getUPIConfig,
  rejectPayment,
  reportPayment,
  verifyPayment,
} from "./services/payment.service.js";
import type { JwtPayload } from "./types/index.js";
import cors from "cors";
import dns from "dns";

const app = Express();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// ---------------------------------------------------------------------------
// Startup configuration validation — security-critical config fails fast.
// ---------------------------------------------------------------------------
const SECRET = process.env.SECRET?.trim();
const mongoUri = process.env.MONGO_URI?.trim();

if (!SECRET) {
  console.error(
    "[fatal] SECRET environment variable is required. Refusing to start without a JWT secret."
  );
  process.exit(1);
}

if (!mongoUri) {
  console.error("[fatal] MONGO_URI environment variable is required.");
  process.exit(1);
}

// Direct-UPI payment configuration is security/commerce-critical: a missing or
// mistyped UPI ID would silently send customer money to the wrong account.
// Fail fast exactly like SECRET/MONGO_URI.
try {
  getUPIConfig();
} catch (error) {
  console.error(
    "[fatal] Payment configuration error:",
    error instanceof Error ? error.message : "unknown error"
  );
  process.exit(1);
}

// WhatsApp integration is optional at startup — degrades to per-request errors
// when unconfigured instead of crashing the server.
try {
  getWhatsAppConfig();
} catch (error) {
  console.warn(
    "[config] WhatsApp integration is not configured:",
    error instanceof Error ? error.message : "unknown error"
  );
}

app.use(
  Express.json({
    limit: "1mb",
    verify: (req, _res, buf) => {
      (req as Request).rawBody = Buffer.from(buf);
    },
  })
);

app.use(
  cors({
    origin: [
      "https://quickwish-gifts-git-main-shivakushwah143s-projects.vercel.app",
      "https://quickwish-gifts-qvbu.vercel.app",
      "https://www.onewish.fun",
      /\.vercel\.app$/,
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use("/api/v1/whatsapp", whatsappRouter);

const port = process.env.PORT || 5000;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimitMap = new Map<string, { count: number; start: number }>();
const CREATOR_COMMISSION_PER_ORDER = 100;
const CREATOR_THREE_ORDER_BONUS = 200;

export const getClientIp = (req: Request): string => {
  const forwardedHeader = req.headers["x-forwarded-for"];

  if (typeof forwardedHeader === "string") {
    const firstIp = forwardedHeader.split(",")[0];

    if (firstIp && firstIp.length > 0) {
      return firstIp.trim();
    }
  }

  const remoteAddress = req.socket?.remoteAddress;

  if (remoteAddress && remoteAddress.length > 0) {
    return remoteAddress;
  }

  return "unknown";
};

// ---------------------------------------------------------------------------
// Error contract — JSON errors, never HTML or stack traces.
// ---------------------------------------------------------------------------
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const error = err as { type?: string; message?: string; code?: string };

  if (error?.type === "entity.too.large") {
    res.status(413).json({
      success: false,
      code: "PAYLOAD_TOO_LARGE",
      message: "Request body is too large",
    });
    return;
  }

  if (error?.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({
      success: false,
      code: "FILE_TOO_LARGE",
      message: "Image exceeds the 5 MB size limit",
    });
    return;
  }

  if (error?.code === "LIMIT_FILE_COUNT") {
    res.status(400).json({
      success: false,
      code: "TOO_MANY_FILES",
      message: "Maximum 5 images per product",
    });
    return;
  }

  if (error?.code === "LIMIT_UNEXPECTED_FILE") {
    res.status(400).json({
      success: false,
      code: "UNEXPECTED_FILE",
      message: "Unexpected upload field",
    });
    return;
  }

  if (error?.type === "entity.parse.failed") {
    res.status(400).json({
      success: false,
      code: "INVALID_JSON",
      message: "Invalid JSON payload",
    });
    return;
  }

  res.status(400).json({
    success: false,
    code: "BAD_REQUEST",
    message: error?.message || "Bad request",
  });
});

// ---------------------------------------------------------------------------
// Customer authentication
// ---------------------------------------------------------------------------
app.post("/api/v1/user/signup", async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    return res
      .status(400)
      .json({ message: "Valid email and password (min 6 characters) are required" });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 8);
    const user = await User.create({
      email: normalizedEmail,
      username,
      password: hashPassword,
    });

    const token = Jwt.sign(
      { userId: user._id, email: user.email, role: "CUSTOMER" },
      SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "User registered successfully",
      token,
      success: true,
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ message: "Error in user registration" });
  }
});

app.post("/api/v1/user/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const passwordValid = await bcrypt.compare(
      String(password || ""),
      String(user.password)
    );

    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = Jwt.sign(
      { userId: user._id, email: user.email, role: "CUSTOMER" },
      SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      token,
      message: "Signin successful",
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Admin authentication
// ---------------------------------------------------------------------------

/**
 * Admin signup is only possible with an explicit bootstrap key configured via
 * the ADMIN_BOOTSTRAP_KEY environment variable. Without it the endpoint is
 * disabled — arbitrary public requests can never create admins.
 */
app.post("/api/v1/admin/signup", async (req: Request, res: Response) => {
  const bootstrapKey = process.env.ADMIN_BOOTSTRAP_KEY?.trim();

  if (!bootstrapKey) {
    return res.status(404).json({
      success: false,
      message: "Admin signup is disabled",
    });
  }

  const providedKey = req.headers["x-bootstrap-key"];
  const provided = typeof providedKey === "string" ? providedKey.trim() : "";
  const keyMatches =
    provided.length === bootstrapKey.length &&
    crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(bootstrapKey));

  if (!keyMatches) {
    return res.status(403).json({
      success: false,
      message: "Invalid bootstrap key",
    });
  }

  const { username, password } = req.body;

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const hashPassword = await bcrypt.hash(password, 8);
    const user = await admin.create({
      username,
      password: hashPassword,
      role: "ADMIN",
    });

    const token = Jwt.sign(
      { userId: user._id, username: user.username, role: "ADMIN" },
      SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "admin registered successfully",
      token,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "error in admin registration" });
  }
});

app.post("/api/v1/admin/signin", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const normalizedUsername = String(username).toLowerCase().trim();
    const user = await admin.findOne({ username: normalizedUsername });

    if (!user) {
      res.status(401).json({ message: "admin not found" });
      return;
    }

    const passwordValid = await bcrypt.compare(
      String(password || ""),
      String(user.password || "")
    );

    if (!passwordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = Jwt.sign(
      { userId: user._id, username: user.username, role: "ADMIN" },
      SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      token,
      message: " admin Signin successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get(
  "/api/v1/admin/users",
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const allusers = await User.find({}).select("-password").lean();
      res.status(200).json({ message: "all users", allusers });
    } catch (error) {
      res.status(500).json({ message: "all users" });
    }
  }
);

app.get(
  "/api/v1/admin/allOrders",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { paymentStatus } = req.query;
      const filter: Record<string, unknown> = {};

      if (typeof paymentStatus === "string" && paymentStatus.trim()) {
        const value = paymentStatus.trim();

        // The customer-facing name is AWAITING_VERIFICATION, but legacy orders
        // still carry PROOF_SUBMITTED — the filter must surface both.
        filter.paymentStatus =
          value === "AWAITING_VERIFICATION"
            ? { $in: ["AWAITING_VERIFICATION", "PROOF_SUBMITTED"] }
            : value;
      }

      const allOrders = await Order.find(filter).sort({ orderedAt: -1 }).lean();
      res.status(200).json({ message: "all orders fetched", allOrders });
    } catch (error) {
      res.status(500).json({ message: "error all orders fetched" });
    }
  }
);

/**
 * Lightweight admin attention queue — how many payments are waiting for manual
 * verification. Powers the dashboard badge and the verification list.
 */
app.get(
  "/api/v1/admin/payments/awaiting",
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const queue = await getAwaitingVerificationOrders();
      res.status(200).json({
        success: true,
        count: queue.count,
        orders: queue.orders,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch awaiting payments",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// Creator / referral
// ---------------------------------------------------------------------------
const buildCreatorDashboard = async (creatorId: string) => {
  const creator = await Creator.findById(creatorId).lean();

  if (!creator) {
    return null;
  }

  const coupon: any = creator.assignedCouponId
    ? await Coupon.findById(creator.assignedCouponId).lean()
    : await Coupon.findOne({ creatorId: creator._id, isCreatorCode: true }).lean();

  const confirmedOrders = await Order.find({
    creatorId: creator._id,
    creatorCommissionStatus: "earned",
  }).lean();

  const ordersGenerated = confirmedOrders.length;
  const revenueGenerated = confirmedOrders.reduce(
    (sum: number, order: any) =>
      sum + (Number(order.finalAmount ?? order.amount) || 0),
    0
  );
  const baseCommissionEarned = confirmedOrders.reduce(
    (sum: number, order: any) => sum + (Number(order.creatorCommission) || 0),
    0
  );
  const threeOrderBonusUnlocked = ordersGenerated >= 3;
  const prPackageUnlocked = ordersGenerated >= 5;
  const bonusEarned = threeOrderBonusUnlocked ? CREATOR_THREE_ORDER_BONUS : 0;

  return {
    creator: {
      id: creator._id,
      name: creator.name,
      email: creator.email,
      phone: creator.phone,
      preferredCode: creator.preferredCode,
      active: creator.active,
    },
    referralCode: coupon?.code || null,
    ordersGenerated,
    revenueGenerated,
    totalCommissionEarned: baseCommissionEarned + bonusEarned,
    baseCommissionEarned,
    bonusEarned,
    bonusProgress: {
      orders: ordersGenerated,
      nextBonusAt: ordersGenerated < 3 ? 3 : ordersGenerated < 5 ? 5 : null,
      threeOrderBonusUnlocked,
      prPackageUnlocked,
    },
    rewardMilestones: [
      {
        label: "3 orders",
        reward: "Rs 200 bonus",
        unlocked: threeOrderBonusUnlocked,
      },
      {
        label: "5 orders",
        reward: "PR package",
        unlocked: prPackageUnlocked,
      },
    ],
  };
};

app.post("/api/v1/creator/request-code", async (req: Request, res: Response) => {
  const { name, email, phone, preferredCode, password } = req.body || {};
  const normalizedCode = normalizeCouponCode(preferredCode);

  if (!name || !email || !normalizedCode) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and preferred code are required",
    });
  }

  try {
    const existingCoupon = await Coupon.findOne({ code: normalizedCode });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "This code is already taken",
      });
    }

    const hashedPassword = password ? await bcrypt.hash(String(password), 8) : null;
    const creator = await Creator.findOneAndUpdate(
      { email: String(email).toLowerCase().trim() },
      {
        name,
        email: String(email).toLowerCase().trim(),
        phone,
        preferredCode: normalizedCode,
        ...(hashedPassword ? { password: hashedPassword } : {}),
        active: true,
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Creator code request saved. Admin can approve and assign it.",
      creator,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Creator request failed" });
  }
});

app.post("/api/v1/creator/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  try {
    const creator = await Creator.findOne({
      email: String(email).toLowerCase().trim(),
      active: true,
    });

    if (!creator) {
      return res.status(401).json({ success: false, message: "Creator not found" });
    }

    if (creator.password) {
      const passwordValid = await bcrypt.compare(
        String(password || ""),
        String(creator.password)
      );

      if (!passwordValid) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    }

    const token = Jwt.sign(
      { creatorId: creator._id.toString(), email: creator.email, role: "CREATOR" },
      SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      token,
      creator: {
        id: creator._id,
        name: creator.name,
        email: creator.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Creator signin failed" });
  }
});

app.get(
  "/api/v1/creator/dashboard",
  requireCreator,
  async (req: Request, res: Response) => {
    const payload = req.user as JwtPayload & { creatorId?: string };

    try {
      const dashboard = await buildCreatorDashboard(payload.creatorId || "");

      if (!dashboard) {
        return res.status(404).json({ success: false, message: "Creator not found" });
      }

      return res.status(200).json({ success: true, dashboard });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Creator dashboard failed" });
    }
  }
);

app.get(
  "/api/v1/admin/creators",
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const creators = await Creator.find({}).sort({ createdAt: -1 }).lean();
      const dashboards = await Promise.all(
        creators.map((creator: any) =>
          buildCreatorDashboard(creator._id.toString())
        )
      );

      return res.status(200).json({
        success: true,
        creators: dashboards.filter(Boolean),
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to fetch creators" });
    }
  }
);

app.post(
  "/api/v1/admin/creators",
  requireAdmin,
  async (req: Request, res: Response) => {
    const { name, email, phone, preferredCode, password, active } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    try {
      const hashedPassword = password ? await bcrypt.hash(String(password), 8) : undefined;
      const creator = await Creator.create({
        name,
        email: String(email).toLowerCase().trim(),
        phone,
        preferredCode: preferredCode ? normalizeCouponCode(preferredCode) : undefined,
        ...(hashedPassword ? { password: hashedPassword } : {}),
        active: active !== false,
      });

      return res.status(201).json({ success: true, creator });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Creator creation failed" });
    }
  }
);

app.post(
  "/api/v1/admin/creators/:creatorId/code",
  requireAdmin,
  async (req: Request, res: Response) => {
    const { creatorId } = req.params;
    const { code, minOrderAmount = 399, usageLimit, active = true } = req.body || {};
    const normalizedCode = normalizeCouponCode(code);

    if (!normalizedCode) {
      return res.status(400).json({ success: false, message: "Creator code is required" });
    }

    try {
      const creator = await Creator.findById(creatorId);

      if (!creator) {
        return res.status(404).json({ success: false, message: "Creator not found" });
      }

      const existingCoupon = await Coupon.findOne({
        code: normalizedCode,
        creatorId: { $ne: creator._id },
      });

      if (existingCoupon) {
        return res.status(409).json({ success: false, message: "Code already exists" });
      }

      const coupon = await Coupon.findOneAndUpdate(
        { code: normalizedCode },
        {
          code: normalizedCode,
          discountType: "flat",
          discountValue: 50,
          minOrderAmount: Number(minOrderAmount) || 399,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          active,
          isCreatorCode: true,
          creatorId: creator._id,
          creatorName: creator.name,
          commissionPerOrder: CREATOR_COMMISSION_PER_ORDER,
          description: `Use ${normalizedCode}'s code and save Rs 50`,
          updatedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      creator.assignedCouponId = coupon._id;
      creator.preferredCode = normalizedCode;
      await creator.save();

      return res.status(200).json({
        success: true,
        message: "Creator code assigned",
        creator,
        coupon,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Creator code assignment failed" });
    }
  }
);

app.get(
  "/api/v1/admin/creators/:creatorId/performance",
  requireAdmin,
  async (req: Request, res: Response) => {
    const creatorId = req.params.creatorId;

    if (!creatorId) {
      return res.status(400).json({ success: false, message: "Creator ID is required" });
    }

    try {
      const dashboard = await buildCreatorDashboard(creatorId);

      if (!dashboard) {
        return res.status(404).json({ success: false, message: "Creator not found" });
      }

      return res.status(200).json({ success: true, dashboard });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Creator performance failed" });
    }
  }
);

// ---------------------------------------------------------------------------
// Product catalog — admin mutations, public reads
// ---------------------------------------------------------------------------
const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_COUNT = 5;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
    files: MAX_IMAGE_COUNT,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, WebP, GIF, HEIC) are allowed"));
    }
  },
});

const PRODUCT_UPDATABLE_FIELDS = [
  "name",
  "price",
  "category",
  "description",
  "discountPercent",
  "originalPrice",
  "offPrice",
  "stock",
  "badge",
  "deliveryOptions",
  "tags",
  "images",
] as const;

const parseTags = (tags: unknown): string[] => {
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0);
  }

  return [];
};

const toNumberOrUndefined = (value: unknown): number | undefined => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
};

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const SORT_WHITELIST: Record<string, Record<string, 1 | -1>> = {
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  newest: { createdAt: -1 },
  "name-asc": { name: 1 },
};

app.post(
  "/api/v1/product",
  requireAdmin,
  upload.array("images", MAX_IMAGE_COUNT),
  async (req: Request, res: Response) => {
    const {
      name,
      price,
      category,
      description,
      discountPercent,
      originalPrice,
      stock,
      badge,
      offPrice,
      deliveryOptions,
      tags,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      !category ||
      !Number.isFinite(Number(price))
    ) {
      return res.status(400).json({
        success: false,
        message: "name, price and category are required",
      });
    }

    try {
      const imageUrls = (req as any).files
        ? await uploadProductImages((req as any).files)
        : [];

      let parsedDeliveryOptions: unknown;

      if (typeof deliveryOptions === "string") {
        try {
          parsedDeliveryOptions = JSON.parse(deliveryOptions);
        } catch {
          return res.status(400).json({
            success: false,
            message: "deliveryOptions must be valid JSON",
          });
        }
      } else if (deliveryOptions) {
        parsedDeliveryOptions = deliveryOptions;
      }

      const newProduct = new product({
        name,
        price: Number(price),
        category,
        badge,
        images: imageUrls,
        description,
        discountPercent: toNumberOrUndefined(discountPercent),
        originalPrice: toNumberOrUndefined(originalPrice),
        offPrice: toNumberOrUndefined(offPrice),
        deliveryOptions: parsedDeliveryOptions,
        stock: Math.max(0, toNumberOrUndefined(stock) || 1),
        tags: parseTags(tags),
        isArchived: false,
      });

      await newProduct.save();

      res.status(201).json({
        message: "Product created successfully",
        product: newProduct,
        success: true,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error creating product",
      });
    }
  }
);

app.get("/api/v1/product", async (req: Request, res: Response) => {
  try {
    const { search, category, sort, minPrice, maxPrice, includeArchived } = req.query;

    // Archived products are hidden from the storefront unless an authenticated
    // admin explicitly requests them.
    let isAdminView = false;

    if (typeof req.headers.authorization === "string") {
      const token = req.headers.authorization.split(" ")[1];

      if (token) {
        try {
          const payload = Jwt.verify(token, SECRET) as JwtPayload;

          if (payload.role === "ADMIN") {
            isAdminView = true;
          }
        } catch {
          // Ignore invalid tokens for the public listing.
        }
      }
    }

    const filter: Record<string, unknown> = {};

    if (!isAdminView || includeArchived !== "true") {
      filter.isArchived = { $ne: true };
    }

    if (category) {
      filter.category = String(category);
    }

    const searchTerm = typeof search === "string" ? search.trim() : "";

    if (searchTerm) {
      const escaped = escapeRegExp(searchTerm);
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
        { category: { $regex: escaped, $options: "i" } },
        { tags: { $regex: escaped, $options: "i" } },
      ];
    }

    const priceFilter: Record<string, unknown> = {};
    const min = Number(minPrice);
    const max = Number(maxPrice);

    if (Number.isFinite(min) && min >= 0) {
      priceFilter.$gte = min;
    }

    if (Number.isFinite(max) && max >= 0) {
      priceFilter.$lte = max;
    }

    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }

    const sortOption = typeof sort === "string" ? SORT_WHITELIST[sort] : undefined;

    const products = sortOption
      ? await product.find(filter).sort(sortOption)
      : await product.find(filter);

    res.status(200).json({ message: "productList", products, success: true });
  } catch (error) {
    res.status(500).json({ message: "error while getting productList" });
  }
});

app.get("/api/v1/product/:productId", async (req: Request, res: Response) => {
  const productId = req.params.productId;

  try {
    const singleProduct = await product.findOne({
      _id: productId,
      isArchived: { $ne: true },
    });

    if (!singleProduct) {
      return res.status(404).json({ success: false, message: "product not found" });
    }

    res.status(200).json({ success: true, singleProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "internal server error" });
  }
});

app.put(
  "/api/v1/product/:productId",
  requireAdmin,
  async (req: Request, res: Response) => {
    const productId = req.params.productId;
    const body = req.body || {};

    // Whitelist fields — never trust arbitrary client keys on the document.
    const update: Record<string, unknown> = {};

    for (const field of PRODUCT_UPDATABLE_FIELDS) {
      if (field in body && body[field] !== undefined) {
        if (field === "tags") {
          update.tags = parseTags(body[field]);
        } else if (field === "deliveryOptions") {
          if (typeof body[field] === "string") {
            try {
              update.deliveryOptions = JSON.parse(body[field]);
            } catch {
              return res
                .status(400)
                .json({ success: false, message: "deliveryOptions must be valid JSON" });
            }
          } else {
            update.deliveryOptions = body[field];
          }
        } else if (
          ["price", "discountPercent", "originalPrice", "offPrice", "stock"].includes(
            field
          )
        ) {
          update[field] = toNumberOrUndefined(body[field]);
        } else {
          update[field] = body[field];
        }
      }
    }

    try {
      const updateProduct = await product.findByIdAndUpdate(productId, update, {
        new: true,
      });

      if (!updateProduct) {
        return res.status(404).json({ success: false, message: "product not found" });
      }

      res.status(200).json({ success: true, updateProduct });
    } catch (error) {
      res.status(500).json({ success: false, message: "internal server error" });
    }
  }
);

app.delete(
  "/api/v1/product/:productId",
  requireAdmin,
  async (req: Request, res: Response) => {
    const productId = req.params.productId;

    try {
      // Soft delete — historical orders stay readable and the document can be
      // restored. Archived products disappear from the storefront.
      const archivedProduct = await product.findByIdAndUpdate(
        productId,
        { isArchived: true, deletedAt: new Date() },
        { new: true }
      );

      if (!archivedProduct) {
        return res.status(404).json({ success: false, message: "product not found" });
      }

      res.status(200).json({ success: true, deletedProduct: archivedProduct });
    } catch (error) {
      res.status(500).json({ success: false, message: "internal server error" });
    }
  }
);

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------
app.post("/api/v1/coupons/validate", async (req: Request, res: Response) => {
  const { code, productId, amount } = req.body || {};

  try {
    let baseAmount = Number(amount);

    if ((!Number.isFinite(baseAmount) || baseAmount <= 0) && productId) {
      const giftProduct = await product.findById(productId);

      if (!giftProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      baseAmount = getUnitPrice(giftProduct);
    }

    if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount or productId is required",
      });
    }

    const validation = await validateCouponForAmount(code, baseAmount);

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const couponCode = normalizeCouponCode(code);
    const isCreatorCode = Boolean(validation.coupon?.isCreatorCode);
    const creatorCodeMessage = validation.coupon
      ? `Use ${validation.coupon.code}'s code and save Rs ${validation.discountAmount}`
      : null;

    return res.status(200).json({
      success: true,
      message:
        isCreatorCode && creatorCodeMessage
          ? creatorCodeMessage
          : couponCode
            ? "Coupon applied successfully"
            : "No coupon applied",
      coupon: validation.coupon
        ? {
            id: validation.coupon._id,
            code: validation.coupon.code,
            discountType: validation.coupon.discountType,
            discountValue: validation.coupon.discountValue,
            creatorName: validation.coupon.creatorName,
            isCreatorCode,
            creatorId: validation.coupon.creatorId,
            displayMessage: isCreatorCode ? creatorCodeMessage : undefined,
          }
        : null,
      pricing: {
        originalAmount: baseAmount,
        discountAmount: validation.discountAmount,
        finalAmount: validation.finalAmount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Coupon validation failed" });
  }
});

// ---------------------------------------------------------------------------
// Assistant chat
// ---------------------------------------------------------------------------
const assistantChatHandler = async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const bucket = rateLimitMap.get(ip);

  if (!bucket || now - bucket.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, start: now });
  } else {
    bucket.count += 1;

    if (bucket.count > RATE_LIMIT_MAX) {
      return res
        .status(429)
        .json({ message: "Too many requests. Please try again shortly." });
    }
  }

  const { message, messages } = req.body || {};

  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ message: "Message is required." });
  }

  if (message.length > 500) {
    return res.status(400).json({ message: "Message is too long." });
  }

  const normalizedMessages: AssistantMessage[] = Array.isArray(messages)
    ? messages
        .filter(
          (m) =>
            m && typeof m.content === "string" && typeof m.role === "string"
        )
        .map((m) => ({
          role: m.role as AssistantMessage["role"],
          content: m.content,
        }))
    : [];

  const userId = req.user?.userId || null;

  let history: AssistantMessage[] = [];

  if (userId) {
    const memory = await ChatMemory.findOne({ userId }).lean();

    if (memory?.messages?.length) {
      history = memory.messages
        .slice(-20)
        .map((m: { role: AssistantMessage["role"]; content: string }) => ({
          role: m.role,
          content: m.content,
        }));
    }
  } else {
    history = normalizedMessages.slice(-20);
  }

  const products = await product
    .find({ isArchived: { $ne: true } })
    .select("name category price tags")
    .limit(10)
    .lean();

  const catalogSummary = products
    .map(
      (p: any) =>
        `${p.name} - ₹${p.price} (${p.category})` +
        (Array.isArray(p.tags) && p.tags.length ? ` [${p.tags.join(", ")}]` : "")
    )
    .join("; ");

  const systemPrompt = `
You are QuickWish, a premium gifting assistant for Indore.
Only help with gifts, categories, occasions, pricing, delivery, and order guidance.
Tone: warm, helpful, concise, suggestive but not salesy.
If unsure, ask a short clarifying question.
Context: Same Day Delivery - ₹49 extra (Indore only).
Catalog: ${catalogSummary || "Curated gifting collections across flowers, cakes, personalized gifts, plants, and keepsakes."}
`.trim();

  try {
    const reply = await generateAssistantReply({
      systemPrompt,
      messages: [...history, { role: "user", content: message.trim() }],
      temperature: 0.4,
    });

    if (userId) {
      const updated = [
        ...history,
        { role: "user", content: message.trim() },
        { role: "assistant", content: reply },
      ].slice(-20);

      await ChatMemory.findOneAndUpdate(
        { userId },
        { messages: updated, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({ success: true, reply });
  } catch (error) {
    return res.status(500).json({ message: "Assistant error." });
  }
};

app.post("/api/assistant/chat", optionalUser, assistantChatHandler);
app.post("/api/v1/assistant/chat", optionalUser, assistantChatHandler);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
app.post("/api/v1/orders", authenticateUser, async (req: Request, res: Response) => {
  const {
    productId,
    shippingAddress,
    couponCode,
    giftUpgrades,
    quantity,
    idempotencyKey,
  } = req.body || {};

  if (typeof productId !== "string") {
    return res.status(400).json({
      success: false,
      code: "INVALID_PRODUCT",
      message: "productId is required",
    });
  }

  try {
    const result = await createOrder({
      userId: req.user!.userId,
      productId,
      quantity,
      shippingAddress,
      couponCode,
      giftUpgrades,
      idempotencyKey,
    });

    if (result.kind === "error") {
      return res.status(result.http).json({
        success: false,
        code: result.code,
        message: result.message,
        ...(typeof result.availableStock === "number"
          ? { availableStock: result.availableStock }
          : {}),
      });
    }

    const isDuplicate = result.kind === "duplicate";

    res.status(isDuplicate ? 200 : 201).json({
      success: true,
      ...(isDuplicate ? { duplicate: true } : {}),
      ...buildOrderPublicView(result.order),
      orderId: result.order._id,
      // Server-built, order-specific UPI payment payload (QR source of truth).
      paymentInstructions: createPaymentInstructions(result.order),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: "ORDER_CREATION_FAILED",
      message: "Order creation failed",
    });
  }
});

app.get(
  "/api/v1/orders/me",
  authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const orders = await Order.find({ user: req.user!.userId })
        .sort({ orderedAt: -1 })
        .lean();

      res.status(200).json({
        success: true,
        orders: orders.map(buildOrderPublicView),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }
  }
);

app.get(
  "/api/v1/orders/:orderId",
  authenticateUserOrAdmin,
  async (req: Request, res: Response) => {
    try {
      const order = await Order.findById(req.params.orderId).lean();

      if (!order) {
        return res.status(404).json({
          success: false,
          code: "ORDER_NOT_FOUND",
          message: "Order not found",
        });
      }

      const isOwner = String(order.user) === req.user?.userId;

      if (!isOwner && !req.admin) {
        return res.status(403).json({
          success: false,
          code: "FORBIDDEN",
          message: "You do not have access to this order",
        });
      }

      res.status(200).json({
        success: true,
        order: buildOrderPublicView(order),
        paymentInstructions: createPaymentInstructions(order),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch order",
      });
    }
  }
);

/**
 * Customer reports they completed the UPI payment. Sets AWAITING_VERIFICATION
 * only — the payment is never marked VERIFIED by this endpoint. The legacy
 * /payment-proof route is registered below as an alias so old clients degrade
 * gracefully into the same state.
 */
const paymentReportedHandler = async (req: Request, res: Response) => {
  try {
    const result = await reportPayment(
      req.params.orderId ?? "",
      req.user!.userId
    );

    if (result.kind === "error") {
      return res.status(result.http).json({
        success: false,
        code: result.code,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      ...buildOrderPublicView(result.order),
      orderId: result.order._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to report payment",
    });
  }
};

app.post(
  "/api/v1/orders/:orderId/payment-reported",
  authenticateUser,
  paymentReportedHandler
);

// Legacy alias — same behavior, kept so deployed older frontends keep working
// until they are replaced.
app.post(
  "/api/v1/orders/:orderId/payment-proof",
  authenticateUser,
  paymentReportedHandler
);

/**
 * Admin-only payment verification. Only this action can move a reported
 * payment to VERIFIED (and the order to CONFIRMED).
 */
const confirmPaymentHandler = async (req: Request, res: Response) => {
  try {
    const result = await verifyPayment(
      req.params.orderId ?? "",
      req.admin!.userId
    );

    if (result.kind === "error") {
      return res.status(result.http).json({
        success: false,
        code: result.code,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: result.alreadyDone ? "Order already confirmed" : "Payment verified — order confirmed",
      order: result.order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

app.patch(
  "/api/v1/admin/orders/:orderId/confirm-payment",
  requireAdmin,
  confirmPaymentHandler
);

// Legacy alias for the pre-existing admin confirm route.
app.patch(
  "/api/v1/admin/orders/:orderId/confirm",
  requireAdmin,
  confirmPaymentHandler
);

app.patch(
  "/api/v1/admin/orders/:orderId/reject-payment",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const result = await rejectPayment(
        req.params.orderId ?? "",
        req.admin!.userId,
        (req.body as { reason?: unknown } | undefined)?.reason as string | undefined
      );

      if (result.kind === "error") {
        return res.status(result.http).json({
          success: false,
          code: result.code,
          message: result.message,
        });
      }

      res.status(200).json({
        success: true,
        message: result.alreadyDone ? "Payment already rejected" : "Payment rejected",
        order: result.order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Payment rejection failed",
      });
    }
  }
);

app.patch(
  "/api/v1/admin/orders/:orderId/cancel",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const result = await cancelOrder(req.params.orderId ?? "");

      if (result.kind === "error") {
        return res.status(result.http).json({
          success: false,
          code: result.code,
          message: result.message,
        });
      }

      res.status(200).json({
        success: true,
        message: result.alreadyDone ? "Order already cancelled" : "Order cancelled",
        order: result.order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Order cancellation failed",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------
const start = async (): Promise<void> => {
  await mongoose.connect(mongoUri, { dbName: "QuickWish" });
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

if (process.env.NODE_ENV !== "test") {
  start().catch((error) => {
    console.error("database is not connected", error);
    process.exit(1);
  });
}

export { app };
