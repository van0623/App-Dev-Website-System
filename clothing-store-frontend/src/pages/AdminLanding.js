import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../App.css';

const AdminLanding = () => {
  const { user } = useUser();

  if (!user || user.role !== 'admin') {
    return <div className="access-denied">Access Denied: Admin Only</div>;
  }

  return (
    <div className="admin-landing">
      <div className="admin-landing-overlay">
        <div className="container">
          <div className="admin-welcome">
            <div className="welcome-content">
              <div className="admin-avatar">
                <span>{user.first_name?.charAt(0)}{user.last_name?.charAt(0)}</span>
              </div>
              <h1>Welcome Back, <span className="highlight">{user.first_name}</span></h1>
              <p className="welcome-subtitle">Your administrative dashboard awaits</p>
            </div>
          </div>

          <div className="admin-choices">
            <div className="choice-card dashboard-card">
              <div className="choice-header">
                <div className="choice-icon">📊</div>
                <h2>Dashboard</h2>
              </div>
              <p>View store statistics and performance metrics</p>
              <div className="choice-stats">
                <span>Analytics overview</span>
              </div>
              <Link to="/admin/dashboard" className="choice-btn primary">
                View Dashboard
              </Link>
            </div>

            <div className="choice-card products-card">
              <div className="choice-header">
                <div className="choice-icon">👕</div>
                <h2>Products</h2>
              </div>
              <p>Manage your product inventory and categories</p>
              <div className="choice-stats">
                <span>Product management</span>
              </div>
              <Link to="/admin/products" className="choice-btn success">
                Manage Products
              </Link>
            </div>

            <div className="choice-card orders-card">
              <div className="choice-header">
                <div className="choice-icon">📦</div>
                <h2>Orders</h2>
              </div>
              <p>View and process customer orders</p>
              <div className="choice-stats">
                <span>Order fulfillment</span>
              </div>
              <Link to="/admin/orders" className="choice-btn warning">
                Manage Orders
              </Link>
            </div>

            <div className="choice-card users-card">
              <div className="choice-header">
                <div className="choice-icon">👥</div>
                <h2>User Management</h2>
              </div>
              <p>View and manage user accounts and permissions</p>
              <div className="choice-stats">
                <span>User administration</span>
              </div>
              <Link to="/admin/users" className="choice-btn info">
                Manage Users
              </Link>
            </div>

            <div className="choice-card settings-card">
              <div className="choice-header">
                <div className="choice-icon">⚙️</div>
                <h2>Store Settings</h2>
              </div>
              <p>Configure store options and preferences</p>
              <div className="choice-stats">
                <span>System configuration</span>
              </div>
              <Link to="/admin/settings" className="choice-btn secondary">
                Store Settings
              </Link>
            </div>

            <div className="choice-card secondary-card">
              <div className="choice-header">
                <div className="choice-icon">🏪</div>
                <h2>Customer View</h2>
              </div>
              <p>View your store as customers see it</p>
              <div className="choice-stats">
                <span>User experience</span>
              </div>
              <Link to="/" className="choice-btn secondary">
                Go to Store
              </Link>
            </div>

            <div className="choice-card quick-actions-card">
              <div className="choice-header">
                <div className="choice-icon">⚡</div>
                <h2>Quick Actions</h2>
              </div>
              <p>Common administrative tasks</p>
              <div className="quick-actions">
                <Link to="/admin/products?action=add" className="quick-btn">
                  <span>➕</span> Add Product
                </Link>
                <Link to="/admin/orders?filter=pending" className="quick-btn">
                  <span>⏳</span> Pending Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLanding; 