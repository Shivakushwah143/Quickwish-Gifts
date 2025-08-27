// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { Product } from '../types/index';

const API_URL = 'http://localhost:3000/api/v1/product';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);
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