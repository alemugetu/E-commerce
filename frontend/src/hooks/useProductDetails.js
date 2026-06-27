import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const fetchProductById = async (id) => {
  // Maps to http://127.0.0.1:8000/api/products/{id}/
  const response = await api.get(`/products/${id}/`);
  return response.data;
};

export const useProductDetails = (id) => {
  return useQuery({
    queryKey: ['product', id], // Unique query key per product ID ensures accurate cache isolation
    queryFn: () => fetchProductById(id),
    enabled: !!id, // Prevent query execution if ID is undefined or null
  });
};

