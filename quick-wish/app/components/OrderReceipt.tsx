"use client";

import { CheckCircle2, Clock, MapPin, MessageCircle, PackageCheck, ShoppingBag, XCircle } from "lucide-react";

export type ReceiptAddress = {
  name: string;
  phone: string;
  street: string;
  city: string;
  pinCode: string;
  state?: string;
};

export type PaymentStatus =
  | "PENDING"
  | "AWAITING_VERIFICATION"
  | "PROOF_SUBMITTED" // legacy value from the old screenshot/WhatsApp flow
  | "VERIFIED"
  | "REJECTED";

type OrderReceiptProps = {
  orderId: string;
  /** Friendly human-readable reference (e.g. QW-2026-001582). */
  orderNumber?: string;
  orderDate: Date;
  customerName: string;
  productName: string;
  quantity?: number;
  productPrice: number;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  deliveryFee: number;
  finalAmountPaid: number;
  deliveryAddress: ReceiptAddress;
  paymentStatus?: PaymentStatus;
  orderStatus?: string;
  onContinueShopping: () => void;
  onTrackOrder: () => void;
};

const formatCurrency = (amount: number) =>
  `₹${(Math.max(0, Number(amount) || 0)).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const getPaymentStatusView = (paymentStatus?: PaymentStatus, orderStatus?: string) => {
  switch (paymentStatus) {
    case "VERIFIED":
      return {
        label: "Payment verified",
        note:
          orderStatus === "orderConfirmed"
            ? "Payment verified and your gift order is confirmed."
            : "Payment verified. Your order is on its way.",
        tone: "bg-emerald-500/15 text-emerald-700",
        labelTone: "text-emerald-600",
        Icon: CheckCircle2,
      };
    case "AWAITING_VERIFICATION":
    case "PROOF_SUBMITTED":
      return {
        label: "Awaiting verification",
        note: "We're checking your payment. You don't need to send a screenshot. Your gift order stays reserved while we verify.",
        tone: "bg-amber-500/15 text-amber-700",
        labelTone: "text-amber-600",
        Icon: Clock,
      };
    case "REJECTED":
      return {
        label: "Payment not verified",
        note: "Please check your payment details or contact QuickWish.",
        tone: "bg-red-500/15 text-red-700",
        labelTone: "text-red-600",
        Icon: XCircle,
      };
    case "PENDING":
    default:
      return {
        label: "Payment pending",
        note: "Your order is reserved. Complete your UPI payment to confirm it.",
        tone: "bg-[color:var(--ivory)] text-[color:var(--muted)]",
        labelTone: "text-[color:var(--muted)]",
        Icon: Clock,
      };
  }
};

export default function OrderReceipt({
  orderId,
  orderNumber,
  orderDate,
  customerName,
  productName,
  quantity = 1,
  productPrice,
  subtotal,
  discount,
  couponDiscount,
  deliveryFee,
  finalAmountPaid,
  deliveryAddress,
  paymentStatus = "PENDING",
  orderStatus = "Processing",
  onContinueShopping,
  onTrackOrder,
}: OrderReceiptProps) {
  const supportMessage = encodeURIComponent(`Hi OneWish, I need help with order ${orderId}.`);
  const addressLine = [
    deliveryAddress.street,
    deliveryAddress.city,
    deliveryAddress.state,
    deliveryAddress.pinCode,
  ]
    .filter(Boolean)
    .join(", ");

  const paymentView = getPaymentStatusView(paymentStatus, orderStatus);
  const PaymentIcon = paymentView.Icon;

  const statusTitle =
    paymentStatus === "VERIFIED"
      ? "Order Confirmed"
      : paymentStatus === "AWAITING_VERIFICATION" || paymentStatus === "PROOF_SUBMITTED"
        ? "Awaiting verification"
        : paymentStatus === "REJECTED"
          ? "Payment not verified"
          : "Order reserved";

  const statusCircle =
    paymentStatus === "VERIFIED"
      ? "bg-emerald-500/15 text-emerald-600"
      : paymentStatus === "REJECTED"
        ? "bg-red-500/15 text-red-600"
        : "bg-amber-500/15 text-amber-600";

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
        <div className="bg-[color:var(--gold)]/10 px-4 py-5 text-center">
          <div
            className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${statusCircle}`}
          >
            <PaymentIcon className="h-7 w-7" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--wine)]">QuickWish</p>
          <h2 className="mt-2 text-2xl font-black text-[color:var(--plum)]">
            {statusTitle}
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{paymentView.note}</p>
        </div>

        <div className="grid gap-3 border-t border-[color:var(--border)] p-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[color:var(--gold)]/10 p-3">
            <p className="text-xs font-bold text-[color:var(--muted)]">Order reference</p>
            <p className="mt-1 break-all text-sm font-black text-[color:var(--plum)]">
              {orderNumber || orderId}
            </p>
          </div>
          <div className="rounded-xl bg-[color:var(--gold)]/10 p-3">
            <p className="text-xs font-bold text-[color:var(--muted)]">Order Date</p>
            <p className="mt-1 text-sm font-black text-[color:var(--plum)]">{formatDate(orderDate)}</p>
          </div>
          <div className="rounded-xl bg-[color:var(--gold)]/10 p-3">
            <p className="text-xs font-bold text-[color:var(--muted)]">Customer Name</p>
            <p className="mt-1 text-sm font-black text-[color:var(--plum)]">{customerName}</p>
          </div>
          <div className={`rounded-xl p-3 ${paymentView.tone}`}>
            <p className={`text-xs font-bold ${paymentView.labelTone}`}>Payment Status</p>
            <p className="mt-1 text-sm font-black">{paymentView.label}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--gold)]/10 text-[#b54e36]">
            <PackageCheck className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-black text-[color:var(--plum)]">Gift Details</h3>
        </div>

        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--gold)]/10 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[color:var(--plum)]">{productName}</p>
              <p className="mt-1 text-xs font-semibold text-[color:var(--muted)]">Quantity: {quantity}</p>
            </div>
            <p className="shrink-0 text-sm font-black text-[color:var(--wine)]">
              {formatCurrency(productPrice * quantity)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-black text-[color:var(--plum)]">Price Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4 text-[color:var(--muted)]">
            <span>Subtotal ({quantity} × {formatCurrency(productPrice)})</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[color:var(--muted)]">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[color:var(--muted)]">
            <span>Coupon Discount</span>
            <span>-{formatCurrency(couponDiscount)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[color:var(--muted)]">
            <span>Delivery Fee</span>
            <span className={deliveryFee === 0 ? "font-semibold text-emerald-700" : ""}>
              {deliveryFee === 0 ? "FREE 🚚" : formatCurrency(deliveryFee)}
            </span>
          </div>
          <div className="border-t border-[color:var(--border)] pt-3">
            <div className="flex justify-between gap-4 text-base font-black text-[color:var(--plum)]">
              <span>Total to Pay</span>
              <span>{formatCurrency(finalAmountPaid)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--gold)]/10 text-[#b54e36]">
            <MapPin className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-black text-[color:var(--plum)]">Delivery Address</h3>
        </div>
        <p className="text-sm font-black text-[color:var(--plum)]">{deliveryAddress.name}</p>
        <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{addressLine}</p>
        <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">{deliveryAddress.phone}</p>
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 grid grid-cols-1 gap-2 border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 px-4 py-3 shadow-[0_-12px_30px_rgba(43,29,37,0.12)] backdrop-blur sm:static sm:mx-0 sm:grid-cols-3 sm:rounded-2xl sm:border sm:shadow-sm">
        <button
          type="button"
          onClick={onTrackOrder}
          className="rounded-full bg-[color:var(--wine)] px-5 py-3 text-sm font-black text-[color:var(--ivory)]"
        >
          Track Order
        </button>
        <button
          type="button"
          onClick={onContinueShopping}
          className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-black text-[color:var(--plum)]"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Continue Shopping
        </button>
        <a
          href={`https://wa.me/919575930848?text=${supportMessage}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-black text-[color:var(--plum)]"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Contact Support
        </a>
      </div>
    </div>
  );
}
