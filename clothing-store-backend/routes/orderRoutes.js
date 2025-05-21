// controllers/orderRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db'); // your promise-based pool
const { isAdmin, authenticateToken } = require('../middleware/auth');
const { 
  createOrder, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus,
  cancelOrder,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require('../controllers/orderController');

// Get user's orders with items
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching orders for user:', userId);
    
    const [orders] = await db.query(`
      SELECT 
        o.*,
        oi.id as item_id,
        oi.product_id,
        oi.product_name,
        oi.price as item_price,
        oi.size,
        oi.quantity,
        oi.image_url
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC
    `, [userId]);

    console.log('Found orders:', orders);

    // Group items by order
    const ordersWithItems = orders.reduce((acc, row) => {
      const orderId = row.id;
      if (!acc[orderId]) {
        acc[orderId] = {
          id: row.id,
          order_number: row.order_number,
          user_id: row.user_id,
          total_amount: row.total_amount,
          shipping_address: row.shipping_address,
          order_status: row.order_status,
          payment_status: row.payment_status,
          created_at: row.created_at,
          items: []
        };
      }
      
      if (row.item_id) {
        acc[orderId].items.push({
          id: row.item_id,
          product_id: row.product_id,
          product_name: row.product_name,
          price: row.item_price,
          size: row.size,
          quantity: row.quantity,
          image_url: row.image_url
        });
      }
      
      return acc;
    }, {});

    console.log('Processed orders:', ordersWithItems);

    res.json({
      success: true,
      orders: Object.values(ordersWithItems)
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching orders',
      error: error.message 
    });
  }
});

// Get all orders (admin only)
router.get('/all', authenticateToken, isAdmin, getAllOrders);

// Create new order
router.post('/create', authenticateToken, createOrder);

// Get single order
router.get('/:id', authenticateToken, getOrderById);

// Update order status (admin only)
router.patch('/:id/status', authenticateToken, isAdmin, updateOrderStatus);

// Update payment status (admin only)
router.put('/:id/payment-status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await db.query(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Payment status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating payment status',
      error: error.message 
    });
  }
});

// Cancel order
router.post('/:orderId/cancel', authenticateToken, cancelOrder);

// Notification routes
router.get('/notifications', authenticateToken, getNotifications);
router.patch('/notifications/:notificationId/read', authenticateToken, markNotificationAsRead);
router.patch('/notifications/read-all', authenticateToken, markAllNotificationsAsRead);

module.exports = router;
