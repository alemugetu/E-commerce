import { api } from "./api";
/**
 * Communicates with Django backend to spin up an Order record 
 * and generate an authorized Chapa hosted payment link.
 */
export const initiateChapaCheckout = async (cartItems = null) => {
  try {
    const payload = cartItems ?? JSON.parse(localStorage.getItem('store_et_cart') || '[]');
    const response = await api.post('/payments/checkout/chapa/', { cart_items: payload });
    return response.data; 
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 
      "Could not synchronize checkout parameters with payment networks."
    );
  }
};


/**
 * Fetches a paginated list of historical orders for the authenticated user session.
 * @param {number} page - The target page number to retrieve.
 */
export const fetchOrderHistory = async (page = 1) => {
  try {
    // Correct endpoint: /api/orders/order-history/ (matches Django orders/urls.py)
    const response = await api.get(`/orders/order-history/?page=${page}`);
    return response.data; // { count, next, previous, results }
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      'Could not retrieve your purchase history from the server.'
    );
  }
};

