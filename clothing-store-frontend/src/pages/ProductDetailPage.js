import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import '../App.css';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const { addToCart } = useCart();
  const [success, setSuccess] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
        // Set default size if available
        if (response.data.size) {
          setSelectedSize(response.data.size.split(',')[0].trim());
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError('Please select a size');
      return;
    }

    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: quantity,
      image: product.image_url
    };

    // Pass user ID if authenticated
    addToCart(productToAdd, user?.id);
    setSuccess(`${product.name} added to cart!`);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="error-page">
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  // Parse available sizes from the size string
  const availableSizes = product.size ? product.size.split(',').map(size => size.trim()) : [];

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Back Button */}
        <button onClick={() => navigate('/shop')} className="back-button">
          Back to Shop
        </button>
        
        {success && (
          <div className="success-message">
            <i>✓</i> {success} 
            <Link to="/cart" className="view-cart-link">View Cart</Link>
          </div>
        )}
        
        <div className="product-detail-container">
          {/* Product Image */}
          <div className="product-image-section">
            <img 
              src={`http://localhost:5000${product.image_url}`}
              alt={product.name}
              className="product-main-image"
            />
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="product-breadcrumb">
              <Link to="/shop">Shop</Link> / <span>{product.category}</span> / <span>{product.name}</span>
            </div>

            <h1 className="product-title">{product.name}</h1>
            <p className="product-price">₱{product.price}</p>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="size-selection">
                <h4>Size</h4>
                <div className="size-options">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="quantity-selection">
              <h4>Quantity</h4>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="add-to-cart-section">
              <button 
                className="btn btn-primary add-to-cart-btn"
                onClick={handleAddToCart}
              >
                Add to Cart - ₱{(product.price * quantity).toLocaleString()}
              </button>
            </div>

            {/* Product Features */}
            <div className="product-features">
              <ul>
                <li>✓ High-quality materials</li>
                <li>✓ Comfortable fit</li>
                <li>✓ Machine washable</li>
                {product.color && <li>✓ Available in {product.color}</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Alternative back link for mobile */}
        <div className="back-to-shop">
          <Link to="/shop" className="btn btn-secondary">
            ← Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
