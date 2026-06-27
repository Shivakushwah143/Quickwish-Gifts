import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about QuickWish Gifts, our mission, and why customers trust us for gifting in Indore.",
  alternates: { canonical: "/about-us" },
  robots: { index: true, follow: true },
};

export default function AboutUsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-[#2b1d25]">
      <h1 className="text-4xl font-semibold lux-serif">About QuickWish Gifts</h1>
      <p className="mt-4 text-sm leading-7 text-[#6f5d66]">
        QuickWish Gifts is built around thoughtful gifting, same-day delivery, and handcrafted presentation for Indore and beyond.
      </p>
    </main>
  );
}
