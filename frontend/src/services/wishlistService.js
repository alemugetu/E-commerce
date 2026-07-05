import { api } from './api';

/**
 * Fetch the user's wishlist from the backend
 * @returns {Promise<Array>} Array of wishlist items
 */
const normalizeWishlistItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const fetchWishlist = async () => {
  try {
    const response = await api.get('/orders/wishlist/');
    return normalizeWishlistItems(response.data);
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Could not load your wishlist.'
    );
  }
};

/**
 * Toggle a product in the wishlist (add/remove)
 * @param {number} productId - The product ID to toggle
 * @returns {Promise<Object>} Updated wishlist data
 */
export const toggleWishlistItem = async (productId) => {
  try {
    const response = await api.post(`/orders/wishlist/toggle/${productId}/`);
    return response.data;
  } catch (error) {
    console.error('Failed to toggle wishlist item:', error);
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Could not update your wishlist.'
    );
  }
};

/**
 * Check if a product is in the user's wishlist
 * @param {number} productId - The product ID to check
 * @param {Array} wishlistItems - Current wishlist items
 * @returns {boolean} True if product is in wishlist
 */
export const isInWishlist = (productId, wishlistItems) => {
  if (!Array.isArray(wishlistItems)) return false;
  return wishlistItems.some(
    (item) => item.product?.id === productId || item.product === productId
  );
};
