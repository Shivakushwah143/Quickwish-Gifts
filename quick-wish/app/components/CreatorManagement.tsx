"use client";

import { FormEvent, useEffect, useState } from "react";
import { Copy, Gift, Loader2, Plus, RefreshCw, Trophy, UserPlus } from "lucide-react";

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
  bonusEarned: number;
  rewardMilestones: Array<{
    label: string;
    reward: string;
    unlocked: boolean;
  }>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const formatCurrency = (amount: number) =>
  `Rs ${Math.max(0, Math.round(amount)).toLocaleString("en-IN")}`;

export default function CreatorManagement() {
  const [creators, setCreators] = useState<CreatorDashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    preferredCode: "",
  });
  const [codeByCreator, setCodeByCreator] = useState<Record<string, string>>({});

  const fetchCreators = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token || !API_BASE_URL) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/creators`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Failed to load creators.");
        return;
      }

      setCreators(data.creators || []);
    } catch {
      setError("Unable to load creators right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCreators();
  }, []);

  const createCreator = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("adminToken");
    if (!token || !API_BASE_URL) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/creators`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          preferredCode: form.preferredCode,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Creator creation failed.");
        return;
      }

      setMessage("Creator created. Assign a code to activate referrals.");
      setForm({ name: "", email: "", phone: "", password: "", preferredCode: "" });
      await fetchCreators();
    } catch {
      setError("Unable to create creator right now.");
    } finally {
      setSaving(false);
    }
  };

  const assignCode = async (creatorId: string) => {
    const token = localStorage.getItem("adminToken");
    const code = codeByCreator[creatorId]?.trim();
    if (!token || !API_BASE_URL || !code) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/creators/${creatorId}/code`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          minOrderAmount: 399,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Code assignment failed.");
        return;
      }

      setMessage("Creator code assigned successfully.");
      setCodeByCreator((prev) => ({ ...prev, [creatorId]: "" }));
      await fetchCreators();
    } catch {
      setError("Unable to assign creator code right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Creator Referral Program</h2>
            <p className="text-sm text-gray-500">
              Create creators, assign unique coupon codes, and track commissions.
            </p>
          </div>
          <button
            onClick={fetchCreators}
            className="inline-flex w-max items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </button>
        </div>

        <form onSubmit={createCreator} className="grid gap-3 md:grid-cols-5">
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Creator name"
            required
          />
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Email"
            required
          />
          <input
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Phone"
          />
          <input
            value={form.preferredCode}
            onChange={(event) => setForm((prev) => ({ ...prev, preferredCode: event.target.value.toUpperCase() }))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Code e.g. SHIVA"
          />
          <input
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Password"
          />
          <button
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 md:col-span-5"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Create Creator
          </button>
        </form>

        {message && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</p>}
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm lg:col-span-2">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-sm text-gray-500">Loading creators...</p>
          </div>
        ) : creators.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm lg:col-span-2">
            <Gift className="mx-auto mb-3 h-8 w-8 text-gray-400" />
            <p className="text-sm font-semibold text-gray-600">No creators yet. Create one above.</p>
          </div>
        ) : (
          creators.map((item) => (
            <div key={item.creator.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{item.creator.name}</h3>
                  <p className="text-sm text-gray-500">{item.creator.email}</p>
                </div>
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                  CREATOR
                </span>
              </div>

              <div className="mb-4 rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Referral Code</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xl font-black tracking-widest text-gray-900">
                    {item.referralCode || "NOT ASSIGNED"}
                  </p>
                  {item.referralCode && (
                    <button
                      onClick={() => navigator.clipboard.writeText(item.referralCode || "")}
                      className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-white"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">Orders</p>
                  <p className="text-lg font-bold text-blue-900">{item.ordersGenerated}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-xs text-green-700">Revenue</p>
                  <p className="text-lg font-bold text-green-900">{formatCurrency(item.revenueGenerated)}</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3">
                  <p className="text-xs text-yellow-700">Commission</p>
                  <p className="text-lg font-bold text-yellow-900">{formatCurrency(item.totalCommissionEarned)}</p>
                </div>
                <div className="rounded-lg bg-pink-50 p-3">
                  <p className="text-xs text-pink-700">Bonus</p>
                  <p className="text-lg font-bold text-pink-900">{formatCurrency(item.bonusEarned)}</p>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {item.rewardMilestones.map((milestone) => (
                  <span
                    key={milestone.label}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                      milestone.unlocked ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Trophy className="mr-1 h-3 w-3" />
                    {milestone.reward}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={codeByCreator[item.creator.id] || ""}
                  onChange={(event) =>
                    setCodeByCreator((prev) => ({
                      ...prev,
                      [item.creator.id]: event.target.value.toUpperCase(),
                    }))
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder={item.creator.preferredCode || "Assign code"}
                />
                <button
                  onClick={() => assignCode(item.creator.id)}
                  disabled={saving || !codeByCreator[item.creator.id]?.trim()}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Code
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
