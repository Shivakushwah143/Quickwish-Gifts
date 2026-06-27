import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for QuickWish Gifts.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-[#2b1d25]">
      <h1 className="text-4xl font-semibold lux-serif">Privacy Policy</h1>
      <p className="mt-4 text-sm leading-7 text-[#6f5d66]">
        We only use customer information to process orders and provide support.
      </p>
    </main>
  );
}
