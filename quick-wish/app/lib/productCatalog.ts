import { notFound } from "next/navigation";

export const PRODUCT_REVALIDATE_SECONDS = 60 * 60 * 24;

type ApiProduct = {
  _id?: string;
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
  description?: string;
  images?: string[];
  category?: string;
};

type ProductsResponse = {
  products?: ApiProduct[];
};

type ProductResponse = {
  singleProduct?: ApiProduct;
  product?: ApiProduct;
};

export type StaticProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  images: string[];
  category: string;
};

const getApiBaseUrl = (): string => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return apiBaseUrl.replace(/\/$/, "");
};

const toStaticProduct = (product: ApiProduct): StaticProduct | null => {
  const id = product._id || product.id;
  const title = product.title || product.name;

  if (!id || !title) {
    return null;
  }

  return {
    id,
    slug: product.slug || id,
    title,
    description: product.description || "",
    images: product.images || [],
    category: product.category || "Gifts",
  };
};

const isProductResponse = (
  value: ProductResponse | ApiProduct
): value is ProductResponse => {
  return "singleProduct" in value || "product" in value;
};

export const fetchStaticProducts = async (): Promise<StaticProduct[]> => {
  const response = await fetch(`${getApiBaseUrl()}/product`, {
    next: { revalidate: PRODUCT_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch product catalog: ${response.status}`);
  }

  const data = (await response.json()) as ProductsResponse;

  return (data.products || [])
    .map(toStaticProduct)
    .filter((product): product is StaticProduct => product !== null);
};

export const fetchStaticProductById = async (
  productId: string
): Promise<StaticProduct> => {
  const response = await fetch(`${getApiBaseUrl()}/product/${productId}`, {
    next: { revalidate: PRODUCT_REVALIDATE_SECONDS },
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch product ${productId}: ${response.status}`);
  }

  const data = (await response.json()) as ProductResponse | ApiProduct;
  const apiProduct = isProductResponse(data)
    ? data.singleProduct || data.product
    : data;

  const staticProduct = apiProduct ? toStaticProduct(apiProduct) : null;

  if (!staticProduct) {
    notFound();
  }

  return staticProduct;
};
