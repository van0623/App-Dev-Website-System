const db = require('../config/db');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { 
      user_id, 
      items, 
      total_amount, 
      shipping_amount,
      tax_amount,
      shipping_address,
      payment_method 
    } = req.body;

    console.log('Received order data:', req.body); // Debug log

    // Validate required fields
    if (!user_id || !items || !total_amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, items, or total_amount'
      });
    }

    // Validate shipping address
    if (!shipping_address || !shipping_address.address || !shipping_address.city || !shipping_address.zipCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping address. Please provide address, city, and zip code.'
      });
    }

    // Format shipping address
    const formattedShippingAddress = `${shipping_address.address}, ${shipping_address.city}, ${shipping_address.zipCode}`;

    // Validate items
    const validatedItems = items.map(item => {
      if (!item.product_id || !item.product_name || !item.price || !item.size || !item.quantity) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      return {
        product_id: item.product_id,
        product_name: item.product_name,
        price: Number(item.price),
        size: item.size,
        quantity: Number(item.quantity),
        image_url: item.image_url || null
      };
    });

    // Create order
    const result = await Order.create({
      userId: user_id,
      products: validatedItems,
      totalAmount: Number(total_amount),
      shippingAmount: Number(shipping_amount || 0),
      taxAmount: Number(tax_amount || 0),
      shippingAddress: formattedShippingAddress,
      paymentMethod: payment_method || 'cash-on-delivery',
      status: 'pending'
    });

    // Create notification for new order
    await Notification.create({
      userId: user_id,
      orderId: result.insertId,
      type: 'order_confirmed',
      message: `Your order #${result.insertId} has been confirmed.`
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: result.insertId
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create order'
    });
  }
};

// Get all orders (for admin or management use)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.getAll();
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const result = await Order.getById(orderId);
    
    if (!result || !result.order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch order' 
    });
  }
};

// Update order status (for admin)
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    const result = await Order.updateStatus(orderId, status);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// Update payment status (for admin)
const updatePaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { payment_status } = req.body;
    
    const result = await Order.updatePaymentStatus(orderId, payment_status);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create notification for payment status change
    try {
      const [order] = await db.query('SELECT user_id FROM orders WHERE id = ?', [orderId]);
      if (order && order[0]) {
        await Notification.create({
          userId: order[0].user_id,
          orderId,
          type: 'payment_status',
          message: `Payment status for order #${orderId} has been updated to ${payment_status}.`
        });
      }
    } catch (notifError) {
      console.error('Error creating payment status notification:', notifError);
    }
    
    res.json({ message: 'Payment status updated successfully' });
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
};

const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;
  let connection;
  const maxRetries = 3;
  let retryCount = 0;

  const executeWithRetry = async () => {
    try {
      // Get a connection from the pool
      connection = await db.getConnection();
      
      // Set a shorter transaction timeout
      await connection.query('SET innodb_lock_wait_timeout = 5');
      
      // Start transaction
      await connection.beginTransaction();

      // Get order details with FOR UPDATE to lock the row
      const [order] = await connection.query(
        'SELECT * FROM orders WHERE id = ? FOR UPDATE',
        [orderId]
      );
      
      if (!order || order.length === 0) {
        await connection.rollback();
        return {
          success: false,
          status: 404,
          message: 'Order not found'
        };
      }

      // Verify order belongs to user
      if (order[0].user_id !== userId) {
        await connection.rollback();
        return {
          success: false,
          status: 403,
          message: 'Not authorized to cancel this order'
        };
      }

      // Check if order can be cancelled
      if (order[0].order_status !== 'pending' && order[0].order_status !== 'confirmed') {
        await connection.rollback();
        return {
          success: false,
          status: 400,
          message: 'Order cannot be cancelled in its current status'
        };
      }

      // Update order status
      await connection.query(
        'UPDATE orders SET order_status = ? WHERE id = ?',
        ['cancelled', orderId]
      );

      // Commit transaction immediately after order update
      await connection.commit();

      // Create notification separately without transaction
      try {
        await Notification.create({
          userId,
          orderId,
          type: 'order_cancelled',
          message: `Your order #${orderId} has been cancelled.`
        });
      } catch (notifError) {
        // Log notification error but don't fail the order cancellation
        console.error('Error creating notification:', notifError);
      }

      return {
        success: true,
        status: 200,
        message: 'Order cancelled successfully'
      };
    } catch (error) {
      // Rollback transaction on error
      if (connection) {
        await connection.rollback();
      }

      // Check if it's a lock timeout error
      if (error.code === 'ER_LOCK_WAIT_TIMEOUT' && retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying order cancellation (attempt ${retryCount}/${maxRetries})`);
        // Wait for a short time before retrying
        await new Promise(resolve => setTimeout(resolve, 500 * retryCount)); // Reduced wait time
        return executeWithRetry();
      }

      throw error;
    } finally {
      // Always release the connection back to the pool
      if (connection) {
        connection.release();
      }
    }
  };

  try {
    const result = await executeWithRetry();
    res.status(result.status).json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel order. Please try again.' 
    });
  }
};

// Add notification endpoints
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.getUnreadByUserId(userId);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get notifications' 
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.markAsRead(notificationId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read' 
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.markAllAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all notifications as read' 
    });
  }
};

module.exports = { 
  createOrder, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  updatePaymentStatus,
  cancelOrder, 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
};
