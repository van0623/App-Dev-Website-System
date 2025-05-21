import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';
import Slider from 'react-slick';
import axios from 'axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../App.css';

const HomePage = () => {
  const { showSuccess } = useNotification();
  const { user } = useUser();
  const hasShownNotificationRef = useRef(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState({
    id: null,
    zoom: 1,
    rotation: 0,
    showMagnifier: false
  });

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        // Get the latest 6 products for the slideshow
        const latestProducts = response.data.slice(-6);
        setFeaturedProducts(latestProducts);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Show welcome notification only once per session
  useEffect(() => {
    if (!hasShownNotificationRef.current) {
      // Add a small delay to ensure the notification system is ready
      const timer = setTimeout(() => {
        // Personalize welcome message if user is logged in
        if (user) {
          showSuccess(`Welcome to Premium Streetwear, ${user.first_name}!`);
        } else {
          showSuccess('Welcome to Premium Streetwear!');
        }
        hasShownNotificationRef.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, user]);

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const handleImageClick = (productId) => {
    setActiveImage(prev => ({
      ...prev,
      id: productId,
      zoom: prev.zoom === 1 ? 1.5 : 1,
      rotation: prev.rotation
    }));
  };

  const handleDoubleClick = (productId) => {
    setActiveImage({
      id: productId,
      zoom: 1,
      rotation: 0,
      showMagnifier: false
    });
  };

  const handleMouseEnter = (productId) => {
    setActiveImage(prev => ({
      ...prev,
      id: productId,
      showMagnifier: true
    }));
  };

  const handleMouseLeave = () => {
    setActiveImage(prev => ({
      ...prev,
      showMagnifier: false
    }));
  };

  const handleRotate = (productId, direction) => {
    setActiveImage(prev => ({
      ...prev,
      id: productId,
      rotation: prev.rotation + (direction === 'right' ? 90 : -90)
    }));
  };

  const getImageStyle = (productId) => {
    if (activeImage.id !== productId) return {};
    
    return {
      transform: `scale(${activeImage.zoom}) rotate(${activeImage.rotation}deg)`,
      transition: 'transform 0.3s ease',
      cursor: 'zoom-in'
    };
  };

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Premium Streetwear Reseller</h1>
            <p>Your trusted source for authentic, brand new streetwear from the most sought-after brands.</p>
            <div className="hero-buttons">
              <Link to="/shop" className="btn btn-primary">Shop Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Slideshow */}
      <section className="featured-products-section">
        <div className="container">
          <h2>Latest Arrivals</h2>
          
          {loading ? (
            <div className="loading">Loading featured products...</div>
          ) : (
            <div className="featured-slider-container">
              <Slider {...sliderSettings}>
                {featuredProducts.map((product) => (
                  <div key={product.id} className="featured-slide">
                    <Link to={`/product/${product.id}`} className="featured-product-link">
                      <div className="featured-product-card">
                        <div 
                          className="featured-product-image"
                          onMouseEnter={() => handleMouseEnter(product.id)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <img 
                            src={`http://localhost:5000${product.image_url}`} 
                            alt={product.name}
                            style={getImageStyle(product.id)}
                            onClick={() => handleImageClick(product.id)}
                            onDoubleClick={() => handleDoubleClick(product.id)}
                            onError={(e) => {
                              e.target.src = '/images/placeholder.jpg';
                            }}
                          />
                          {activeImage.showMagnifier && activeImage.id === product.id && (
                            <div className="image-controls-overlay">
                              <button 
                                className="rotate-btn left"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRotate(product.id, 'left');
                                }}
                              >
                                ↺
                              </button>
                              <button 
                                className="rotate-btn right"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRotate(product.id, 'right');
                                }}
                              >
                                ↻
                              </button>
                            </div>
                          )}
                          {activeImage.showMagnifier && activeImage.id === product.id && (
                            <div className="magnifier" />
                          )}
                        </div>
                        <div className="featured-product-info">
                          <h3>{product.name}</h3>
                          <p className="featured-product-price">₱{product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <h2>About Us</h2>
          <p>We are your premier destination for authentic, brand new streetwear. As an authorized reseller, we bring you the latest drops and exclusive pieces from the most coveted streetwear brands. Every item in our collection is 100% authentic and brand new, sourced directly from authorized suppliers.</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose Us</h2>
          <div className="features-list">
            <div className="feature-item">
              <strong>100% Authentic</strong>
              <p>All items are brand new and sourced from authorized suppliers.</p>
            </div>
            <div className="feature-item">
              <strong>Latest Drops</strong>
              <p>Stay ahead with our curated selection of the newest streetwear releases.</p>
            </div>
            <div className="feature-item">
              <strong>Secure Shopping</strong>
              <p>Shop with confidence with our buyer protection and easy returns policy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Discover Premium Streetwear</h2>
          <p>Browse our collection of authentic, brand new streetwear pieces and elevate your style today.</p>
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
