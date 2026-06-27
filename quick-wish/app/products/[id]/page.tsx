import {
  fetchStaticProductById,
  fetchStaticProducts,
} from "../../lib/productCatalog";
import ProductDetailPage from "../../components/ProductDetailPage";
import { notFound } from "next/navigation";

export const revalidate = 86400;
export const dynamic = "force-dynamic";
export const dynamicParams = true;

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  const products = await fetchStaticProducts();

  return products.map((product) => ({
    id: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  let product;

  try {
    product = await fetchStaticProductById(id);
  } catch {
    return {
      title: "Product not found | QuickWish Gifts",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  const siteUrl = "https://www.onewish.fun";

  return {
    title: `${product.title} | QuickWish`,
    description: product.description,
    alternates: {
      canonical: `${siteUrl}/products/${product.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: product.title,
      description: product.description,
      url: `${siteUrl}/products/${product.slug}`,
      type: "product",
      images: product.images.slice(0, 1),
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  let product;

  try {
    product = await fetchStaticProductById(id);
  } catch {
    notFound();
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.slice(0, 3),
    brand: {
      "@type": "Brand",
      name: "QuickWish Gifts",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `https://www.onewish.fun/products/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailPage product={product} />
    </>
  );
}
