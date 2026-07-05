import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchWishlist, toggleWishlistItem, isInWishlist } from '../services/wishlistService';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist when user logs in
  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    setLoading(true);
    try {
      const items = await fetchWishlist();
      setWishlistItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      setWishlistItems((prev) => (prev.length === 0 ? prev : []));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load wishlist on mount and when user changes
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Toggle item in wishlist
  const toggleWishlist = useCallback(async (productId) => {
    if (!user) {
      // If not logged in, redirect to login
      window.location.href = '/login';
      return;
    }

    try {
      await toggleWishlistItem(productId);
      // Reload wishlist to get updated state
      await loadWishlist();
    } catch (error) {
      console.error('Failed to toggle wishlist item:', error);
      throw error;
    }
  }, [user, loadWishlist]);

  // Check if product is in wishlist
  const checkIsInWishlist = useCallback((productId) => {
    return isInWishlist(productId, wishlistItems);
  }, [wishlistItems]);

  // Wishlist count
  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        loading,
        toggleWishlist,
        checkIsInWishlist,
        loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
