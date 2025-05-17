const db = require('../config/db');

// Create a new order
const createOrder = (req, res) => {
  const { userId, products, totalAmount, shippingAddress, status } = req.body;

  // SQL query to insert a new order into the 'orders' table
  const query = 'INSERT INTO orders (user_id, products, total_amount, shipping_address, status) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [userId, JSON.stringify(products), totalAmount, shippingAddress, status], (err, result) => {
    if (err) {
      console.error('Error inserting order:', err);
      return res.status(500).json({ message: 'Failed to create order' });
    }
    res.status(201).json({ message: 'Order created successfully', orderId: result.insertId });
  });
};

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
  const { status } = req.body;

  const query = 'UPDATE orders SET status = ? WHERE id = ?';

  db.query(query, [status, orderId], (err, result) => {
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

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus };
