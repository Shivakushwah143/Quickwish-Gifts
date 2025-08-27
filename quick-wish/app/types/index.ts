// src/types/index.ts
export interface HeroSlide {
  title: string;
  subtitle: string;
  image: string;
  cta: string;
}

export interface Category {
  id?: string;
  name: string;
  image: string;
  count?: string;
  isLarge?: boolean;
}

export interface DeliveryOption {
  type: string;
  price: number;
  days: number;
}
export interface Product {
  _id?: string;
  name: string;
  price: number;
  category: string;
  badge?: string;
  images: string[];
  description: string;
  discountPercent?: number;
  originalPrice?: number;
  offPrice?: number;
  deliveryOptions?: DeliveryOption[];
  stock: number;
  rating?: number;
  reviews?: number;
  createdAt?: Date;
  updatedAt?: Date;
   similarProducts?: Product[];
}


export interface Testimonial {
  name: string;
  location: string;
  content: string;
  rating: number;
  avatar: string;
}