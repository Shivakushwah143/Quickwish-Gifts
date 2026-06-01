"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Gift, Lock, Sparkles, Tag, Truck, X } from "lucide-react";

export type AppliedCartOffer = {
  code: string;
  discountAmount: number;
  finalAmount: number;
  originalAmount: number;
};

type OfferKind = "discount" | "reward";

type CartOffer = {
  code: string;
  title: string;
  description: string;
  minimumAmount: number;
  discountAmount: number;
  kind: OfferKind;
};

type CartSummaryOffersProps = {
  itemCount: number;
  subtotal: number;
  productDiscount?: number;
  deliveryFee?: number;
  appliedOffer: AppliedCartOffer | null;
  onOfferChange: (offer: AppliedCartOffer | null) => void;
  onCheckout: () => void;
  checkoutDisabled?: boolean;
  checkoutLabel?: string;
};

const OFFERS: CartOffer[] = [
  {
    code: "FREECARD",
    title: "Free Greeting Card",
    description: "Add a handwritten note with your gift",
    minimumAmount: 499,
    discountAmount: 0,
    kind: "reward",
  },
  {
    code: "FREEWRAP",
    title: "Free Gift Wrapping",
    description: "Premium wrap, ribbon, and finishing",
    minimumAmount: 799,
    discountAmount: 0,
    kind: "reward",
  },
  {
    code: "GIFT50",
    title: "Rs 50 OFF",
    description: "Save Rs 50 above Rs 399",
    minimumAmount: 399,
    discountAmount: 50,
    kind: "discount",
  },
  {
    code: "GIFT100",
    title: "Rs 100 OFF",
    description: "Save Rs 100 above Rs 999",
    minimumAmount: 999,
    discountAmount: 100,
    kind: "discount",
  },
];

const formatCurrency = (amount: number) =>
  `Rs ${Math.max(0, Math.round(amount)).toLocaleString("en-IN")}`;

export default function CartSummaryOffers({
  itemCount,
  subtotal,
  productDiscount = 0,
  deliveryFee = 49,
  appliedOffer,
  onOfferChange,
  onCheckout,
  checkoutDisabled = false,
  checkoutLabel = "Place Order",
}: CartSummaryOffersProps) {
  const [expanded, setExpanded] = useState(false);
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(true);
  const safeSubtotal = Number.isFinite(subtotal) && subtotal > 0 ? subtotal : 0;
  const safeProductDiscount =
    Number.isFinite(productDiscount) && productDiscount > 0
      ? Math.min(productDiscount, safeSubtotal)
      : 0;
  const payableBeforeCoupon = Math.max(0, safeSubtotal - safeProductDiscount);

  const bestEligibleOffer = useMemo(() => {
    return (
      OFFERS.filter((offer) => payableBeforeCoupon >= offer.minimumAmount && offer.discountAmount > 0).sort(
        (a, b) => b.discountAmount - a.discountAmount || b.minimumAmount - a.minimumAmount
      )[0] ?? null
    );
  }, [payableBeforeCoupon]);

  const unlockedRewards = useMemo(
    () =>
      OFFERS.filter((offer) => offer.kind === "reward" && payableBeforeCoupon >= offer.minimumAmount).map(
        (offer) => offer.title
      ),
    [payableBeforeCoupon]
  );

  useEffect(() => {
    if (!autoApplyEnabled) return;

    if (!bestEligibleOffer) {
      if (appliedOffer) onOfferChange(null);
      return;
    }

    const nextOffer: AppliedCartOffer = {
      code: bestEligibleOffer.code,
      discountAmount: bestEligibleOffer.discountAmount,
      originalAmount: safeSubtotal,
      finalAmount: Math.max(0, payableBeforeCoupon - bestEligibleOffer.discountAmount + deliveryFee),
    };

    if (
      appliedOffer?.code !== nextOffer.code ||
      appliedOffer.discountAmount !== nextOffer.discountAmount ||
      appliedOffer.finalAmount !== nextOffer.finalAmount
    ) {
      onOfferChange(nextOffer);
    }
  }, [
    appliedOffer,
    autoApplyEnabled,
    bestEligibleOffer,
    deliveryFee,
    onOfferChange,
    payableBeforeCoupon,
    safeSubtotal,
  ]);

  const couponDiscount = appliedOffer?.discountAmount ?? 0;
  const totalAmount = Math.max(0, payableBeforeCoupon - couponDiscount + deliveryFee);
  const totalSavings = Math.max(0, safeProductDiscount + couponDiscount);

  const handleRemoveOffer = () => {
    setAutoApplyEnabled(false);
    onOfferChange(null);
  };

  const handleApplyBestOffer = () => {
    setAutoApplyEnabled(true);
    setExpanded(true);
  };

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-2xl border border-[#ead7c5] bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          aria-expanded={expanded}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff0e7] text-[#b54e36]">
              <Gift className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-[#2b1d25]">🎁 Available Offers ({OFFERS.length})</h3>
              <p className="truncate text-xs text-[#7a6570]">
                {unlockedRewards.length > 0
                  ? unlockedRewards.join(" + ")
                  : "Unlock free card, wrap, and instant savings"}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-[#6f5d66] transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {appliedOffer && (
          <div className="mx-4 mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-emerald-900">{appliedOffer.code} applied</p>
                <p className="text-xs font-semibold text-emerald-700">
                  You saved {formatCurrency(appliedOffer.discountAmount)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveOffer}
                className="rounded-full p-1 text-emerald-800 transition hover:bg-emerald-100"
                aria-label="Remove applied offer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {expanded && (
          <div className="space-y-2 border-t border-[#f1e4d8] bg-[#fffaf4] p-3">
            {!autoApplyEnabled && bestEligibleOffer && (
              <button
                type="button"
                onClick={handleApplyBestOffer}
                className="w-full rounded-xl border border-[#ead7c5] bg-white px-3 py-2 text-sm font-black text-[#4a1f3b]"
              >
                Apply best eligible offer
              </button>
            )}

            {OFFERS.map((offer) => {
              const isApplied = appliedOffer?.code === offer.code;
              const isUnlocked = payableBeforeCoupon >= offer.minimumAmount;
              const unlockAmount = Math.max(0, offer.minimumAmount - payableBeforeCoupon);
              const progress = Math.min(100, Math.round((payableBeforeCoupon / offer.minimumAmount) * 100));
              const Icon = offer.kind === "reward" ? Sparkles : Tag;

              return (
                <div
                  key={offer.code}
                  className={`rounded-xl border bg-white p-3 ${
                    isApplied
                      ? "border-emerald-200"
                      : isUnlocked
                        ? "border-[#ead7c5]"
                        : "border-[#efe3d8]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        isUnlocked ? "bg-[#fff0e7] text-[#b54e36]" : "bg-[#f4eee7] text-[#8a7880]"
                      }`}
                    >
                      {isUnlocked ? <Icon className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[#2b1d25]">{offer.title}</p>
                          <p className="mt-0.5 text-xs text-[#7a6570]">{offer.description}</p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${
                            isApplied
                              ? "bg-emerald-100 text-emerald-800"
                              : isUnlocked
                                ? "bg-[#fff0e7] text-[#b54e36]"
                                : "bg-[#f4eee7] text-[#7a6570]"
                          }`}
                        >
                          {isApplied ? "Applied" : isUnlocked ? "Unlocked" : `${progress}%`}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#f0e4da]">
                          <div
                            className={`h-full rounded-full ${isUnlocked ? "bg-emerald-500" : "bg-[#c9a36a]"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3 text-[11px] font-bold">
                          <span className={isUnlocked ? "text-emerald-700" : "text-[#8b3f2f]"}>
                            {isUnlocked ? "Ready for this order" : `${formatCurrency(unlockAmount)} away`}
                          </span>
                          <span className="text-[#8a7880]">Min {formatCurrency(offer.minimumAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[#ead7c5] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff4e4] text-[#b54e36]">
              <Truck className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-black text-[#2b1d25]">Price Details</h3>
          </div>
          <span className="text-xs font-bold text-[#7a6570]">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4 text-[#6f5d66]">
            <span>Subtotal</span>
            <span>{formatCurrency(safeSubtotal)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[#6f5d66]">
            <span>Discount</span>
            <span>-{formatCurrency(safeProductDiscount)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[#6f5d66]">
            <span>Coupon Discount</span>
            <span>-{formatCurrency(couponDiscount)}</span>
          </div>
          <div className="flex justify-between gap-4 text-[#6f5d66]">
            <span>Delivery Fee</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="border-t border-[#ead7c5] pt-2">
            <div className="flex justify-between gap-4 text-base font-black text-[#2b1d25]">
              <span>Total Amount</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {totalSavings > 0 && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">
            🎉 You're saving {formatCurrency(totalSavings)} on this order
          </div>
        )}
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-[#ead7c5] bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(43,29,37,0.12)] backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#7a6570]">
              {itemCount} {itemCount === 1 ? "Item" : "Items"} selected
            </p>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <p className="text-lg font-black text-[#2b1d25]">{formatCurrency(totalAmount)}</p>
              {totalSavings > 0 && (
                <p className="text-xs font-black text-emerald-700">Saved {formatCurrency(totalSavings)}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            disabled={checkoutDisabled}
            className="shrink-0 rounded-full bg-[#4a1f3b] px-6 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(74,31,59,0.22)] transition hover:bg-[#3b182f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkoutLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
