// controllers/orderController.js

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create a new order
router.post('/create', async (req, res) => {
  const { userId, cartItems, totalAmount, shippingAmount, taxAmount, shippingInfo } = req.body;

  try {
    // Combine shipping info into a single address string
    const shippingAddress = `${shippingInfo.firstName} ${shippingInfo.lastName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zipCode}. Phone: ${shippingInfo.phone}, Email: ${shippingInfo.email}`;

    // Insert order into database
    const orderQuery = `
      INSERT INTO orders (customer_id, total_amount, shipping_address, order_status, payment_status) 
      VALUES (?, ?, ?, 'pending', 'pending')
    `;

    db.query(orderQuery, [userId, totalAmount, shippingAddress], (err, result) => {
      if (err) {
        console.error('Error creating order:', err);
        return res.status(500).json({ success: false, message: 'Failed to create order' });
      }

      const orderNumber = result.insertId;

      // Insert each cart item into order_items table
      const orderItemsQuery = `
        INSERT INTO order_items (order_id, product_id, product_name, price, size, quantity, image_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      let itemsInserted = 0;
      const totalItems = cartItems.length;

      if (totalItems === 0) {
        return res.json({ 
          success: true, 
          orderNumber: orderNumber,
          message: 'Order created successfully' 
        });
      }

      // Insert each cart item
      cartItems.forEach((item) => {
        db.query(orderItemsQuery, [
          orderNumber,
          item.id,
          item.name,
          item.price,
          item.size,
          item.quantity,
          item.image
        ], (itemErr, itemResult) => {
          if (itemErr) {
            console.error('Error inserting order item:', itemErr);
          }
          
          itemsInserted++;
          
          // When all items are inserted, send response
          if (itemsInserted === totalItems) {
            res.json({ 
              success: true, 
              orderNumber: orderNumber,
              message: 'Order created successfully' 
            });
          }
        });
      });
    });

  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user's orders with items
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;

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
    WHERE o.customer_id = ? 
    ORDER BY o.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }

    // Group results by order
    const orders = {};
    results.forEach(row => {
      if (!orders[row.id]) {
        orders[row.id] = {
          id: row.id,
          customer_id: row.customer_id,
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
  });
});

// Get all orders (for admin or management use)
const getAllOrders = (req, res) => {
  const query = 'SELECT * FROM orders';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ message: 'Failed to fetch orders' });
    }
    res.json(results);
  });
};

// Get a single order by ID
const getOrderById = (req, res) => {
  const orderId = req.params.id;
  
  const query = 'SELECT * FROM orders WHERE id = ?';
  
  db.query(query, [orderId], (err, result) => {
    if (err) {
      console.error('Error fetching order:', err);
      return res.status(500).json({ message: 'Failed to fetch order' });
    }
    if (!result.length) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(result[0]);
  });
};

// Update order status (for admin)
const updateOrderStatus = (req, res) => {
  const orderId = req.params.id;
  const { order_status } = req.body;

  const query = 'UPDATE orders SET order_status = ? WHERE id = ?';

  db.query(query, [order_status, orderId], (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ message: 'Failed to update order status' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order status updated successfully' });
  });
};

// Update payment status (for admin)
const updatePaymentStatus = (req, res) => {
  const orderId = req.params.id;
  const { payment_status } = req.body;

  const query = 'UPDATE orders SET payment_status = ? WHERE id = ?';

  db.query(query, [payment_status, orderId], (err, result) => {
    if (err) {
      console.error('Error updating payment status:', err);
      return res.status(500).json({ message: 'Failed to update payment status' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Payment status updated successfully' });
  });
};

module.exports = router;
