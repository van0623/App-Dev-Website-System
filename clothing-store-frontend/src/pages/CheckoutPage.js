// src/pages/CheckoutPage.js
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  console.log('CheckoutPage rendered');
  
  const cartContext = useCart();
  console.log('Cart context in CheckoutPage:', cartContext);
  
  const { cart, clearCart, getCartTotal, getCartItemCount } = cartContext;
  console.log('Destructured cart:', cart);
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cash-on-delivery'
  });

  const { isAuthenticated, user } = useUser();

  // Safety check - ensure cart is an array
  const safeCart = cart || [];
  console.log('Safe cart:', safeCart, 'Length:', safeCart.length);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateShipping = () => {
    const total = getCartTotal();
    if (total >= 2000) return 0; // Free shipping for orders over ₱2000
    return 100; // Standard shipping
  };

  const calculateTax = () => {
    return getCartTotal() * 0.12; // 12% VAT
  };

  const getFinalTotal = () => {
    return getCartTotal() + calculateShipping() + calculateTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isAuthenticated && user) {
      // Create order in database for logged-in users
      try {
        const shippingInfo = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode
        };

        const response = await axios.post('http://localhost:5000/api/orders/create', {
          userId: user.id,
          cartItems: safeCart,
          totalAmount: getFinalTotal(),
          shippingAmount: calculateShipping(),
          taxAmount: calculateTax(),
          shippingInfo
        });

        if (response.data.success) {
          console.log('Order created:', response.data.orderNumber);
          setOrderPlaced(true);
          clearCart();
        }
      } catch (error) {
        console.error('Error creating order:', error);
        alert('Failed to place order. Please try again.');
      }
    } else {
      // For non-logged-in users, just simulate order placement
      console.log('Order submitted:', { formData, cart: safeCart, total: getFinalTotal() });
      setOrderPlaced(true);
      clearCart();
    }
  };

  if (safeCart.length === 0 && !orderPlaced) {
    console.log('Rendering empty cart page');
    return (
      <div className="checkout-page">
        <div className="container">
          {/* Back Button */}
          <button onClick={() => navigate('/cart')} className="back-button">
            Back to Cart
          </button>
          
          <div className="empty-checkout">
            <h1>Your cart is empty</h1>
            <p>Add some items to your cart before checking out.</p>
            <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    console.log('Rendering order success page');
    return (
      <div className="checkout-page">
        <div className="container">
          {/* Back Button */}
          <button onClick={() => navigate('/shop')} className="back-button">
            Back to Shop
          </button>
          
          <div className="order-success">
            <h1>Order Placed Successfully!</h1>
            <p>Thank you for your purchase. Your order confirmation will be sent to your email.</p>
            <p>You will pay <strong>₱{getFinalTotal().toLocaleString()}</strong> when your order is delivered.</p>
            <div className="success-actions">
              <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
              <Link to="/" className="btn btn-secondary">Go to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering checkout form with cart:', safeCart);
  return (
    <div className="checkout-page">
      <div className="container">
        {/* Back Button */}
        <button onClick={() => navigate('/cart')} className="back-button">
          Back to Cart
        </button>
        
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="checkout-form">
            <h2>Shipping Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <div className="payment-method-display">
                  <div className="payment-option selected">
                    <span>💵 Cash on Delivery</span>
                    <p>Pay when your order is delivered to your doorstep</p>
                  </div>
                </div>
                <input
                  type="hidden"
                  name="paymentMethod"
                  value="cash-on-delivery"
                />
              </div>

              <div className="checkout-actions">
                <Link to="/cart" className="btn btn-secondary">Back to Cart</Link>
                <button type="submit" className="btn btn-primary">Place Order</button>
              </div>
            </form>
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            {safeCart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="checkout-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Size: {item.size}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className="item-price">
                  ₱{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
            
            <div className="order-total">
              <div className="total-row">
                <span>Subtotal ({getCartItemCount()} items)</span>
                <span>₱{getCartTotal().toLocaleString()}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>{calculateShipping() === 0 ? 'FREE' : `₱${calculateShipping().toLocaleString()}`}</span>
              </div>
              <div className="total-row">
                <span>Tax (12% VAT)</span>
                <span>₱{calculateTax().toLocaleString()}</span>
              </div>
              <div className="total-row final-total">
                <span>Total</span>
                <span>₱{getFinalTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
