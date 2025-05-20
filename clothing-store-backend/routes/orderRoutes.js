// controllers/orderRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db'); // your promise-based pool

// Get user's orders with items
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
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
    `;

    const [results] = await db.query(query, [userId]);

    // Group results by order
    const orders = {};
    results.forEach(row => {
      if (!orders[row.id]) {
        orders[row.id] = {
          id: row.id,
          user_id: row.user_id,
          total_amount: row.total_amount,
          shipping_address: row.shipping_address,
          order_status: row.order_status,
          payment_status: row.payment_status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: []
        };
      }

      if (row.item_id) {
        orders[row.id].items.push({
          id: row.item_id,
          product_id: row.product_id,
          product_name: row.product_name,
          price: row.item_price,
          size: row.size,
          quantity: row.quantity,
          image_url: row.image_url
        });
      }
    });

    res.json({ success: true, orders: Object.values(orders) });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders: ' + error.message });
  }
});

// Get all orders (for admin or management use)
router.get('/all', async (req, res) => {
  try {
    const query = 'SELECT * FROM orders';
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Create a new order
router.post('/create', async (req, res) => {
  const { userId, cartItems, totalAmount, shippingAmount, taxAmount, shippingInfo } = req.body;

  // Basic validation
  if (!userId || !shippingInfo || !shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.address) {
    return res.status(400).json({ success: false, message: 'Missing required user or shipping information' });
  }
  if (!Array.isArray(cartItems)) {
    return res.status(400).json({ success: false, message: 'cartItems must be an array' });
  }

  try {
    // Combine shipping info into a single address string
    const shippingAddress = `${shippingInfo.firstName} ${shippingInfo.lastName}, ${shippingInfo.address}, ${shippingInfo.city || ''}, ${shippingInfo.zipCode || ''}. Phone: ${shippingInfo.phone || 'N/A'}, Email: ${shippingInfo.email || 'N/A'}`;

    // Insert order into database
    const [orderResult] = await db.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, order_status, payment_status) 
       VALUES (?, ?, ?, 'pending', 'pending')`,
      [userId, totalAmount, shippingAddress]
    );

    const orderNumber = orderResult.insertId;

    if (cartItems.length === 0) {
      return res.json({
        success: true,
        orderNumber,
        message: 'Order created successfully (no items)'
      });
    }

    // Insert each cart item in parallel
    const insertItemsPromises = cartItems.map(item => 
      db.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, size, quantity, image_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderNumber, item.id, item.name, item.price, item.size, item.quantity, item.image]
      )
    );

    await Promise.all(insertItemsPromises);

    res.json({
      success: true,
      orderNumber,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get a single order by ID with items
router.get('/:id', async (req, res) => {
  const orderId = req.params.id;

  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    res.json({
      success: true,
      order: {
        ...orders[0],
        items
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

// Update order status (for admin)
router.put('/:id/status', async (req, res) => {
  const orderId = req.params.id;
  const { order_status } = req.body;

  try {
    const query = 'UPDATE orders SET order_status = ? WHERE id = ?';
    const [result] = await db.query(query, [order_status, orderId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Update payment status (for admin)
router.put('/:id/payment-status', async (req, res) => {
  const orderId = req.params.id;
  const { payment_status } = req.body;

  try {
    const query = 'UPDATE orders SET payment_status = ? WHERE id = ?';
    const [result] = await db.query(query, [payment_status, orderId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Payment status updated successfully' });
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
});

module.exports = router;
