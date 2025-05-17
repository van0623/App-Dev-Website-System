import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const OrderHistory = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/orders/user/${user.id}`);
      
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      setError('Failed to fetch orders');
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#28a745';
      case 'delivered': return '#20c997';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.order_status?.toLowerCase() === filterStatus);

  if (!user) {
    return (
      <div className="order-history-page">
        <div className="container">
          <div className="access-denied">
            <h2>Please login to view your order history</h2>
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          Back
        </button>

        <div className="page-header">
          <h1>Order History</h1>
          <p>Track all your orders and purchases</p>
        </div>

        <div className="order-filters">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select 
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <h3>No orders found</h3>
            <p>
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet."
                : `No orders with status "${filterStatus}" found.`
              }
            </p>
            <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.order_status) }}
                    >
                      {order.order_status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-summary">
                    <p><strong>Total:</strong> ₱{Number(order.total_amount).toLocaleString()}</p>
                    <p><strong>Payment:</strong> {order.payment_status || 'Pending'}</p>
                    <p><strong>Shipping:</strong> {order.shipping_address}</p>
                  </div>

                  <div className="order-actions">
                    <Link 
                      to={`/order/${order.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      View Details
                    </Link>
                    {order.order_status === 'delivered' && (
                      <button className="btn btn-secondary btn-sm">
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="order-history-footer">
          <Link to="/profile" className="btn btn-secondary">
            Back to Profile
          </Link>
          <Link to="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory; 