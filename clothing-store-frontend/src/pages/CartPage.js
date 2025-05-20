import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import '../App.css';

const CartPage = () => {
  const { cart, setCart } = useCart();
  const { isAuthenticated } = useUser();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  const handleQuantityChange = async (itemId, size, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      if (isAuthenticated) {
        await axios.put('http://localhost:5000/api/cart/update', {
          userId: JSON.parse(localStorage.getItem('user')).id,
          productId: itemId,
          size,
          quantity: newQuantity
        });
      }

      const updatedCart = cart.map(item => {
        if (item.id === itemId && item.size === size) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      showError('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId, size) => {
    try {
      if (isAuthenticated) {
        await axios.delete('http://localhost:5000/api/cart/remove', {
          data: {
            userId: JSON.parse(localStorage.getItem('user')).id,
            productId: itemId,
            size
          }
        });
      }

      const updatedCart = cart.filter(item => !(item.id === itemId && item.size === size));
      setCart(updatedCart);
      showSuccess('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      showError('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      if (isAuthenticated) {
        await axios.delete(`http://localhost:5000/api/cart/clear/${JSON.parse(localStorage.getItem('user')).id}`);
      }

      setCart([]);
      showSuccess('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      showError('Failed to clear cart');
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthOptions(true);
    } else {
      navigate('/checkout');
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
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
          <button onClick={handleClearCart} className="clear-cart-button">
            Clear Cart
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
              <div key={`${item.id}-${item.size}`} className="cart-item">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-size">Size: {item.size}</p>
                  <p className="item-price">${item.price}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.size, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.size, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id, item.size)}
                    className="remove-item"
                  >
                    Remove
                  </button>
                </div>
                <div className="item-total">
                  ₱{(item.price * item.quantity).toFixed(2)}
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
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;