// src/components/CartButton.js
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import '../App.css';

const CartButton = () => {
  const { getCartItemCount, getCartTotal } = useCart();
  const itemCount = getCartItemCount();

  return (
    <Link to="/cart" className="cart-button">
      <div className="cart-icon">
        🛒
        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
      </div>
      <div className="cart-info">
        <span className="cart-text">Cart</span>
        <span className="cart-total">₱{getCartTotal().toLocaleString()}</span>
      </div>
    </Link>
  );
};

export default CartButton;
