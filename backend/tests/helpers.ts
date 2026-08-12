import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import supertest from "supertest";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// Importing the app registers all routes. The module reads process.env.SECRET
// at import time — setup.ts guarantees it is set before this file loads.
import { app } from "../src/index.js";
import { admin, Coupon, Creator, Order, OrderCounter, product, User } from "../src/db.js";

let mongoServer: MongoMemoryServer | null = null;

export const startTestDb = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "QuickWish" });
};

export const stopTestDb = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

export const resetTestDb = async (): Promise<void> => {
  await Promise.all([
    admin.deleteMany({}),
    User.deleteMany({}),
    product.deleteMany({}),
    Coupon.deleteMany({}),
    Creator.deleteMany({}),
    Order.deleteMany({}),
    OrderCounter.deleteMany({}),
  ]);
};

export const api = () => supertest(app);

const TEST_SECRET = process.env.SECRET || "test-secret";

export const signToken = (payload: Record<string, unknown>): string =>
  Jwt.sign(payload, TEST_SECRET, { expiresIn: "1h" });

export const createCustomer = async (email = "customer@test.com") => {
  const user = await User.create({
    email,
    username: email.split("@")[0],
    password: await bcrypt.hash("password123", 4),
  });

  return {
    user,
    token: signToken({ userId: user._id.toString(), role: "CUSTOMER" }),
  };
};

export const createAdmin = async (username = "root") => {
  const doc = await admin.create({
    username,
    password: await bcrypt.hash("password123", 4),
    role: "ADMIN",
  });

  return {
    admin: doc,
    token: signToken({ userId: doc._id.toString(), role: "ADMIN" }),
  };
};

export const createProduct = async (overrides: Record<string, unknown> = {}) => {
  const doc = await product.create({
    name: "Birthday Gift Hamper",
    price: 799,
    category: "Birthday",
    description: "A beautiful handmade hamper",
    images: ["https://example.com/hamper.jpg"],
    stock: 5,
    ...overrides,
  });

  return doc;
};

export const createCreatorWithCoupon = async (code = "CREATOR1") => {
  const creator = await Creator.create({
    name: "Creator One",
    email: "creator1@test.com",
    preferredCode: code,
    active: true,
  });

  const coupon = await Coupon.create({
    code,
    discountType: "flat",
    discountValue: 50,
    minOrderAmount: 0,
    active: true,
    isCreatorCode: true,
    creatorId: creator._id,
    creatorName: creator.name,
    commissionPerOrder: 100,
  });

  creator.assignedCouponId = coupon._id;
  await creator.save();

  return { creator, coupon };
};

export const buildShippingAddress = () => ({
  name: "Test Customer",
  phone: "9876543210",
  street: "12 MG Road",
  city: "Indore",
  pinCode: "452001",
});
