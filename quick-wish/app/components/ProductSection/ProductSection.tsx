// // src/components/ProductSection/ProductSection.tsx
// import { Product } from '@/app/types';
// import { Star } from 'lucide-react';


// interface ProductSectionProps {
//   title: string;
//   products: Product[];
// }

// const ProductSection = ({ title, products }: ProductSectionProps) => {
//   return (
//     <section className="bg-white py-6 px-4 mt-2">
//       <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
//       <div className="grid grid-cols-2 gap-4">
//         {products.map((product) => (
//           <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden">
//             <div className="relative">
//               <img 
//                 src={product.image} 
//                 alt={product.name}
//                 className="w-full h-32 object-cover"
//               />
//               <div className="absolute top-2 left-2">
//                 <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
//                   {product.badge}
//                 </span>
//               </div>
//               <div className="absolute top-2 right-2">
//                 <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
//                   {product.discount}
//                 </span>
//               </div>
//             </div>

//             <div className="p-3">
//               <h3 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h3>

//               <div className="flex items-center mb-2">
//                 <div className="flex items-center">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={`h-3 w-3 ${
//                         i < Math.floor(product.rating)
//                           ? 'text-yellow-400 fill-current'
//                           : 'text-gray-300'
//                       }`}
//                     />
//                   ))}
//                 </div>
//                 <span className="text-xs text-gray-600 ml-1">({product.reviews})</span>
//               </div>

//               <div className="flex items-center justify-between">
//                 <div>
//                   <span className="text-lg font-bold text-pink-600">{product.price}</span>
//                   <span className="text-xs text-gray-500 line-through ml-1">{product.originalPrice}</span>
//                 </div>
//                 <button className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700">
//                   Add
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default ProductSection;
// src/components/ProductSection/ProductSection.tsx

// src/components/ProductSection/ProductSection.tsx


// 'use client';

// import { useState, useEffect } from 'react';
// import { Product } from '../../types/index';
// import { Star } from 'lucide-react';

// interface ProductSectionProps {
//   title: string;
// }

// const ProductSection = ({ title }: ProductSectionProps) => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const API_URL = 'http://localhost:5000/api/v1/product';

//   // Helper function to format price
//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0,
//     }).format(price);
//   };

//   // Helper function to calculate discount percentage
//   const calculateDiscount = (originalPrice: number, currentPrice: number) => {
//     return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
//   };


//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await fetch(API_URL);
//         const data = await response.json();
//         console.log('Fetched products:', data);
//         setProducts(data.products);
//       } catch (err) {
//         console.error('Error fetching products:', err);
//       }
//     };

//     fetchProducts();
//   }, []);

//   return (
//     <section className="bg-white py-6 px-4 mt-2">
//       <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
//       <div className="grid grid-cols-2 gap-4">
//         {products.map((product) => {
//           const originalPrice = product.originalPrice || product.price * 1.3; // Fallback if no original price
//           const discountPercent = product.discountPercent || calculateDiscount(originalPrice, product.price);

//           return (
//             <div key={product._id} className="bg-gray-50 rounded-lg overflow-hidden">
//               <div className="relative">
//                 <img 
//                   src={product.images[0] || '/placeholder-image.jpg'} 
//                   alt={product.name}
//                   className="w-full h-32 object-cover"
//                 />
//                 {product.badge && (
//                   <div className="absolute top-2 left-2">
//                     <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
//                       {product.badge}
//                     </span>
//                   </div>
//                 )}
//                 {discountPercent > 0 && (
//                   <div className="absolute top-2 right-2">
//                     <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
//                       {discountPercent}% OFF
//                     </span>
//                   </div>
//                 )}
//               </div>

//               <div className="p-3">
//                 <h3 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h3>

//                 <div className="flex items-center mb-2">
//                   <div className="flex items-center">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`h-3 w-3 ${
//                           i < Math.floor(product.rating || 0)
//                             ? 'text-yellow-400 fill-current'
//                             : 'text-gray-300'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                   <span className="text-xs text-gray-600 ml-1">
//                     ({product.reviews || 0})
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <span className="text-lg font-bold text-pink-600">
//                       {formatPrice(product.price)}
//                     </span>
//                     {discountPercent > 0 && (
//                       <span className="text-xs text-gray-500 line-through ml-1">
//                         {formatPrice(originalPrice)}
//                       </span>
//                     )}
//                   </div>
//                   <button className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700">
//                     Add
//                   </button>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// };

// export default ProductSection;

// 'use client';

// import { useState, useEffect } from 'react';
// import {  useRouter } from 'next/navigation';
// import { Product } from '../../types/index';
// import { Star } from 'lucide-react';

// // Product Listing Component
//  export default function ProductSection  ({ title }: { title: string }) {
//   const [products, setProducts] = useState<Product[]>([]);
//   const router = useRouter();
//   const API_URL = 'http://localhost:5000/api/v1/product';

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await fetch(API_URL);
//         const data = await response.json();
//         setProducts(data.products);
//       } catch (err) {
//         console.error('Error fetching products:', err);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0,
//     }).format(price);
//   };

//   const calculateDiscount = (originalPrice: number, currentPrice: number) => {
//     return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
//   };

//   const handleProductClick = (productId: string) => {
//     router.push(`/products/${productId}`);
//     console.log(productId)
//   };
//   return (
//     <section className="bg-white py-6 px-4 mt-2">
//       <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
//       <div className="grid grid-cols-2 gap-4">
//         {products.map((product) => {
//           const originalPrice = product.originalPrice || product.price * 1.3;
//           const discountPercent = product.discountPercent || 
//             calculateDiscount(originalPrice, product.price);

//           return (

//             <div 
//               key={product._id} 
//               className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
//               onClick={() => handleProductClick(product._id!)}
//             >
//               <div className="relative">
//                 <img 
//                   src={product.images[0] || '/placeholder-image.jpg'} 
//                   alt={product.name}
//                   className="w-full h-32 object-cover"
//                 />
//                 {product.badge && (
//                   <div className="absolute top-2 left-2">
//                     <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
//                       {product.badge}
//                     </span>
//                   </div>
//                 )}
//                 {discountPercent > 0 && (
//                   <div className="absolute top-2 right-2">
//                     <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
//                       {discountPercent}% OFF
//                     </span>
//                   </div>
//                 )}
//               </div>

//               <div className="p-3">
//                 <h3 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h3>

//                 <div className="flex items-center mb-2">
//                   <div className="flex items-center">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`h-3 w-3 ${
//                           i < Math.floor(product.rating || 0)
//                             ? 'text-yellow-400 fill-current'
//                             : 'text-gray-300'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                   <span className="text-xs text-gray-600 ml-1">
//                     ({product.reviews || 0})
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <span className="text-lg font-bold text-pink-600">
//                       {formatPrice(product.price)}
//                     </span>
//                     {discountPercent > 0 && (
//                       <span className="text-xs text-gray-500 line-through ml-1">
//                         {formatPrice(originalPrice)}
//                       </span>
//                     )}
//                   </div>
//                   <button 
//                     className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700"
//                     onClick={(e) => {
//                       e.stopPropagation();

//                     }}
//                   >
//                     Add
//                   </button>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// };
// components/ProductSection.tsx



'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../../types/index';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import OrderPaymentModal from '../OrderPaymentModal';
import AuthModal from '../../components/AuthModel';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const ProductSection = ({ title }: { title: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        if (!API_BASE_URL) {
          throw new Error('API URL is not configured');
        }

        const response = await fetch(`${API_BASE_URL}/product`);
        const data = await response.json();
        console.log(data)
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (originalPrice: number, currentPrice: number) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const urgencyTag = (price: number, discountPercent: number, index: number) => {
    if (price > 0 && price <= 299) return 'Under Rs 299';
    if (price > 0 && price <= 499) return 'Under Rs 499';
    if (discountPercent >= 40) return `${discountPercent}% OFF`;
    const badges = ['Most Loved', 'Fast Selling', 'Best for Birthdays'];
    return badges[index % badges.length];
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  if (loading) {
    return (
      <section className="bg-[color:var(--ivory)] py-8 px-4 mt-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold lux-serif text-[color:var(--plum)]">{title}</h2>
              <p className="text-sm text-[color:var(--muted)]">Chosen for quiet impact and lasting warmth.</p>
            </div>
          </div>
          <div className="flex snap-x gap-6 overflow-x-auto pb-4 pr-4 hide-scrollbar">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[86vw] max-w-[18rem] flex-shrink-0 snap-start overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm sm:w-72">
              <div className="h-72 bg-[color:var(--border)]/60 animate-pulse"></div>
              <div className="p-3">
                <div className="h-4 bg-[color:var(--border)]/70 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-[color:var(--border)]/70 rounded w-1/2 mb-3 animate-pulse"></div>
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-[color:var(--border)]/70 rounded w-1/3 animate-pulse"></div>
                  <div className="h-6 bg-[color:var(--border)]/70 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-[color:var(--ivory)] py-8 px-4 mt-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold lux-serif text-[color:var(--plum)]">{title}</h2>
              <p className="text-sm text-[color:var(--muted)]">A small edit of gifts people choose when the moment really matters.</p>
            </div>
            <button
              className="inline-flex w-max items-center rounded-full border border-[#eadfd4] bg-white px-4 py-2 text-sm font-semibold text-[#2b1d25] transition hover:border-[#c9a36a] hover:bg-[#fffaf4]"
              onClick={() => router.push('/products')}
            >
              View All Best Sellers
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </button>
          </div>
          <div className="flex snap-x gap-6 overflow-x-auto pb-4 pr-4 hide-scrollbar">
          {products.slice(0, 6).map((product, index) => {
            const currentPrice = Number(product.price);
            const originalCandidate = Number(product.originalPrice ?? product.offPrice ?? 0);
            const safeCurrentPrice =
              Number.isFinite(currentPrice) && currentPrice > 0
                ? currentPrice
                : Number.isFinite(originalCandidate)
                  ? originalCandidate
                  : 0;
            const safeOriginalPrice = Number.isFinite(originalCandidate) ? originalCandidate : 0;
            const computedOriginalPrice = safeOriginalPrice > 0 ? safeOriginalPrice : safeCurrentPrice * 1.3;
            const hasDiscount = safeCurrentPrice > 0 && computedOriginalPrice > safeCurrentPrice;
            const discountPercent = hasDiscount
              ? (product.discountPercent ?? calculateDiscount(computedOriginalPrice, safeCurrentPrice))
              : 0;

            return (
              <motion.div
                key={product._id}
                className="w-[86vw] max-w-[18rem] flex-shrink-0 snap-start cursor-pointer overflow-hidden rounded-lg border border-[#eadfd4] bg-white shadow-[0_14px_30px_rgba(43,29,37,0.07)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(43,29,37,0.12)] sm:w-72"
                onClick={() => product._id && handleProductClick(product._id)}
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <div className="relative overflow-hidden bg-[#fbf4ec]">
                  <motion.img
                    src={product.images[0] || '/placeholder-image.jpg'}
                    alt={product.name}
                    className="h-72 w-full object-cover transition duration-500 hover:scale-105"
                    loading="lazy"
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.035 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#b54e36] shadow-sm">
                      {urgencyTag(safeCurrentPrice, discountPercent, index)}
                    </span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-[#c9a36a] px-2 py-1 text-xs font-bold text-[#2b1d25] shadow-sm">
                        {discountPercent}% OFF
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-[#2b1d25] text-base mb-2 line-clamp-2 leading-snug">{product.name}</h3>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-semibold text-[#4a1f3b]">
                        {formatPrice(safeCurrentPrice)}
                      </span>

                      {hasDiscount && (
                        <span className="text-xs text-[#7b6a73] line-through ml-1">
                          {formatPrice(computedOriginalPrice)}
                        </span>
                      )}
                    </div>
                    <motion.button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--wine)] px-4 py-2.5 text-sm font-bold text-[color:var(--ivory)] transition-all hover:bg-[#3b182f]"
                      onClick={(e) => handleAddToCart(product, e)}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Add
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>
      </section>

      {selectedProduct && (
        <OrderPaymentModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          productId={selectedProduct._id!}
          productName={selectedProduct.name}
          productPrice={selectedProduct.price}
          productImage={selectedProduct.images[0]}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signin"
      />
    </>
  );
};

export default ProductSection;



