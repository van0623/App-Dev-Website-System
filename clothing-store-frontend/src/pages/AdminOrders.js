import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import '../App.css';

const AdminOrders = () => {
  const { user } = useUser();
  const { showSuccess, showError } = useNotification();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to load orders');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        order_status: newStatus
      });
      showSuccess('Order status updated successfully!');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Error updating order status');
    }
  };

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/payment`, {
        payment_status: newStatus
      });
      showSuccess('Payment status updated successfully!');
      fetchOrders();
    } catch (error) {
      console.error('Error updating payment status:', error);
      showError('Error updating payment status');
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/orders/${orderId}`);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      showError('Error loading order details');
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.order_status === filterStatus);

  if (!user || user.role !== 'admin') {
    return <div className="access-denied">Access Denied: Admin Only</div>;
  }

  return (
    <div className="admin-orders">
      <div className="container">
        <div className="page-header">
          <Link to="/admin/landing" className="back-button">
            Back to Admin Panel
          </Link>
          <h1>Order Management</h1>
        </div>

        <div className="order-filters">
          <label>Filter by Status:</label>
          <select 
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

        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Order Status</th>
                <th>Payment Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer_name || `Customer ${order.customer_id}`}</td>
                  <td>₱{order.total_amount?.toLocaleString()}</td>
                  <td>
                    <select
                      value={order.order_status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`status-select ${order.order_status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={order.payment_status}
                      onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                      className={`status-select ${order.payment_status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => viewOrderDetails(order.id)}
                      className="btn btn-sm btn-primary"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedOrder && (
          <div className="order-modal">
            <div className="order-modal-content">
              <h2>Order Details - #{selectedOrder.id}</h2>
              
              <div className="order-info">
                <div className="order-section">
                  <h3>Customer Information</h3>
                  <p><strong>Address:</strong> {selectedOrder.shipping_address}</p>
                </div>

                <div className="order-section">
                  <h3>Order Items</h3>
                  <div className="order-items">
                    {selectedOrder.items?.map(item => (
                      <div key={item.id} className="order-item">
                        <img src={item.image_url} alt={item.product_name} />
                        <div>
                          <p><strong>{item.product_name}</strong></p>
                          <p>Size: {item.size}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ₱{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedOrder(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
