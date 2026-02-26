

// // app/products/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { Product } from '../types';
// import { Star, Filter, X, ArrowLeft, Home } from 'lucide-react';

// // Define API base URL
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const categoryParam = searchParams.get('category');

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${API_BASE_URL}/product`);
//         const data = await response.json();
//         setProducts(data.products || []);
//       } catch (err) {
//         console.error('Error fetching products:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     if (categoryParam) {
//       setSelectedCategory(categoryParam);
//     }
//   }, [categoryParam]);

//   useEffect(() => {
//     if (selectedCategory) {
//       const filtered = products.filter(product => 
//         product.category?.toLowerCase() === selectedCategory.toLowerCase()
//       );
//       setFilteredProducts(filtered);
//     } else {
//       setFilteredProducts(products);
//     }
//   }, [products, selectedCategory]);

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

//   const clearFilter = () => {
//     setSelectedCategory(null);
//     // Also update the URL without the category parameter
//     window.history.replaceState({}, '', '/products');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="max-w-6xl mx-auto px-4">
//           {/* Back button */}
//           <button
//             onClick={() => router.back()}
//             className="flex items-center text-gray-600 mb-6 hover:text-gray-900"
//           >
//             <ArrowLeft size={20} className="mr-2" />
//             Back
//           </button>
          
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
//             <div className="grid grid-cols-2 gap-4">
//               {[...Array(6)].map((_, i) => (
//                 <div key={i} className="bg-gray-50 rounded-lg overflow-hidden">
//                   <div className="w-full h-32 bg-gray-200 animate-pulse"></div>
//                   <div className="p-3">
//                     <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
//                     <div className="h-3 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
//                     <div className="flex justify-between items-center">
//                       <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
//                       <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-6xl mx-auto px-4">
//         {/* Back button */}
//         <button
//           onClick={() => router.back()}
//           className="flex items-center text-gray-600 mb-6 hover:text-gray-900"
//         >
//           <ArrowLeft size={20} className="mr-2" />
//           Back
//         </button>
        
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h1 className="text-2xl font-bold text-gray-900">
//               {selectedCategory ? `Products in ${selectedCategory}` : 'All Products'}
//             </h1>
            
//             {selectedCategory && (
//               <button 
//                 onClick={clearFilter}
//                 className="flex items-center text-sm text-gray-600 hover:text-gray-900"
//               >
//                 <X size={16} className="mr-1" />
//                 Clear filter
//               </button>
//             )}
//           </div>

//           {filteredProducts.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="text-gray-500 mb-4">
//                 No products found{selectedCategory ? ` in ${selectedCategory}` : ''}.
//               </div>
//               <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                 {selectedCategory && (
//                   <button 
//                     onClick={clearFilter}
//                     className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
//                   >
//                     View All Products
//                   </button>
//                 )}
//                 <button 
//                   onClick={() => router.push('/')}
//                   className="flex items-center justify-center bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
//                 >
//                   <Home size={16} className="mr-2" />
//                   Back to Home
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 gap-4">
//               {filteredProducts.map((product) => {
//                 const originalPrice = product.originalPrice || product.price * 1.3;
//                 const discountPercent = product.discountPercent || 
//                   calculateDiscount(originalPrice, product.price);
                
//                 return (
//                   <div 
//                     key={product._id} 
//                     className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
//                     onClick={() => router.push(`/products/${product._id}`)}
//                   >
//                     <div className="relative">
//                       <img 
//                         src={product.images[0] || '/placeholder-image.jpg'} 
//                         alt={product.name}
//                         className="w-full h-32 object-cover"
//                       />
//                       {product.badge && (
//                         <div className="absolute top-2 left-2">
//                           <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
//                             {product.badge}
//                           </span>
//                         </div>
//                       )}
//                       {discountPercent > 0 && (
//                         <div className="absolute top-2 right-2">
//                           <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
//                             {discountPercent}% OFF
//                           </span>
//                         </div>
//                       )}
//                     </div>
                    
//                     <div className="p-3">
//                       <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">{product.name}</h3>
                      
//                       <div className="flex items-center mb-2">
//                         <div className="flex items-center">
//                           {[...Array(5)].map((_, i) => (
//                             <Star
//                               key={i}
//                               className={`h-3 w-3 ${
//                                 i < Math.floor(product.rating || 0)
//                                   ? 'text-yellow-400 fill-current'
//                                   : 'text-gray-300'
//                               }`}
//                             />
//                           ))}
//                         </div>
//                         <span className="text-xs text-gray-600 ml-1">
//                           ({product.reviews || 0})
//                         </span>
//                       </div>
                      
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <span className="text-lg font-bold text-pink-600">
//                             {formatPrice(product.price)}
//                           </span>
//                           {discountPercent > 0 && (
//                             <span className="text-xs text-gray-500 line-through ml-1">
//                               {formatPrice(originalPrice)}
//                             </span>
//                           )}
//                         </div>
//                         <button 
//                           className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             // Add to cart logic here
//                           }}
//                         >
//                           Add
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// app/products/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '../types';
import { Star, Filter, X, ArrowLeft, Home } from 'lucide-react';

// Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create a component that uses useSearchParams
function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/product`);
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (selectedCategory) {
      const selected = selectedCategory.toLowerCase();
      const filtered = products.filter(product =>
        product.category?.toLowerCase() === selected ||
        (product.tags || []).some(tag => tag.toLowerCase() === selected)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [products, selectedCategory]);

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

  const clearFilter = () => {
    setSelectedCategory(null);
    // Also update the URL without the category parameter
    window.history.replaceState({}, '', '/products');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--ivory)] py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-[color:var(--muted)] mb-6 hover:text-[color:var(--wine)] transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          
          <div className="lux-card p-6">
            <div className="h-8 bg-[color:var(--border)]/70 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="lux-card overflow-hidden">
                  <div className="w-full h-40 bg-[color:var(--border)]/70 animate-pulse"></div>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--ivory)] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-[color:var(--muted)] mb-6 hover:text-[color:var(--wine)] transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        
        <div className="lux-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold lux-serif text-[color:var(--plum)]">
              {selectedCategory ? `Gifts in ${selectedCategory}` : 'All Gifts'}
            </h1>
            
            {selectedCategory && (
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
                No gifts found{selectedCategory ? ` in ${selectedCategory}` : ''}. Try another mood or collection.
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {selectedCategory && (
                  <button 
                    onClick={clearFilter}
                    className="bg-[color:var(--wine)] text-[color:var(--ivory)] px-4 py-2 rounded-xl hover:bg-[#3b182f] transition-all"
                  >
                    View All Gifts
                  </button>
                )}
                <button 
                  onClick={() => router.push('/')}
                  className="flex items-center justify-center border border-[color:var(--border)] text-[color:var(--plum)] px-4 py-2 rounded-xl hover:bg-[color:var(--border)]/30 transition-colors"
                >
                  <Home size={16} className="mr-2" />
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => {
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
                  <div 
                    key={product._id} 
                    className="lux-card overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => router.push(`/products/${product._id}`)}
                  >
                    <div className="relative">
                      <img 
                        src={product.images[0] || '/placeholder-image.jpg'} 
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                      {product.badge && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-[color:var(--wine)] text-[color:var(--ivory)] px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                            {product.badge}
                          </span>
                        </div>
                      )}
                      {discountPercent > 0 && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-[color:var(--gold)] text-[color:var(--plum)] px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                            {discountPercent}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-medium text-[color:var(--plum)] text-sm mb-1 line-clamp-1">{product.name}</h3>
                      
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating || 0)
                                  ? 'text-[color:var(--gold)] fill-current'
                                  : 'text-[color:var(--border)]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[color:var(--muted)] ml-1">
                          ({product.reviews || 0})
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-semibold text-[color:var(--wine)]">
                            {formatPrice(safeCurrentPrice)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-[color:var(--muted)] line-through ml-1">
                              {formatPrice(computedOriginalPrice)}
                            </span>
                          )}
                          <div className="mt-1">
                            <span className="lux-pill px-2 py-0.5 text-[10px] tracking-wide">
                              Same Day Delivery - ₹49 extra (Indore only)
                            </span>
                          </div>
                        </div>
                        <button 
                          className="bg-[color:var(--wine)] text-[color:var(--ivory)] px-3 py-1 rounded-lg text-xs font-medium hover:bg-[#3b182f] transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add to cart logic here
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[color:var(--ivory)] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-8 bg-[color:var(--border)]/70 rounded w-1/4 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="lux-card overflow-hidden">
              <div className="w-full h-40 bg-[color:var(--border)]/70 animate-pulse"></div>
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
    </div>
  );
}

// Main page component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}

