
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product } from "../types";
import {
  Star,
  ArrowLeft,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import OrderPaymentModal from "../components/OrderPaymentModal";
import AuthModal from "../components/AuthModel";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;;

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/product/${productId}`);
        const data = await res.json();
        setProduct(data.singleProduct || data.product || data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const calculateDiscount = (originalPrice: number, currentPrice: number) =>
    Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const nextImage = () =>
    product?.images &&
    setSelectedImage((prev) => (prev + 1) % product.images.length);

  const prevImage = () =>
    product?.images &&
    setSelectedImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );

  const handleAddToCart = () => {
    if (!product) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsOrderModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--ivory)]">
        <p className="text-lg">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--ivory)]">
        <div className="text-center">
          <p className="text-lg text-[color:var(--muted)] mb-4">Product not found</p>
          <button
            onClick={() => router.back()}
            className="bg-[color:var(--wine)] text-[color:var(--ivory)] px-4 py-2 rounded-xl hover:bg-[#3b182f] transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = Number(product.price);
  const originalCandidate = Number(product.originalPrice ?? product.offPrice ?? 0);
  const safeCurrentPrice =
    Number.isFinite(currentPrice) && currentPrice > 0
      ? currentPrice
      : Number.isFinite(originalCandidate)
        ? originalCandidate
        : 0;
  const safeOriginalPrice = Number.isFinite(originalCandidate) ? originalCandidate : 0;
  const computedOriginalPrice =
    safeOriginalPrice > 0 ? safeOriginalPrice : safeCurrentPrice * 1.3;
  const hasDiscount = safeCurrentPrice > 0 && computedOriginalPrice > safeCurrentPrice;
  const discountPercent = hasDiscount
    ? (product.discountPercent ?? calculateDiscount(computedOriginalPrice, safeCurrentPrice))
    : 0;

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
            {/* Product Images */}
            <div className="relative">
              <div className="h-80 w-full overflow-hidden rounded-xl mb-4 relative">
                <img
                  src={product.images?.[selectedImage] || "/placeholder.jpg"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />

                {product.images?.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[color:var(--ivory)] p-2 rounded-full shadow-md hover:bg-white transition"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[color:var(--ivory)] p-2 rounded-full shadow-md hover:bg-white transition"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`h-20 cursor-pointer rounded-md overflow-hidden ${
                        selectedImage === i ? "ring-2 ring-[color:var(--gold)]" : ""
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[color:var(--plum)] mb-2 lux-serif">
                {product.name}
              </h1>

              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 0)
                        ? "text-[color:var(--gold)] fill-current"
                        : "text-[color:var(--border)]"
                    }`}
                  />
                ))}
                <span className="text-sm text-[color:var(--muted)] ml-2">
                  ({product.reviews || 0} reviews)
                </span>
              </div>

              {product.badge && (
                <span className="inline-block bg-[color:var(--wine)]/10 text-[color:var(--wine)] text-xs font-medium px-2.5 py-0.5 rounded-full mb-4">
                  {product.badge}
                </span>
              )}

              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-3xl font-semibold text-[color:var(--wine)]">
                    {formatPrice(safeCurrentPrice)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-[color:var(--muted)] line-through ml-2">
                        {formatPrice(computedOriginalPrice)}
                      </span>
                      <span className="ml-3 bg-[color:var(--gold)]/20 text-[color:var(--plum)] text-sm font-medium px-2 py-0.5 rounded-full">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="lux-pill px-3 py-1 text-xs max-w-full text-center leading-tight whitespace-normal break-words">
                    Same Day Delivery - ₹49 extra (Indore only)
                  </span>
                  <span className="text-sm text-[color:var(--muted)]">Inclusive of all taxes</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-[color:var(--plum)] mb-2">
                  Description
                </h3>
                <p className="text-[color:var(--muted)]">{product.description}</p>
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
                  onClick={handleAddToCart}
                  className="flex-1 bg-[color:var(--wine)] text-[color:var(--ivory)] py-2 px-4 rounded-xl font-medium hover:bg-[#3b182f] flex items-center justify-center transition-all"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Buy Now
                </button>

                <button className="p-2 border border-[color:var(--border)] rounded-xl text-[color:var(--muted)] hover:bg-[color:var(--border)]/30 transition">
                  <Heart size={20} />
                </button>
              </div>

              <div className="border-t border-[color:var(--border)] pt-4">
                <h3 className="text-lg font-medium text-[color:var(--plum)] mb-2">
                  Product Details
                </h3>
                <ul className="text-[color:var(--muted)] space-y-1">
                  <li>
                    <span className="font-medium">Category:</span>{" "}
                    {product.category}
                  </li>
                  <li>
                    <span className="font-medium">Stock:</span>{" "}
                    {product.stock}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {product && (
  <OrderPaymentModal
    isOpen={isOrderModalOpen}
    onClose={() => setIsOrderModalOpen(false)}
    productId={product._id!}
    productName={product.name}
    productPrice={safeCurrentPrice}
    productImage={product.images[0]}
    originalPrice={computedOriginalPrice}
    discountPercent={
      hasDiscount
        ? (product.discountPercent ?? calculateDiscount(computedOriginalPrice, safeCurrentPrice))
        : 0
    } 
  />
)}


      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signin"
      />
    </div>
  );
}

