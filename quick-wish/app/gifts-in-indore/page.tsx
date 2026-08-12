import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = "https://www.onewish.fun";

export const metadata: Metadata = {
  title: "Gifts in Indore",
  description:
    "Shop birthday gifts, anniversary gifts, flower bouquets, chocolate bouquets, personalized gifts, and same-day surprises in Indore.",
  alternates: {
    canonical: "/gifts-in-indore",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Gifts in Indore",
  url: `${siteUrl}/gifts-in-indore`,
  description:
    "High-intent gifting landing page for Indore customers searching for same-day gifts, flowers, hampers, and personalized presents.",
};

export default function GiftsInIndorePage() {
  const links = [
    { label: "Birthday Gifts", href: "/products?category=Birthday" },
    { label: "Anniversary Gifts", href: "/products?category=Anniversary" },
    { label: "Flower Bouquets", href: "/products?category=Flower Bouquets" },
    { label: "Personalized Gifts", href: "/products?category=Personalized Gifts" },
    { label: "Chocolate Bouquets", href: "/products?category=Chocolate Bouquets" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 text-[color:var(--plum)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <section className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--wine)]">
          Indore gifting
        </p>
        <h1 className="mt-3 text-3xl font-semibold lux-serif sm:text-5xl">
          Gifts in Indore for birthdays, anniversaries, and same-day surprises
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
          QuickWish Gifts helps customers in Indore send thoughtful gifts fast.
          Explore curated categories for birthday gifts, flower bouquets,
          personalized hampers, chocolate bouquets, and premium surprises.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--tint-cream)] px-4 py-2 text-sm font-bold text-[color:var(--plum)] transition hover:bg-[color:var(--tint-peach)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Same-day delivery",
            text: "Built for fast gifting in Indore when timing matters.",
          },
          {
            title: "Personalized options",
            text: "Add notes, custom touches, and curated combinations.",
          },
          {
            title: "Commercial intent",
            text: "Matches the search intent behind high-value gifting queries.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--tint-cream)] p-5">
            <h2 className="text-lg font-bold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
