"use client";

// components/OrderPaymentModal.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import BannerSection from "./promotional/BannerSection";
import CartSummaryOffers, {
  type AppliedCartOffer,
  type CouponValidationResult,
} from "./CartSummaryOffers";
import OrderReceipt, { type PaymentStatus } from "./OrderReceipt";
import CompleteYourGift, {
  getGiftUpgradeLines,
  getGiftUpgradeTotal,
  type GiftUpgradeSelection,
} from "./CompleteYourGift";
import {
  clearStoredReferralCode,
  getStoredReferralCode,
} from "../lib/productShare";

interface OrderPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productPrice: number; // current price
  originalPrice?: number; // original price for display
  discountPercent?: number; // optional discount
  productImage?: string;
  quantity?: number; // quantity selected on the product page
  maxStock?: number; // available stock to display/limit against
}

interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  pinCode: string;
  state?: string;
}

/**
 * Payment payload built by the backend from the stored authoritative order
 * total and the centralized UPI configuration. The frontend never invents the
 * UPI ID, the amount, or the order reference.
 */
export interface PaymentInstructions {
  upiUri: string;
  upiId: string;
  upiName: string;
  amount: number;
  orderReference: string;
}

interface ServerOrderData {
  orderId: string;
  orderNumber?: string | null;
  status: string;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discountAmount: number;
  couponDiscount: number;
  deliveryFee: number;
  giftUpgradeTotal: number;
  finalAmount: number;
  couponCode?: string;
  quantity: number;
  paymentInstructions?: PaymentInstructions;
  paymentReportedAt?: string | null;
  paymentVerifiedAt?: string | null;
  paymentRejectedAt?: string | null;
  paymentRejectionReason?: string | null;
}

const defaultGiftUpgrades: GiftUpgradeSelection = {
  giftWrap: false,
  personalisedCard: {
    enabled: false,
    message: "",
  },
  chocolatePack: {
    enabled: false,
    type: "FERRERO_ROCHER",
  },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const POLL_INTERVAL_MS = 4000;
const QUICKWISH_UPI_ID = "9009917146@ptyes";
const QUICKWISH_UPI_NAME = "QuickWish";

const buildLocalUpiUri = (amount: number, orderId: string): string => {
  if (!Number.isFinite(amount) || amount <= 0 || !orderId) {
    return "";
  }

  return `upi://pay?pa=${QUICKWISH_UPI_ID}&pn=${encodeURIComponent(
    QUICKWISH_UPI_NAME
  )}&am=${amount.toFixed(2)}&cu=INR&tr=${encodeURIComponent(
    orderId
  )}&tn=${encodeURIComponent(orderId)}`;
};

/** Consistent ₹ formatting — always two decimals (₹371.50, never ₹371.5). */
const formatINR = (amount: number): string => {
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customerToken") || localStorage.getItem("token");
};

/** Shape of the backend public order view (subset read by the modal). */
type OrderApiView = {
  orderId?: string;
  orderNumber?: string | null;
  status?: string;
  paymentStatus?: string;
  subtotal?: number;
  discountAmount?: number;
  couponDiscount?: number;
  deliveryFee?: number;
  giftUpgradeTotal?: number;
  finalAmount?: number;
  amount?: number;
  couponCode?: string;
  quantity?: number;
  paymentReportedAt?: string | null;
  paymentVerifiedAt?: string | null;
  paymentRejectedAt?: string | null;
  paymentRejectionReason?: string | null;
};

/** Maps the backend public order view into the modal's state shape. */
const mapOrderToServerData = (order: OrderApiView, paymentInstructions?: PaymentInstructions): ServerOrderData => ({
  orderId: order.orderId || "",
  orderNumber: order.orderNumber ?? null,
  status: order.status || "Processing",
  paymentStatus: (order.paymentStatus as PaymentStatus) || "PENDING",
  subtotal: Number(order.subtotal) || 0,
  discountAmount: Number(order.discountAmount) || 0,
  couponDiscount: Number(order.couponDiscount) || 0,
  deliveryFee: Number(order.deliveryFee) || 0,
  giftUpgradeTotal: Number(order.giftUpgradeTotal) || 0,
  finalAmount: Number(order.finalAmount ?? order.amount) || 0,
  couponCode: order.couponCode,
  quantity: Number(order.quantity) || 1,
  paymentInstructions: paymentInstructions ?? {
    upiUri: "",
    upiId: "",
    upiName: "",
    amount: Number(order.finalAmount ?? order.amount) || 0,
    orderReference: order.orderNumber || String(order.orderId),
  },
  paymentReportedAt: order.paymentReportedAt ?? null,
  paymentVerifiedAt: order.paymentVerifiedAt ?? null,
  paymentRejectedAt: order.paymentRejectedAt ?? null,
  paymentRejectionReason: order.paymentRejectionReason ?? null,
});

export default function OrderPaymentModal({
  isOpen,
  onClose,
  productId,
  productName,
  productPrice,
  originalPrice,
  productImage,
  quantity: propQuantity = 1,
  maxStock,
}: OrderPaymentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderDate, setOrderDate] = useState<Date | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCartOffer | null>(null);
  const [refCouponActive, setRefCouponActive] = useState(false);
  const [refCheckAttempted, setRefCheckAttempted] = useState(false);
  const [giftUpgrades, setGiftUpgrades] = useState<GiftUpgradeSelection>(defaultGiftUpgrades);
  const [serverOrder, setServerOrder] = useState<ServerOrderData | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [qrBusy, setQrBusy] = useState(false);
  const [copiedUpiId, setCopiedUpiId] = useState(false);
  const [copiedOrderRef, setCopiedOrderRef] = useState(false);
  const [showPayAfterReject, setShowPayAfterReject] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    street: "",
    city: "",
    pinCode: "",
    state: "",
  });
  // Guards the one-shot automatic payment-instructions retry per modal open.
  const paymentInstructionsRetried = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    setCurrentStep(1);
    setLoading(false);
    setError("");
    setOrderId("");
    setOrderDate(null);
    setAppliedCoupon(null);
    setRefCouponActive(false);
    setRefCheckAttempted(false);
    setServerOrder(null);
    setReporting(false);
    setReportError("");
    setShowPayAfterReject(false);
    setQrBusy(false);
    setCopiedUpiId(false);
    setCopiedOrderRef(false);
    paymentInstructionsRetried.current = false;
    setIdempotencyKey(crypto.randomUUID());
    setGiftUpgrades(defaultGiftUpgrades);
    setShippingAddress({
      name: "",
      phone: "",
      street: "",
      city: "",
      pinCode: "",
      state: "",
    });
  }, [isOpen]);

  // Let global floating UI (gift assistant, homepage CTA) know a checkout is
  // open so they hide themselves — checkout needs full focus.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("quickwish:checkout", { detail: { open: isOpen } })
    );
  }, [isOpen]);

  // Prevent the page behind the modal from scrolling while checkout is open.
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const stockLimit = useMemo(() => {
    const limit = Number(maxStock);

    if (Number.isFinite(limit) && limit > 0) {
      return limit;
    }

    return 10;
  }, [maxStock]);

  const quantity = Math.min(
    Math.max(1, Math.floor(Number(propQuantity) || 1)),
    stockLimit
  );

  const safeProductPrice = Number.isFinite(Number(productPrice)) ? Number(productPrice) : 0;
  const safeOriginalPrice = Number.isFinite(Number(originalPrice)) ? Number(originalPrice) : undefined;
  const baseAmount =
    safeProductPrice > 0
      ? safeProductPrice
      : safeOriginalPrice && safeOriginalPrice > 0
        ? safeOriginalPrice
        : 0;
  const subtotal = safeOriginalPrice && safeOriginalPrice > baseAmount ? safeOriginalPrice : baseAmount;
  const productDiscount = Math.max(0, subtotal - baseAmount);
  const giftUpgradeLines = getGiftUpgradeLines(giftUpgrades);
  const giftUpgradeTotal = getGiftUpgradeTotal(giftUpgrades);

  const orderSubtotal = subtotal * quantity;

  const FREE_DELIVERY_THRESHOLD = 499;
  const STANDARD_DELIVERY_FEE = 49;
  const freeDeliveryEligible = orderSubtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = freeDeliveryEligible ? 0 : STANDARD_DELIVERY_FEE;

  // Client-side preview only — the backend is the financial authority.
  const couponDiscount = appliedCoupon?.discountAmount ?? 0;
  const payablePreview = Math.max(0, orderSubtotal + giftUpgradeTotal + deliveryFee - couponDiscount);

  // Auto-apply a creator referral code captured from a shared link. The
  // referral is a creator coupon code — the backend validates it at order
  // time. An explicit coupon typed by the user always wins (see
  // handleManualCouponApplied).
  useEffect(() => {
    if (!isOpen || refCheckAttempted || !API_BASE_URL) {
      return;
    }

    setRefCheckAttempted(true);

    const refCode = getStoredReferralCode();

    if (!refCode) {
      return;
    }

    let active = true;

    void validateCoupon(refCode).then((result) => {
      if (!active) {
        return;
      }

      if (result.ok && result.offer) {
        setAppliedCoupon(result.offer);
        setRefCouponActive(true);
      } else {
        // Stale or invalid referral — drop it quietly.
        clearStoredReferralCode();
      }
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, refCheckAttempted]);

  /**
   * Guards the applied-offer state:
   *  - a background built-in offer can never override an active creator ref
   *  - removing the offer releases the ref
   *  - a user-typed coupon releases the ref via handleManualCouponApplied
   */
  const handleOfferChange = (offer: AppliedCartOffer | null) => {
    if (refCouponActive) {
      const refCode = getStoredReferralCode();

      if (offer && refCode && offer.code !== refCode) {
        return; // Background override attempt — keep the referral.
      }

      if (!offer) {
        clearStoredReferralCode();
        setRefCouponActive(false);
      }
    }

    setAppliedCoupon(offer);
  };

  const handleManualCouponApplied = () => {
    clearStoredReferralCode();
    setRefCouponActive(false);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateCoupon = async (code: string): Promise<CouponValidationResult> => {
    if (!API_BASE_URL) {
      return { ok: false, message: "API not configured." };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, productId, amount: orderSubtotal }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { ok: false, message: data.message || "Invalid coupon code" };
      }

      const serverDiscount = Number(data.pricing?.discountAmount) || 0;
      const finalAmount = Math.max(
        0,
        orderSubtotal + giftUpgradeTotal + deliveryFee - serverDiscount
      );

      return {
        ok: true,
        offer: {
          code: data.coupon?.code || code.toUpperCase(),
          discountAmount: serverDiscount,
          originalAmount: orderSubtotal,
          finalAmount,
        },
        message: data.message,
      };
    } catch {
      return { ok: false, message: "Could not validate coupon. Please try again." };
    }
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    setError("");

    try {
      if (!API_BASE_URL) {
        setError("API URL is not configured.");
        setLoading(false);
        return;
      }

      const token = getAuthToken();

      if (!token) {
        setError("Please login to place order");
        setLoading(false);
        return;
      }

      // Financial values are NOT sent. The backend reloads the product and
      // computes the authoritative totals itself.
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity,
          shippingAddress,
          couponCode: appliedCoupon?.code || undefined,
          giftUpgrades,
          idempotencyKey,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const orderData = mapOrderToServerData(data, data.paymentInstructions);

        setServerOrder(orderData);
        setOrderId(orderData.orderId);
        setOrderDate(new Date());

        // The referral was consumed — stop re-applying it to future orders.
        clearStoredReferralCode();
        setRefCouponActive(false);

        if (orderData.couponCode && orderData.couponDiscount > 0) {
          setAppliedCoupon((prev) =>
            prev
              ? {
                  ...prev,
                  code: orderData.couponCode || prev.code,
                  discountAmount: orderData.couponDiscount,
                  finalAmount: orderData.finalAmount,
                }
              : prev
          );
        }

        setCurrentStep(2);
      } else {
        const message =
          data?.message ||
          (data?.code === "INSUFFICIENT_STOCK"
            ? `Only ${data?.availableStock ?? 0} item(s) remaining`
            : "Order creation failed");

        setError(message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Customer says they finished the UPI payment. This only marks the order as
   * AWAITING_VERIFICATION — it can never verify it. Truth stays on the server.
   */
  const handleReportPayment = async () => {
    if (!orderId || reporting) return;

    setReporting(true);
    setReportError("");

    const token = getAuthToken();

    if (!token || !API_BASE_URL) {
      setReportError("Please sign in to report your payment.");
      setReporting(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/payment-reported`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.paymentStatus) {
        setServerOrder((prev) =>
          prev
            ? {
                ...prev,
                paymentStatus: data.paymentStatus,
                paymentReportedAt: data.paymentReportedAt ?? prev.paymentReportedAt,
                paymentRejectedAt: null,
                paymentRejectionReason: null,
              }
            : prev
        );
        setShowPayAfterReject(false);
      } else {
        setReportError(data?.message || "We couldn't record your payment. Please try again.");
      }
    } catch {
      setReportError("Network error. Please try again.");
    } finally {
      setReporting(false);
    }
  };

  /**
   * Shared fetch of the public order view + server-built payment instructions.
   * Used by the awaiting-verification poll and by the payment-instructions
   * refresh so both stay identical and order identity stays stable.
   */
  const fetchOrder = async (
    orderIdToFetch: string
  ): Promise<{
    order: OrderApiView;
    paymentInstructions?: PaymentInstructions;
  } | null> => {
    const token = getAuthToken();

    if (!token || !API_BASE_URL) {
      return null;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderIdToFetch}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.ok && data.order) {
        return {
          order: data.order,
          paymentInstructions: data.paymentInstructions,
        };
      }
    } catch {
      // Transient failure — the caller decides whether to retry or show an error.
    }

    return null;
  };

  const applyFetchedOrder = (fetched: {
    order: OrderApiView;
    paymentInstructions?: PaymentInstructions;
  }) => {
    const merged = mapOrderToServerData(fetched.order, fetched.paymentInstructions);

    setServerOrder((prev) => ({
      ...prev,
      ...merged,
      // Keep the local order identity stable across refetches.
      orderId: prev?.orderId ?? merged.orderId,
    }));
  };

  /**
   * Re-fetches the order to (re)obtain the server-built payment instructions.
   * The QR is rendered locally from this URI — it never depends on a
   * client-built link or an external QR image service. Used by the one-shot
   * auto-retry and by the manual "Try again" fallback.
   */
  const handleRefreshPaymentInstructions = async () => {
    if (!orderId || qrBusy) return;

    setQrBusy(true);

    try {
      const fetched = await fetchOrder(orderId);

      if (fetched) {
        applyFetchedOrder(fetched);
      }
      // If instructions are still missing, the "Try again" button stays
      // available — the customer is never blocked.
    } finally {
      setQrBusy(false);
    }
  };

  /**
   * Polls the server while the payment is awaiting verification so the page
   * auto-transitions when the admin confirms (or rejects) — no manual reload.
   * Stops on VERIFIED / REJECTED / CANCELLED. Polling is convenience only;
   * it never changes payment state.
   */
  const paymentState: "pay" | "reported" | "verified" | "rejected" =
    serverOrder?.paymentStatus === "VERIFIED"
      ? "verified"
      : serverOrder?.paymentStatus === "REJECTED"
        ? "rejected"
        : serverOrder?.paymentStatus === "AWAITING_VERIFICATION" ||
            serverOrder?.paymentStatus === "PROOF_SUBMITTED"
          ? "reported"
          : "pay";

  const orderCancelled = ["cancelled"].includes(
    (serverOrder?.status || "").toLowerCase()
  );
  const shouldPoll =
    currentStep === 2 &&
    paymentState === "reported" &&
    !orderCancelled &&
    !showPayAfterReject;

  useEffect(() => {
    if (!shouldPoll || !orderId || !API_BASE_URL) {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      const fetched = await fetchOrder(orderId);

      if (!fetched || cancelled) {
        return;
      }

      applyFetchedOrder(fetched);
    };

    void poll();
    const interval = window.setInterval(() => void poll(), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [shouldPoll, orderId]);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const flashCopy = (setter: (value: boolean) => void) => {
    setter(true);
    window.setTimeout(() => setter(false), 2000);
  };

  const handleCopyUpiId = async () => {
    const upiId = paymentInstructions?.upiId || "";
    if (upiId && (await copyToClipboard(upiId))) {
      flashCopy(setCopiedUpiId);
    }
  };

  const handleCopyOrderRef = async () => {
    if (await copyToClipboard(orderReference)) {
      flashCopy(setCopiedOrderRef);
    }
  };

  // Server-authoritative payment values — never computed client-side. The
  // amount always comes from the backend (payment instructions or the stored
  // order total), never from a client-side estimate.
  const paymentInstructions = serverOrder?.paymentInstructions;
  const payableAmount = serverOrder?.finalAmount ?? paymentInstructions?.amount ?? 0;
  const upiUri = buildLocalUpiUri(payableAmount, orderId);
  const orderReference =
    paymentInstructions?.orderReference ||
    serverOrder?.orderNumber ||
    (orderId.length > 10 ? `${orderId.slice(0, 6)}…${orderId.slice(-4)}` : orderId);

  // One automatic retry: if the payment step renders without server payment
  // instructions (e.g. a stale gateway response), refetch the order once so
  // the QR appears without the customer having to notice the failure.
  useEffect(() => {
    if (
      currentStep === 2 &&
      orderId &&
      !upiUri &&
      !qrBusy &&
      !paymentInstructionsRetried.current
    ) {
      paymentInstructionsRetried.current = true;
      void handleRefreshPaymentInstructions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, orderId, upiUri, qrBusy]);

  const inputClass =
    "w-full px-3 py-2 border border-[color:var(--border)] rounded-lg bg-[color:var(--surface)] text-[color:var(--plum)] placeholder:text-[color:var(--muted)] focus:ring-2 focus:ring-[color:var(--gold)] focus:border-transparent outline-none";

  const canCheckout =
    shippingAddress.name &&
    shippingAddress.phone &&
    shippingAddress.street &&
    shippingAddress.city &&
    shippingAddress.pinCode;

  const checkoutLabel = loading
    ? "Creating Order..."
    : `Place Order · ${formatINR(payablePreview)}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--plum)] shadow-2xl">
        {/* Header — stays fixed while content scrolls */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[color:var(--border)] px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center">
            <ShoppingCart className="mr-2 h-5 w-5 shrink-0 text-[color:var(--wine)]" />
            <h2 className="truncate text-lg font-bold text-[color:var(--plum)] sm:text-xl">
              {currentStep === 1
                ? "Complete Your Order"
                : currentStep === 2
                  ? "Payment"
                  : "Confirmation"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 text-[color:var(--muted)] transition hover:bg-[color:var(--ivory)] hover:text-[color:var(--plum)]"
            aria-label="Close checkout"
          >
            <X size={22} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="shrink-0 border-b border-[color:var(--border)] bg-[color:var(--ivory)] px-4 py-3 sm:px-6">
          <div className="flex items-center justify-center space-x-3 sm:space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? "text-[color:var(--wine)]" : "text-[color:var(--muted)]"}`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 ${currentStep >= 1 ? "bg-[color:var(--wine)] text-[color:var(--ivory)]" : "bg-[color:var(--border)] text-[color:var(--muted)]"}`}>
                1
              </div>
              <span className="ml-1.5 text-xs font-medium sm:ml-2 sm:text-sm">
                <span className="sm:hidden">Details</span>
                <span className="hidden sm:inline">Shipping</span>
              </span>
            </div>
            <div className={`h-0.5 w-8 sm:w-12 ${currentStep >= 2 ? "bg-[color:var(--wine)]" : "bg-[color:var(--border)]"}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? "text-[color:var(--wine)]" : "text-[color:var(--muted)]"}`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 ${currentStep >= 2 ? "bg-[color:var(--wine)] text-[color:var(--ivory)]" : "bg-[color:var(--border)] text-[color:var(--muted)]"}`}>
                2
              </div>
              <span className="ml-1.5 text-xs font-medium sm:ml-2 sm:text-sm">Payment</span>
            </div>
            <div className={`h-0.5 w-8 sm:w-12 ${currentStep >= 3 ? "bg-[color:var(--wine)]" : "bg-[color:var(--border)]"}`}></div>
            <div className={`flex items-center ${currentStep >= 3 ? "text-[color:var(--wine)]" : "text-[color:var(--muted)]"}`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 ${currentStep >= 3 ? "bg-[color:var(--wine)] text-[color:var(--ivory)]" : "bg-[color:var(--border)] text-[color:var(--muted)]"}`}>
                3
              </div>
              <span className="ml-1.5 text-xs font-medium sm:ml-2 sm:text-sm">
                <span className="sm:hidden">Done</span>
                <span className="hidden sm:inline">Confirmation</span>
              </span>
            </div>
          </div>
        </div>

        {/* Content — scrolls independently */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {currentStep === 1 ? (
            <div className="space-y-6">
              <BannerSection variant="checkout" bannerIds={["checkout-birthday-surprise"]} />

              {/* Product Summary */}
              <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--ivory)] p-4">
                <h3 className="mb-3 font-semibold text-[color:var(--plum)]">Order Summary</h3>
                <div className="flex items-center space-x-4">
                  {productImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={productImage} alt={productName} className="h-16 w-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-[color:var(--plum)]">{productName}</h4>
                    <p className="text-sm text-[color:var(--muted)]">Quantity: {quantity}</p>
                    <p className="text-lg font-bold text-[color:var(--wine)]">{formatINR(payablePreview)}</p>
                    {couponDiscount > 0 && (
                      <p className="text-xs text-[color:var(--muted)] line-through">{formatINR(orderSubtotal + giftUpgradeTotal + deliveryFee)}</p>
                    )}
                    <span className="lux-pill mt-2 inline-flex px-2 py-0.5 text-[10px]">
                      Same Day Delivery - ₹49 extra (Indore only)
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Delivery Success Banner */}
              {freeDeliveryEligible && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎉</span>
                    <div>
                      <p className="font-semibold text-emerald-800">FREE DELIVERY UNLOCKED</p>
                      <p className="text-sm text-emerald-700">You saved ₹49 on shipping charges</p>
                    </div>
                  </div>
                </div>
              )}

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[color:var(--muted)]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--wine)] text-[10px] font-bold text-[color:var(--ivory)]">1</span>
                  1 · Complete Your Gift
                </h3>
                <CompleteYourGift value={giftUpgrades} onChange={setGiftUpgrades} />
              </section>

              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[color:var(--muted)]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--wine)] text-[10px] font-bold text-[color:var(--ivory)]">2</span>
                  2 · Delivery Details
                </h3>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm sm:p-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[color:var(--muted)]">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={shippingAddress.name}
                        onChange={handleAddressChange}
                        className={inputClass}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[color:var(--muted)]">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        className={inputClass}
                        placeholder="Enter your phone number"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-[color:var(--muted)]">Street Address *</label>
                      <input
                        type="text"
                        name="street"
                        value={shippingAddress.street}
                        onChange={handleAddressChange}
                        className={inputClass}
                        placeholder="Street address, P.O. Box, company name"
                        autoComplete="street-address"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[color:var(--muted)]">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        className={inputClass}
                        placeholder="Enter your city"
                        autoComplete="address-level2"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[color:var(--muted)]">State</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        className={inputClass}
                        placeholder="Enter your state (optional)"
                        autoComplete="address-level1"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[color:var(--muted)]">PIN Code *</label>
                      <input
                        type="text"
                        name="pinCode"
                        value={shippingAddress.pinCode}
                        onChange={handleAddressChange}
                        className={inputClass}
                        placeholder="Enter PIN code"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              <CartSummaryOffers
                itemCount={quantity}
                subtotal={orderSubtotal}
                productDiscount={productDiscount * quantity}
                deliveryFee={deliveryFee}
                giftUpgradeLines={giftUpgradeLines}
                appliedOffer={appliedCoupon}
                onOfferChange={handleOfferChange}
                onManualCouponApplied={handleManualCouponApplied}
                disableAutoApply={refCouponActive}
                onValidateCoupon={validateCoupon}
                onCheckout={handleCreateOrder}
                checkoutDisabled={loading || !canCheckout}
                checkoutLabel={checkoutLabel}
              />

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          ) : currentStep === 2 ? (
            paymentState === "reported" && !showPayAfterReject ? (
              <ReportedPaymentPanel
                amount={payableAmount}
                orderReference={orderReference}
                orderCancelled={orderCancelled}
                onViewOrder={() => setCurrentStep(3)}
                onContinueShopping={onClose}
              />
            ) : paymentState === "verified" ? (
              <VerifiedPaymentPanel
                amount={payableAmount}
                orderReference={orderReference}
                onViewOrder={() => setCurrentStep(3)}
              />
            ) : paymentState === "rejected" && !showPayAfterReject ? (
              <RejectedPaymentPanel
                amount={payableAmount}
                orderReference={orderReference}
                reason={serverOrder?.paymentRejectionReason}
                onRetry={() => setShowPayAfterReject(true)}
                onContinueShopping={onClose}
              />
            ) : (
              <PayPanel
                amount={payableAmount}
                upiUri={upiUri}
                upiId={QUICKWISH_UPI_ID}
                orderReference={orderReference}
                copiedUpiId={copiedUpiId}
                copiedOrderRef={copiedOrderRef}
                onCopyUpiId={() => void handleCopyUpiId()}
                onCopyOrderRef={() => void handleCopyOrderRef()}
                qrBusy={qrBusy}
                onRetryQr={() => void handleRefreshPaymentInstructions()}
                reporting={reporting}
                reportError={reportError}
                onReportPayment={() => void handleReportPayment()}
                onBack={() => setCurrentStep(1)}
              />
            )
          ) : (
            <OrderReceipt
              orderId={orderId}
              orderNumber={serverOrder?.orderNumber || undefined}
              orderDate={orderDate ?? new Date()}
              customerName={shippingAddress.name}
              productName={productName}
              quantity={serverOrder?.quantity ?? quantity}
              productPrice={baseAmount}
              subtotal={serverOrder?.subtotal ?? subtotal * quantity}
              discount={productDiscount * quantity}
              couponDiscount={serverOrder?.couponDiscount ?? couponDiscount}
              deliveryFee={serverOrder?.deliveryFee ?? deliveryFee}
              finalAmountPaid={serverOrder?.finalAmount ?? payablePreview}
              deliveryAddress={shippingAddress}
              paymentStatus={serverOrder?.paymentStatus ?? "PENDING"}
              orderStatus={serverOrder?.status ?? "Processing"}
              onTrackOrder={() => setCurrentStep(2)}
              onContinueShopping={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Payment sub-panels                                                  */
/* ------------------------------------------------------------------ */

function PayPanel({
  amount,
  upiUri,
  upiId,
  orderReference,
  copiedUpiId,
  copiedOrderRef,
  onCopyUpiId,
  onCopyOrderRef,
  qrBusy,
  onRetryQr,
  reporting,
  reportError,
  onReportPayment,
  onBack,
}: {
  amount: number;
  upiUri: string;
  upiId: string;
  orderReference: string;
  copiedUpiId: boolean;
  copiedOrderRef: boolean;
  onCopyUpiId: () => void;
  onCopyOrderRef: () => void;
  qrBusy: boolean;
  onRetryQr: () => void;
  reporting: boolean;
  reportError: string;
  onReportPayment: () => void;
  onBack: () => void;
}) {
  const supportHref = `https://wa.me/919575930848?text=${encodeURIComponent(
    `Hi QuickWish, I'm having trouble paying for order ${orderReference}.`
  )}`;

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      {/* Truthful reserved state — payment is NOT complete yet */}
      <div className="flex items-start gap-2.5">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--wine)]" />
        <p className="text-sm font-semibold leading-relaxed text-[color:var(--plum)]">
          Order reserved — complete payment to confirm your gift.
        </p>
      </div>

      {/* Amount — the single most important number, always server-sourced */}
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--muted)]">
          Amount to pay
        </p>
        <p className="mt-1.5 text-4xl font-black tracking-tight text-[color:var(--plum)] sm:text-5xl">
          {formatINR(amount)}
        </p>
        <p className="mt-1 text-xs font-semibold text-[color:var(--muted)]">
          Pay directly to QuickWish · UPI · INR
        </p>
      </div>

      {/* Mobile: pay-first. Desktop: QR-first. One component, responsive order. */}
      <div className="flex flex-col gap-5">
        {upiUri ? (
          <>
            {/* Mobile primary action → desktop secondary */}
            <div className="order-1 space-y-3 md:order-3">
              <a
                href={upiUri}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[color:var(--wine)] px-5 py-3.5 text-sm font-black text-[color:var(--ivory)] shadow-[0_12px_24px_rgba(74,31,59,0.22)] transition hover:bg-[#3b182f]"
              >
                <Smartphone className="h-4 w-4 shrink-0" />
                Pay with UPI App
              </a>
              <p className="text-center text-sm font-medium text-[color:var(--muted)]">
                Google Pay · PhonePe · Paytm · BHIM · Other UPI apps
              </p>
            </div>

            <div
              className="order-2 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--muted)]"
              role="separator"
            >
              <span className="h-px flex-1 bg-[color:var(--border)]" />
              or
              <span className="h-px flex-1 bg-[color:var(--border)]" />
            </div>

            {/* Desktop primary → mobile secondary */}
            <div className="order-3 space-y-3 md:order-1">
              <p className="text-center text-sm font-bold text-[color:var(--plum)]">
                Paying from another device?
              </p>
              <div className="flex justify-center">
                <div className="w-[min(224px,100%)] rounded-2xl bg-white p-3 shadow-inner ring-1 ring-black/10 sm:p-4">
                  <QRCodeSVG
                    value={upiUri}
                    size={224}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#000000"
                    style={{ width: "100%", height: "auto" }}
                    aria-label="UPI payment QR code"
                  />
                </div>
              </div>
              <p className="text-center text-sm font-medium text-[color:var(--muted)]">
                Scan this QR using any UPI app
              </p>
            </div>
          </>
        ) : qrBusy ? (
          /* Skeleton matches the QR dimensions — no layout shift while loading. */
          <div className="space-y-3">
            <p className="text-center text-sm font-bold text-[color:var(--plum)]">
              Paying from another device?
            </p>
            <div className="flex justify-center">
              <div className="flex h-[224px] w-[min(224px,100%)] items-center justify-center rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--ivory)]">
                <div className="animate-pulse px-4 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[color:var(--wine)]" />
                  <p className="mt-2 text-xs font-semibold text-[color:var(--muted)]">
                    Preparing secure UPI payment…
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* QR could not be prepared — user is never blocked. */
          <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--ivory)] p-5 text-center">
            <p className="text-sm font-bold text-[color:var(--plum)]">
              We couldn&apos;t prepare the QR.
            </p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-[color:var(--muted)]">
              Your order is still reserved. Payment details didn&apos;t come back
              from our server — try again, or contact QuickWish to complete your
              payment.
            </p>
            <button
              type="button"
              onClick={onRetryQr}
              className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[color:var(--wine)] px-6 py-2.5 text-sm font-black text-[color:var(--ivory)] transition hover:bg-[#3b182f]"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* UPI ID — server-owned, never invented client-side */}
      {upiId && (
        <div className="flex items-center justify-between gap-3 border-t border-[color:var(--border)] pt-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[color:var(--muted)]">UPI ID</p>
            <p className="truncate font-mono text-sm font-black text-[color:var(--plum)]">{upiId}</p>
          </div>
          <button
            type="button"
            onClick={onCopyUpiId}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--border)] px-3.5 py-2 text-xs font-bold text-[color:var(--plum)] transition hover:border-[color:var(--gold)] hover:bg-[color:var(--ivory)]"
          >
            <Copy className="h-3.5 w-3.5" />
            {copiedUpiId ? "✓ Copied" : "Copy"}
          </button>
        </div>
      )}

      {/* Order reference — friendly number, subtle */}
      <div className="flex items-center justify-between gap-3 border-t border-[color:var(--border)] pt-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[color:var(--muted)]">Order reference</p>
          <p className="truncate font-mono text-sm font-black text-[color:var(--plum)]">{orderReference}</p>
        </div>
        <button
          type="button"
          onClick={onCopyOrderRef}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--border)] px-3.5 py-2 text-xs font-bold text-[color:var(--plum)] transition hover:border-[color:var(--gold)] hover:bg-[color:var(--ivory)]"
        >
          <Copy className="h-3.5 w-3.5" />
          {copiedOrderRef ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Reporting payment is NOT verification — brand styling, not success green. */}
      <div className="space-y-2 border-t border-[color:var(--border)] pt-4">
        <p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--muted)]">
          Already paid?
        </p>
        <button
          type="button"
          onClick={onReportPayment}
          disabled={reporting}
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[color:var(--wine)] px-5 py-3.5 text-sm font-black text-[color:var(--ivory)] transition hover:bg-[#3b182f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {reporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Recording…
            </>
          ) : (
            <>I&apos;ve paid {formatINR(amount)}</>
          )}
        </button>

        {reportError && (
          <p className="rounded-lg bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
            {reportError}
          </p>
        )}

        <p className="text-center text-xs font-medium text-[color:var(--muted)]">
          We verify every payment before confirming your order.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 pt-1">
        <a
          href={supportHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[color:var(--wine)] transition hover:text-[color:var(--plum)]"
        >
          Having trouble? Contact QuickWish
        </a>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--wine)]"
        >
          ← Back to delivery details
        </button>
      </div>
    </div>
  );
}

function ReportedPaymentPanel({
  amount,
  orderReference,
  orderCancelled,
  onViewOrder,
  onContinueShopping,
}: {
  amount: number;
  orderReference: string;
  orderCancelled: boolean;
  onViewOrder: () => void;
  onContinueShopping: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-500/30 dark:bg-amber-500/10">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
          Payment reported
        </p>
        <h3 className="mt-2 text-2xl font-black text-[color:var(--plum)]">Awaiting verification</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[color:var(--muted)]">
          {orderCancelled
            ? "This order was cancelled. Please contact QuickWish if you paid."
            : "We&apos;re checking your payment. You don&apos;t need to send a screenshot. Your gift order stays reserved while we verify."}
        </p>

        <div className="mx-auto mt-5 grid max-w-xs grid-cols-1 gap-3">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm dark:bg-[color:var(--surface)]">
            <p className="text-xs font-bold text-[color:var(--muted)]">Amount</p>
            <p className="mt-0.5 text-lg font-black text-[color:var(--plum)]">{formatINR(amount)}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm dark:bg-[color:var(--surface)]">
            <p className="text-xs font-bold text-[color:var(--muted)]">Order reference</p>
            <p className="mt-0.5 break-all font-mono text-sm font-black text-[color:var(--plum)]">{orderReference}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm dark:bg-[color:var(--surface)]">
            <p className="text-xs font-bold text-[color:var(--muted)]">Status</p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-black text-amber-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Awaiting verification
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onViewOrder}
          className="rounded-full bg-[color:var(--wine)] px-5 py-3 text-sm font-black text-[color:var(--ivory)] transition hover:bg-[#3b182f]"
        >
          View Order
        </button>
        <button
          type="button"
          onClick={onContinueShopping}
          className="rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-black text-[color:var(--plum)] transition hover:bg-[color:var(--ivory)]"
        >
          Continue Shopping
        </button>
      </div>
      <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-[color:var(--muted)]">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        We&apos;ll notify you here as soon as your payment is verified.
      </p>
    </div>
  );
}

function VerifiedPaymentPanel({
  amount,
  orderReference,
  onViewOrder,
}: {
  amount: number;
  orderReference: string;
  onViewOrder: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
          Payment verified
        </p>
        <h3 className="mt-2 text-2xl font-black text-[color:var(--plum)]">Your gift order is confirmed 🎁</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[color:var(--muted)]">
          Thank you! We&apos;ll keep you updated about delivery.
        </p>

        <div className="mx-auto mt-5 grid max-w-xs grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm dark:bg-[color:var(--surface)]">
            <p className="text-xs font-bold text-[color:var(--muted)]">Amount</p>
            <p className="mt-0.5 text-lg font-black text-[color:var(--plum)]">{formatINR(amount)}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm dark:bg-[color:var(--surface)]">
            <p className="text-xs font-bold text-[color:var(--muted)]">Order reference</p>
            <p className="mt-0.5 break-all font-mono text-sm font-black text-[color:var(--plum)]">{orderReference}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onViewOrder}
        className="w-full rounded-full bg-[color:var(--wine)] px-5 py-3 text-sm font-black text-[color:var(--ivory)] transition hover:bg-[#3b182f]"
      >
        View Order
      </button>
    </div>
  );
}

function RejectedPaymentPanel({
  amount,
  orderReference,
  reason,
  onRetry,
  onContinueShopping,
}: {
  amount: number;
  orderReference: string;
  reason?: string | null;
  onRetry: () => void;
  onContinueShopping: () => void;
}) {
  const supportHref = `https://wa.me/919575930848?text=${encodeURIComponent(
    `Hi QuickWish, I paid for order ${orderReference} but the payment couldn't be verified.`
  )}`;

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-black text-[color:var(--plum)]">We couldn&apos;t verify this payment</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[color:var(--muted)]">
          Please check your payment details or contact QuickWish. Your order is still reserved — you can try again.
        </p>
        {reason && (
          <p className="mx-auto mt-3 max-w-sm rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[color:var(--muted)] dark:bg-[color:var(--surface)]">
            Note: {reason}
          </p>
        )}

        <div className="mx-auto mt-5 grid max-w-xs grid-cols-1 gap-3">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm dark:bg-[color:var(--surface)]">
            <p className="text-xs font-bold text-[color:var(--muted)]">Amount</p>
            <p className="mt-0.5 text-lg font-black text-[color:var(--plum)]">{formatINR(amount)}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm dark:bg-[color:var(--surface)]">
            <p className="text-xs font-bold text-[color:var(--muted)]">Order reference</p>
            <p className="mt-0.5 break-all font-mono text-sm font-black text-[color:var(--plum)]">{orderReference}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-[color:var(--wine)] px-5 py-3 text-sm font-black text-[color:var(--ivory)] transition hover:bg-[#3b182f]"
        >
          Try payment again
        </button>
        <a
          href={supportHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-3 text-sm font-black text-[color:var(--plum)] transition hover:bg-[color:var(--ivory)]"
        >
          Contact QuickWish
        </a>
      </div>

      <button
        type="button"
        onClick={onContinueShopping}
        className="w-full text-sm font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--wine)]"
      >
        Continue Shopping
      </button>
    </div>
  );
}
