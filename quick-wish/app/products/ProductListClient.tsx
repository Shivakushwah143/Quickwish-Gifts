"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Home, X } from "lucide-react";
import type { StaticProduct } from "../lib/productCatalog";
import ProductDynamicFields from "./ProductDynamicFields";

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

export default function ProductListClient({ products }: ProductListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const filteredProducts = useMemo(() => {
    if (!categoryParam) {
      return products;
    }

    const selectedValues = getFilterValues(categoryParam);

    return products.filter((product) =>
      selectedValues.includes(normalizeFilterValue(product.category))
    );
  }, [categoryParam, products]);

  const clearFilter = () => {
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
          <div className="flex items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold lux-serif text-[color:var(--plum)]">
              {categoryParam ? `Gifts in ${categoryParam}` : "All Gifts"}
            </h1>

            {categoryParam && (
              <button
                onClick={clearFilter}
                className="flex items-center text-sm text-[color:var(--muted)] hover:text-[color:var(--wine)] transition-colors"
              >
                <X size={16} className="mr-1" />
                Clear filter
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[color:var(--muted)] mb-4">
                No gifts found{categoryParam ? ` in ${categoryParam}` : ""}.
                Try another mood or collection.
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {categoryParam && (
                  <button
                    onClick={clearFilter}
                    className="bg-[color:var(--wine)] text-[color:var(--ivory)] px-4 py-2 rounded-xl hover:bg-[#3b182f] transition-all"
                  >
                    View All Gifts
                  </button>
                )}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="lux-card overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
                  onClick={() => router.push(`/products/${product.slug}`)}
                >
                  <div className="relative bg-[#fbf4ec]">
                    <img
                      src={product.images[0] || "/placeholder-image.jpg"}
                      alt={product.title}
                      className="w-full h-44 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-white text-[#b54e36] px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                        Curated
                      </span>
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

                    <ProductDynamicFields productId={product.id} />

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
