"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Gift, Loader2, Lock, Sparkles, Tag, Ticket, Truck, X } from "lucide-react";

export type AppliedCartOffer = {
  code: string;
  discountAmount: number;
  finalAmount: number;
  originalAmount: number;
};

export type CouponValidationResult = {
  ok: boolean;
  offer?: AppliedCartOffer | null;
  message?: string;
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
  giftUpgradeLines?: Array<{
    label: string;
    amount: number;
  }>;
  appliedOffer: AppliedCartOffer | null;
  onOfferChange: (offer: AppliedCartOffer | null) => void;
  onCheckout: () => void;
  checkoutDisabled?: boolean;
  checkoutLabel?: string;
  /** Backend validation for a coupon code. When provided, offers and manual
   *  codes are only applied after the server confirms them. */
  onValidateCoupon?: (code: string) => Promise<CouponValidationResult>;
  /** Set when a creator referral coupon is already applied — prevents the
   *  built-in best-offer auto-apply from overriding the referral. */
  disableAutoApply?: boolean;
  /** Fired only when the user manually applies a coupon code. Lets the parent
   *  release creator-referral attribution in favour of an explicit choice. */
  onManualCouponApplied?: (offer: AppliedCartOffer) => void;
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
  giftUpgradeLines = [],
  appliedOffer,
  onOfferChange,
  onCheckout,
  checkoutDisabled = false,
  checkoutLabel = "Place Order",
  onValidateCoupon,
  disableAutoApply = false,
  onManualCouponApplied,
}: CartSummaryOffersProps) {
  const [expanded, setExpanded] = useState(false);
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(true);
  const effectiveAutoApply = autoApplyEnabled && !disableAutoApply;
  const [manualCode, setManualCode] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState("");
  const validationCache = useRef<Map<string, CouponValidationResult>>(new Map());

  const safeSubtotal = Number.isFinite(subtotal) && subtotal > 0 ? subtotal : 0;
  const safeProductDiscount =
    Number.isFinite(productDiscount) && productDiscount > 0
      ? Math.min(productDiscount, safeSubtotal)
      : 0;
  const giftUpgradeTotal = giftUpgradeLines.reduce(
    (sum, line) => sum + (Number.isFinite(line.amount) ? line.amount : 0),
    0
  );
  const payableBeforeCoupon = Math.max(0, safeSubtotal - safeProductDiscount + giftUpgradeTotal);

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

  // Auto-apply the best eligible offer, but only after the backend confirms
  // the coupon actually exists and is valid.
  useEffect(() => {
    if (!effectiveAutoApply || !onValidateCoupon) {
      return;
    }

    if (!bestEligibleOffer) {
      if (appliedOffer) onOfferChange(null);
      return;
    }

    const code = bestEligibleOffer.code;
    const cached = validationCache.current.get(code);

    if (cached && !cached.ok) {
      return; // Already known invalid — never apply it.
    }

    if (cached?.ok) {
      onOfferChange(cached.offer ?? null);
      return;
    }

    // Optimistic display while the server validates.
    const optimistic: AppliedCartOffer = {
      code,
      discountAmount: bestEligibleOffer.discountAmount,
      originalAmount: safeSubtotal,
      finalAmount: Math.max(
        0,
        payableBeforeCoupon - bestEligibleOffer.discountAmount + deliveryFee
      ),
    };

    if (appliedOffer?.code !== code) {
      onOfferChange(optimistic);
    }

    void onValidateCoupon(code).then((result) => {
      validationCache.current.set(code, result);
      onOfferChange(result.ok ? result.offer ?? optimistic : null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bestEligibleOffer, payableBeforeCoupon, safeSubtotal, deliveryFee, effectiveAutoApply]);

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

  const handleApplyManualCode = async () => {
    const code = manualCode.trim().toUpperCase();

    if (!code || !onValidateCoupon) {
      return;
    }

    setCouponBusy(true);
    setCouponError("");

    const result = await onValidateCoupon(code);
    validationCache.current.set(code, result);

    if (result.ok && result.offer) {
      setAutoApplyEnabled(false);
      onManualCouponApplied?.(result.offer);
      onOfferChange(result.offer);
      setManualCode("");
    } else {
      setCouponError(result.message || "Invalid coupon code");
    }

    setCouponBusy(false);
  };

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          aria-expanded={expanded}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--gold)]/10 text-[color:var(--wine)]">
              <Gift className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-[color:var(--plum)]">🎁 Available Offers ({OFFERS.length})</h3>
              <p className="truncate text-xs text-[color:var(--muted)]">
                {unlockedRewards.length > 0
                  ? unlockedRewards.join(" + ")
                  : "Unlock free card, wrap, and instant savings"}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-[color:var(--muted)] transition-transform ${expanded ? "rotate-180" : ""}`}
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
          <div className="space-y-2 border-t border-[color:var(--border)] bg-[color:var(--gold)]/10 p-3">
            {!autoApplyEnabled && bestEligibleOffer && (
              <button
                type="button"
                onClick={handleApplyBestOffer}
                className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm font-black text-[color:var(--wine)]"
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
                  className={`rounded-xl border bg-[color:var(--surface)] p-3 ${
                    isApplied
                      ? "border-emerald-200"
                      : isUnlocked
                        ? "border-[color:var(--border)]"
                        : "border-[color:var(--border)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        isUnlocked ? "bg-[color:var(--gold)]/10 text-[color:var(--wine)]" : "bg-[color:var(--ivory)] text-[color:var(--muted)]"
                      }`}
                    >
                      {isUnlocked ? <Icon className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[color:var(--plum)]">{offer.title}</p>
                          <p className="mt-0.5 text-xs text-[color:var(--muted)]">{offer.description}</p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${
                            isApplied
                              ? "bg-emerald-100 text-emerald-800"
                              : isUnlocked
                                ? "bg-[color:var(--gold)]/10 text-[color:var(--wine)]"
                                : "bg-[#f4eee7] text-[color:var(--muted)]"
                          }`}
                        >
                          {isApplied ? "Applied" : isUnlocked ? "Unlocked" : `${progress}%`}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--border)]">
                          <div
                            className={`h-full rounded-full ${isUnlocked ? "bg-emerald-500" : "bg-[#c9a36a]"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3 text-[11px] font-bold">
                          <span className={isUnlocked ? "text-emerald-700" : "text-[color:var(--wine)]"}>
                            {isUnlocked ? "Ready for this order" : `${formatCurrency(unlockAmount)} away`}
                          </span>
                          <span className="text-[color:var(--muted)]">Min {formatCurrency(offer.minimumAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {onValidateCoupon && (
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
                <label
                  htmlFor="coupon-input"
                  className="mb-2 flex items-center text-xs font-black uppercase tracking-wide text-[color:var(--wine)]"
                >
                  <Ticket className="mr-1 h-3.5 w-3.5" />
                  Have a coupon code?
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon-input"
                    type="text"
                    value={manualCode}
                    onChange={(event) => {
                      setManualCode(event.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleApplyManualCode();
                      }
                    }}
                    placeholder="e.g. SHIVA"
                    className="min-w-0 flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--gold)]/10 px-3 py-2 text-sm font-bold uppercase text-[color:var(--plum)] outline-none transition focus:border-[#c9a36a] focus:ring-2 focus:ring-[#c9a36a]/25"
                  />
                  <button
                    type="button"
                    onClick={() => void handleApplyManualCode()}
                    disabled={couponBusy || !manualCode.trim()}
                    className="shrink-0 rounded-xl bg-[color:var(--wine)] px-4 py-2 text-sm font-black text-[color:var(--ivory)] transition hover:bg-[#3b182f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {couponBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-xs font-semibold text-red-600">{couponError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--gold)]/10 text-[color:var(--wine)]">
              <Truck className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-black text-[color:var(--plum)]">Price Details</h3>
          </div>
          <span className="text-xs font-bold text-[color:var(--muted)]">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4 text-[color:var(--muted)]">
            <span>Subtotal</span>
            <span>{formatCurrency(safeSubtotal)}</span>
          </div>
          {safeProductDiscount > 0 && (
            <div className="flex justify-between gap-4 text-[color:var(--muted)]">
              <span>Discount</span>
              <span>-{formatCurrency(safeProductDiscount)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between gap-4 text-[color:var(--muted)]">
              <span>Coupon Discount</span>
              <span>-{formatCurrency(couponDiscount)}</span>
            </div>
          )}
          {giftUpgradeLines.map((line) => (
            <div key={line.label} className="flex justify-between gap-4 text-[color:var(--muted)]">
              <span>{line.label}</span>
              <span>{formatCurrency(line.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between gap-4 text-[color:var(--muted)]">
            <span>Delivery Fee</span>
            <span className={deliveryFee === 0 ? "font-semibold text-emerald-700" : ""}>
              {deliveryFee === 0 ? "FREE 🚚" : formatCurrency(deliveryFee)}
            </span>
          </div>
          <div className="border-t border-[color:var(--border)] pt-2">
            <div className="flex justify-between gap-4 text-base font-black text-[color:var(--plum)]">
              <span>Total Amount</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {totalSavings > 0 && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">
            🎉 You&apos;re saving {formatCurrency(totalSavings)} on this order
          </div>
        )}
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 px-4 py-3 shadow-[0_-12px_30px_rgba(43,29,37,0.12)] backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[color:var(--muted)]">
              {itemCount} {itemCount === 1 ? "Item" : "Items"} selected
            </p>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <p className="text-lg font-black text-[color:var(--plum)]">{formatCurrency(totalAmount)}</p>
              {totalSavings > 0 && (
                <p className="text-xs font-black text-emerald-700">Saved {formatCurrency(totalSavings)}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            disabled={checkoutDisabled}
            className="shrink-0 rounded-full bg-[color:var(--wine)] px-6 py-3 text-sm font-black text-[color:var(--ivory)] shadow-[0_12px_24px_rgba(74,31,59,0.22)] transition hover:bg-[#3b182f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkoutLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
