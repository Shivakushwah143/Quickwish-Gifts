import Express, { response } from "express";
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { admin, Order, product, User } from "./db.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import multer from "multer";
import { uploadProductImages } from "./config/uploadImages.js";
import type { JwtPayload } from "./types/index.js";
import cors from "cors";
const app = Express();

app.use(Express.json());

app.use(
  cors({
    origin: "https://quickwish-gifts-qvbu-mtw2oh8wf-shivakushwah143s-projects.vercel.app",
    credentials: true,
  })
);
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI as string;
const SECRET = process.env.SECRET || "fallback_secret";


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
    } = req.body;

    console.log("Received body:", req.body);
    console.log("Received files:", (req as any).files);

    try {
      const imageUrls = (req as any).files
        ? await uploadProductImages((req as any).files)
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
    const updateProduct = await product.findByIdAndUpdate(productId, req.body, {
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

app.post(
  "/api/v1/orders",
  authenticateUser,
  async (req: Request, res: Response) => {
    const { productId, shippingAddress } = req.body;
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
      const order = await Order.create({
        user: user._id,
        product: productId,
        amount: (GiftProduct as any).originalPrice,
        shippingAddress,
        status: "Processing",
      });

      res.status(201).json({
        success: true,
        orderId: order._id,
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

      console.log("level2");
      res.status(200).json({
        success: true,
        message: "Order confirmed",
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
