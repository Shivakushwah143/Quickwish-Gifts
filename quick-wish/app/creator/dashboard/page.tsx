"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  LogOut,
  PackageCheck,
  Share2,
  Sparkles,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import {
  buildProductShareUrl,
  canUseNativeShare,
  copyProductLink,
  shareNative,
  shareWhatsAppUrl,
} from "../../lib/productShare";
import { useRouter } from "next/navigation";
import { clearCreatorAuthState, hasJwtExpired } from "../../utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type RewardMilestone = {
  label: string;
  reward: string;
  unlocked: boolean;
};

type CreatorDashboard = {
  creator: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    preferredCode?: string;
    active: boolean;
  };
  referralCode: string | null;
  ordersGenerated: number;
  revenueGenerated: number;
  totalCommissionEarned: number;
  baseCommissionEarned: number;
  bonusEarned: number;
  bonusProgress: {
    orders: number;
    nextBonusAt: number | null;
    threeOrderBonusUnlocked: boolean;
    prPackageUnlocked: boolean;
  };
  rewardMilestones: RewardMilestone[];
};

const formatCurrency = (amount: number) =>
  `Rs ${Math.max(0, Math.round(amount)).toLocaleString("en-IN")}`;

export default function CreatorDashboardPage() {
  const [dashboard, setDashboard] = useState<CreatorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoLinkCopied, setPromoLinkCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("creatorToken");

    if (!token || hasJwtExpired(token)) {
      clearCreatorAuthState();
      router.replace("/creator/login");
      return;
    }

    if (!API_BASE_URL) {
      setError("Creator dashboard is not configured.");
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/creator/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data?.dashboard) {
          if (response.status === 401 || response.status === 403) {
            clearCreatorAuthState();
            router.replace("/creator/login");
            return;
          }

          setError(data?.message || "Unable to load creator dashboard.");
          return;
        }

        setDashboard(data.dashboard);
      } catch {
        setError("Unable to load creator dashboard right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [router]);

  const progressPercent = useMemo(() => {
    if (!dashboard) return 0;
    const target = dashboard.bonusProgress.nextBonusAt || 5;
    return Math.min(100, Math.round((dashboard.ordersGenerated / target) * 100));
  }, [dashboard]);

  const handleCopyCode = async () => {
    if (!dashboard?.referralCode) return;
    await navigator.clipboard.writeText(dashboard.referralCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleLogout = () => {
    clearCreatorAuthState();
    router.replace("/creator/login");
  };

  const extractProductSlug = (input: string): string | null => {
    const trimmed = input.trim();

    if (!trimmed) {
      return null;
    }

    const match = trimmed.match(/\/products\/([^\/?#]+)/);
    const slug = match ? decodeURIComponent(match[1]) : trimmed;

    if (!slug || slug.includes(" ") || slug.length > 120) {
      return null;
    }

    return slug;
  };

  const handleGeneratePromoLink = () => {
    setPromoError("");
    setGeneratedLink("");

    if (!dashboard?.referralCode) {
      setPromoError("Your referral code is not assigned yet.");
      return;
    }

    const slug = extractProductSlug(promoInput);

    if (!slug) {
      setPromoError(
        "Paste a product link like https://www.onewish.fun/products/gift-123"
      );
      return;
    }

    setGeneratedLink(
      buildProductShareUrl({
        slug,
        referralCode: dashboard.referralCode,
      })
    );
  };

  const handleCopyPromoLink = async () => {
    if (!generatedLink) {
      return;
    }

    const result = await copyProductLink(generatedLink);

    if (result.ok) {
      setPromoLinkCopied(true);
      window.setTimeout(() => setPromoLinkCopied(false), 1800);
    }
  };

  const handleWhatsAppPromo = () => {
    if (!generatedLink) {
      return;
    }

    const message = [
      "Check out this beautiful gift on QuickWish 🎁",
      "",
      generatedLink,
    ].join("\n");

    window.open(shareWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  };

  const handleNativePromo = async () => {
    if (!generatedLink || !canUseNativeShare()) {
      return;
    }

    await shareNative({
      title: "QuickWish Gift",
      text: `Check out this beautiful gift on QuickWish 🎁\n\n${generatedLink}`,
      url: generatedLink,
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--tint-cream)] px-4 text-[color:var(--plum)]">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-center shadow-sm">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[color:var(--wine)]" />
          <p className="text-sm font-bold text-[color:var(--muted)]">Loading creator dashboard...</p>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--tint-cream)] px-4 text-[color:var(--plum)]">
        <div className="max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold lux-serif">Creator Dashboard</h1>
          <p className="mt-2 text-sm text-red-600">{error || "Dashboard not found."}</p>
          <button
            type="button"
            onClick={() => router.replace("/creator/login")}
            className="mt-5 rounded-full bg-[color:var(--wine)] px-5 py-3 text-sm font-black text-[color:var(--ivory)]"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  const metricCards = [
    {
      label: "Orders Generated",
      value: dashboard.ordersGenerated.toString(),
      icon: PackageCheck,
    },
    {
      label: "Revenue Generated",
      value: formatCurrency(dashboard.revenueGenerated),
      icon: TrendingUp,
    },
    {
      label: "Commission Earned",
      value: formatCurrency(dashboard.totalCommissionEarned),
      icon: Wallet,
    },
    {
      label: "Bonus Earned",
      value: formatCurrency(dashboard.bonusEarned),
      icon: Trophy,
    },
  ];

  return (
    <main className="min-h-screen bg-[color:var(--tint-cream)] px-4 py-8 text-[color:var(--plum)]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--tint-peach)] text-[color:var(--wine)]">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--wine)]">
                Creator Dashboard
              </p>
              <h1 className="text-2xl font-semibold lux-serif">
                Hi, {dashboard.creator.name}
              </h1>
              <p className="text-sm text-[color:var(--muted)]">
                Track your code, rewards, and confirmed commissions.
              </p>
            </div>
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

        <section className="mb-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--tint-rose)] p-5 shadow-sm">
            <p className="text-sm font-black text-[color:var(--wine)]">Your referral code</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-dashed border-[color:var(--gold)] bg-[color:var(--surface)] px-5 py-4 text-3xl font-black tracking-[0.16em] text-[color:var(--wine)]">
                {dashboard.referralCode || "PENDING"}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                disabled={!dashboard.referralCode}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--wine)] px-5 py-3 text-sm font-black text-[color:var(--ivory)] transition hover:bg-[#3b182f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              Customers save Rs 50 when they use your code. You earn Rs 100
              after each successful confirmed order.
            </p>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-[color:var(--plum)]">Bonus Progress</p>
                <p className="text-xs text-[color:var(--muted)]">
                  {dashboard.ordersGenerated} confirmed orders
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-[color:var(--wine)]" />
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#f0e4da]">
              <div
                className="h-full rounded-full bg-[#c9a36a]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {dashboard.rewardMilestones.map((milestone) => (
                <div
                  key={milestone.label}
                  className={`rounded-xl border p-3 ${
                    milestone.unlocked
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-[color:var(--border)] bg-[color:var(--tint-cream)] text-[color:var(--plum)]"
                  }`}
                >
                  <p className="text-sm font-black">{milestone.label}</p>
                  <p className="mt-1 text-xs font-semibold">{milestone.reward}</p>
                  <p className="mt-2 text-xs font-black">
                    {milestone.unlocked ? "Unlocked" : "Locked"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--tint-peach)] text-[color:var(--wine)]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--muted)]">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-black text-[color:var(--plum)]">{metric.value}</p>
              </div>
            );
          })}
        </section>

        {/* Promote a gift with your creator referral code */}
        <section className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--tint-peach)] text-[color:var(--wine)]">
              <Share2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold lux-serif">Promote a Gift</h2>
              <p className="text-sm text-[color:var(--muted)]">
                Paste any product link to get your personal referral link — your code is added automatically.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={promoInput}
              onChange={(event) => {
                setPromoInput(event.target.value);
                setPromoError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleGeneratePromoLink();
                }
              }}
              placeholder="https://www.onewish.fun/products/gift-123"
              className="min-w-0 flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--tint-cream)] px-4 py-3 text-sm text-[color:var(--plum)] outline-none transition focus:border-[color:var(--gold)] focus:ring-2 focus:ring-[#c9a36a]/25"
            />
            <button
              type="button"
              onClick={handleGeneratePromoLink}
              className="shrink-0 rounded-full bg-[color:var(--wine)] px-6 py-3 text-sm font-black text-[color:var(--ivory)] transition hover:bg-[#3b182f]"
            >
              Get My Link
            </button>
          </div>

          {promoError && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {promoError}
            </p>
          )}

          {generatedLink && (
            <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--tint-cream)] p-3">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 shrink-0 text-[color:var(--wine)]" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-[color:var(--muted)]">
                  {generatedLink}
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopyPromoLink()}
                  className="shrink-0 rounded-lg bg-[color:var(--wine)] px-3 py-2 text-xs font-black text-[color:var(--ivory)] transition hover:bg-[#3b182f]"
                >
                  {promoLinkCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppPromo}
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-black text-[color:var(--ivory)] transition hover:brightness-95"
                >
                  WhatsApp
                </button>
                {canUseNativeShare() && (
                  <button
                    type="button"
                    onClick={() => void handleNativePromo()}
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-xs font-black text-[color:var(--plum)] transition hover:bg-[color:var(--tint-cream)]"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    More Apps
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
