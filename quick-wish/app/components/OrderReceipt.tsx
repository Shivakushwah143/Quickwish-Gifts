"use client";

import { CheckCircle2, MapPin, MessageCircle, PackageCheck, ShoppingBag } from "lucide-react";

export type ReceiptAddress = {
  name: string;
  phone: string;
  street: string;
  city: string;
  pinCode: string;
  state?: string;
};

type OrderReceiptProps = {
  orderId: string;
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
  onContinueShopping: () => void;
  onTrackOrder: () => void;
};

const formatCurrency = (amount: number) =>
  `Rs ${Math.max(0, Math.round(amount)).toLocaleString("en-IN")}`;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

export default function OrderReceipt({
  orderId,
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

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-[#ead7c5] bg-white shadow-sm">
        <div className="bg-[#fffaf4] px-4 py-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b54e36]">OneWish</p>
          <h2 className="mt-2 text-2xl font-black text-[#2b1d25]">Order Confirmed</h2>
          <p className="mt-1 text-sm text-[#6f5d66]">Your payment is marked as paid and your gift is being prepared.</p>
        </div>

        <div className="grid gap-3 border-t border-[#ead7c5] p-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[#fffaf4] p-3">
            <p className="text-xs font-bold text-[#7a6570]">Order ID</p>
            <p className="mt-1 break-all text-sm font-black text-[#2b1d25]">{orderId}</p>
          </div>
          <div className="rounded-xl bg-[#fffaf4] p-3">
            <p className="text-xs font-bold text-[#7a6570]">Order Date</p>
            <p className="mt-1 text-sm font-black text-[#2b1d25]">{formatDate(orderDate)}</p>
          </div>
          <div className="rounded-xl bg-[#fffaf4] p-3">
            <p className="text-xs font-bold text-[#7a6570]">Customer Name</p>
            <p className="mt-1 text-sm font-black text-[#2b1d25]">{customerName}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-xs font-bold text-emerald-700">Payment Status</p>
            <p className="mt-1 text-sm font-black text-emerald-900">Paid</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#ead7c5] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0e7] text-[#b54e36]">
            <PackageCheck className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-black text-[#2b1d25]">Gift Details</h3>
        </div>

        <div className="rounded-xl border border-[#f0e2d6] bg-[#fffaf4] p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[#2b1d25]">{productName}</p>
              <p className="mt-1 text-xs font-semibold text-[#7a6570]">Quantity: {quantity}</p>
            </div>
            <p className="shrink-0 text-sm font-black text-[#4a1f3b]">{formatCurrency(productPrice)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#ead7c5] bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-black text-[#2b1d25]">Price Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4 text-[#6f5d66]">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[#6f5d66]">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[#6f5d66]">
            <span>Coupon Discount</span>
            <span>-{formatCurrency(couponDiscount)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[#6f5d66]">
            <span>Delivery Fee</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="border-t border-[#ead7c5] pt-3">
            <div className="flex justify-between gap-4 text-base font-black text-[#2b1d25]">
              <span>Total Paid</span>
              <span>{formatCurrency(finalAmountPaid)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#ead7c5] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0e7] text-[#b54e36]">
            <MapPin className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-black text-[#2b1d25]">Delivery Address</h3>
        </div>
        <p className="text-sm font-black text-[#2b1d25]">{deliveryAddress.name}</p>
        <p className="mt-1 text-sm leading-6 text-[#6f5d66]">{addressLine}</p>
        <p className="mt-1 text-sm font-semibold text-[#6f5d66]">{deliveryAddress.phone}</p>
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 grid grid-cols-1 gap-2 border-t border-[#ead7c5] bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(43,29,37,0.12)] backdrop-blur sm:static sm:mx-0 sm:grid-cols-3 sm:rounded-2xl sm:border sm:shadow-sm">
        <button
          type="button"
          onClick={onTrackOrder}
          className="rounded-full bg-[#4a1f3b] px-5 py-3 text-sm font-black text-white"
        >
          Track Order
        </button>
        <button
          type="button"
          onClick={onContinueShopping}
          className="inline-flex items-center justify-center rounded-full border border-[#ead7c5] px-5 py-3 text-sm font-black text-[#2b1d25]"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Continue Shopping
        </button>
        <a
          href={`https://wa.me/919575930848?text=${supportMessage}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-[#ead7c5] px-5 py-3 text-sm font-black text-[#2b1d25]"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Contact Support
        </a>
      </div>
    </div>
  );
}
