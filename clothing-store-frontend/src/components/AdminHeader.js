import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import '../App.css';

const AdminHeader = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { showSuccess } = useNotification();
  
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };
  
  const handleLogoutConfirm = () => {
    logout();
    showSuccess('You have been successfully logged out');
    navigate('/login');
    setShowLogoutConfirm(false);
  };
  
  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <Link to="/" className="admin-logo">Fear of God Admin Panel</Link>
            <div className="admin-nav">
              <Link to="/login" className="admin-nav-link">Login</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-header">
      <div className="container">
        <div className="admin-header-content">
          <Link to="/admin" className="admin-logo">Fear of God Admin</Link>
          
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className="menu-icon">☰</span>
          </button>
          
          <div className={`admin-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link 
              to="/admin/dashboard" 
              className={`admin-nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/admin/products" 
              className={`admin-nav-link ${isActive('/admin/products') ? 'active' : ''}`}
            >
              Products
            </Link>
            <Link 
              to="/admin/orders" 
              className={`admin-nav-link ${isActive('/admin/orders') ? 'active' : ''}`}
            >
              Orders
            </Link>
            <Link 
              to="/admin/users" 
              className={`admin-nav-link ${isActive('/admin/users') ? 'active' : ''}`}
            >
              Users
            </Link>
            <Link 
              to="/admin/settings" 
              className={`admin-nav-link ${isActive('/admin/settings') ? 'active' : ''}`}
            >
              Settings
            </Link>
            <Link to="/" className="admin-nav-link store-link">
              View Store
            </Link>
            
            <div className="admin-user-section">
              <span className="admin-greeting">Hello, {user.first_name}</span>
              <button onClick={handleLogoutClick} className="admin-logout-btn">
                Logout
              </button>
            </div>
          </div>
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
    </div>
  );
};

export default AdminHeader; 