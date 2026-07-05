import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const fetchProducts = async (params = {}) => {
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value != null)
  );
  const response = await api.get('/products/', { params: cleanedParams });
  return response.data;
};

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  });
};
