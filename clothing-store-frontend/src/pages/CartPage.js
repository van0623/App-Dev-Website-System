import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import '../App.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useUser();
  
  const handleRemove = (id, size) => {
    removeFromCart(id, size);
  };
  
  const handleQuantityChange = (id, size, newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateQuantity(id, size, parseInt(newQuantity), user?.id);
    }
  };

  // Render empty cart message if cart is empty
  if (!cart || cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-button">
            Back
          </button>
          
          <div className="empty-cart">
            <h1>Your Cart is Empty</h1>
            <div className="empty-cart-content">
              <p>Looks like you haven't added any items to your cart yet.</p>
              <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          Back
        </button>
        
        <div className="cart-header">
          <h1>Your Cart</h1>
          <button onClick={clearCart} className="clear-cart-btn">Clear Cart</button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                </div>
                
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-size">Size: {item.size}</p>
                  <p className="cart-item-price">₱{parseFloat(item.price).toLocaleString()}</p>
                </div>
                
                <div className="cart-item-quantity">
                  <button 
                    onClick={() => handleQuantityChange(item.id, item.size, item.quantity - 1)}
                    className="quantity-btn"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(item.id, item.size, item.quantity + 1)}
                    className="quantity-btn"
                    disabled={item.quantity >= 10}
                  >
                    +
                  </button>
                </div>
                
                <div className="cart-item-subtotal">
                  ₱{(parseFloat(item.price) * item.quantity).toLocaleString()}
                </div>
                
                <button 
                  onClick={() => handleRemove(item.id, item.size)}
                  className="remove-item-btn"
                  aria-label="Remove item"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₱{getCartTotal().toLocaleString()}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping:</span>
              <span>₱150.00</span>
            </div>
            
            <div className="summary-row total">
              <span>Total:</span>
              <span>₱{(getCartTotal() + 150).toLocaleString()}</span>
            </div>
            
            <div className="cart-actions">
              <Link to="/checkout" className="checkout-btn">
                Proceed to Checkout
              </Link>
              <Link to="/shop" className="btn btn-secondary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
