import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import '../App.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useUser();
  const { getCartItemCount, cart } = useCart();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { showSuccess } = useNotification();

  // Debug log for user and cart state
  useEffect(() => {
    console.log('Header component - Current user:', user);
    console.log('Header component - Cart state:', cart);
  }, [user, cart]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };
  
  const handleLogoutConfirm = () => {
    console.log('Logging out user:', user);
    logout();
    showSuccess('You have been successfully logged out');
    navigate('/');
    setShowLogoutConfirm(false);
  };
  
  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const cartItemCount = getCartItemCount();
  const isAdmin = user && user.role === 'admin';

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            Fear of God
          </Link>
          
          <nav className="nav-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/shop" className="nav-link">Shop</Link>
            <Link to="/cart" className="nav-link cart-link">
              Cart {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
            </Link>
            
            {isAuthenticated ? (
              <div className="auth-section">
                <span className="nav-link user-greeting">
                  Hello, {user?.first_name || 'User'} {user?.role ? `(${user.role})` : ''}
                </span>
                {isAdmin && (
                  <Link to="/admin" className="admin-link">
                    Admin Panel
                  </Link>
                )}
                <Link to="/profile" className="profile-link">
                  My Profile
                </Link>
                <button onClick={handleLogoutClick} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-section">
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
              </div>
            )}
          </nav>
        </div>
      </div>
      
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={handleLogoutCancel}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleLogoutConfirm}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
