"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  ShoppingCart,
  X,
} from "lucide-react";
import type { PriceComparison, StaticProduct } from "../lib/productCatalog";
import ProductDynamicFields from "../products/ProductDynamicFields";
import OrderPaymentModal from "./OrderPaymentModal";
import AuthModal from "./AuthModel";
import ProductShareButton from "./ProductShareButton";
import { captureReferralFromCurrentUrl } from "../lib/productShare";

type ProductDetailPageProps = {
  product: StaticProduct;
};

type DynamicProduct = {
  price?: number;
  originalPrice?: number;
  offPrice?: number;
  discountPercent?: number;
  stock?: number;
  comparisons?: PriceComparison[];
};

type ProductResponse = {
  singleProduct?: DynamicProduct;
  product?: DynamicProduct;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const getValidComparisons = (comparisons: PriceComparison[] | undefined): PriceComparison[] => {
  return (comparisons || []).filter((comparison) => {
    if (!comparison.siteName || !Number.isFinite(Number(comparison.price)) || Number(comparison.price) <= 0) {
      return false;
    }

    try {
      const url = new URL(comparison.url);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  });
};

const isProductResponse = (
  value: ProductResponse | DynamicProduct
): value is ProductResponse => {
  return "singleProduct" in value || "product" in value;
};

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
  const images = Array.isArray(product.images) ? product.images : [];
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [dynamicProduct, setDynamicProduct] = useState<DynamicProduct | null>(
    null
  );
  const router = useRouter();

  // Persist any ?ref=CODE creator referral from a shared link so it survives
  // through gift customization and checkout.
  useEffect(() => {
    captureReferralFromCurrentUrl();
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setIsOrderModalOpen(false);
      setIsAuthModalOpen(true);
    };

    window.addEventListener("quickwish:auth-expired", handleAuthExpired);
    return () => window.removeEventListener("quickwish:auth-expired", handleAuthExpired);
  }, []);

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
    if (images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setSelectedImage(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  const handleBuyNow = () => {
    if (!dynamicProduct?.price) {
      return;
    }

    setIsOrderModalOpen(true);
  };

  const selectedProductImage =
    images[selectedImage] || images[0] || "/placeholder.jpg";
  const currentPrice = Number(dynamicProduct?.price || 0);
  const originalPrice = Number(
    dynamicProduct?.originalPrice || dynamicProduct?.offPrice || 0
  );
  const availableStock = Number(dynamicProduct?.stock || 0);
  const maxQuantity = availableStock > 0 ? availableStock : 10;
  const comparisons = getValidComparisons(dynamicProduct?.comparisons || product.comparisons);
  const hasComparisons = comparisons.length > 0 && currentPrice > 0;

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
              <div className="h-72 w-full overflow-hidden rounded-xl mb-4 relative bg-[#fbf4ec] sm:h-80">
                <img
                  src={selectedProductImage}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />

                {images.length > 1 && (
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

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
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
                <ProductDynamicFields
                  productId={product.id}
                  mode="detail"
                  priceAction={
                    <div className="ml-1 flex items-center gap-2">
                      <ProductShareButton
                        variant="icon"
                        slug={product.slug}
                        title={product.title}
                        price={currentPrice > 0 ? currentPrice : undefined}
                        image={selectedProductImage !== "/placeholder.jpg" ? selectedProductImage : undefined}
                        description={product.description}
                        fallback="copy"
                        className="h-10 w-10 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] shadow-sm hover:border-[color:var(--gold)] hover:text-[color:var(--wine)] hover:shadow-md"
                      />
                      {hasComparisons && (
                        <button
                          type="button"
                          onClick={() => setIsCompareOpen(true)}
                          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-xs font-bold text-[color:var(--muted)] shadow-sm transition hover:border-[color:var(--gold)] hover:text-[color:var(--wine)] hover:shadow-md"
                        >
                          <span aria-hidden="true">⇄</span>
                          Compare
                        </button>
                      )}
                    </div>
                  }
                />
              </div>

              <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:space-x-4 sm:gap-0">
                <div className="flex items-center border border-[color:var(--border)] rounded-xl">
                  <button
                    className="px-4 py-3 text-[color:var(--muted)] hover:bg-[color:var(--border)]/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="min-w-8 px-3 py-3 text-center">{quantity}</span>
                  <button
                    className="px-4 py-3 text-[color:var(--muted)] hover:bg-[color:var(--border)]/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={availableStock > 0 && quantity >= availableStock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                {availableStock > 0 && availableStock <= 5 && (
                  <span className="text-xs font-semibold text-[color:var(--warning)]">
                    Only {availableStock} left in stock
                  </span>
                )}

                <button
                  onClick={handleBuyNow}
                  disabled={!dynamicProduct?.price}
                  className="flex-1 min-h-12 bg-[color:var(--wine)] text-[color:var(--ivory)] py-3 px-4 rounded-xl font-medium hover:bg-[#3b182f] flex items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {dynamicProduct?.price ? "Buy Now" : "Loading price"}
                </button>

                <button
                  className="self-start p-3 border border-[color:var(--border)] rounded-xl text-[color:var(--muted)] hover:bg-[color:var(--border)]/30 transition sm:self-auto"
                  aria-label="Save this gift"
                >
                  <Heart size={20} />
                </button>

              </div>

              <div className="mb-6">
                <h2 className="text-lg font-medium text-[color:var(--plum)] mb-2">
                  Description
                </h2>
                <p className="max-w-prose text-[color:var(--muted)] leading-7">
                  {product.description}
                </p>
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
        quantity={quantity}
        maxStock={availableStock}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signin"
      />

      {hasComparisons && isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-0 sm:items-center sm:justify-center sm:p-4">
          <div className="w-full rounded-t-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[color:var(--plum)] lux-serif">Compare prices</h2>
              <button
                type="button"
                onClick={() => setIsCompareOpen(false)}
                className="rounded-full p-2 text-[color:var(--muted)] hover:bg-[color:var(--border)]/40"
                aria-label="Close price comparison"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-[color:var(--gold)] bg-[color:var(--tint-peach)] px-4 py-3">
                <div>
                  <p className="font-bold text-[color:var(--plum)]">QuickWish</p>
                  <p className="text-xs font-semibold text-[color:var(--wine)]">Best value</p>
                </div>
                <p className="font-bold text-[color:var(--wine)]">{formatCurrency(currentPrice)}</p>
              </div>

              {comparisons.map((comparison, index) => {
                const competitorPrice = Number(comparison.price);
                const savings = competitorPrice - currentPrice;

                return (
                  <div
                    key={`${comparison.siteName}-${index}`}
                    className="flex flex-col gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--ivory)]/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-[color:var(--plum)]">{comparison.siteName}</p>
                      {savings > 0 && (
                        <p className="text-xs font-semibold text-emerald-700">
                          Save {formatCurrency(savings)} with QuickWish
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <p className="font-bold text-[color:var(--plum)]">{formatCurrency(competitorPrice)}</p>
                      <a
                        href={comparison.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs font-bold text-[color:var(--wine)] hover:bg-[color:var(--surface)]"
                      >
                        View site
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs font-medium text-[color:var(--muted)]">
              Prices may change on external websites.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
