// src/components/ProductList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../ProductCard';

const ProductList = ({ addToCart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetching products from the backend
    axios.get('http://localhost:5000/api/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  return (
    <div className="row">
      {products.map((product) => (
        <div key={product.id} className="col-4">
          <ProductCard product={product} addToCart={addToCart} />
        </div>
      ))}
    </div>
  );
};

export default ProductList;
