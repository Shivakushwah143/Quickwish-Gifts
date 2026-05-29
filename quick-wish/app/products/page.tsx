import { Suspense } from "react";
import {
  fetchStaticProducts,
  PRODUCT_REVALIDATE_SECONDS,
} from "../lib/productCatalog";
import ProductListClient from "./ProductListClient";

export const revalidate = PRODUCT_REVALIDATE_SECONDS;

function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[color:var(--ivory)] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-8 bg-[color:var(--border)]/70 rounded w-1/4 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="lux-card overflow-hidden">
              <div className="w-full h-44 bg-[color:var(--border)]/70 animate-pulse" />
              <div className="p-3 space-y-3">
                <div className="h-4 bg-[color:var(--border)]/70 rounded w-3/4 animate-pulse" />
                <div className="h-5 bg-[color:var(--border)]/70 rounded w-1/2 animate-pulse" />
                <div className="h-8 bg-[color:var(--border)]/70 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ProductsPage() {
  const products = await fetchStaticProducts();

  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductListClient products={products} />
    </Suspense>
  );
}
