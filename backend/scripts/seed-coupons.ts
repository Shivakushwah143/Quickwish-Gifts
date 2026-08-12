/**
 * Seeds the storefront offer coupons that the checkout UI auto-applies.
 *
 * GIFT50  → flat Rs 50 off above Rs 399
 * GIFT100 → flat Rs 100 off above Rs 999
 *
 * Run: npm run seed:coupons
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Coupon } from "../src/db.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI?.trim();

if (!mongoUri) {
  console.error("MONGO_URI is required");
  process.exit(1);
}

const SEED_COUPONS = [
  {
    code: "GIFT50",
    discountType: "flat",
    discountValue: 50,
    minOrderAmount: 399,
    active: true,
    isCreatorCode: false,
    description: "Save Rs 50 above Rs 399",
  },
  {
    code: "GIFT100",
    discountType: "flat",
    discountValue: 100,
    minOrderAmount: 999,
    active: true,
    isCreatorCode: false,
    description: "Save Rs 100 above Rs 999",
  },
];

const main = async (): Promise<void> => {
  await mongoose.connect(mongoUri, { dbName: "QuickWish" });

  for (const coupon of SEED_COUPONS) {
    const result = await Coupon.findOneAndUpdate(
      { code: coupon.code },
      {
        $set: {
          ...coupon,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          usedCount: 0,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`[seed] coupon ${coupon.code} ready (id=${result._id})`);
  }

  await mongoose.disconnect();
};

main().catch((error) => {
  console.error("[seed] failed", error);
  process.exit(1);
});
