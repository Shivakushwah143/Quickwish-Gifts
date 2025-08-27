

// // components/ProductCard.tsx - Updated Add to Cart button
// import { useState } from 'react';
// import { ShoppingCart, Heart, Star } from 'lucide-react';
// import OrderPaymentModal from './OrderPaymentModal';

// interface ProductCardProps {
//   id: string;
//   name: string;
//   price: number;
//   originalPrice?: number;
//   image: string;
//   rating?: number;
//   reviews?: number;
//   isWishlisted?: boolean;
// }

// export default function ProductCard({ 
//   id, 
//   name, 
//   price, 
//   originalPrice, 
//   image, 
//   rating = 4.5, 
//   reviews = 0,
//   isWishlisted = false 
// }: ProductCardProps) {
//   const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
//   const [isHeartFilled, setIsHeartFilled] = useState(isWishlisted);

//   const handleAddToCart = () => {
//     const token = localStorage.getItem('token');
//     if (!token) {

//       alert('Please login to place order');
//       return;
//     }
//     setIsOrderModalOpen(true);
//   };

//   return (
//     <>
//       <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
//         {/* Image Section */}
//         <div className="relative overflow-hidden">
//           <img 
//             src={image} 
//             alt={name}
//             className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
//           />
//           {originalPrice && (
//             <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
//               {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
//             </div>
//           )}
//           <button
//             onClick={() => setIsHeartFilled(!isHeartFilled)}
//             className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
//           >
//             <Heart 
//               size={18} 
//               className={`${isHeartFilled ? 'fill-red-500 text-red-500' : 'text-gray-400'} transition-colors`} 
//             />
//           </button>
//         </div>

//         {/* Content Section */}
//         <div className="p-4">
//           <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{name}</h3>
          
//           {/* Rating */}
//           <div className="flex items-center mb-2">
//             <div className="flex items-center">
//               {[...Array(5)].map((_, i) => (
//                 <Star
//                   key={i}
//                   size={14}
//                   className={`${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
//                 />
//               ))}
//             </div>
//             <span className="text-xs text-gray-500 ml-2">({reviews})</span>
//           </div>

//           {/* Price */}
//           <div className="flex items-center mb-4">
//             <span className="text-xl font-bold text-gray-900">₹{price}</span>
//             {originalPrice && (
//               <span className="text-sm text-gray-500 line-through ml-2">₹{originalPrice}</span>
//             )}
//           </div>

//           {/* Action Buttons */}
//           <div className="flex space-x-2">
//             <button 
//               onClick={handleAddToCart}
//               className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center"
//             >
//               <ShoppingCart size={18} className="mr-2" />
//               Buy Now
//             </button>
//           </div>
//         </div>
//       </div>

//       <OrderPaymentModal
//         isOpen={isOrderModalOpen}
//         onClose={() => setIsOrderModalOpen(false)}
//         productId={id}
//         productName={name}
//         productPrice={price}
//         productImage={image}
//       />
//     </>
//   );
// }


// components/ProductCard.tsx
'use client';

import { useState } from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import OrderPaymentModal from './OrderPaymentModal';
import AuthModal from '../components/AuthModel';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  isWishlisted?: boolean;
}

export default function ProductCard({ 
  id, 
  name, 
  price, 
  originalPrice, 
  image, 
  rating = 4.5, 
  reviews = 0,
  isWishlisted = false 
}: ProductCardProps) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHeartFilled, setIsHeartFilled] = useState(isWishlisted);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsOrderModalOpen(true);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartFilled(!isHeartFilled);
    // Add your wishlist logic here
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {originalPrice && originalPrice > price && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </div>
          )}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Heart 
              size={18} 
              className={`${isHeartFilled ? 'fill-red-500 text-red-500' : 'text-gray-400'} transition-colors`} 
            />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{name}</h3>
          
          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={`${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-2">({reviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-center mb-4">
            <span className="text-xl font-bold text-gray-900">₹{price}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-500 line-through ml-2">₹{originalPrice}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center"
            >
              <ShoppingCart size={18} className="mr-2" />
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <OrderPaymentModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        productId={id}
        productName={name}
        productPrice={price}
        productImage={image}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode="signin"
      />
    </>
  );
}