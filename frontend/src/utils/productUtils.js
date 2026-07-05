export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=700&auto=format&fit=crop&q=60';

export const resolveImageUrl = (imageObj) => {
  if (!imageObj) return FALLBACK_IMAGE;
  const url = imageObj.image_url || imageObj.image || '';
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith('/media/')) return `http://127.0.0.1:8000${url}`;
  return url;
};

export const getProductImage = (product) => {
  const firstImage = product?.images?.[0];
  return resolveImageUrl(firstImage);
};

export const formatPrice = (price) => Number(price).toLocaleString();

export const normalizeListResponse = (data) => {
  if (Array.isArray(data)) return { results: data, count: data.length, next: null, previous: null };
  return {
    results: data?.results || data?.data || [],
    count: data?.count ?? (data?.results || data?.data || []).length,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
  };
};
