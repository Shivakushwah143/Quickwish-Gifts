import Express, { response } from "express";
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { admin, ChatMemory, Coupon, Order, product, User } from "./db.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import multer from "multer";
import { uploadProductImages } from "./config/uploadImages.js";
import {
  sendOrderConfirmationEmail,
  type OrderItem,
} from "./services/email.service.js";
import type { JwtPayload } from "./types/index.js";
import cors from "cors";
import dns from "dns";
const app = Express();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.use(Express.json());

// app.use(
//   cors({
//     origin: "https://quickwish-gifts-qvbu-mtw2oh8wf-shivakushwah143s-projects.vercel.app",
//     credentials: true,
//   })
// );
app.use(cors({
  origin: [
    'https://quickwish-gifts-git-main-shivakushwah143s-projects.vercel.app', // Your main domain
    'https://quickwish-gifts-qvbu.vercel.app', // Your previous domain
    'https://www.onewish.fun',                 // Your custom domain (NEW)
    /\.vercel\.app$/,                          // All Vercel deployments (regex pattern)
    'http://localhost:3000'                    // Local development
  ],
  credentials: true,
}));
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI as string;
const SECRET = process.env.SECRET || "fallback_secret";
const GROK_API_KEY = process.env.GROK_API_KEY as string;
const GROQ_API_KEY = process.env.GROQ_API_KEY as string;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY as string;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimitMap = new Map<string, { count: number; start: number }>();

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

app.post("/api/v1/user/signup", async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  try {
    // Check if user exists (email or username)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 8);
    const user = await User.create({
      email,
      username,
      password: hashPassword,
    });

    const token = Jwt.sign({ userId: user._id }, SECRET, { expiresIn: "1h" });
    res.status(200).json({
      message: "User registered successfully",
      token,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Error in user registration" });
  }
});

app.get("/api/v1/admin/users", async (req: Request, res: Response) => {
  try {
    const allusers = await User.find({});
    res.status(200).json({ message: "all users", allusers });
  } catch (error) {
    res.status(500).json({ message: "all users" });

  }
});

app.post("/api/v1/user/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // const passwordValid = await bcrypt.compare(password, password);
    // if (!passwordValid) {
    //   return res.status(401).json({ message: "Invalid credentials" });
    // }

    const token = Jwt.sign({ userId: user._id, email: user.email }, SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      success: true,
      token,
      message: "Signin successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Authentication middleware
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "Authorization header missing" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(400).json({ error: "Token not provided" });
  }

  Jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Invalid or expired token" });
      return;
    }

    const payload = decoded as JwtPayload;
    req.user = payload;

    next();
  });
};
const adminAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(400).json({ error: "Token not provided" });
    }

    Jwt.verify(token, SECRET, (err, admin) => {
      if (err) {
        return res.sendStatus(403);
      }
      const payload = admin as JwtPayload;
      req.admin = payload;
      next();
    });
  }
};

const normalizeCouponCode = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toUpperCase();
};

const DELIVERY_FEE = 49;

type ProductPricingSource = {
  price?: unknown;
  offPrice?: unknown;
  originalPrice?: unknown;
};

type CouponPricingSource = {
  discountType?: unknown;
  discountValue?: unknown;
};

const getBaseOrderAmount = (giftProduct: ProductPricingSource) => {
  const candidateValues = [
    giftProduct?.price,
    giftProduct?.offPrice,
    giftProduct?.originalPrice,
  ];

  for (const value of candidateValues) {
    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }
  }

  return 0;
};

const calculateCouponDiscount = (baseAmount: number, coupon: CouponPricingSource | null) => {
  const safeBaseAmount = Number.isFinite(baseAmount) && baseAmount > 0 ? baseAmount : 0;

  if (!coupon || safeBaseAmount <= 0) {
    return {
      discountAmount: 0,
      finalAmount: safeBaseAmount,
    };
  }

  let discountAmount = 0;

  if (coupon.discountType === "flat") {
    discountAmount = Math.min(Number(coupon.discountValue) || 0, safeBaseAmount);
  } else {
    discountAmount = (safeBaseAmount * (Number(coupon.discountValue) || 0)) / 100;
  }

  const roundedDiscount = Math.max(
    0,
    Math.min(safeBaseAmount, Number(discountAmount.toFixed(2)))
  );
  const finalAmount = Number((safeBaseAmount - roundedDiscount).toFixed(2));

  return {
    discountAmount: roundedDiscount,
    finalAmount,
  };
};

const calculateOrderPricing = (
  subtotal: number,
  couponDiscount: number,
  deliveryFee = DELIVERY_FEE
) => {
  const safeSubtotal = Number.isFinite(subtotal) && subtotal > 0 ? subtotal : 0;
  const safeCouponDiscount = Number.isFinite(couponDiscount) && couponDiscount > 0
    ? Math.min(couponDiscount, safeSubtotal)
    : 0;
  const safeDeliveryFee = Number.isFinite(deliveryFee) && deliveryFee > 0 ? deliveryFee : 0;
  const finalAmount = Number((safeSubtotal - safeCouponDiscount + safeDeliveryFee).toFixed(2));

  return {
    subtotal: safeSubtotal,
    couponDiscount: safeCouponDiscount,
    deliveryFee: safeDeliveryFee,
    finalAmount,
  };
};

const validateCouponForAmount = async (code: unknown, baseAmount: number) => {
  const couponCode = normalizeCouponCode(code);

  if (!couponCode) {
    return {
      ok: true,
      coupon: null,
      discountAmount: 0,
      finalAmount: baseAmount,
    };
  }

  const coupon = await Coupon.findOne({
    code: couponCode,
    active: true,
  });

  if (!coupon) {
    return {
      ok: false,
      message: "Invalid coupon code",
    };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return {
      ok: false,
      message: "Coupon has expired",
    };
  }

  if (Number(coupon.minOrderAmount || 0) > baseAmount) {
    return {
      ok: false,
      message: `Minimum order amount for this coupon is Rs ${coupon.minOrderAmount}`,
    };
  }

  if (
    typeof coupon.usageLimit === "number" &&
    coupon.usageLimit > 0 &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return {
      ok: false,
      message: "Coupon usage limit has been reached",
    };
  }

  const { discountAmount, finalAmount } = calculateCouponDiscount(baseAmount, coupon);

  return {
    ok: true,
    coupon,
    discountAmount,
    finalAmount,
  };
};

app.post("/api/v1/admin/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const hashPassword = await bcrypt.hash(password, 8);
    const user = await admin.create({
      username,
      password: hashPassword,
    });
    const token = Jwt.sign({ userId: user._id }, SECRET, { expiresIn: "1h" });
    res
      .status(200)
      .json({ message: "admin register succesfully", token, success: true });
  } catch (error) {
    res.status(500).json({ message: "error i user register" });
  }
});

app.post("/api/v1/admin/signin", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await admin.findOne({ username });
    if (!user) {
      res.status(401).json({ message: "admin not found" });
      return;
    }
    const passwordValid = await bcrypt.compare(
      password as string,
      user?.password as string
    );
    if (!passwordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = Jwt.sign(
      { username: user.username, userID: user._id.toString() },
      SECRET,
      { expiresIn: "1hr" }
    );
    res
      .status(200)
      .json({ success: true, token, message: " admin Signin successful" });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/v1/user/sync-clerk", async (req: Request, res: Response) => {
  const { clerkUserId, email, username } = req.body;

  try {
    let user = await User.findOne({
      $or: [{ clerkUserId }, { email }],
    });

    if (!user) {
      // Create new user
      user = await User.create({
        clerkUserId,
        email,
        username,
      });
    } else {
      // Update existing user
      user.clerkUserId = clerkUserId;
      user.username = username || user.username;
      await user.save();
    }

    const token = Jwt.sign({ userId: user._id, clerkUserId }, SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Clerk sync error:", error);
    res.status(500).json({ message: "Error syncing user with Clerk" });
  }
});

app.get("/api/v1/admin/allOrders", async (req: Request, res: Response) => {
  try {
    const allOrders = await Order.find({});
    res.status(200).json({ message: "all orders fetched", allOrders });
  } catch (error) {
    res.status(200).json({ message: "erorall orders fetched" });
  }
});

app.post(
  "/api/v1/product",
  upload.array("images"),
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

    console.log("Received body:", req.body);
    console.log("Received files:", (req as any).files);

    try {
      const imageUrls = (req as any).files
        ? await uploadProductImages((req as any).files)
        : [];

      const parsedTags =
        typeof tags === "string"
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : Array.isArray(tags)
            ? tags
                .map((tag) => String(tag).trim())
                .filter((tag) => tag.length > 0)
            : [];

      const newProduct = new product({
        name,
        price: Number(price),
        category,
        badge,
        images: imageUrls,
        description,
        discountPercent: discountPercent ? Number(discountPercent) : undefined,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        offPrice: offPrice ? Number(offPrice) : undefined,
        deliveryOptions: deliveryOptions
          ? JSON.parse(deliveryOptions)
          : undefined,
        stock: Number(stock),
        tags: parsedTags,
      });

      await newProduct.save();

      res.status(201).json({
        message: "Product created successfully",
        product: newProduct,
      });
    } catch (error) {
      console.error("Product creation error:", error);
      res.status(500).json({
        message: "Error creating product",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

app.get("/api/v1/product", async (req: Request, res: Response) => {
  try {
    const products = await product.find({});
    res.status(200).json({ message: "productList", products, success: true });
  } catch (error) {
    res.status(500).json({ message: "error while getting productList" });
  }
});

app.get("/api/v1/product/:productId", async (req: Request, res: Response) => {
  const productId = req.params.productId;
  console.log(productId);
  try {
    if (!productId) {
      res.status(404).json({ message: "product not found" });
    }
    const singleProduct = await product.findById(productId);
    res.status(200).json({ success: true, singleProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "intetnal server error" });
  }
});

app.put("/api/v1/product/:productId", async (req: Request, res: Response) => {
  const productId = await req.params.productId;
  const userWantTOupdate = req.body;
  console.log(req.body);

  try {
    if (!productId) {
      res.status(404).json({ message: "product not found" });
    }
    console.log(productId);
    if (typeof userWantTOupdate.tags === "string") {
      userWantTOupdate.tags = userWantTOupdate.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
    }

    const updateProduct = await product.findByIdAndUpdate(productId, userWantTOupdate, {
      new: true,
    });
    res.status(200).json({ success: true, updateProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "intetnal server error" });
  }
});
app.delete(
  "/api/v1/product/:productId",
  async (req: Request, res: Response) => {
    const productId = await req.params.productId;
    console.log(productId);
    try {
      const deletedProduct = await product.findByIdAndDelete(productId);
      res.status(200).json({ success: true, deletedProduct });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "intetnal server error" });
    }
  }
);

app.post("/api/v1/coupons/validate", async (req: Request, res: Response) => {
  const { code, productId, amount } = req.body || {};

  try {
    let baseAmount = Number(amount);

    if ((!Number.isFinite(baseAmount) || baseAmount <= 0) && productId) {
      const giftProduct = await product.findById(productId);
      if (!giftProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      baseAmount = getBaseOrderAmount(giftProduct);
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

    return res.status(200).json({
      success: true,
      message: couponCode ? "Coupon applied successfully" : "No coupon applied",
      coupon: validation.coupon
        ? {
            id: validation.coupon._id,
            code: validation.coupon.code,
            discountType: validation.coupon.discountType,
            discountValue: validation.coupon.discountValue,
            creatorName: validation.coupon.creatorName,
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

const assistantChatHandler = async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const bucket = rateLimitMap.get(ip);
  if (!bucket || now - bucket.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, start: now });
  } else {
    bucket.count += 1;
    if (bucket.count > RATE_LIMIT_MAX) {
      return res.status(429).json({ message: "Too many requests. Please try again shortly." });
    }
  }

  const assistantKey = GROQ_API_KEY || GROK_API_KEY || DEEPSEEK_API_KEY;
  console.log(assistantKey)
  if (!assistantKey) {
    return res.status(500).json({ message: "Assistant is not configured." });
  }

  const { message, messages } = req.body || {};
  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ message: "Message is required." });
  }
  if (message.length > 500) {
    return res.status(400).json({ message: "Message is too long." });
  }

  const normalizedMessages = Array.isArray(messages)
    ? messages
        .filter((m) => m && typeof m.content === "string" && typeof m.role === "string")
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  let userId: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        const decoded = Jwt.verify(token, SECRET) as JwtPayload;
        userId = decoded.userId;
      } catch {
        userId = null;
      }
    }
  }

  let history: { role: string; content: string }[] = [];
  if (userId) {
    const memory = await ChatMemory.findOne({ userId }).lean();
    if (memory?.messages?.length) {
      history = memory.messages.slice(-20).map((m: any) => ({ role: m.role, content: m.content }));
    }
  } else {
    history = normalizedMessages.slice(-20);
  }

  const products = await product
    .find({})
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

  const requestPayload = {
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message.trim() },
    ],
    temperature: 0.4,
  };

  const callGroq = async () => {
    if (!GROQ_API_KEY) return null;
    console.log(GROK_API_KEY)
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        ...requestPayload,
      }),
    });
    console.log(res)
    return res;
  };

  const callDeepSeek = async () => {
    if (!DEEPSEEK_API_KEY) return null;
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        ...requestPayload,
      }),
    });
    return res;
  };

  try {
    let assistantRes = await callGroq();
    if (!assistantRes || !assistantRes.ok) {
      const fallbackRes = await callDeepSeek();
      assistantRes = fallbackRes || assistantRes;
    }

    if (!assistantRes || !assistantRes.ok) {
      const errText = assistantRes ? await assistantRes.text() : "No provider configured";
      return res.status(502).json({ message: "Assistant unavailable.", details: errText });
    }

    const data = await assistantRes.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ message: "Assistant returned no response." });
    }

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

app.post("/api/assistant/chat", assistantChatHandler);
app.post("/api/v1/assistant/chat", assistantChatHandler);

app.post(
  "/api/v1/orders",
  authenticateUser,
  async (req: Request, res: Response) => {
    const { productId, shippingAddress, couponCode } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token);
    try {
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Verify token (JWT users)
      const decoded = Jwt.verify(token, SECRET) as JwtPayload;
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Create order
      const GiftProduct = await product.findById(productId);
      if (!GiftProduct)
        return res.status(404).json({ message: "Product not found" });
      console.log(req.body);

      const subtotal = getBaseOrderAmount(GiftProduct);
      const validation = await validateCouponForAmount(couponCode, subtotal);

      if (!validation.ok) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }

      let couponDoc = validation.coupon;
      let discountAmount = validation.discountAmount ?? 0;
      const normalizedCouponCode = normalizeCouponCode(couponCode);

      if (normalizedCouponCode) {
        const couponFilter: Record<string, unknown> = {
          code: normalizedCouponCode,
          active: true,
        };

        if (validation.coupon?.expiresAt) {
          couponFilter.expiresAt = { $gt: new Date() };
        }

        if (
          typeof validation.coupon?.usageLimit === "number" &&
          validation.coupon.usageLimit > 0
        ) {
          couponFilter.$expr = {
            $lt: ["$usedCount", "$usageLimit"],
          };
        }

        couponDoc = await Coupon.findOneAndUpdate(
          couponFilter,
          {
            $inc: { usedCount: 1 },
            $set: { updatedAt: new Date() },
          },
          { new: true }
        );

        if (!couponDoc) {
          return res.status(400).json({
            success: false,
            message: "Coupon is no longer available",
          });
        }

        const recalculated = calculateCouponDiscount(subtotal, couponDoc);
        discountAmount = recalculated.discountAmount;
      }

      const orderPricing = calculateOrderPricing(subtotal, discountAmount);

      const order = await Order.create({
        user: user._id,
        product: productId,
        amount: orderPricing.finalAmount,
        originalAmount: orderPricing.subtotal,
        subtotal: orderPricing.subtotal,
        discountAmount,
        couponDiscount: orderPricing.couponDiscount,
        deliveryFee: orderPricing.deliveryFee,
        finalAmount: orderPricing.finalAmount,
        couponCode: normalizedCouponCode || undefined,
        couponId: couponDoc?._id,
        shippingAddress,
        status: "Processing",
      });

      res.status(201).json({
        success: true,
        orderId: order._id,
        amount: order.amount,
        originalAmount: order.originalAmount,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        couponDiscount: order.couponDiscount,
        deliveryFee: order.deliveryFee,
        finalAmount: order.finalAmount,
        couponCode: order.couponCode,
        whatsappUrl: `https://wa.me/9575930848?text=Order%20${order._id}`,
      });
    } catch (error) {
      res.status(500).json({ message: "Order creation failed" });
    }
  }
);

app.patch(
  "/api/v1/admin/orders/:orderId/confirm",
  adminAuthentication,
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    console.log(orderId);
    console.log("level0");
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          status: "orderConfirmed",
          paidAt: new Date(),
        },
        { new: true }
      );
      console.log("level1");
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const customer = await User.findById(order.user);
      const orderedProduct = await product.findById(order.product);

      if (!customer) {
        console.error(`Order ${orderId} confirmed, but customer was not found`);
        return res.status(500).json({
          success: false,
          message: "Order confirmed, but customer email could not be found",
        });
      }

      if (!orderedProduct) {
        console.error(`Order ${orderId} confirmed, but product was not found`);
        return res.status(500).json({
          success: false,
          message: "Order confirmed, but product details could not be found",
        });
      }

      const orderItems: OrderItem[] = [
        {
          name: orderedProduct.name,
          quantity: 1,
          price: order.finalAmount ?? order.amount,
        },
      ];

      try {
        await sendOrderConfirmationEmail({
          customerName: order.shippingAddress?.name || customer.username || "Customer",
          customerEmail: customer.email,
          orderId: order._id.toString(),
          items: orderItems,
          totalAmount: order.finalAmount ?? order.amount,
        });
        console.log('sent email successfully')
      } catch (emailError) {
        const message =
        emailError instanceof Error ? emailError.message : "Unknown email error";
        console.error(
          `Order ${orderId} confirmed, but confirmation email failed: ${message}`
        );
        return res.status(502).json({
          success: false,
          message: "Order confirmed, but confirmation email failed",
        });
        console.log('sent email successfully')
      }

      console.log("level2");
      res.status(200).json({
        success: true,
        message: "Order confirmed",
        emailSent: true,
        order,
      });
    } catch (error) {
      res.status(500).json({ message: "Order confirmation failed" });
    }
  }
);

mongoose
  .connect(mongoUri, { dbName: "QuickWish" })
  .then(() => {
    console.log("database is connected");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("database is not connected", error);
  });
