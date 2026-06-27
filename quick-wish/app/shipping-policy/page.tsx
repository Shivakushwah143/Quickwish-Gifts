import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Shipping policy for QuickWish Gifts, including delivery areas and dispatch timing.",
  alternates: { canonical: "/shipping-policy" },
  robots: { index: true, follow: true },
};

export default function ShippingPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-[#2b1d25]">
      <h1 className="text-4xl font-semibold lux-serif">Shipping Policy</h1>
      <p className="mt-4 text-sm leading-7 text-[#6f5d66]">
        Orders are processed based on product availability and delivery location.
      </p>
    </main>
  );
}
