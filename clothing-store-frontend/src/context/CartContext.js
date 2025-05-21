import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { useUser } from './UserContext';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSuccess, showError, showInfo } = useNotification();
  const { user } = useUser();

  // Helper functions for cart calculations
  const getCartItemCount = useCallback(() => {
    return cart.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      return total + quantity;
    }, 0);
  }, [cart]);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  }, [cart]);

  const fetchCart = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/cart/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      showError(error.response?.data?.message || 'Failed to fetch cart');
    }
  }, [showError]);

  // Fetch cart when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('Fetching cart for user:', user.id);
      fetchCart(user.id);
    } else {
      console.log('No user logged in, clearing cart');
      setCart([]);
    }
  }, [user?.id, fetchCart]);

  // Constants for validation
  const MAX_QUANTITY_PER_ITEM = 10;
  const MIN_QUANTITY_PER_ITEM = 1;
  const MAX_ITEMS_IN_CART = 20;

  const addToCart = async (item) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        showError('Please sign in to add items to cart');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showError('Authentication token not found. Please login again.');
        return;
      }

      // Validate cart size
      if (cart.length >= MAX_ITEMS_IN_CART) {
        showError(`Cart is full (maximum ${MAX_ITEMS_IN_CART} items)`);
        return;
      }

      // Validate quantity
      if (item.quantity < MIN_QUANTITY_PER_ITEM || item.quantity > MAX_QUANTITY_PER_ITEM) {
        showError(`Quantity must be between ${MIN_QUANTITY_PER_ITEM} and ${MAX_QUANTITY_PER_ITEM}`);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/cart/add', {
        userId: user.id,
        ...item
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        await fetchCart(user.id);
        showSuccess(response.data.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError(error.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateQuantity = async (productId, size, newQuantity, productName) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        showError('Please sign in to update cart');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showError('Authentication token not found. Please login again.');
        return;
      }

      // Validate quantity
      if (newQuantity < MIN_QUANTITY_PER_ITEM) {
        showError(`Minimum quantity is ${MIN_QUANTITY_PER_ITEM}`);
        return;
      }
      if (newQuantity > MAX_QUANTITY_PER_ITEM) {
        showError(`Maximum quantity is ${MAX_QUANTITY_PER_ITEM}`);
        return;
      }

      const response = await axios.put('http://localhost:5000/api/cart/update', {
        userId: user.id,
        productId,
        size,
        quantity: newQuantity
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        await fetchCart(user.id);
        showSuccess(response.data.message);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showError(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const removeFromCart = async (productId, size, productName) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        showError('Please sign in to remove items from cart');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.delete('http://localhost:5000/api/cart/remove', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          userId: user.id,
          productId,
          size
        }
      });

      if (response.data.success) {
        await fetchCart(user.id);
        showSuccess(response.data.message);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      showError(error.response?.data?.message || 'Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  const clearCart = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        showError('Please sign in to clear cart');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.delete(`http://localhost:5000/api/cart/clear/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        if (response.data.action === 'already_empty') {
          showInfo(response.data.message);
        } else {
          setCart([]);
          showSuccess(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      showError(error.response?.data?.message || 'Failed to clear cart');
    } finally {
      setIsUpdating(false);
    }
  };

  const value = {
    cart,
    isUpdating,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartItemCount,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
