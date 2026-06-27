import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact QuickWish Gifts for orders, support, and gifting help.",
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-[#2b1d25]">
      <h1 className="text-4xl font-semibold lux-serif">Contact QuickWish Gifts</h1>
      <p className="mt-4 text-sm leading-7 text-[#6f5d66]">
        Email care@quickwish.in for order support and gifting questions.
      </p>
    </main>
  );
}
