import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotifications } from '../context/NotificationContext';
import '../App.css';

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Yes, Cancel Order", cancelText = "No, Keep Order" }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirmation-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className="btn btn-danger" 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderHistory = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your orders');
        showError('Please login to view your orders');
        return;
      }

      console.log('Fetching orders for user:', user?.id);
      const response = await axios.get(`http://localhost:5000/api/orders/user/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Orders response:', response.data);
      
      if (response.data.success) {
        const ordersWithValidImages = response.data.orders.map(order => ({
          ...order,
          items: order.items.map(item => ({
            ...item,
            image_url: item.image_url || `https://via.placeholder.com/150?text=${encodeURIComponent(item.product_name)}`
          }))
        }));
        console.log('Processed orders:', ordersWithValidImages);
        setOrders(ordersWithValidImages);
      } else {
        console.error('Failed to fetch orders:', response.data);
        setError('Failed to fetch orders');
        showError('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error.response || error);
      setError('Failed to fetch orders: ' + (error.response?.data?.message || error.message));
      showError(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showError]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  const initiateCancelOrder = (order) => {
    setSelectedOrder(order);
    setShowConfirmDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedOrder) return;

    setCancellingOrderId(selectedOrder.id);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Authentication token not found. Please login again.');
        return;
      }

      console.log('Cancelling order:', {
        orderId: selectedOrder.id,
        currentStatus: selectedOrder.order_status,
        currentPaymentStatus: selectedOrder.payment_status
      });
      
      const response = await axios.post(
        `http://localhost:5000/api/orders/${selectedOrder.id}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Cancel response:', response.data);
      
      if (response.data.success) {
        showSuccess('Order cancelled successfully');
        
        // Ensure we're using the status from the response if available
        const newStatus = response.data.order?.order_status || 'cancelled';
        const newPaymentStatus = response.data.order?.payment_status || 'failed';
        
        console.log('Updating order with new status:', {
          orderId: selectedOrder.id,
          newStatus,
          newPaymentStatus
        });

        // Update the local state with the new status
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrder.id 
              ? {
                  ...order,
                  order_status: newStatus,
                  payment_status: newPaymentStatus
                }
              : order
          )
        );

        // Update the selected order details if it's being viewed
        if (selectedOrderDetails?.id === selectedOrder.id) {
          setSelectedOrderDetails(prev => ({
            ...prev,
            order_status: newStatus,
            payment_status: newPaymentStatus
          }));
        }

        // Fetch fresh data from the server to ensure we have the correct status
        await fetchOrders();
      } else {
        console.error('Cancel order response indicates failure:', response.data);
        showError('Failed to cancel order: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showError(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
      setShowConfirmDialog(false);
      setSelectedOrder(null);
    }
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
    setSelectedOrder(null);
  };

  const canCancelOrder = (order) => {
    return order.order_status === 'pending' || order.order_status === 'confirmed';
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
    : orders.filter(order => {
        const orderStatus = order.order_status?.toLowerCase() || '';
        const filterValue = filterStatus.toLowerCase();
        console.log('Filtering order:', {
          orderId: order.id,
          orderStatus,
          filterValue,
          matches: orderStatus === filterValue
        });
        return orderStatus === filterValue;
      });

  // Add debug logging for orders
  useEffect(() => {
    console.log('Current orders:', orders.map(order => ({
      id: order.id,
      status: order.order_status,
      statusLower: order.order_status?.toLowerCase()
    })));
  }, [orders]);

  // Add debug logging for filter changes
  useEffect(() => {
    console.log('Filter status changed:', filterStatus);
  }, [filterStatus]);

  const handleViewDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Please login to view order details');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSelectedOrderDetails(response.data.order);
        setIsDetailsModalOpen(true);
      } else {
        showError('Failed to load order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      showError('Failed to load order details');
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrderDetails(null);
  };

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

                <div className="order-items-preview">
                  {order.items && order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="order-item-preview">
                      <div className="item-image">
                        <img 
                          src={item.image_url 
                            ? `http://localhost:5000${item.image_url}`
                            : `https://via.placeholder.com/100?text=${encodeURIComponent(item.product_name || 'Product')}`} 
                          alt={item.product_name || 'Product'}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/100?text=${encodeURIComponent(item.product_name || 'Product')}`;
                          }}
                        />
                      </div>
                      <div className="item-details">
                        <h4>{item.product_name || 'Product'}</h4>
                        <p>Size: {item.size || 'N/A'}</p>
                        <p>Quantity: {item.quantity || 1}</p>
                        <p className="item-price">₱{Number(item.price || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {order.items && order.items.length > 2 && (
                    <div className="more-items">
                      +{order.items.length - 2} more items
                    </div>
                  )}
                </div>

                <div className="order-summary">
                  <p><strong>Total:</strong> ₱{Number(order.total_amount).toLocaleString()}</p>
                  <p><strong>Payment:</strong> {order.payment_status || 'Pending'}</p>
                  <p><strong>Shipping:</strong> {order.shipping_address}</p>
                </div>

                <div className="order-actions">
                  {canCancelOrder(order) && (
                    <button
                      className="btn btn-danger"
                      onClick={() => initiateCancelOrder(order)}
                      disabled={cancellingOrderId === order.id}
                    >
                      {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                  <button 
                    onClick={() => handleViewDetails(order.id)}
                    className="btn btn-primary"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {isDetailsModalOpen && selectedOrderDetails && (
          <div className="modal-overlay">
            <div className="modal-content order-details-modal">
              <div className="modal-header">
                <h3>Order Details #{selectedOrderDetails.id}</h3>
                <button onClick={closeDetailsModal} className="close-button">&times;</button>
              </div>
              <div className="modal-body">
                <div className="order-details-grid">
                  <div className="order-info-section">
                    <h4>Order Information</h4>
                    <p><strong>Order Date:</strong> {new Date(selectedOrderDetails.created_at).toLocaleString()}</p>
                    <p><strong>Status:</strong> 
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedOrderDetails.order_status) }}
                      >
                        {selectedOrderDetails.order_status}
                      </span>
                    </p>
                    <p><strong>Payment Status:</strong> {selectedOrderDetails.payment_status}</p>
                    <p><strong>Shipping Address:</strong> {selectedOrderDetails.shipping_address}</p>
                  </div>

                  <div className="order-items-section">
                    <h4>Order Items</h4>
                    <div className="order-items-list">
                      {selectedOrderDetails.items?.map((item, index) => (
                        <div key={index} className="order-item-detail">
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
                          <div className="item-info">
                            <h5>{item.product_name || 'Product'}</h5>
                            <p>Size: {item.size || 'N/A'}</p>
                            <p>Quantity: {item.quantity || 1}</p>
                            <p className="item-price">₱{Number(item.price || 0).toLocaleString()} each</p>
                            <p className="item-total">Total: ₱{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="order-summary-section">
                    <h4>Order Summary</h4>
                    <div className="summary-details">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>₱{(Number(selectedOrderDetails.total_amount) - (selectedOrderDetails.shipping_amount || 0) - (selectedOrderDetails.tax_amount || 0)).toLocaleString()}</span>
                      </div>
                      <div className="summary-row">
                        <span>Shipping:</span>
                        <span>₱{Number(selectedOrderDetails.shipping_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="summary-row">
                        <span>Tax (12% VAT):</span>
                        <span>₱{Number(selectedOrderDetails.tax_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total Amount:</span>
                        <span>₱{Number(selectedOrderDetails.total_amount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={closeDetailsModal} className="btn btn-secondary">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={handleCancelClose}
          onConfirm={handleCancelConfirm}
          title="Cancel Order Confirmation"
          message={`Are you sure you want to cancel Order #${selectedOrder?.id}? This action cannot be undone.`}
          confirmText="Yes, Cancel Order"
          cancelText="No, Keep Order"
        />

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