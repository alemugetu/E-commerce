import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchCart,
  addToCartAPI,
  updateCartItemAPI,
  removeFromCartAPI,
} from '../services/cartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  // Read initial cart state from local cache to persist selections across browser refreshes
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('store_et_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [loading, setLoading] = useState(false);
  const [isBackendSynced, setIsBackendSynced] = useState(false);

  // Automatically sync state mutations to localStorage whenever the basket updates
  useEffect(() => {
    localStorage.setItem('store_et_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Load cart from backend when user logs in
  const loadCartFromBackend = useCallback(async () => {
    if (!user) {
      setIsBackendSynced(false);
      return;
    }

    setLoading(true);
    try {
      const cartData = await fetchCart();
      // Transform backend cart items to match frontend structure
      const transformedItems = cartData.items?.map(item => ({
        id: item.product.id,
        ...item.product,
        quantity: item.quantity,
        cartItemId: item.id, // Store backend cart item ID for updates
      })) || [];
      setCartItems(transformedItems);
      setIsBackendSynced(true);
    } catch (error) {
      console.error('Failed to load cart from backend:', error);
      setIsBackendSynced(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sync local cart to backend when user logs in
  const syncLocalCartToBackend = useCallback(async () => {
    if (!user || cartItems.length === 0) return;

    setLoading(true);
    try {
      // Sync each item individually using addToCartAPI
      for (const item of cartItems) {
        try {
          await addToCartAPI(item.id, item.quantity);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          // Continue with other items even if one fails
        }
      }
      // After syncing, load the cart from backend to get the final state
      await loadCartFromBackend();
    } catch (error) {
      console.error('Failed to sync cart to backend:', error);
      // Keep local cart if sync fails
    } finally {
      setLoading(false);
    }
  }, [user, cartItems, loadCartFromBackend]);

  // Load/sync cart when user authentication state changes
  useEffect(() => {
    if (user) {
      // If user just logged in and has local cart items, sync them
      const localCart = JSON.parse(localStorage.getItem('store_et_cart') || '[]');
      if (localCart.length > 0 && !isBackendSynced) {
        syncLocalCartToBackend();
      } else if (!isBackendSynced) {
        loadCartFromBackend();
      }
    } else {
      // User logged out, use local storage cart
      setIsBackendSynced(false);
      const localCart = localStorage.getItem('store_et_cart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      }
    }
  }, [user]);

  // Action 1: Add item to cart with quantity management
  const addToCart = useCallback(async (product, quantity = 1) => {
    if (user && isBackendSynced) {
      // Use backend API for logged-in users
      try {
        setLoading(true);
        const cartData = await addToCartAPI(product.id, quantity);
        const transformedItems = cartData.items?.map(item => ({
          id: item.product.id,
          ...item.product,
          quantity: item.quantity,
          cartItemId: item.id,
        })) || [];
        setCartItems(transformedItems);
      } catch (error) {
        console.error('Failed to add to cart (backend):', error);
        // Fallback to local storage on error
        setCartItems((prevItems) => {
          const existingItem = prevItems.find((item) => item.id === product.id);
          if (existingItem) {
            return prevItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }
          return [...prevItems, { ...product, quantity }];
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Use local storage for guest users
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { ...product, quantity }];
      });
    }
  }, [user, isBackendSynced]);

  // Action 2: Mutate item quantity directly (e.g., input field updates)
  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (user && isBackendSynced) {
      // Use backend API for logged-in users
      const item = cartItems.find(item => item.id === productId);
      if (item?.cartItemId) {
        try {
          setLoading(true);
          const cartData = await updateCartItemAPI(item.cartItemId, quantity);
          const transformedItems = cartData.items?.map(item => ({
            id: item.product.id,
            ...item.product,
            quantity: item.quantity,
            cartItemId: item.id,
          })) || [];
          setCartItems(transformedItems);
        } catch (error) {
          console.error('Failed to update cart item (backend):', error);
          // Fallback to local storage on error
          setCartItems((prevItems) =>
            prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item))
          );
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Use local storage for guest users
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
    }
  }, [user, isBackendSynced, cartItems]);

  // Action 3: Evict a single product variation cleanly
  const removeFromCart = useCallback(async (productId) => {
    if (user && isBackendSynced) {
      // Use backend API for logged-in users
      const item = cartItems.find(item => item.id === productId);
      if (item?.cartItemId) {
        try {
          setLoading(true);
          const cartData = await removeFromCartAPI(item.cartItemId);
          const transformedItems = cartData.items?.map(item => ({
            id: item.product.id,
            ...item.product,
            quantity: item.quantity,
            cartItemId: item.id,
          })) || [];
          setCartItems(transformedItems);
        } catch (error) {
          console.error('Failed to remove from cart (backend):', error);
          // Fallback to local storage on error
          setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Use local storage for guest users
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    }
  }, [user, isBackendSynced, cartItems]);

  // Action 4: Flush entire cart array (Call this after successful Chapa checkout validation)
  const clearCart = useCallback(async () => {
    if (user && isBackendSynced) {
      // For logged-in users, we'd need a backend clear endpoint
      // For now, just clear local state and let backend handle it via checkout
      setCartItems([]);
    } else {
      setCartItems([]);
    }
  }, [user, isBackendSynced]);

  // Derived Telemetry Fields (Calculates instantly without tracking extra states)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cartItems.reduce((total, item) => {
    const numericalPrice = parseFloat(item.final_price || item.price) || 0;
    return total + numericalPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      loading,
      isBackendSynced,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be executed inside a valid CartProvider shell context.");
  return context;
};

