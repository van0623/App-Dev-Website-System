import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';
import '../App.css';

const HomePage = () => {
  const { showSuccess } = useNotification();
  const { user } = useUser();
  const hasShownNotificationRef = useRef(false);
  
  // Show welcome notification only once per session
  useEffect(() => {
    if (!hasShownNotificationRef.current) {
      // Add a small delay to ensure the notification system is ready
      const timer = setTimeout(() => {
        // Personalize welcome message if user is logged in
        if (user) {
          showSuccess(`Welcome to Fear of God, ${user.first_name}!`);
        } else {
          showSuccess('Welcome to Fear of God Clothing!');
        }
        hasShownNotificationRef.current = true;
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccess, user]);

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Fear of God: Premium Streetwear</h1>
            <p>Elevate your style with our exclusive streetwear collection.</p>
            <div className="hero-buttons">
              <Link to="/shop" className="btn btn-primary">Shop Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <h2>About Us</h2>
          <p>Fear of God is a premium streetwear brand dedicated to bringing you high-quality fashion essentials. We focus on minimalist designs, exceptional materials, and contemporary silhouettes that define modern street style.</p>
        </div>
      </section>

      {/* Product Preview */}
      <section className="product-preview">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="product-row">
            <div className="product-item">
              <img src="https://via.placeholder.com/200x250" alt="Streetwear T-Shirt" />
              <h3>Essential T-Shirt</h3>
              <p className="price">₱599.00</p>
            </div>
            <div className="product-item">
              <img src="https://via.placeholder.com/200x250" alt="Streetwear Hoodie" />
              <h3>Oversized Hoodie</h3>
              <p className="price">₱1,299.00</p>
            </div>
            <div className="product-item">
              <img src="https://via.placeholder.com/200x250" alt="Streetwear Cap" />
              <h3>Premium Cap</h3>
              <p className="price">₱499.00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose Us</h2>
          <div className="features-list">
            <div className="feature-item">
              <strong>Premium Materials</strong>
              <p>Every piece is crafted with the highest quality fabrics and materials.</p>
            </div>
            <div className="feature-item">
              <strong>Fast Shipping</strong>
              <p>Get your orders delivered quickly across the Philippines.</p>
            </div>
            <div className="feature-item">
              <strong>Easy Returns</strong>
              <p>Not satisfied? Return within 30 days for a full refund.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Elevate Your Streetwear Game</h2>
          <p>Browse our collection and discover premium streetwear essentials today.</p>
          <div className="cta-buttons">
            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
            <Link to="/register" className="btn btn-secondary">Create Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
