// Frontend: src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useUser();
  const { cart } = useCart();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  // Debug log to see if there is an existing cart before login
  useEffect(() => {
    console.log('LoginPage - Cart state before login:', cart);
    
    // Check for any existing carts in localStorage
    const storageKeys = Object.keys(localStorage);
    const cartKeys = storageKeys.filter(key => key.startsWith('cart_'));
    console.log('LoginPage - Found cart keys in localStorage:', cartKeys);
    
    cartKeys.forEach(key => {
      try {
        const cartData = JSON.parse(localStorage.getItem(key));
        console.log(`LoginPage - Cart data for ${key}:`, cartData);
      } catch (error) {
        console.error(`Error parsing cart data for ${key}:`, error);
      }
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Attempting login with:', formData.email);

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        // Login successful - pass the correct user data with role
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          first_name: response.data.user.first_name,  // Correct field name
          last_name: response.data.user.last_name,    // Correct field name
          role: response.data.user.role               // IMPORTANT: Include role
        };
        
        console.log('Login successful, user data:', userData); 
        
        // Check for existing carts before login completion
        const userCartKey = `cart_${userData.id}`;
        const existingUserCart = localStorage.getItem(userCartKey);
        console.log(`LoginPage - Existing cart for user ${userData.id}:`, existingUserCart ? JSON.parse(existingUserCart) : 'None');
        
        login(userData);
        // No welcome message here to prevent duplicates with HomePage
        navigate('/'); // Navigate to home page after login
      } else {
        showError(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign In</h2>
        <p className="login-subtitle">Welcome back! Please sign in to your account.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="register-link">
          Don't have an account? <Link to="/register" className="register-link-text">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
