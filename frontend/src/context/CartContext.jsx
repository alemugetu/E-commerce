import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // Read initial cart state from local cache to persist selections across browser refreshes
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('store_et_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Automatically sync state mutations to localStorage whenever the basket updates
  useEffect(() => {
    localStorage.setItem('store_et_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Action 1: Add item to cart with quantity management
  const addToCart = (product, quantity = 1) => {
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
  };

  // Action 2: Mutate item quantity directly (e.g., input field updates)
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  // Action 3: Evict a single product variation cleanly
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // Action 4: Flush entire cart array (Call this after successful Chapa checkout validation)
  const clearCart = () => {
    setCartItems([]);
  };

  // Derived Telemetry Fields (Calculates instantly without tracking extra states)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const cartTotal = cartItems.reduce((total, item) => {
    const numericalPrice = parseFloat(item.price) || 0;
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
      cartTotal 
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

