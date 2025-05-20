import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import '../App.css';

const AdminDashboard = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="access-denied">Access Denied: Admin Only</div>;
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="loading">Loading dashboard statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
            <button onClick={fetchStats} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="page-header">
          <Link to="/admin" className="back-button">
            Back to Admin Panel
          </Link>
          <h1>Admin Dashboard</h1>
        </div>
        
        <p className="welcome-message">Welcome back, {user.first_name}!</p>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-card">
            <h3>₱{stats.totalRevenue?.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>📦 Product Management</h3>
            <p>Create, read, update, and delete products</p>
            <Link to="/admin/products" className="btn btn-primary">
              Manage Products
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>📋 Order Management</h3>
            <p>View and update order status</p>
            <Link to="/admin/orders" className="btn btn-primary">
              Manage Orders
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>👥 User Management</h3>
            <p>View and manage user accounts</p>
            <Link to="/admin/users" className="btn btn-primary">
              Manage Users
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
