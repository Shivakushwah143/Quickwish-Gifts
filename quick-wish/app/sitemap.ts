import type { MetadataRoute } from "next";
import { fetchStaticProducts } from "./lib/productCatalog";
import { seoPages } from "./seo-pages";

const siteUrl = "https://www.onewish.fun";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchStaticProducts().catch(() => []);
  const productEntries = products.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...seoPages.map((page) => ({
      url: page.canonical,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...productEntries,
  ];
}
