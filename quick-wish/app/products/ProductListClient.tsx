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

const categoryAliases: Record<string, string[]> = {
  "birthday hampers": ["birthday", "cakes", "chocolate bouquets"],
  "couple gifts": ["anniversary", "valentine's day"],
  "friendship gifts": ["besti"],
  "custom hampers": ["personalized gifts", "customized mugs", "photo frames"],
  coustomize: ["personalized gifts", "customized mugs", "photo frames"],
  personalized: ["personalized gifts"],
  flowers: ["fresh flowers", "flower bouquets"],
  chocolates: ["chocolate bouquets"],
};

const normalizeFilterValue = (value: string): string =>
  value.trim().toLowerCase();

const getFilterValues = (category: string): string[] => {
  const normalized = normalizeFilterValue(category);
  return [normalized, ...(categoryAliases[normalized] || [])];
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
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";

  const [dynamicMap, setDynamicMap] = useState<Record<string, DynamicProductFields>>({});

  // Persist any ?ref=CODE creator referral from a shared listing link.
  useEffect(() => {
    captureReferralFromCurrentUrl();
  }, []);

  // Batch-fetch live price/stock once for the whole listing (kills N+1).
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const map = await fetchDynamicProducts();

      if (isMounted) {
        setDynamicMap(map);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    let result = products;

    if (categoryParam) {
      const selectedValues = getFilterValues(categoryParam);
      result = result.filter((product) =>
        selectedValues.includes(normalizeFilterValue(product.category))
      );
    }

    if (searchParam) {
      const needle = searchParam.trim().toLowerCase();

      if (needle) {
        result = result.filter((product) => {
          const haystack = [
            product.title,
            product.category,
            product.description,
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(needle);
        });
      }
    }

    const minPrice = Number(minPriceParam);
    const maxPrice = Number(maxPriceParam);

    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
      result = result.filter((product) => {
        const price = Number(dynamicMap[product.id]?.price) || 0;

        if (price <= 0) {
          return false;
        }

        if (Number.isFinite(minPrice) && price < minPrice) {
          return false;
        }

        if (Number.isFinite(maxPrice) && price > maxPrice) {
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
  }, [products, categoryParam, searchParam, sortParam, minPriceParam, maxPriceParam, dynamicMap]);

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
    categoryParam || searchParam || sortParam || minPriceParam || maxPriceParam
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
                {searchParam
                  ? `Search: ${searchParam}`
                  : categoryParam
                    ? `Gifts in ${categoryParam}`
                    : "All Gifts"}
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

          {rows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[color:var(--muted)] mb-4">
                No gifts found
                {searchParam ? ` matching "${searchParam}"` : ""}
                {categoryParam ? ` in ${categoryParam}` : ""}.
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
                  className="lux-card overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
                  onClick={() => router.push(`/products/${product.slug}`)}
                >
                  <div className="relative bg-[color:var(--ivory)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images[0] || "/placeholder-image.jpg"}
                      alt={product.title}
                      className="w-full h-44 object-cover"
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
