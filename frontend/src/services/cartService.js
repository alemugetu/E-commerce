import { api } from './api';

/**
 * Fetch the user's cart from the backend
 * @returns {Promise<Object>} Cart data with items
 */
export const fetchCart = async () => {
  try {
    const response = await api.get('/orders/cart/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Could not load your cart.'
    );
  }
};

/**
 * Add an item to the backend cart
 * @param {number} productId - The product ID
 * @param {number} quantity - The quantity to add
 * @returns {Promise<Object>} Updated cart data
 */
export const addToCartAPI = async (productId, quantity = 1) => {
  try {
    const response = await api.post('/orders/cart/', {
      product_id: productId,
      quantity: quantity,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add to cart:', error);
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Could not add item to cart.'
    );
  }
};

/**
 * Update cart item quantity in backend
 * @param {number} itemId - The cart item ID
 * @param {number} quantity - The new quantity
 * @returns {Promise<Object>} Updated cart data
 */
export const updateCartItemAPI = async (itemId, quantity) => {
  try {
    const response = await api.patch(`/orders/cart/items/${itemId}/`, {
      quantity: quantity,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update cart item:', error);
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Could not update cart item.'
    );
  }
};

/**
 * Remove item from backend cart
 * @param {number} itemId - The cart item ID
 * @returns {Promise<Object>} Updated cart data
 */
export const removeFromCartAPI = async (itemId) => {
  try {
    const response = await api.delete(`/orders/cart/items/${itemId}/`);
    return response.data;
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    throw new Error(
      error.response?.data?.error ||
      error.response?.data?.detail ||
      'Could not remove item from cart.'
    );
  }
};
