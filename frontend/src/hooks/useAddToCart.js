import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

/**
 * useAddToCart
 *
 * Unified "add to cart" action used by both the catalog grid (Home.jsx)
 * and the product detail page (ProductDetail.jsx).
 *
 * Strategy:
 *   - Authenticated user → POST to /api/orders/cart/ (syncs with the Django
 *     DB cart that the Chapa checkout pipeline reads from) AND mirrors the
 *     item into the local CartContext so the navbar badge updates instantly.
 *   - Guest user → local CartContext only (they can still browse and add
 *     items; the backend call is skipped until they log in).
 *
 * Returns:
 *   { addItem, isAdding }
 *   - addItem(product, quantity?)  call this from any button onClick
 *   - isAdding                     true while the API request is in-flight
 *     (use to disable the button and show a loading label)
 */
export const useAddToCart = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const addItem = async (product, quantity = 1) => {
    if (isAdding) return; // Prevent double-clicks
    setIsAdding(true);

    try {
      if (user) {
        // ── Authenticated path ──────────────────────────────────────────
        // POST to the backend so the DB cart matches what Chapa will charge.
        await api.post('/orders/cart/', {
          product_id: product.id,
          quantity,
        });

        // Mirror into local context so the navbar badge increments instantly
        // without waiting for a full cart refetch.
        addToCart(product, quantity);

        toast.success(`"${product.name}" added to cart`, {
          icon: '🛒',
        });
      } else {
        // ── Guest path ──────────────────────────────────────────────────
        // Store locally; the cart page will send these items at checkout.
        addToCart(product, quantity);

        toast.success(`"${product.name}" added to cart`, {
          icon: '🛒',
        });
      }
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Failed to add item to cart. Please try again.';

      // If backend says 401, the Axios interceptor will silently refresh the
      // token and retry — so this error branch only fires on real failures.
      toast.error(message);
    } finally {
      setIsAdding(false);
    }
  };

  return { addItem, isAdding };
};
