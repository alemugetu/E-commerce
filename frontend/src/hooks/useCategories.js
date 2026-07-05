import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { normalizeListResponse } from '../utils/productUtils';

const fetchCategories = async () => {
  const response = await api.get('/products/categories/');
  return normalizeListResponse(response.data).results;
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
  });
};
