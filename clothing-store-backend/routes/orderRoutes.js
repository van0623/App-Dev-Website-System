// controllers/orderRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db'); // your promise-based pool
const { isAdmin } = require('../middleware/auth');

// Get user's orders with items
router.get('/user/:userId', async (req, res) => {
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
router.get('/all', isAdmin, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT 
        o.*,
        oi.id as item_id,
        oi.product_id,
        oi.product_name,
        oi.price as item_price,
        oi.size,
        oi.quantity,
        oi.image_url,
        u.first_name,
        u.last_name,
        u.email
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    // Group items by order
    const ordersWithItems = orders.reduce((acc, row) => {
      const orderId = row.id;
      if (!acc[orderId]) {
        acc[orderId] = {
          id: row.id,
          order_number: row.order_number,
          user_id: row.user_id,
          customer_name: `${row.first_name} ${row.last_name}`,
          customer_email: row.email,
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

    res.json({
      success: true,
      orders: Object.values(ordersWithItems)
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching orders',
      error: error.message 
    });
  }
});

// Create new order
router.post('/create', async (req, res) => {
  try {
    const { 
      userId, 
      cartItems, 
      totalAmount, 
      shippingAmount, 
      taxAmount,
      shippingInfo 
    } = req.body;

    // Validate user exists
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Format shipping address
    const shippingAddress = `
Customer Information:
Name: ${shippingInfo.firstName} ${shippingInfo.lastName}
Email: ${shippingInfo.email}
Phone: ${shippingInfo.phone}

Shipping Information:
Address: ${shippingInfo.address}
City: ${shippingInfo.city}
ZIP Code: ${shippingInfo.zipCode}
    `.trim();

    // Start transaction
    await db.beginTransaction();

    try {
      // Insert order
    const [orderResult] = await db.query(
        'INSERT INTO orders (order_number, user_id, total_amount, shipping_address, order_status, payment_status) VALUES (?, ?, ?, ?, ?, ?)',
        [orderNumber, userId, totalAmount, shippingAddress, 'pending', 'pending']
      );

      const orderId = orderResult.insertId;

      // Insert order items
      for (const item of cartItems) {
        await db.query(
          'INSERT INTO order_items (order_id, product_id, product_name, price, size, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [orderId, item.id, item.name, item.price, item.size, item.quantity, item.image]
        );
      }

      // Commit transaction
      await db.commit();

      res.json({
        success: true,
        message: 'Order created successfully',
        orderNumber,
        orderId
      });
    } catch (error) {
      // Rollback transaction on error
      await db.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating order',
      error: error.message 
    });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const [orders] = await db.query(`
      SELECT 
        o.*,
        oi.id as item_id,
        oi.product_id,
        oi.product_name,
        oi.price as item_price,
        oi.size,
        oi.quantity,
        oi.image_url,
        u.first_name,
        u.last_name,
        u.email
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Group items by order
    const orderWithItems = orders.reduce((acc, row) => {
      if (!acc.id) {
        acc = {
          id: row.id,
          order_number: row.order_number,
          user_id: row.user_id,
          customer_name: `${row.first_name} ${row.last_name}`,
          customer_email: row.email,
          total_amount: row.total_amount,
          shipping_address: row.shipping_address,
          order_status: row.order_status,
          payment_status: row.payment_status,
          created_at: row.created_at,
          items: []
        };
      }
      
      if (row.item_id) {
        acc.items.push({
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

    res.json({
      success: true,
      order: orderWithItems
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching order',
      error: error.message 
    });
  }
});

// Update order status (admin only)
router.put('/:id/status', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await db.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
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
      message: 'Order status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating order status',
      error: error.message 
    });
  }
});

// Update payment status (admin only)
router.put('/:id/payment-status', isAdmin, async (req, res) => {
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

module.exports = router;
