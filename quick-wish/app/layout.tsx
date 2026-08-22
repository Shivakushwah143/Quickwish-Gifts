import "./globals.css";
import AssistantDrawer from "./components/AssistantDrawer";
import ClerkCustomerSync from "./components/ClerkCustomerSync";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

const siteUrl = "https://www.onewish.fun";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "QuickWish Gifts | Same Day Gifting in Indore",
    template: "%s | QuickWish Gifts",
  },
  description:
    "QuickWish Gifts is an Indore gifting store for birthday gifts, anniversary gifts, crochet bouquets, personalized hampers, chocolate bouquets, and same-day delivery in India.",
  applicationName: "QuickWish Gifts",
  authors: [{ name: "QuickWish Gifts" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "QuickWish Gifts",
    title: "QuickWish Gifts | Same Day Gifting in Indore",
    description:
      "Premium gifting for birthdays, anniversaries, festivals, and same-day surprises in Indore.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "QuickWish Gifts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickWish Gifts | Same Day Gifting in Indore",
    description:
      "Birthday gifts, anniversary gifts, crochet bouquets, personalized hampers, and same-day delivery in Indore.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "QuickWish Gifts",
  url: siteUrl,
  logo: `${siteUrl}/favicon.ico`,
  sameAs: [],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "QuickWish Gifts",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/products?category={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};


export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Apply the saved theme before first paint to avoid a flash of the
              wrong theme. Choice: light | dark | system (system falls back to
              the OS preference). */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var s=localStorage.getItem('quickwish_theme');var dark=s==='dark'||((s==='system'||!s)&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';}catch(e){}})();`,
            }}
          />
        </head>
        <body className="antialiased">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
          <ClerkCustomerSync />
          {children}
          <AssistantDrawer />
        </body>
      </html>
    </ClerkProvider>
  );
}
