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
  price?: number;
  stock?: number;
  storefrontGroups?: string[];
  displayOrder?: number;
  comparisons?: PriceComparison[];
};

export type PriceComparison = {
  siteName: string;
  price: number;
  url: string;
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
  price: number;
  stock: number;
  storefrontGroups: string[];
  displayOrder: number;
  comparisons: PriceComparison[];
};

const getApiBaseUrl = (): string => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return apiBaseUrl.replace(/\/$/, "");
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const toStaticProduct = (product: ApiProduct): StaticProduct | null => {
  const id = product._id || product.id;
  const title = product.title || product.name;

  if (!id || !title) {
    return null;
  }

  return {
    id,
    slug: slugify(`${title}-${id}`) || product.slug || id,
    title,
    description: product.description || "",
    images: product.images || [],
    category: product.category || "Gifts",
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    storefrontGroups: product.storefrontGroups || [],
    displayOrder: Number(product.displayOrder) || 0,
    comparisons: Array.isArray(product.comparisons) ? product.comparisons : [],
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

  const seenSlugs = new Map<string, number>();

  return (data.products || [])
    .map(toStaticProduct)
    .filter((product): product is StaticProduct => product !== null)
    .map((product) => {
      const seenCount = seenSlugs.get(product.slug) || 0;
      seenSlugs.set(product.slug, seenCount + 1);

      if (seenCount === 0) {
        return product;
      }

      return {
        ...product,
        slug: `${product.slug}-${product.id}`,
      };
    });
};

export const fetchStaticProductById = async (
  productId: string
): Promise<StaticProduct> => {
  const response = await fetch(`${getApiBaseUrl()}/product/${productId}`, {
    next: { revalidate: PRODUCT_REVALIDATE_SECONDS },
  }).catch(() => null);

  if (!response) {
    const catalog = await fetchStaticProducts().catch(() => []);
    const fallback = catalog.find(
      (item) => item.id === productId || item.slug === productId
    );
    if (fallback) {
      return fallback;
    }
    notFound();
  }

  if (response.status === 404) {
    const catalog = await fetchStaticProducts().catch(() => []);
    const fallback = catalog.find(
      (item) => item.id === productId || item.slug === productId
    );
    if (fallback) {
      return fallback;
    }
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
