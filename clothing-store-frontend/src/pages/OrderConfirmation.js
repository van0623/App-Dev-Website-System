import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import '../App.css';

const OrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError('Order not found');
      }
    } catch (error) {
      setError('Failed to fetch order details');
      console.error('Fetch order details error:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      fetchOrderDetails();
    }
  }, [user, id, fetchOrderDetails]);

  if (!user) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="access-denied">
            <h2>Please login to view order confirmation</h2>
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="loading">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="error-page">
            <h2>{error || 'Order not found'}</h2>
            <Link to="/order-history" className="btn btn-primary">
              Back to Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-header">
          <h1>Order Confirmation</h1>
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <h2>Thank you for your order!</h2>
            <p>Your order has been successfully placed.</p>
          </div>
        </div>

        <div className="confirmation-content">
          <div className="order-info">
            <h3>Order Details</h3>
            <div className="info-grid">
              <div className="info-section">
                <h4>Order Information</h4>
                <p><strong>Order Number:</strong> #{order.id}</p>
                <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className="status-badge">{order.order_status}</span></p>
                <p><strong>Payment Method:</strong> {order.payment_method}</p>
                <p><strong>Payment Status:</strong> {order.payment_status}</p>
              </div>

              <div className="info-section">
                <h4>Shipping Information</h4>
                <p><strong>Name:</strong> {order.customer_name}</p>
                <p><strong>Address:</strong> {order.shipping_address}</p>
              </div>
            </div>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="items-list">
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    <img 
                      src={item.image_url 
                        ? `http://localhost:5000${item.image_url}`
                        : `https://via.placeholder.com/150?text=${encodeURIComponent(item.product_name || 'Product')}`} 
                      alt={item.product_name || 'Product'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://via.placeholder.com/150?text=${encodeURIComponent(item.product_name || 'Product')}`;
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <h4>{item.product_name}</h4>
                    <p>Size: {item.size}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ₱{(Number(item.price) * Number(item.quantity)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-total">
              <div className="total-row">
                <span>Total Amount:</span>
                <span>₱{Number(order.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
            <Link to="/order-history" className="btn btn-secondary">View Order History</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 