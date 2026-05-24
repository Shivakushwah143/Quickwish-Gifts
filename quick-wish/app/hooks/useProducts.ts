// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { Product } from '../types/index';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!API_BASE_URL) {
          throw new Error('API URL is not configured');
        }

        const response = await fetch(`${API_BASE_URL}/product`);
        const data = await response.json();
        console.log('Fetched products:', data);
        setProducts(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  return {products}; 
};
