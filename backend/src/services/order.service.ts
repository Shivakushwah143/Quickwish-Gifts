import { randomUUID } from "crypto";
import { Coupon, Order, OrderCounter, product, User } from "../db.js";
import {
  calculateOrderPricing,
  getUnitPrice,
  MAX_ORDER_QUANTITY,
  normalizeCouponCode,
  normalizeGiftUpgrades,
  type GiftUpgradesInput,
  validateCouponForAmount,
} from "./pricing.js";
import {
  decrementProductStock,
  restoreProductStock,
} from "./inventory.js";
import {
  sendOrderConfirmationEmail,
  sendPaymentReceivedEmail,
  type OrderItem,
} from "./email.service.js";

/**
 * Order lifecycle domain logic. All side effects (stock, coupon usage,
 * creator commission, emails) are guarded so retries and double-submits are
 * idempotent.
 */

export const ORDER_STATUSES = {
  PROCESSING: "Processing",
  CONFIRMED: "orderConfirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

export const PAYMENT_STATUSES = {
  PENDING: "PENDING",
  PROOF_SUBMITTED: "PROOF_SUBMITTED", // legacy value from the old screenshot/WhatsApp flow
  AWAITING_VERIFICATION: "AWAITING_VERIFICATION",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;

/**
 * Statuses that mean "customer reported the payment, an admin must still check
 * the UPI/bank app and confirm". PROOF_SUBMITTED is the legacy name for the
 * same state from the removed screenshot flow — it stays readable forever.
 */
export const AWAITING_PAYMENT_STATUSES = [
  PAYMENT_STATUSES.AWAITING_VERIFICATION,
  PAYMENT_STATUSES.PROOF_SUBMITTED,
] as const;

const ORDER_PAYMENT_TTL_MS = 24 * 60 * 60 * 1000; // paymentExpiresAt horizon for stale-order visibility

/**
 * Mints a unique, human-readable order number (QW-2026-001582) using an
 * atomic per-year counter. Used as the UPI transaction reference.
 */
export const generateOrderNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const counter = await OrderCounter.findOneAndUpdate(
    { year },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return `QW-${year}-${String(counter.seq).padStart(6, "0")}`;
};

export type CreateOrderInput = {
  userId: string;
  productId: string;
  quantity?: number;
  shippingAddress?: Record<string, unknown>;
  couponCode?: string;
  giftUpgrades?: GiftUpgradesInput;
  idempotencyKey?: string;
};

export type CreateOrderResult =
  | {
      kind: "created";
      order: any;
    }
  | {
      kind: "duplicate";
      order: any;
    }
  | {
      kind: "error";
      http: number;
      code: string;
      message: string;
      availableStock?: number;
    };

export type OrderActionResult =
  | { kind: "ok"; order: any; alreadyDone?: boolean }
  | { kind: "error"; http: number; code: string; message: string };

const buildProductSnapshot = (
  giftProduct: any,
  quantity: number,
  unitPrice: number
) => {
  const image =
    Array.isArray(giftProduct.images) && giftProduct.images.length > 0
      ? String(giftProduct.images[0])
      : undefined;

  return {
    productId: giftProduct._id,
    name: giftProduct.name,
    ...(image ? { image } : {}),
    unitPrice,
    quantity,
    category: giftProduct.category,
  };
};

const isDuplicateKeyError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const code = (error as { code?: number }).code;

  return code === 11000;
};

/**
 * Extracts the conflicting index name from a duplicate-key error so we can
 * tell an orderNumber collision (retryable with a fresh number) apart from an
 * idempotencyKey collision (a true concurrent duplicate).
 */
const getDuplicateKeyIndex = (error: unknown): string | null => {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const message = String((error as { message?: string }).message || "");
  const match = message.match(/index:\s+([^\s]+)/);

  return match?.[1] ?? null;
};

/**
 * Creates an order with server-authoritative pricing.
 *
 * Sequence (no transactions required):
 *  1. validate coupon (no side effects)
 *  2. atomically reserve stock (guarded)
 *  3. create order with unique idempotencyKey
 *  4. increment coupon usage (guarded atomic)
 *
 * Every failure path restores the resources it already touched. Retries of the
 * same idempotencyKey return the original order instead of creating a new one.
 */
export const createOrder = async ({
  userId,
  productId,
  quantity = 1,
  shippingAddress,
  couponCode,
  giftUpgrades,
  idempotencyKey,
}: CreateOrderInput): Promise<CreateOrderResult> => {
  const resolvedKey = idempotencyKey?.trim() || randomUUID();

  const existingOrder = await Order.findOne({ idempotencyKey: resolvedKey }).lean();

  if (existingOrder) {
    return { kind: "duplicate", order: existingOrder };
  }

  const giftProduct = await product.findById(productId);

  if (!giftProduct) {
    return {
      kind: "error",
      http: 404,
      code: "PRODUCT_NOT_FOUND",
      message: "Product not found",
    };
  }

  const qty = Math.floor(Number(quantity));

  if (!Number.isFinite(qty) || qty < 1 || qty > MAX_ORDER_QUANTITY) {
    return {
      kind: "error",
      http: 400,
      code: "INVALID_QUANTITY",
      message: `Quantity must be between 1 and ${MAX_ORDER_QUANTITY}`,
    };
  }

  // 1. Authoritative pricing (without coupon first, then re-run with coupon).
  const basePricing = calculateOrderPricing({
    product: giftProduct,
    quantity: qty,
    coupon: null,
    giftUpgrades,
  });

  const validation = await validateCouponForAmount(
    couponCode,
    basePricing.subtotal
  );

  if (!validation.ok) {
    return {
      kind: "error",
      http: 400,
      code: "INVALID_COUPON",
      message: validation.message || "Coupon is not valid",
    };
  }

  const orderPricing = calculateOrderPricing({
    product: giftProduct,
    quantity: qty,
    coupon: validation.coupon,
    giftUpgrades,
  });

  const normalizedCouponCode = normalizeCouponCode(couponCode);
  const normalizedGiftUpgrades = normalizeGiftUpgrades(giftUpgrades);

  // 2. Reserve stock atomically. Failure = 409, nothing else touched.
  const stockReserved = await decrementProductStock(productId, qty);

  if (!stockReserved) {
    return {
      kind: "error",
      http: 409,
      code: "INSUFFICIENT_STOCK",
      message: `Only ${Number(giftProduct.stock) || 0} item(s) remaining`,
      availableStock: Number(giftProduct.stock) || 0,
    };
  }

  // 3. Increment coupon usage only after stock reservation succeeded.
  //    Guarded so concurrent requests cannot exceed the usage limit.
  let couponDoc: any = validation.coupon;

  if (normalizedCouponCode && validation.coupon) {
    const couponFilter: Record<string, unknown> = {
      _id: validation.coupon._id,
      active: true,
    };

    if (validation.coupon.expiresAt) {
      couponFilter.expiresAt = { $gt: new Date() };
    }

    if (
      typeof validation.coupon.usageLimit === "number" &&
      validation.coupon.usageLimit > 0
    ) {
      couponFilter.$expr = {
        $lt: ["$usedCount", "$usageLimit"],
      };
    }

    const updatedCoupon = await Coupon.findOneAndUpdate(
      couponFilter,
      {
        $inc: { usedCount: 1 },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (!updatedCoupon) {
      await restoreProductStock(productId, qty);
      return {
        kind: "error",
        http: 400,
        code: "COUPON_UNAVAILABLE",
        message: "Coupon is no longer available",
      };
    }

    couponDoc = updatedCoupon;
  }

  const creatorReferral =
    couponDoc && couponDoc.isCreatorCode
      ? {
          creatorId: couponDoc.creatorId,
          creatorCode: couponDoc.code,
          creatorCommission:
            Number(couponDoc.commissionPerOrder) || 100,
          creatorCommissionStatus: "pending" as const,
        }
      : {
          creatorCommission: 0,
          creatorCommissionStatus: "none" as const,
        };

  // 4. Create the order (unique idempotencyKey prevents duplicates). A rare
  //    collision on the orderNumber unique index is retried with a fresh number;
  //    an idempotencyKey collision is a true concurrent duplicate and returns
  //    the original order. Every real failure rolls back stock + coupon usage.
  const rollbackReservations = async () => {
    await restoreProductStock(productId, qty);

    if (couponDoc?._id) {
      await Coupon.updateOne(
        { _id: couponDoc._id },
        { $inc: { usedCount: -1 } }
      ).catch(() => {
        // Best-effort rollback only.
      });
    }
  };

  let order: any = null;
  let orderNumber = await generateOrderNumber();

  for (let attempt = 0; attempt < 3 && !order; attempt += 1) {
    if (attempt > 0) {
      orderNumber = await generateOrderNumber();
    }

    try {
      order = await Order.create({
        user: userId,
        product: productId,
        quantity: qty,
        idempotencyKey: resolvedKey,
        orderNumber,
        paymentMethod: "UPI_DIRECT",
        paymentExpiresAt: new Date(Date.now() + ORDER_PAYMENT_TTL_MS),
        amount: orderPricing.finalAmount,
        originalAmount: orderPricing.subtotal,
        subtotal: orderPricing.subtotal,
        discountAmount: orderPricing.couponDiscount,
        couponDiscount: orderPricing.couponDiscount,
        deliveryFee: orderPricing.deliveryFee,
        giftUpgrades: normalizedGiftUpgrades.upgrades,
        giftUpgradeTotal: orderPricing.giftUpgradeTotal,
        finalAmount: orderPricing.finalAmount,
        couponCode: normalizedCouponCode || undefined,
        ...(couponDoc?._id ? { couponId: couponDoc._id } : {}),
        ...creatorReferral,
        productSnapshot: buildProductSnapshot(
          giftProduct,
          qty,
          orderPricing.unitPrice
        ),
        shippingAddress,
        status: ORDER_STATUSES.PROCESSING,
        paymentStatus: PAYMENT_STATUSES.PENDING,
      });
    } catch (error) {
      const duplicateIndex = getDuplicateKeyIndex(error);
      const retryable =
        isDuplicateKeyError(error) &&
        duplicateIndex !== null &&
        duplicateIndex !== "idempotencyKey_1" &&
        attempt < 2;

      if (retryable) {
        continue; // orderNumber collision — try again with a fresh number.
      }

      // Real failure — undo everything we reserved.
      await rollbackReservations();

      if (isDuplicateKeyError(error)) {
        const duplicateOrder = await Order.findOne({
          idempotencyKey: resolvedKey,
        }).lean();

        if (duplicateOrder) {
          return { kind: "duplicate", order: duplicateOrder };
        }
      }

      return {
        kind: "error",
        http: 500,
        code: "ORDER_CREATION_FAILED",
        message: "Order creation failed",
      };
    }
  }

  if (!order) {
    // Defensive: exhausted retries without an insert.
    await rollbackReservations();
    return {
      kind: "error",
      http: 500,
      code: "ORDER_CREATION_FAILED",
      message: "Order creation failed",
    };
  }

  // Non-blocking email side effect — must never fail the order.
  try {
    const customer = await User.findById(userId).lean();
    await sendPaymentReceivedEmail({
      customerName:
        (shippingAddress as any)?.name || customer?.username || "Customer",
      customerEmail: customer?.email || "",
      orderId: order._id.toString(),
      productName: giftProduct.name,
      amount: orderPricing.finalAmount,
    });
  } catch {
    // Email failure is logged by the email service; order stays created.
  }

  return { kind: "created", order };
};

const getOrderEmailItems = async (order: any): Promise<OrderItem[]> => {
  const snapshot = order.productSnapshot;
  const quantity = Number(order.quantity) || 1;

  if (snapshot?.name && snapshot?.unitPrice) {
    return [
      {
        name: snapshot.name,
        quantity,
        price: snapshot.unitPrice,
      },
    ];
  }

  const giftProduct = await product.findById(order.product).lean();

  if (giftProduct) {
    return [
      {
        name: giftProduct.name,
        quantity,
        price: Number(order.finalAmount ?? order.amount) / quantity,
      },
    ];
  }

  return [];
};

/**
 * Confirms an order (payment verified by admin). Idempotent:
 *  - already VERIFIED/orderConfirmed → no-op, no re-email, no re-commission
 *  - only the first transition awards the creator commission and sends the
 *    confirmation email.
 */
export const confirmOrder = async (
  orderId: string,
  options?: { verifiedBy?: string }
): Promise<OrderActionResult> => {
  const order = await Order.findById(orderId);

  if (!order) {
    return {
      kind: "error",
      http: 404,
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    };
  }

  if (
    order.paymentStatus === PAYMENT_STATUSES.VERIFIED ||
    order.status === ORDER_STATUSES.CONFIRMED
  ) {
    return { kind: "ok", order, alreadyDone: true };
  }

  if (order.status === ORDER_STATUSES.CANCELLED) {
    return {
      kind: "error",
      http: 409,
      code: "ORDER_CANCELLED",
      message: "Cancelled orders cannot be confirmed",
    };
  }

  if (order.paymentStatus === PAYMENT_STATUSES.REJECTED) {
    return {
      kind: "error",
      http: 409,
      code: "PAYMENT_REJECTED",
      message: "This payment was rejected. Ask the customer to re-report it before verifying.",
    };
  }

  const update: Record<string, unknown> = {
    paymentStatus: PAYMENT_STATUSES.VERIFIED,
    status: ORDER_STATUSES.CONFIRMED,
    paidAt: new Date(),
    paymentVerifiedAt: new Date(),
    ...(options?.verifiedBy
      ? { paymentVerifiedBy: options.verifiedBy }
      : {}),
  };

  if (order.creatorCommissionStatus === "pending") {
    update.creatorCommissionStatus = "earned";
  }

  const updated = await Order.findOneAndUpdate(
    {
      _id: orderId,
      paymentStatus: {
        $in: [
          PAYMENT_STATUSES.PENDING,
          PAYMENT_STATUSES.PROOF_SUBMITTED,
          PAYMENT_STATUSES.AWAITING_VERIFICATION,
        ],
      },
      status: { $ne: ORDER_STATUSES.CANCELLED },
    },
    { $set: update },
    { new: true }
  );

  if (!updated) {
    // Raced with another confirmation — treat as already done.
    const latest = await Order.findById(orderId);
    return { kind: "ok", order: latest, alreadyDone: true };
  }

  // Side effects below run exactly once per order (the transition above is
  // the single gate). Failures are logged but never roll back the order.
  try {
    const customer = await User.findById(updated.user).lean();
    const items = await getOrderEmailItems(updated);

    if (customer?.email && items.length > 0) {
      await sendOrderConfirmationEmail({
        customerName:
          updated.shippingAddress?.name || customer.username || "Customer",
        customerEmail: customer.email,
        orderId: updated._id.toString(),
        items,
        totalAmount: Number(updated.finalAmount ?? updated.amount) || 0,
      });
    }
  } catch {
    // Order is already confirmed in DB. Email failure must not fail the request.
  }

  return { kind: "ok", order: updated };
};

/**
 * Cancels an order. Idempotent — stock is restored exactly once, only when the
 * order actually transitions to Cancelled. Pending creator commission is
 * cancelled so it is never paid out.
 */
export const cancelOrder = async (orderId: string): Promise<OrderActionResult> => {
  const order = await Order.findById(orderId);

  if (!order) {
    return {
      kind: "error",
      http: 404,
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    };
  }

  if (order.status === ORDER_STATUSES.CANCELLED) {
    return { kind: "ok", order, alreadyDone: true };
  }

  const update: Record<string, unknown> = {
    status: ORDER_STATUSES.CANCELLED,
  };

  if (order.creatorCommissionStatus === "pending") {
    update.creatorCommissionStatus = "cancelled";
  }

  const updated = await Order.findOneAndUpdate(
    { _id: orderId, status: { $ne: ORDER_STATUSES.CANCELLED } },
    { $set: update },
    { new: true }
  );

  if (!updated) {
    const latest = await Order.findById(orderId);
    return { kind: "ok", order: latest, alreadyDone: true };
  }

  // Restore stock exactly once — the transition above is the single gate.
  await restoreProductStock(
    String(updated.product),
    Number(updated.quantity) || 1
  );

  return { kind: "ok", order: updated };
};

/**
 * Customer reports they completed the UPI payment. This is NOT verification —
 * the payment stays unverified until an admin confirms it after checking the
 * UPI/bank app. Idempotent: repeated calls just re-mark the same state.
 *
 * Allowed transitions: PENDING / PROOF_SUBMITTED / AWAITING_VERIFICATION /
 * REJECTED → AWAITING_VERIFICATION. A rejected payment may be re-reported
 * (retry) without creating a new order. VERIFIED and CANCELLED are terminal.
 */
export const reportPayment = async (
  orderId: string,
  userId: string
): Promise<OrderActionResult> => {
  const order = await Order.findById(orderId);

  if (!order) {
    return {
      kind: "error",
      http: 404,
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    };
  }

  if (String(order.user) !== userId) {
    return {
      kind: "error",
      http: 403,
      code: "FORBIDDEN",
      message: "You do not have access to this order",
    };
  }

  if (
    order.paymentStatus === PAYMENT_STATUSES.VERIFIED ||
    order.status === ORDER_STATUSES.CONFIRMED
  ) {
    return { kind: "ok", order, alreadyDone: true };
  }

  if (order.status === ORDER_STATUSES.CANCELLED) {
    return {
      kind: "error",
      http: 409,
      code: "ORDER_CANCELLED",
      message: "Cancelled orders cannot report payment",
    };
  }

  const updated = await Order.findOneAndUpdate(
    {
      _id: orderId,
      user: userId,
      paymentStatus: {
        $in: [
          PAYMENT_STATUSES.PENDING,
          PAYMENT_STATUSES.PROOF_SUBMITTED,
          PAYMENT_STATUSES.AWAITING_VERIFICATION,
          PAYMENT_STATUSES.REJECTED,
        ],
      },
      status: { $ne: ORDER_STATUSES.CANCELLED },
    },
    {
      $set: {
        paymentStatus: PAYMENT_STATUSES.AWAITING_VERIFICATION,
        paymentReportedAt: new Date(),
      },
      // Re-reporting clears a previous rejection so the queue sees it again.
      $unset: {
        paymentRejectedAt: "",
        paymentRejectedBy: "",
        paymentRejectionReason: "",
      },
    },
    { new: true }
  );

  if (!updated) {
    // Raced with verify/cancel — return current truth, not a fabricated error.
    const latest = await Order.findById(orderId);
    return { kind: "ok", order: latest, alreadyDone: true };
  }

  return { kind: "ok", order: updated };
};

/**
 * Deprecated alias kept so old clients that still POST /payment-proof degrade
 * gracefully into the new AWAITING_VERIFICATION state instead of erroring.
 */
export const submitPaymentProof = reportPayment;

/**
 * Admin marks a reported payment as not found / not verifiable. This is NOT a
 * cancellation: stock and the reservation stay, so the customer can retry the
 * payment safely (reportPayment allows REJECTED → AWAITING_VERIFICATION).
 * Idempotent — repeated rejects are no-ops.
 */
export const rejectPayment = async (
  orderId: string,
  adminId: string,
  reason?: string
): Promise<OrderActionResult> => {
  const order = await Order.findById(orderId);

  if (!order) {
    return {
      kind: "error",
      http: 404,
      code: "ORDER_NOT_FOUND",
      message: "Order not found",
    };
  }

  if (order.status === ORDER_STATUSES.CANCELLED) {
    return {
      kind: "error",
      http: 409,
      code: "ORDER_CANCELLED",
      message: "Cancelled orders cannot be rejected",
    };
  }

  if (order.paymentStatus === PAYMENT_STATUSES.VERIFIED) {
    return {
      kind: "error",
      http: 409,
      code: "PAYMENT_ALREADY_VERIFIED",
      message: "Payment is already verified",
    };
  }

  if (order.paymentStatus === PAYMENT_STATUSES.REJECTED) {
    return { kind: "ok", order, alreadyDone: true };
  }

  const update: Record<string, unknown> = {
    paymentStatus: PAYMENT_STATUSES.REJECTED,
    paymentRejectedAt: new Date(),
    paymentRejectedBy: adminId,
  };

  if (typeof reason === "string" && reason.trim()) {
    update.paymentRejectionReason = reason.trim().slice(0, 300);
  }

  const updated = await Order.findOneAndUpdate(
    {
      _id: orderId,
      paymentStatus: { $ne: PAYMENT_STATUSES.VERIFIED },
      status: { $ne: ORDER_STATUSES.CANCELLED },
    },
    { $set: update },
    { new: true }
  );

  if (!updated) {
    const latest = await Order.findById(orderId);
    return { kind: "ok", order: latest, alreadyDone: true };
  }

  return { kind: "ok", order: updated };
};

export const buildOrderPublicView = (order: any) => {
  return {
    orderId: order._id,
    orderNumber: order.orderNumber || null,
    status: order.status,
    paymentStatus: order.paymentStatus || PAYMENT_STATUSES.PENDING,
    amount: order.amount,
    originalAmount: order.originalAmount,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    couponDiscount: order.couponDiscount,
    deliveryFee: order.deliveryFee,
    giftUpgrades: order.giftUpgrades,
    giftUpgradeTotal: order.giftUpgradeTotal,
    finalAmount: order.finalAmount,
    couponCode: order.couponCode,
    quantity: Number(order.quantity) || 1,
    product: order.productSnapshot || order.product,
    creatorCode: order.creatorCode,
    creatorCommission: order.creatorCommission,
    creatorCommissionStatus: order.creatorCommissionStatus,
    paymentMethod: order.paymentMethod || "UPI_DIRECT",
    paymentReportedAt: order.paymentReportedAt || null,
    paymentVerifiedAt: order.paymentVerifiedAt || null,
    paymentRejectedAt: order.paymentRejectedAt || null,
    paymentRejectionReason: order.paymentRejectionReason || null,
    shippingAddress: order.shippingAddress,
    orderedAt: order.orderedAt,
    paidAt: order.paidAt,
  };
};

export const getOrderUnitPrice = (giftProduct: any): number => {
  return getUnitPrice(giftProduct);
};
