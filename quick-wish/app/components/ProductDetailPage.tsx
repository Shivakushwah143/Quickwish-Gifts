"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
} from "lucide-react";
import type { StaticProduct } from "../lib/productCatalog";
import ProductDynamicFields from "../products/ProductDynamicFields";
import OrderPaymentModal from "./OrderPaymentModal";
import AuthModal from "./AuthModel";

type ProductDetailPageProps = {
  product: StaticProduct;
};

type DynamicProduct = {
  price?: number;
  originalPrice?: number;
  offPrice?: number;
  discountPercent?: number;
};

type ProductResponse = {
  singleProduct?: DynamicProduct;
  product?: DynamicProduct;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const isProductResponse = (
  value: ProductResponse | DynamicProduct
): value is ProductResponse => {
  return "singleProduct" in value || "product" in value;
};

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [dynamicProduct, setDynamicProduct] = useState<DynamicProduct | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchDynamicProduct = async () => {
      if (!API_BASE_URL) return;

      try {
        const response = await fetch(`${API_BASE_URL}/product/${product.id}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as ProductResponse | DynamicProduct;
        const nextProduct = isProductResponse(data)
          ? data.singleProduct || data.product
          : data;

        if (isMounted && nextProduct) {
          setDynamicProduct(nextProduct);
        }
      } catch (error) {
        console.error("Failed to load dynamic purchase fields", error);
      }
    };

    void fetchDynamicProduct();

    return () => {
      isMounted = false;
    };
  }, [product.id]);

  const nextImage = () => {
    if (product.images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images.length > 0) {
      setSelectedImage(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  };

  const handleBuyNow = () => {
    if (!dynamicProduct?.price) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsOrderModalOpen(true);
  };

  const selectedProductImage =
    product.images[selectedImage] || product.images[0] || "/placeholder.jpg";
  const currentPrice = Number(dynamicProduct?.price || 0);
  const originalPrice = Number(
    dynamicProduct?.originalPrice || dynamicProduct?.offPrice || 0
  );

  return (
    <div className="min-h-screen bg-[color:var(--ivory)] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[color:var(--muted)] mb-6 hover:text-[color:var(--wine)] transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Gifts
        </button>

        <div className="lux-card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div className="relative">
              <div className="h-80 w-full overflow-hidden rounded-xl mb-4 relative bg-[#fbf4ec]">
                <img
                  src={selectedProductImage}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />

                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-[color:var(--ivory)] p-2 rounded-full shadow-md hover:bg-white transition"
                      aria-label="Previous product image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-[color:var(--ivory)] p-2 rounded-full shadow-md hover:bg-white transition"
                      aria-label="Next product image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImage(index)}
                      className={`h-20 cursor-pointer rounded-md overflow-hidden ${
                        selectedImage === index
                          ? "ring-2 ring-[color:var(--gold)]"
                          : ""
                      }`}
                      aria-label={`View product image ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
                {product.category}
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[color:var(--plum)] mt-2 mb-4 lux-serif">
                {product.title}
              </h1>

              <div className="mb-6">
                <ProductDynamicFields productId={product.id} mode="detail" />
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-medium text-[color:var(--plum)] mb-2">
                  Description
                </h2>
                <p className="text-[color:var(--muted)] leading-7">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center border border-[color:var(--border)] rounded-xl">
                  <button
                    className="px-3 py-2 text-[color:var(--muted)] hover:bg-[color:var(--border)]/30 transition"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="px-3 py-2">{quantity}</span>
                  <button
                    className="px-3 py-2 text-[color:var(--muted)] hover:bg-[color:var(--border)]/30 transition"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={!dynamicProduct?.price}
                  className="flex-1 bg-[color:var(--wine)] text-[color:var(--ivory)] py-2 px-4 rounded-xl font-medium hover:bg-[#3b182f] flex items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {dynamicProduct?.price ? "Buy Now" : "Loading price"}
                </button>

                <button className="p-2 border border-[color:var(--border)] rounded-xl text-[color:var(--muted)] hover:bg-[color:var(--border)]/30 transition">
                  <Heart size={20} />
                </button>
              </div>

              <div className="border-t border-[color:var(--border)] pt-4">
                <h2 className="text-lg font-medium text-[color:var(--plum)] mb-2">
                  Gift Details
                </h2>
                <ul className="text-[color:var(--muted)] space-y-1">
                  <li>
                    <span className="font-medium">Category:</span>{" "}
                    {product.category}
                  </li>
                  <li>
                    <span className="font-medium">Personalization:</span>{" "}
                    Loaded live after page load
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderPaymentModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        productId={product.id}
        productName={product.title}
        productPrice={Number.isFinite(currentPrice) ? currentPrice : 0}
        productImage={selectedProductImage}
        originalPrice={Number.isFinite(originalPrice) ? originalPrice : undefined}
        discountPercent={dynamicProduct?.discountPercent}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signin"
      />
    </div>
  );
}
