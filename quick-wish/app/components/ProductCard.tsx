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
      <div className="lux-card overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {originalPrice && originalPrice > price && (
            <div className="absolute top-3 left-3 bg-[color:var(--wine)] text-[color:var(--ivory)] px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </div>
          )}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 bg-[color:var(--ivory)] rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Heart 
              size={18} 
              className={`${isHeartFilled ? 'fill-red-500 text-red-500' : 'text-[color:var(--muted)]'} transition-colors`} 
            />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-semibold text-[color:var(--plum)] mb-2 line-clamp-2">{name}</h3>
          
          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={`${i < Math.floor(rating) ? 'text-[color:var(--gold)] fill-[color:var(--gold)]' : 'text-[color:var(--border)]'}`}
                />
              ))}
            </div>
            <span className="text-xs text-[color:var(--muted)] ml-2">({reviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-center mb-4 flex-wrap gap-2">
            <span className="text-xl font-semibold text-[color:var(--wine)]">?{price}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-[color:var(--muted)] line-through ml-1">?{originalPrice}</span>
            )}
            <span className="lux-pill px-2 py-0.5 text-[10px]">Same Day Delivery - ₹49 extra (Indore only)</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-[color:var(--wine)] text-[color:var(--ivory)] py-2 px-4 rounded-xl font-medium hover:bg-[#3b182f] transition-all duration-200 flex items-center justify-center"
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
        originalPrice={originalPrice}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode="signin"
      />
    </>
  );
}


