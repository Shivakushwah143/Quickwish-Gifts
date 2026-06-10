"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Gift,
  Loader2,
  LogOut,
  PackageCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("creatorToken");

    if (!token) {
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
            localStorage.removeItem("creatorToken");
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
    localStorage.removeItem("creatorToken");
    localStorage.removeItem("creatorName");
    router.replace("/creator/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4] px-4 text-[#2b1d25]">
        <div className="rounded-2xl border border-[#ead7c5] bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[#b54e36]" />
          <p className="text-sm font-bold text-[#6f5d66]">Loading creator dashboard...</p>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf4] px-4 text-[#2b1d25]">
        <div className="max-w-md rounded-2xl border border-[#ead7c5] bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold lux-serif">Creator Dashboard</h1>
          <p className="mt-2 text-sm text-red-600">{error || "Dashboard not found."}</p>
          <button
            type="button"
            onClick={() => router.replace("/creator/login")}
            className="mt-5 rounded-full bg-[#4a1f3b] px-5 py-3 text-sm font-black text-white"
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
    <main className="min-h-screen bg-[#fffaf4] px-4 py-8 text-[#2b1d25]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#ead7c5] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0e7] text-[#b54e36]">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b54e36]">
                Creator Dashboard
              </p>
              <h1 className="text-2xl font-semibold lux-serif">
                Hi, {dashboard.creator.name}
              </h1>
              <p className="text-sm text-[#6f5d66]">
                Track your code, rewards, and confirmed commissions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-max items-center rounded-full border border-[#ead7c5] px-4 py-2 text-sm font-black text-[#2b1d25] transition hover:bg-[#fffaf4]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </header>

        <section className="mb-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-[#ead7c5] bg-gradient-to-br from-[#FDECEF] to-[#fffaf4] p-5 shadow-sm">
            <p className="text-sm font-black text-[#8b3f2f]">Your referral code</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-dashed border-[#c9a36a] bg-white px-5 py-4 text-3xl font-black tracking-[0.16em] text-[#4a1f3b]">
                {dashboard.referralCode || "PENDING"}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                disabled={!dashboard.referralCode}
                className="inline-flex items-center justify-center rounded-full bg-[#4a1f3b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#3b182f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#6f5d66]">
              Customers save Rs 50 when they use your code. You earn Rs 100
              after each successful confirmed order.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ead7c5] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-[#2b1d25]">Bonus Progress</p>
                <p className="text-xs text-[#6f5d66]">
                  {dashboard.ordersGenerated} confirmed orders
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-[#b54e36]" />
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
                      : "border-[#ead7c5] bg-[#fffaf4] text-[#2b1d25]"
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
              <div key={metric.label} className="rounded-2xl border border-[#ead7c5] bg-white p-5 shadow-sm">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0e7] text-[#b54e36]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-xs font-bold uppercase tracking-wide text-[#7a6570]">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-black text-[#2b1d25]">{metric.value}</p>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
