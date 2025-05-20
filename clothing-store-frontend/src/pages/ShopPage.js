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
  const { addToCart } = useCart();

  // Default/sample products with categories
  const defaultProducts = [
    {
      id: 1,
      name: "Faith T-Shirt",
      description: "Comfortable cotton t-shirt with inspiring message",
      price: 899,
      image_url: "https://via.placeholder.com/250x250/2c5aa0/FFFFFF?text=Faith+T-Shirt",
      category: "T-Shirts"
    },
    {
      id: 2,
      name: "Prayer Hoodie",
      description: "Warm and cozy hoodie perfect for daily wear",
      price: 1599,
      image_url: "https://via.placeholder.com/250x250/28a745/FFFFFF?text=Prayer+Hoodie",
      category: "Hoodies"
    },
    {
      id: 3,
      name: "Hope Cap",
      description: "Stylish cap with embroidered Christian symbol",
      price: 499,
      image_url: "https://via.placeholder.com/250x250/6f42c1/FFFFFF?text=Hope+Cap",
      category: "Accessories"
    },
    {
      id: 4,
      name: "Grace Jacket",
      description: "Lightweight jacket for any season",
      price: 2299,
      image_url: "https://via.placeholder.com/250x250/fd7e14/FFFFFF?text=Grace+Jacket",
      category: "Outerwear"
    },
    {
      id: 5,
      name: "Love Tank Top",
      description: "Comfortable tank top for warm weather",
      price: 699,
      image_url: "https://via.placeholder.com/250x250/e83e8c/FFFFFF?text=Love+Tank",
      category: "Tank Tops"
    },
    {
      id: 6,
      name: "Peace Sweatshirt",
      description: "Cozy sweatshirt with peaceful message",
      price: 1299,
      image_url: "https://via.placeholder.com/250x250/20c997/FFFFFF?text=Peace+Sweatshirt",
      category: "Sweatshirts"
    }
  ];

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

  // Try to fetch products from backend, but use default if it fails
  useEffect(() => {
    if (process.env.REACT_APP_API_URL) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/products`)
        .then(response => {
          const productsData = response.data.length > 0 ? response.data : defaultProducts;
          setProducts(productsData);
          setFilteredProducts(productsData);
          setLoading(false);
        })
        .catch(error => {
          console.log('Backend not available, showing default products');
          setProducts(defaultProducts);
          setFilteredProducts(defaultProducts);
          setLoading(false);
        });
    } else {
      // If no API URL, just use default products
      setProducts(defaultProducts);
      setFilteredProducts(defaultProducts);
      setLoading(false);
    }
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

  return (
    <div className="shop-page">
      <div className="container">
        {/* Back Button */}
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>
      
      <div className="shop-header">
        <h1>Our Collection</h1>
        <p>Discover our faith-inspired clothing line</p>
        
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
                src={product.image_url}
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
