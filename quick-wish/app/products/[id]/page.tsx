import {
  fetchStaticProductById,
  fetchStaticProducts,
} from "../../lib/productCatalog";
import ProductDetailPage from "../../components/ProductDetailPage";
import { notFound } from "next/navigation";

export const revalidate = 86400;
export const dynamic = "force-dynamic";
export const dynamicParams = true;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.onewish.fun";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const buildProductDescription = (product: Awaited<ReturnType<typeof fetchStaticProductById>>) => {
  const priceText = product.price > 0 ? ` from ${formatPrice(product.price)}` : "";
  const categoryText = product.category ? ` in ${product.category}` : "";
  const base = `Shop ${product.title}${categoryText}${priceText} at QuickWish. Same-day gift delivery in Indore with secure checkout.`;

  return base.length <= 160 ? base : `${base.slice(0, 157).trim()}...`;
};

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  const products = await fetchStaticProducts().catch(() => []);

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
  const description = buildProductDescription(product);

  return {
    title: `${product.title} - ${product.category} in Indore | QuickWish`,
    description,
    alternates: {
      canonical: `${SITE_URL}/products/${product.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${product.title} | QuickWish`,
      description,
      url: `${SITE_URL}/products/${product.slug}`,
      type: "website",
      images: product.images.slice(0, 1),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | QuickWish`,
      description,
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
      name: "QuickWish",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.slug}`,
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
