import {
  fetchStaticProductById,
  fetchStaticProducts,
  PRODUCT_REVALIDATE_SECONDS,
} from "../../lib/productCatalog";
import ProductDetailPage from "../../components/ProductDetailPage";

export const revalidate = PRODUCT_REVALIDATE_SECONDS;
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
  const product = await fetchStaticProductById(id);

  return {
    title: `${product.title} | QuickWish`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await fetchStaticProductById(id);

  return <ProductDetailPage product={product} />;
}
