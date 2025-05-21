// src/pages/ShopPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css'; 
import { useCart } from '../context/CartContext';

function ShopPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [storeSettings, setStoreSettings] = useState(null);
  const { cart, getCartItemCount } = useCart() || {};

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch store settings
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/store-settings');
        setStoreSettings(response.data);
      } catch (error) {
        console.error('Error fetching store settings:', error);
      }
    };

    fetchStoreSettings();
  }, []);

  // Filter products when search term or category changes
  useEffect(() => {
    let result = products;
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(search) || 
        product.description.toLowerCase().includes(search)
      );
    }
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  // Get unique categories from products
  const categories = ['All', ...new Set(products.map(product => product.category))];

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="shop-page">
      <div className="container">
        {/* Back Button */}
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>
      
      <div className="shop-header">
        <h1>Premium Streetwear Collection</h1>
        <p>Discover our selection of authentic, brand new streetwear from top brands</p>
        
        {/* Search and Filter */}
        <div className="shop-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
          <button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('All');
          }} className="btn btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="product-list">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-category">{product.category}</div>
              <img
                src={`http://localhost:5000${product.image_url}`}
                alt={product.name}
                className="product-image"
              />
              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">₱{product.price.toLocaleString()}</p>
                <div className="product-actions">
                  <Link to={`/product/${product.id}`}>
                    <button className="view-details-btn">View Details</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="shop-footer">
        <div className="contact-info">
          <div className="contact-item">
            <h3>Contact Us</h3>
            <p>Email: {storeSettings?.contact_email || 'support@fearofgod.com'}</p>
            <p>Phone: {storeSettings?.contact_phone || '+63 912 345 6789'}</p>
          </div>
          <div className="contact-item">
            <h3>Location</h3>
            <p>{storeSettings?.store_address || '123 Fashion Street'}</p>
            <p>{storeSettings?.store_city || 'Manila'}, {storeSettings?.store_country || 'Philippines'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopPage;
