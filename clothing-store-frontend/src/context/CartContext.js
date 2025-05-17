import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from './UserContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useUser();
  const userId = user?.id || 'guest';
  const previousUserIdRef = useRef('guest');
  
  const [cart, setCart] = useState([]);
  
  // Load user-specific cart when component mounts or userId changes
  useEffect(() => {
    // If the user ID changed, we need to load their specific cart
    if (previousUserIdRef.current !== userId) {
      console.log(`User changed from ${previousUserIdRef.current} to ${userId}, loading cart for ${userId}`);
      
      const cartKey = `cart_${userId}`;
      const savedCart = localStorage.getItem(cartKey);
      
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
          console.log(`Loaded cart for ${userId}:`, parsedCart);
        } catch (error) {
          console.error(`Error parsing cart data for ${userId}:`, error);
          setCart([]);
          localStorage.removeItem(cartKey);
        }
      } else {
        // No saved cart for this user, start with an empty cart
        console.log(`No saved cart found for ${userId}, starting with empty cart`);
        setCart([]);
      }
      
      // Update the previous user ID reference
      previousUserIdRef.current = userId;
    }
  }, [userId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartKey = `cart_${userId}`;
    console.log(`Saving cart for ${userId}:`, cart);
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, userId]);

  const addToCart = (product) => {
    console.log(`Adding to cart for ${userId}:`, product);
    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.id === product.id && item.size === product.size
      );

      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id && item.size === product.size
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }

      return [...prevCart, product];
    });
  };

  const removeFromCart = (id, size) => {
    console.log(`Removing from cart for ${userId}: product ${id}, size ${size}`);
    setCart(prevCart => prevCart.filter(item => 
      !(item.id === id && item.size === size)
    ));
  };

  const updateQuantity = (id, size, quantity) => {
    console.log(`Updating quantity for ${userId}: product ${id}, size ${size}, quantity ${quantity}`);
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    console.log(`Clearing cart for ${userId}`);
    setCart([]);
    const cartKey = `cart_${userId}`;
    localStorage.removeItem(cartKey);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      return total + quantity;
    }, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
