
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

const API_BASE_URL = "https://quickwish-gifts.onrender.com/api/v1";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Product not found</p>
          <button
            onClick={() => router.back()}
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const originalPrice = product.originalPrice || product.price * 1.3;
  const discountPercent =
    product.discountPercent ||
    calculateDiscount(originalPrice, product.price);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 mb-6 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Products
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="relative">
              <div className="h-80 w-full overflow-hidden rounded-lg mb-4 relative">
                <img
                  src={product.images?.[selectedImage] || "/placeholder.jpg"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />

                {product.images?.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
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
                        selectedImage === i ? "ring-2 ring-pink-500" : ""
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  ({product.reviews || 0} reviews)
                </span>
              </div>

              {product.badge && (
                <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded mb-4">
                  {product.badge}
                </span>
              )}

              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-pink-600">
                    {formatPrice( product.originalPrice as any)}
                  </span>
                  {discountPercent > 0 && (
                    <>
                      <span className="text-lg text-gray-500 line-through ml-2">
                        {formatPrice(product.offPrice as any)}
                      </span>
                      <span className="ml-3 bg-green-100 text-green-800 text-sm font-medium px-2 py-0.5 rounded">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Inclusive of all taxes
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-700">{product.description}</p>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center border rounded-md">
                  <button
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="px-3 py-2">{quantity}</span>
                  <button
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 flex items-center justify-center"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Buy Now
                </button>

                <button className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100">
                  <Heart size={20} />
                </button>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Product Details
                </h3>
                <ul className="text-gray-700 space-y-1">
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
    productPrice={product.price}       
    productImage={product.images[0]}
    originalPrice={product.originalPrice || product.price * 1.3} 
    discountPercent={
      product.discountPercent ||
      calculateDiscount(product.originalPrice || product.price * 1.3, product.price)
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
