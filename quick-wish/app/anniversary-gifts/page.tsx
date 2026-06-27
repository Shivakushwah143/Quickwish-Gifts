import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Anniversary Gifts",
  description:
    "Discover anniversary gifts, flower bouquets, hampers, and romantic surprises from QuickWish Gifts.",
  alternates: {
    canonical: "/anniversary-gifts",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AnniversaryGiftsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 text-[#2b1d25]">
      <section className="rounded-3xl border border-[#ead7c5] bg-white p-8 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b54e36]">
          Anniversary intent
        </p>
        <h1 className="mt-3 text-3xl font-semibold lux-serif sm:text-5xl">
          Anniversary gifts for meaningful moments
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6f5d66] sm:text-base">
          Explore romantic gifting ideas that combine flowers, keepsakes, and
          premium finishes for users ready to buy.
        </p>
        <div className="mt-6">
          <Link
            href="/products?category=Anniversary"
            className="rounded-full bg-[#4a1f3b] px-5 py-3 text-sm font-bold text-white"
          >
            Shop Anniversary Gifts
          </Link>
        </div>
      </section>
    </main>
  );
}
