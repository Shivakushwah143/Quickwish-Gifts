import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund policy for QuickWish Gifts.",
  alternates: { canonical: "/refund-policy" },
  robots: { index: true, follow: true },
};

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-[color:var(--plum)]">
      <h1 className="text-4xl font-semibold lux-serif">Refund Policy</h1>
      <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
        Refund handling depends on order status and product type.
      </p>
    </main>
  );
}
