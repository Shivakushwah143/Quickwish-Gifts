/**
 * Backfill script for legacy QuickWish orders.
 *
 * Fills in fields introduced by the commerce-integrity work:
 *  - paymentStatus   (derived from legacy status)
 *  - quantity        (default 1)
 *  - productSnapshot (immutable product data for historical orders)
 *
 * Run: npm run backfill:orders
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order, product } from "../src/db.js";
import { generateOrderNumber } from "../src/services/order.service.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI?.trim();

if (!mongoUri) {
  console.error("MONGO_URI is required");
  process.exit(1);
}

const derivePaymentStatus = (order: any): string => {
  if (order.paymentStatus) {
    return order.paymentStatus;
  }

  const status = String(order.status || "").trim().toLowerCase();

  if (status === "orderconfirmed" || status === "paid") {
    return "VERIFIED";
  }

  if (status === "cancelled") {
    return "REJECTED";
  }

  return "PENDING";
};

const main = async (): Promise<void> => {
  await mongoose.connect(mongoUri, { dbName: "QuickWish" });

  const orders = await Order.find({}).lean();
  let updated = 0;
  let missingProducts = 0;

  for (const order of orders) {
    const update: Record<string, unknown> = {};
    const paymentStatus = derivePaymentStatus(order);

    if (paymentStatus !== order.paymentStatus) {
      update.paymentStatus = paymentStatus;
    }

    if (!order.quantity) {
      update.quantity = 1;
    }

    // Mint a friendly order number for legacy orders so UPI transaction refs
    // are human-readable even for pre-existing records.
    if (!order.orderNumber) {
      update.orderNumber = await generateOrderNumber();
    }

    if (!order.productSnapshot && order.product) {
      const giftProduct = await product.findById(order.product).lean();

      if (giftProduct) {
        const unitPrice =
          Number(order.originalAmount || order.subtotal || order.amount) || 0;

        update.productSnapshot = {
          productId: giftProduct._id,
          name: giftProduct.name,
          ...(Array.isArray(giftProduct.images) && giftProduct.images.length > 0
            ? { image: String(giftProduct.images[0]) }
            : {}),
          unitPrice: Number.isFinite(unitPrice) ? unitPrice : Number(order.amount) || 0,
          quantity: Number(order.quantity) || 1,
          category: giftProduct.category,
        };
      } else {
        missingProducts += 1;
        console.log(
          `[backfill] order ${order._id} references a product that no longer exists; snapshot skipped`
        );
      }
    }

    if (Object.keys(update).length > 0) {
      await Order.updateOne({ _id: order._id }, { $set: update });
      updated += 1;
    }
  }

  console.log(
    `[backfill] done. orders=${orders.length} updated=${updated} missingProducts=${missingProducts}`
  );

  await mongoose.disconnect();
};

main().catch((error) => {
  console.error("[backfill] failed", error);
  process.exit(1);
});
