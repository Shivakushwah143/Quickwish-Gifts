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
import { Star } from 'lucide-react';
import OrderPaymentModal from '../OrderPaymentModal';
import AuthModal from '../../components/AuthModel';

const API_BASE_URL =" https://quickwish-gifts.onrender.com/api/v1";

const ProductSection = ({ title }: { title: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
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
      <section className="bg-white py-6 px-4 mt-2">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="w-full h-32 bg-gray-200 animate-pulse"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-white py-6 px-4 mt-2">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => {
            const originalPrice = product.originalPrice || product.price * 1.3;
            const discountPercent = product.discountPercent ||
              calculateDiscount(originalPrice, product.price);

            return (
              <div
                key={product._id}
                className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                onClick={() => product._id && handleProductClick(product._id)}
              >
                <div className="relative">
                  <img
                    src={product.images[0] || '/placeholder-image.jpg'}
                    alt={product.name}
                    className="w-full h-32 object-cover"
                  />
                  {product.badge && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {product.badge}
                      </span>
                    </div>
                  )}
                  {discountPercent > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {discountPercent}% OFF
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">{product.name}</h3>

                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Math.floor(product.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 ml-1">
                      ({product.reviews || 0})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-pink-600">
                        {formatPrice(product.originalPrice ?? product.originalPrice as any)}

                      </span>

                      {product.discountPercent as any > 0 && (
                        <span className="text-xs text-gray-500 line-through ml-1">
                          {formatPrice(product.originalPrice as any)}
                        </span>
                      )}
                    </div>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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