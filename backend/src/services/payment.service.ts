import { Order } from "../db.js";
import {
  AWAITING_PAYMENT_STATUSES,
  buildOrderPublicView,
  confirmOrder,
  rejectPayment,
  reportPayment,
  type OrderActionResult,
} from "./order.service.js";

/**
 * PaymentService — the single boundary between order/checkout code and the
 * payment provider. Today the "provider" is direct UPI (₹0 gateway cost) with
 * customer self-report + admin verification. If QuickWish later plugs in a
 * bank/PSP webhook, this module is the only place that needs to change.
 *
 * Truth model (must never be weakened):
 *   customer reports payment  ≠  payment verified
 *   only an authenticated admin confirm → VERIFIED / order confirmed
 */

export interface UPIConfig {
  upiId: string;
  upiName: string;
}

/**
 * Required payment configuration. Fail loudly rather than silently charging a
 * customer to the wrong UPI ID. The UPI ID is customer-visible (it is the
 * whole point of the QR), but it still lives only in server configuration.
 */
export const getUPIConfig = (): UPIConfig => {
  const upiId = process.env.QUICKWISH_UPI_ID?.trim();

  if (!upiId) {
    throw new Error(
      "QUICKWISH_UPI_ID environment variable is required. Refusing to start without the direct UPI payment configuration."
    );
  }

  return {
    upiId,
    upiName: process.env.QUICKWISH_UPI_NAME?.trim() || "QuickWish",
  };
};

export interface BuildUPIPaymentUriInput {
  upiId: string;
  upiName: string;
  amount: number;
  orderReference: string;
}

/**
 * Builds a UPI intent URI with URLSearchParams so every value is safely
 * encoded. pa/pn/am/cu are standard UPI parameters; tr (transaction ref) and
 * tn (note) carry the order reference so the admin can locate the payment in
 * the UPI/bank app.
 */
export const buildUPIPaymentUri = ({
  upiId,
  upiName,
  amount,
  orderReference,
}: BuildUPIPaymentUriInput): string => {
  const params = new URLSearchParams();
  params.set("pa", upiId);
  params.set("pn", upiName);
  params.set("am", (Number.isFinite(Number(amount)) ? Number(amount) : 0).toFixed(2));
  params.set("cu", "INR");
  params.set("tr", orderReference);
  params.set("tn", orderReference);

  return `upi://pay?${params.toString()}`;
};

/**
 * Order-specific payment payload served to the frontend. Every value derives
 * from server state — the amount comes from the stored authoritative order
 * total, never from the client.
 */
export const createPaymentInstructions = (order: any) => {
  const config = getUPIConfig();
  const amount = Number(order.finalAmount ?? order.amount) || 0;
  // New orders always carry a friendly orderNumber; legacy orders fall back to
  // a stable derived reference so the UPI `tr` is still human-searchable.
  const orderReference =
    order.orderNumber ||
    `QW-${String(order._id)
      .slice(-8)
      .toUpperCase()}`;

  const upiUri = buildUPIPaymentUri({
    upiId: config.upiId,
    upiName: config.upiName,
    amount,
    orderReference,
  });

  return {
    upiUri,
    upiId: config.upiId,
    upiName: config.upiName,
    amount,
    orderReference,
  };
};

/**
 * Customer reports they completed the UPI payment. Ownership-checked and
 * idempotent; sets paymentStatus = AWAITING_VERIFICATION and the audit
 * timestamp. Never marks VERIFIED. Implemented (and guarded against cancelled
 * orders) in order.service — re-exported here so all payment actions stay
 * inside the PaymentService boundary.
 */
export { reportPayment };

/**
 * Admin-only payment verification. Wraps confirmOrder (the single idempotency
 * gate for stock/commission/email side effects) and records who verified.
 */
export const verifyPayment = async (
  orderId: string,
  adminId: string
): Promise<OrderActionResult> => {
  return confirmOrder(orderId, { verifiedBy: adminId });
};


/**
 * The admin payment-verification queue: every order whose customer says they
 * paid but no admin has confirmed yet. Legacy PROOF_SUBMITTED orders are
 * included so nothing is ever buried.
 */
export const getAwaitingVerificationOrders = async () => {
  const orders = await Order.find({
    paymentStatus: { $in: [...AWAITING_PAYMENT_STATUSES] },
  })
    .sort({ paymentReportedAt: -1, orderedAt: -1 })
    .lean();

  return {
    count: orders.length,
    orders: orders.map(buildOrderPublicView),
  };
};

// Re-exported so route wiring can stay inside this service boundary.
export { rejectPayment };
