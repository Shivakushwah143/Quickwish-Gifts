"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Home, X } from "lucide-react";
import type { StaticProduct } from "../lib/productCatalog";
import ProductDynamicFields, {
  fetchDynamicProducts,
  type DynamicProductFields,
} from "./ProductDynamicFields";
import ProductShareButton from "../components/ProductShareButton";
import { captureReferralFromCurrentUrl } from "../lib/productShare";

type ProductListClientProps = {
  products: StaticProduct[];
};

type ApiProduct = {
  _id?: string;
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
  description?: string;
  images?: string[];
  category?: string;
  storefrontGroups?: string[];
  displayOrder?: number;
  comparisons?: Array<{ siteName: string; price: number; url: string }>;
};

type ProductsResponse = {
  products?: ApiProduct[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const toStaticProduct = (product: ApiProduct): StaticProduct | null => {
  const id = product._id || product.id;
  const title = product.title || product.name;

  if (!id || !title) return null;

  return {
    id,
    slug: product.slug || id,
    title,
    description: product.description || "",
    images: product.images || [],
    category: product.category || "Gifts",
    storefrontGroups: product.storefrontGroups || [],
    displayOrder: Number(product.displayOrder) || 0,
    comparisons: Array.isArray(product.comparisons) ? product.comparisons : [],
  };
};

const formatContextLabel = (value: string): string =>
  value
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getListingHeading = ({
  searchParam,
  viewParam,
  recipientParam,
  categoryParam,
}: {
  searchParam: string;
  viewParam: string;
  recipientParam: string;
  categoryParam: string;
}) => {
  if (searchParam) return `Search: ${searchParam}`;

  if (viewParam) {
    const label = formatContextLabel(viewParam);
    return label.toLowerCase().startsWith("for ")
      ? `Gifts ${label}`
      : `Gifts in ${label}`;
  }

  if (recipientParam) {
    return `Gifts for ${formatContextLabel(recipientParam.replace(/^for-/, ""))}`;
  }

  if (categoryParam) {
    return `Gifts in ${formatContextLabel(categoryParam)}`;
  }

  return "All Gifts";
};

const SORT_OPTIONS = [
  { value: "", label: "Sort: Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

export default function ProductListClient({ products }: ProductListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const recipientParam = searchParams.get("recipient") || "";
  const viewParam = searchParams.get("view") || "";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";

  const [dynamicMap, setDynamicMap] = useState<Record<string, DynamicProductFields>>({});
  const [catalogProducts, setCatalogProducts] = useState<StaticProduct[]>(products);
  const [catalogLoading, setCatalogLoading] = useState(products.length === 0);

  // Persist any ?ref=CODE creator referral from a shared listing link.
  useEffect(() => {
    captureReferralFromCurrentUrl();
  }, []);

  // Batch-fetch live catalog and price/stock once for the whole listing.
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!API_BASE_URL) {
        setCatalogLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/product`, {
          cache: "no-store",
        });
        const data = (await response.json()) as ProductsResponse;
        const liveProducts = (data.products || [])
          .map(toStaticProduct)
          .filter((product): product is StaticProduct => product !== null);

        if (isMounted && liveProducts.length > 0) {
          setCatalogProducts(liveProducts);
        }

        const map = await fetchDynamicProducts();

        if (isMounted) {
          setDynamicMap(map);
        }
      } catch (error) {
        console.error("Failed to load product catalog", error);
      } finally {
        if (isMounted) {
          setCatalogLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    let result = catalogProducts;

    if (searchParam) {
      const needle = searchParam.trim().toLowerCase();

      if (needle) {
        result = result.filter((product) => {
          const haystack = [
            product.title,
            product.category,
            product.description,
            ...(product.storefrontGroups || []),
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(needle);
        });
      }
    }

    const hasMinPrice = minPriceParam.trim() !== "";
    const hasMaxPrice = maxPriceParam.trim() !== "";
    const minPrice = hasMinPrice ? Number(minPriceParam) : Number.NaN;
    const maxPrice = hasMaxPrice ? Number(maxPriceParam) : Number.NaN;

    if ((hasMinPrice && Number.isFinite(minPrice)) || (hasMaxPrice && Number.isFinite(maxPrice))) {
      result = result.filter((product) => {
        const price = Number(dynamicMap[product.id]?.price) || 0;

        if (price <= 0 && (hasMinPrice || hasMaxPrice)) {
          return false;
        }

        if (hasMinPrice && Number.isFinite(minPrice) && price < minPrice) {
          return false;
        }

        if (hasMaxPrice && Number.isFinite(maxPrice) && price > maxPrice) {
          return false;
        }

        return true;
      });
    }

    switch (sortParam) {
      case "price-asc":
        result = [...result].sort(
          (a, b) =>
            (Number(dynamicMap[a.id]?.price) || 0) -
            (Number(dynamicMap[b.id]?.price) || 0)
        );
        break;
      case "price-desc":
        result = [...result].sort(
          (a, b) =>
            (Number(dynamicMap[b.id]?.price) || 0) -
            (Number(dynamicMap[a.id]?.price) || 0)
        );
        break;
      case "name-asc":
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return result;
  }, [catalogProducts, searchParam, sortParam, minPriceParam, maxPriceParam, dynamicMap]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.replace(`/products?${params.toString()}`);
  };

  const hasActiveFilters = Boolean(
    searchParam || sortParam || minPriceParam || maxPriceParam
  );

  const clearAllFilters = () => {
    router.replace("/products");
  };

  return (
    <div className="min-h-screen bg-[color:var(--ivory)] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[color:var(--muted)] mb-6 hover:text-[color:var(--wine)] transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        <div className="lux-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-semibold lux-serif text-[color:var(--plum)]">
                {getListingHeading({ searchParam, viewParam, recipientParam, categoryParam })}
              </h1>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                {rows.length} gift{rows.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sortParam}
                onChange={(event) => updateParams("sort", event.target.value)}
                aria-label="Sort products"
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm font-medium text-[color:var(--plum)] outline-none focus:ring-2 focus:ring-[color:var(--gold)]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center text-sm text-[color:var(--muted)] hover:text-[color:var(--wine)] transition-colors"
                >
                  <X size={16} className="mr-1" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {catalogLoading ? (
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="lux-card overflow-hidden">
                  <div className="aspect-[4/5] w-full bg-[color:var(--border)]/70 animate-pulse" />
                  <div className="space-y-3 p-3">
                    <div className="h-4 w-3/4 rounded bg-[color:var(--border)]/70 animate-pulse" />
                    <div className="h-5 w-1/2 rounded bg-[color:var(--border)]/70 animate-pulse" />
                    <div className="h-8 rounded bg-[color:var(--border)]/70 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[color:var(--muted)] mb-4">
                No gifts found
                {searchParam ? ` matching "${searchParam}"` : ""}
                .
                Try another mood or collection.
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={clearAllFilters}
                  className="bg-[color:var(--wine)] text-[color:var(--ivory)] px-4 py-2 rounded-xl hover:bg-[#3b182f] transition-all"
                >
                  View All Gifts
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex items-center justify-center border border-[color:var(--border)] text-[color:var(--plum)] px-4 py-2 rounded-xl hover:bg-[color:var(--border)]/30 transition-colors"
                >
                  <Home size={16} className="mr-2" />
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {rows.map((product) => (
                <article
                  key={product.id}
                  className="group lux-card overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
                  onClick={() => router.push(`/products/${product.slug}`)}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[color:var(--ivory)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images[0] || "/placeholder-image.jpg"}
                      alt={product.title}
                      className="h-full w-full object-cover object-center transition-transform duration-500 md:group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-[color:var(--surface)] text-[color:var(--wine)] px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                        Curated
                      </span>
                    </div>
                    <div
                      className="absolute top-2 right-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ProductShareButton
                        slug={product.slug}
                        title={product.title}
                        price={
                          Number(dynamicMap[product.id]?.price) > 0
                            ? Number(dynamicMap[product.id]?.price)
                            : undefined
                        }
                        image={product.images[0]}
                        className="h-9 w-9 rounded-full bg-[color:var(--surface)]/95 text-[color:var(--muted)] shadow-sm hover:bg-[color:var(--surface)] hover:text-[color:var(--wine)]"
                      />
                    </div>
                  </div>

                  <div className="p-3 space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-[color:var(--muted)]">
                        {product.category}
                      </p>
                      <h2 className="font-medium text-[color:var(--plum)] text-sm line-clamp-2">
                        {product.title}
                      </h2>
                    </div>

                    <ProductDynamicFields
                      productId={product.id}
                      initialFields={dynamicMap[product.id] ?? null}
                    />

                    <button
                      className="w-full bg-[color:var(--wine)] text-[color:var(--ivory)] px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#3b182f] transition-all"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/products/${product.slug}`);
                      }}
                    >
                      View Gift
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
