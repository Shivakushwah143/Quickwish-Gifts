import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { seoPageSlugs, seoPages } from "../seo-pages";

type SeoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return seoPageSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: SeoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = seoPages.find((item) => item.slug === slug);

  if (!page) {
    return {
      title: "QuickWish Gifts",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: page.canonical.replace("https://www.onewish.fun", ""),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SeoLandingPage({ params }: SeoPageProps) {
  const { slug } = await params;
  const page = seoPages.find((item) => item.slug === slug);

  if (!page) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.onewish.fun/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.title,
        item: page.canonical,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-[#2b1d25]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <nav className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b3f2f]">
        <Link href="/">Home</Link> / <span>{page.title}</span>
      </nav>

      <section className="rounded-3xl border border-[#ead7c5] bg-white p-8 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b54e36]">
          SEO landing page
        </p>
        <h1 className="mt-3 text-3xl font-semibold lux-serif sm:text-5xl">{page.h1}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6f5d66] sm:text-base">
          {page.intro}
        </p>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-[#ead7c5] bg-[#fffaf4] p-6">
          <h2 className="text-2xl font-semibold lux-serif">{page.h2}</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-[#6f5d66]">
            {page.seoCopy.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <aside className="rounded-3xl border border-[#ead7c5] bg-white p-6">
          <h2 className="text-xl font-semibold lux-serif">Related links</h2>
          <ul className="mt-4 space-y-3">
            {page.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link className="text-sm font-bold text-[#4a1f3b] hover:underline" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="mt-8 rounded-3xl border border-[#ead7c5] bg-white p-6">
        <h2 className="text-2xl font-semibold lux-serif">FAQ</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {page.faq.map((item) => (
            <div key={item.question} className="rounded-2xl bg-[#fffaf4] p-4">
              <h3 className="text-sm font-black text-[#2b1d25]">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6f5d66]">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
