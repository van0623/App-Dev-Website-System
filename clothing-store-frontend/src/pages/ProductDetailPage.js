import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import '../App.css';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const { addToCart } = useCart();
  const [success, setSuccess] = useState('');
  const { user } = useUser();

  // Same default products from ShopPage
  const defaultProducts = [
    {
      id: 1,
      name: "Faith T-Shirt",
      description: "Comfortable cotton t-shirt with inspiring message. Made from 100% premium cotton, this shirt features a beautiful faith-based design that allows you to express your beliefs in style. Perfect for casual wear, church events, or daily inspiration.",
      price: 899,
      image_url: "https://via.placeholder.com/400x400/2c5aa0/FFFFFF?text=Faith+T-Shirt",
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      category: "T-Shirts"
    },
    {
      id: 2,
      name: "Prayer Hoodie",
      description: "Warm and cozy hoodie perfect for daily wear. This premium fleece hoodie combines comfort with faith, featuring a subtle prayer-inspired design. The soft interior and durable exterior make it perfect for cooler weather.",
      price: 1599,
      image_url: "https://via.placeholder.com/400x400/28a745/FFFFFF?text=Prayer+Hoodie",
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      category: "Hoodies"
    },
    {
      id: 3,
      name: "Hope Cap",
      description: "Stylish cap with embroidered Christian symbol. This adjustable baseball cap features premium embroidery and comfortable fit. Perfect for outdoor activities while representing your faith.",
      price: 499,
      image_url: "https://via.placeholder.com/400x400/6f42c1/FFFFFF?text=Hope+Cap",
      sizes: ['One Size'],
      category: "Accessories"
    },
    {
      id: 4,
      name: "Grace Jacket",
      description: "Lightweight jacket for any season. This versatile jacket combines style and functionality with a subtle faith-based message. Water-resistant and windproof, perfect for various weather conditions.",
      price: 2299,
      image_url: "https://via.placeholder.com/400x400/fd7e14/FFFFFF?text=Grace+Jacket",
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      category: "Outerwear"
    },
    {
      id: 5,
      name: "Love Tank Top",
      description: "Comfortable tank top for warm weather. Made from breathable fabric, this tank top features an inspiring love-themed design. Perfect for workouts, beach days, or casual summer wear.",
      price: 699,
      image_url: "https://via.placeholder.com/400x400/e83e8c/FFFFFF?text=Love+Tank",
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      category: "Tank Tops"
    },
    {
      id: 6,
      name: "Peace Sweatshirt",
      description: "Cozy sweatshirt with peaceful message. This comfortable sweatshirt features a peace-inspired design and is perfect for relaxing or casual outings. Made from soft, durable fabric.",
      price: 1299,
      image_url: "https://via.placeholder.com/400x400/20c997/FFFFFF?text=Peace+Sweatshirt",
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      category: "Sweatshirts"
    }
  ];

  useEffect(() => {
    // Find product by ID
    const foundProduct = defaultProducts.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedSize(foundProduct.sizes[0]); // Set first available size as default
    } else {
      setError('Product not found');
    }
    setLoading(false);
  }, [id]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (selectedSize === '') {
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
              src={product.image_url} 
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
            <div className="size-selection">
              <h4>Size</h4>
              <div className="size-options">
                {product.sizes.map(size => (
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
                <li>✓ Faith-inspired design</li>
                <li>✓ Comfortable fit</li>
                <li>✓ Machine washable</li>
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
