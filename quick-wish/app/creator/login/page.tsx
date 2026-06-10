"use client";

import { FormEvent, useEffect, useState } from "react";
import { Gift, Loader2, LogIn, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreatorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("creatorToken");
    if (token) {
      router.replace("/creator/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!API_BASE_URL) {
      setError("Creator login is not configured.");
      return;
    }

    if (!email.trim()) {
      setError("Enter your creator email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/creator/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.token) {
        setError(data?.message || "Creator login failed.");
        return;
      }

      localStorage.setItem("creatorToken", data.token);
      localStorage.setItem("creatorName", data?.creator?.name || "Creator");
      router.replace("/creator/dashboard");
    } catch {
      setError("Unable to login right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf4] px-4 py-10 text-[#2b1d25]">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="rounded-2xl border border-[#ead7c5] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0e7] text-[#b54e36]">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b54e36]">
                QuickWish Creator
              </p>
              <h1 className="text-2xl font-semibold lux-serif">Creator Login</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-[#6f5d66]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[#ead7c5] bg-[#fffaf4] px-4 py-3 text-sm text-[#2b1d25] outline-none transition focus:border-[#c9a36a] focus:ring-2 focus:ring-[#c9a36a]/25"
                placeholder="creator@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-[#6f5d66]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-[#ead7c5] bg-[#fffaf4] px-4 py-3 text-sm text-[#2b1d25] outline-none transition focus:border-[#c9a36a] focus:ring-2 focus:ring-[#c9a36a]/25"
                placeholder="Creator password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#4a1f3b] px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(74,31,59,0.18)] transition hover:bg-[#3b182f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Login to Dashboard
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-[#ead7c5] bg-gradient-to-br from-[#FDECEF] to-[#fffaf4] p-6 shadow-sm">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#b54e36] shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <h2 className="text-3xl font-semibold lux-serif">
            Share gifts people remember.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#6f5d66]">
            Track your referral code, confirmed orders, commission, and reward
            milestones in one calm creator dashboard.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Rs 100/order", "3 orders bonus", "5 orders PR gift"].map((item) => (
              <div key={item} className="rounded-xl bg-white/75 p-3 text-sm font-black text-[#2b1d25] shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
