"use client";

// app/account/page.tsx
// Authenticated customer order history. Order data comes from the backend



// /orders/me endpoint — the user id is derived from the JWT server-side, so
// customers can only ever see their own orders.
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";



import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  Package,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { clearCustomerAuthState, hasJwtExpired } from "../utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type OrderProduct = {
  productId?: string;
  name?: string;
  image?: string;
  unitPrice?: number;
  quantity?: number;
  category?: string;
};

type CustomerOrder = {
  orderId: string;
  orderNumber?: string | null;
  status: string;
  paymentStatus:
    | "PENDING"
    | "AWAITING_VERIFICATION"
    | "PROOF_SUBMITTED"
    | "VERIFIED"
    | "REJECTED";
  amount: number;
  finalAmount?: number;
  subtotal?: number;
  couponDiscount?: number;
  deliveryFee?: number;
  quantity?: number;
  couponCode?: string;
  product: OrderProduct | string;
  creatorCode?: string;
  orderedAt?: string;
  paidAt?: string;
  shippingAddress?: {
    name?: string;
    city?: string;
    street?: string;
    pinCode?: string;
  };
};

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customerToken") || localStorage.getItem("token");
};

const formatCurrency = (amount: number) =>
  `Rs ${Math.max(0, Math.round(Number(amount) || 0)).toLocaleString("en-IN")}`;

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getPaymentStatusView = (status: CustomerOrder["paymentStatus"]) => {
  switch (status) {
    case "VERIFIED":
      return {
        label: "Paid",
        color: "bg-emerald-100 text-emerald-800",
        Icon: CheckCircle2,
      };
    case "AWAITING_VERIFICATION":
    case "PROOF_SUBMITTED":
      return {
        label: "Awaiting verification",
        color: "bg-amber-100 text-amber-800",
        Icon: Clock,
      };
    case "REJECTED":
      return {
        label: "Payment rejected",
        color: "bg-red-100 text-red-800",
        Icon: Clock,
      };
    case "PENDING":
    default:
      return {
        label: "Payment pending",
        color: "bg-gray-100 text-gray-800",
        Icon: Clock,
      };
  }
};

const getOrderStatusView = (status: string) => {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "orderconfirmed":
      return { label: "Confirmed", color: "bg-blue-100 text-blue-800", Icon: PackageCheck };
    case "shipped":
      return { label: "Shipped", color: "bg-purple-100 text-purple-800", Icon: Truck };
    case "delivered":
      return { label: "Delivered", color: "bg-green-100 text-green-800", Icon: PackageCheck };
    case "cancelled":
      return { label: "Cancelled", color: "bg-red-100 text-red-800", Icon: Package };
    case "processing":
    default:
      return { label: "Processing", color: "bg-yellow-100 text-yellow-800", Icon: Clock };
  }
};

export default function AccountPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const token = getAuthToken();

    if (!token || hasJwtExpired(token)) {
      clearCustomerAuthState();
      setAuthenticated(false);
      setLoading(false);
      return;
    }

    if (!API_BASE_URL) {
      setError("Account service is not configured.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orders/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        clearCustomerAuthState();
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError("Unable to load your orders right now.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
      setAuthenticated(true);
    } catch {
      setError("Network error while loading orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleLogout = async () => {
    clearCustomerAuthState();
    await signOut({ redirectUrl: "/" });
    router.push("/");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--tint-cream)] px-4 text-[color:var(--plum)]">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-center shadow-sm">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[color:var(--wine)]" />
          <p className="text-sm font-bold text-[color:var(--muted)]">Loading your orders...</p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--tint-cream)] px-4 text-[color:var(--plum)]">
        <div className="max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-center shadow-sm">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--tint-peach)] text-[color:var(--wine)]">
            <ShoppingBag className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-semibold lux-serif">Sign in to see your orders</h1>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            Your order history, payment status, and delivery updates will appear here.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 rounded-full bg-[color:var(--wine)] px-6 py-3 text-sm font-black text-[color:var(--ivory)] transition hover:bg-[#3b182f]"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[color:var(--tint-cream)] px-4 py-8 text-[color:var(--plum)]">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center text-sm font-bold text-[color:var(--muted)] transition hover:text-[color:var(--wine)]"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </button>

        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--wine)]">My Account</p>
            <h1 className="mt-1 text-2xl font-semibold lux-serif">My Orders</h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              {orders.length} order{orders.length === 1 ? "" : "s"} placed
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-max items-center rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-black text-[color:var(--plum)] transition hover:bg-[color:var(--tint-cream)]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-10 text-center shadow-sm">
            <Package className="mx-auto mb-4 h-10 w-10 text-[#c9a36a]" />
            <h2 className="text-lg font-semibold lux-serif">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[color:var(--muted)]">
              When you place an order, it will show up here with live payment and delivery status.
            </p>
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="mt-5 rounded-full bg-[color:var(--wine)] px-6 py-3 text-sm font-black text-[color:var(--ivory)] transition hover:bg-[#3b182f]"
            >
              Explore Gifts
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const product =
                typeof order.product === "object" && order.product !== null
                  ? order.product
                  : undefined;
              const paymentView = getPaymentStatusView(order.paymentStatus);
              const orderView = getOrderStatusView(order.status);
              const PaymentIcon = paymentView.Icon;
              const OrderIcon = orderView.Icon;
              const isExpanded = expandedOrder === order.orderId;
              const productImage = product?.image;
              const productName = product?.name || "Gift";
              const quantity = Number(order.quantity) || Number(product?.quantity) || 1;
              const paid = Number(order.finalAmount ?? order.amount);

              return (
                <article
                  key={order.orderId}
                  className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[color:var(--ivory)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={productImage || "/placeholder-image.jpg"}
                        alt={productName}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 rounded-tl-lg bg-[color:var(--wine)] px-1.5 py-0.5 text-[10px] font-black text-[color:var(--ivory)]">
                        ×{quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-black">{productName}</h2>
                      <p className="mt-0.5 text-xs text-[color:var(--muted)]">
                        Placed {formatDate(order.orderedAt)} · {order.orderNumber || `#${order.orderId.slice(-8)}`}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${paymentView.color}`}>
                          <PaymentIcon className="h-3 w-3" />
                          {paymentView.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${orderView.color}`}>
                          <OrderIcon className="h-3 w-3" />
                          {orderView.label}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black">{formatCurrency(paid)}</p>
                      <button
                        type="button"
                        onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}
                        className="mt-1 text-xs font-black text-[color:var(--wine)] transition hover:text-[color:var(--wine)]"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "Hide details" : "View details"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 border-t border-[color:var(--border)] bg-[color:var(--tint-cream)] p-4 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
                          <p className="text-xs font-bold text-[color:var(--muted)]">Order ID</p>
                          <p className="mt-1 break-all font-mono text-xs font-black">{order.orderId}</p>
                        </div>
                        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
                          <p className="text-xs font-bold text-[color:var(--muted)]">Delivery to</p>
                          <p className="mt-1 text-xs font-black">
                            {order.shippingAddress?.name || "—"}
                          </p>
                          <p className="mt-0.5 text-xs text-[color:var(--muted)]">
                            {order.shippingAddress?.city || ""}
                            {order.shippingAddress?.city && order.shippingAddress?.pinCode ? ", " : ""}
                            {order.shippingAddress?.pinCode || ""}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-xs">
                        <div className="flex justify-between gap-4 text-[color:var(--muted)]">
                          <span>Subtotal</span>
                          <span>{formatCurrency(Number(order.subtotal ?? 0) || paid)}</span>
                        </div>
                        {Number(order.couponDiscount) > 0 && (
                          <div className="flex justify-between gap-4 text-[color:var(--muted)]">
                            <span>Coupon discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                            <span>-{formatCurrency(Number(order.couponDiscount))}</span>
                          </div>
                        )}
                        <div className="flex justify-between gap-4 text-[color:var(--muted)]">
                          <span>Delivery</span>
                          <span>{Number(order.deliveryFee) > 0 ? formatCurrency(Number(order.deliveryFee)) : "FREE"}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-[color:var(--border)] pt-1.5 text-sm font-black text-[color:var(--plum)]">
                          <span>Total paid</span>
                          <span>{formatCurrency(paid)}</span>
                        </div>
                      </div>

                      {order.creatorCode && (
                        <p className="text-xs font-semibold text-[color:var(--muted)]">
                          Referral code used: <span className="font-black text-[color:var(--wine)]">{order.creatorCode}</span>
                        </p>
                      )}

                      <a
                        href={`https://wa.me/919575930848?text=${encodeURIComponent(`Hi OneWish, I need help with order ${order.orderId}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-xs font-black text-[color:var(--plum)] transition hover:bg-[color:var(--tint-cream)]"
                      >
                        Contact Support
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
