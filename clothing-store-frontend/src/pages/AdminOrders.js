import React, { useState, useEffect, useCallback } from 'react';
import '../App.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const validateStatusChange = (currentStatus, newStatus) => {
    const validTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      showNotification(`Cannot change status from ${currentStatus} to ${newStatus}`, 'error');
      return false;
    }
    return true;
  };

  const validatePaymentStatusChange = (currentStatus, newStatus, orderStatus) => {
    // Immediately return false for cancelled orders - no changes allowed
    if (orderStatus === 'cancelled') {
      showNotification('Payment status cannot be changed for cancelled orders', 'error');
      return false;
    }

    if (orderStatus === 'delivered' && currentStatus !== newStatus) {
      showNotification('Cannot change payment status of delivered orders', 'error');
      return false;
    }

    return true;
  };

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const sortedOrders = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Check for status changes
      if (orders.length > 0) {
        const statusChanges = sortedOrders.filter(newOrder => {
          const oldOrder = orders.find(o => o.id === newOrder.id);
          return oldOrder && oldOrder.order_status !== newOrder.order_status;
        });

        if (statusChanges.length > 0) {
          statusChanges.forEach(order => {
            if (order.order_status === 'cancelled') {
              showNotification(`Order #${order.id} has been cancelled`, 'info');
            }
          });
        }
      }

      setOrders(sortedOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders. Please try again later.');
    }
  }, [orders]);

  useEffect(() => {
    fetchOrders();
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (!validateStatusChange(order.order_status.toLowerCase(), newStatus)) {
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ order_status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      showNotification(`Order status updated to ${newStatus}`);
      
      await fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      showNotification(err.message || 'Failed to update order status', 'error');
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Prevent any payment status changes for cancelled orders
      if (order.order_status.toLowerCase() === 'cancelled') {
        showNotification('Payment status cannot be changed for cancelled orders', 'error');
        return;
      }

      if (!validatePaymentStatusChange(
        order.payment_status.toLowerCase(),
        newStatus,
        order.order_status.toLowerCase()
      )) {
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ payment_status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update payment status');
      }

      showNotification(`Payment status updated to ${newStatus}`);
      await fetchOrders();
    } catch (err) {
      console.error('Error updating payment status:', err);
      showNotification(err.message || 'Failed to update payment status', 'error');
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const orderDetails = await response.json();
      setSelectedOrder(orderDetails);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
    }
  };

  const handleEditOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const orderDetails = await response.json();
      setEditedOrder(orderDetails);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${editedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(editedOrder)
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === editedOrder.id ? editedOrder : order
        )
      );

      setIsEditModalOpen(false);
      setEditedOrder(null);
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditedOrder(null);
  };

  const renderPaymentStatusSelect = (order) => {
    const isCancelled = order.order_status.toLowerCase() === 'cancelled';
    
    if (isCancelled) {
      return (
        <div className="payment-status-display failed">
          Failed
        </div>
      );
    }

    return (
      <select
        value={order.payment_status.toLowerCase()}
        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
        className={`payment-status-select ${order.payment_status.toLowerCase()}`}
      >
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="failed">Failed</option>
      </select>
    );
  };

  if (error) return <div className="admin-error">{error}</div>;

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.order_status.toLowerCase() === selectedStatus);

  return (
    <div className="admin-orders">
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="admin-header">
        <h1>Order Management</h1>
        <div className="order-filters">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="admin-empty-state">
          <h3>No Orders Found</h3>
          <p>There are no orders matching the current filter.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="table-scroll-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Order Status</th>
                  <th>Payment Status</th>
                  <th>Total Amount</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={`order-row ${order.order_status.toLowerCase()}`}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>
                      <select
                        value={order.order_status.toLowerCase()}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`status-select ${order.order_status.toLowerCase()}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      {renderPaymentStatusSelect(order)}
                    </td>
                    <td>₱{Number(order.total_amount).toLocaleString()}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-view" 
                          onClick={() => handleViewOrder(order.id)}
                        >
                          View
                        </button>
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEditOrder(order.id)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Order Details</h3>
            <div className="order-details">
              <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
              <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
              <p><strong>Order Status:</strong> {selectedOrder.order_status}</p>
              <p><strong>Payment Status:</strong> {selectedOrder.payment_status}</p>
              <p><strong>Total Amount:</strong> ₱{selectedOrder.total_amount}</p>
              <p><strong>Created At:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              <div className="order-items">
                <h4>Order Items</h4>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <p>{item.name} - Quantity: {item.quantity} - Price: ₱{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Order</h3>
            <form onSubmit={handleEditSubmit} className="edit-order-form">
              <div className="form-group">
                <label>Order ID</label>
                <input type="text" value={`#${editedOrder.id}`} disabled />
              </div>
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  name="customer_name"
                  value={editedOrder.customer_name}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="order_status"
                  value={editedOrder.order_status}
                  onChange={handleEditChange}
                  className={`status-select ${editedOrder.order_status.toLowerCase()}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Total Amount</label>
                <div className="input-with-symbol">
                  <span>₱</span>
                  <input
                    type="number"
                    name="total_amount"
                    value={editedOrder.total_amount}
                    onChange={handleEditChange}
                    step="0.01"
                  />
                </div>
              </div>
              <div className="order-items">
                <h4>Order Items</h4>
                {editedOrder.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="form-group">
                      <label>Item Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const newItems = [...editedOrder.items];
                          newItems[index] = { ...item, name: e.target.value };
                          setEditedOrder(prev => ({ ...prev, items: newItems }));
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...editedOrder.items];
                          newItems[index] = { ...item, quantity: parseInt(e.target.value) };
                          setEditedOrder(prev => ({ ...prev, items: newItems }));
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Price</label>
                      <div className="input-with-symbol">
                        <span>₱</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...editedOrder.items];
                            newItems[index] = { ...item, price: parseFloat(e.target.value) };
                            setEditedOrder(prev => ({ ...prev, items: newItems }));
                          }}
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
