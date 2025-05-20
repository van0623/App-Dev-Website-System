import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import '../App.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && id) {
      fetchOrderDetails();
    }
  }, [user, id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/orders/${id}`);
      
      if (response.data.success) {
        const orderWithValidImages = {
          ...response.data.order,
          items: response.data.orderItems.map(item => ({
            ...item,
            image_url: item.image_url || `https://via.placeholder.com/150?text=${encodeURIComponent(item.product_name)}`
          }))
        };
        setOrder(orderWithValidImages);
        setOrderItems(orderWithValidImages.items || []);
      } else {
        setError('Order not found');
      }
    } catch (error) {
      setError('Failed to fetch order details');
      console.error('Fetch order details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#28a745';
      case 'delivered': return '#20c997';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReorder = () => {
    // Add all items from this order to cart
    // This would require adding items to CartContext
    console.log('Reorder functionality to be implemented');
    alert('Reorder functionality will be implemented soon!');
  };

  if (!user) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="access-denied">
            <h2>Please login to view order details</h2>
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
      <div className="order-detail-page">
        <div className="container">
          <div className="loading">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-button">
            Back
          </button>
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
    <div className="order-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          Back
        </button>

        <div className="order-detail-header">
          <div className="order-title">
            <h1>Order #{order.id}</h1>
            <span 
              className="status-badge large"
              style={{ backgroundColor: getStatusColor(order.order_status) }}
            >
              {order.order_status || 'Pending'}
            </span>
          </div>
          <p className="order-date">Ordered on {formatDate(order.created_at)}</p>
        </div>

        <div className="order-detail-content">
          <div className="order-info-grid">
            <div className="order-section">
              <h3>Order Summary</h3>
              <div className="order-summary-details">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₱{(Number(order.total_amount) - (order.shipping_amount || 0) - (order.tax_amount || 0)).toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>₱{Number(order.shipping_amount || 0).toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (12% VAT):</span>
                  <span>₱{Number(order.tax_amount || 0).toLocaleString()}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₱{Number(order.total_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="order-section">
              <h3>Shipping Information</h3>
              <div className="shipping-info">
                <p><strong>Address:</strong> {order.shipping_address}</p>
                <p><strong>Payment Method:</strong> Cash on Delivery</p>
                <p><strong>Payment Status:</strong> {order.payment_status || 'Pending'}</p>
              </div>
            </div>
          </div>

          <div className="order-items-section">
            <h3>Items Ordered ({orderItems.length})</h3>
            <div className="order-items">
              {orderItems.map(item => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    <img src={item.image_url || '/placeholder.jpg'} alt={item.product_name} />
                  </div>
                  <div className="item-details">
                    <h4>{item.product_name}</h4>
                    <p>Size: {item.size}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    <span>₱{Number(item.price).toLocaleString()}</span>
                  </div>
                  <div className="item-total">
                    <span>₱{(Number(item.price) * Number(item.quantity)).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-actions">
            {order.order_status === 'delivered' && (
              <button onClick={handleReorder} className="btn btn-success">
                Reorder Items
              </button>
            )}
            <Link to="/order-history" className="btn btn-secondary">
              Back to Order History
            </Link>
            <Link to="/shop" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 