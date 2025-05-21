import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import '../App.css';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, isUpdating } = useCart();
  const { isAuthenticated } = useUser();
  const { showError, showSuccess, showInfo } = useNotification();
  const navigate = useNavigate();
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  const handleQuantityChange = async (productId, size, newQuantity, productName) => {
    if (isUpdating) return;

    try {
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        if (!token) {
          showError('Authentication token not found. Please login again.');
          return;
        }

        await axios.put('http://localhost:5000/api/cart/update', {
          userId: JSON.parse(localStorage.getItem('user')).id,
          productId,
          size,
          quantity: newQuantity
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      updateQuantity(productId, size, newQuantity, productName);
    } catch (error) {
      console.error('Error updating quantity:', error);
      showError('Failed to update quantity. Please try again.');
    }
  };

  const handleRemoveItem = async (productId, size, productName) => {
    if (isUpdating) return;

    try {
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        if (!token) {
          showError('Authentication token not found. Please login again.');
          return;
        }

        await axios.delete('http://localhost:5000/api/cart/remove', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          data: {
            userId: JSON.parse(localStorage.getItem('user')).id,
            productId,
            size
          }
        });
      }

      removeFromCart(productId, size, productName);
    } catch (error) {
      console.error('Error removing item:', error);
      showError('Failed to remove item. Please try again.');
    }
  };

  const handleClearCart = async () => {
    if (isUpdating) return;

    try {
      if (isAuthenticated) {
        await axios.delete(`http://localhost:5000/api/cart/clear/${JSON.parse(localStorage.getItem('user')).id}`);
      }

      clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      showError('Failed to clear cart. Please try again.');
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthOptions(true);
      showInfo('Please sign in to proceed with checkout');
    } else {
      navigate('/checkout');
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0);
  };

  const shipping = 10;
  const subtotal = calculateSubtotal();
  const total = subtotal + shipping;

  if (showAuthOptions) {
    return (
      <div className="auth-options">
        <h2>Sign in to continue</h2>
        <p>Please sign in or create an account to proceed with checkout.</p>
        <div className="auth-buttons">
          <Link to="/login?redirect=/checkout" className="btn btn-primary">Sign In</Link>
          <Link to="/register?redirect=/checkout" className="btn btn-secondary">Create Account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <Link to="/" className="back-button">Back to Shopping</Link>
        <h1>Your Cart</h1>
        {cart.length > 0 && (
          <button 
            onClick={handleClearCart} 
            className="clear-cart-button"
            disabled={isUpdating}
          >
            {isUpdating ? 'Clearing...' : 'Clear Cart'}
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={`${item.product_id}-${item.size}`} className="cart-item">
                <img 
                  src={`http://localhost:5000${item.image_url}`} 
                  alt={item.product_name} 
                  className="item-image"
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg';
                    console.error('Failed to load image:', item.image_url);
                  }}
                />
                <div className="item-details">
                  <h3>{item.product_name}</h3>
                  <p className="item-size">Size: {item.size}</p>
                  <p className="item-price">₱{item.price}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(item.product_id, item.size, item.quantity - 1, item.product_name)}
                      disabled={item.quantity <= 1 || isUpdating}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.product_id, item.size, item.quantity + 1, item.product_name)}
                      disabled={isUpdating}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.product_id, item.size, item.product_name)}
                    className="remove-item"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Removing...' : 'Remove'}
                  </button>
                </div>
                <div className="item-total">
                  ₱{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>₱{shipping.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="checkout-button"
              disabled={isUpdating}
            >
              {isUpdating ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;