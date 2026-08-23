"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import ProductCard from "../ProductCard";
import type { Product } from "../../types";

type FeaturedGiftsProps = {
  products: Product[];
};

export default function FeaturedGifts({ products }: FeaturedGiftsProps) {
  const router = useRouter();
  const visibleProducts = products.slice(0, 3).filter((product) => product._id);

  if (visibleProducts.length === 0) return null;

  return (
    <section className="bg-[color:var(--ivory)] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="lux-serif text-2xl font-semibold text-[color:var(--plum)] sm:text-3xl">
              Featured Gifts / Our Best Picks
            </h2>
            <p className="text-sm text-[color:var(--muted)]">
              Hand-picked gifts chosen by QuickWish.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id || product.name}
              name={product.name}
              price={Number(product.price) || 0}
              originalPrice={product.originalPrice || product.offPrice}
              image={product.images?.[0] || "/placeholder-image.jpg"}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="inline-flex items-center rounded-full bg-[color:var(--wine)] px-6 py-3 text-sm font-bold text-[color:var(--ivory)] transition hover:bg-[#3b182f]"
          >
            View More Gifts
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
