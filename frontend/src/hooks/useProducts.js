import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

// 1. Core asynchronous fetcher function talking directly to Django
const fetchProducts = async () => {
  // Maps to http://127.0.0.1:8000/api/products/
  const response = await api.get('/products/');
  return response.data;
};

// 2. Custom hook wrapping TanStack Query
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'], // The unique cache key identifier for this specific dataset
    queryFn: fetchProducts,  // The execution promise function defined above
  });
};

