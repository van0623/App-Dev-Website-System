const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'clothing_store'
});

// Get admin dashboard stats
router.get('/stats', (req, res) => {
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM products) as totalProducts,
      (SELECT COUNT(*) FROM orders) as totalOrders,
      (SELECT COUNT(*) FROM users WHERE role = 'customer') as totalUsers,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status = 'delivered') as totalRevenue
  `;

  db.query(statsQuery, (err, results) => {
    if (err) {
      console.error('Error fetching stats:', err);
      return res.status(500).json({ message: 'Failed to fetch stats' });
    }
    res.json(results[0]);
  });
});

// Get all orders for admin
router.get('/orders', (req, res) => {
  const query = `
    SELECT 
      o.*,
      CONCAT(u.first_name, ' ', u.last_name) as customer_name
    FROM orders o
    LEFT JOIN users u ON o.customer_id = u.id
    ORDER BY o.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ message: 'Failed to fetch orders' });
    }
    res.json(results);
  });
});

// Get single order with items
router.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  
  const orderQuery = `
    SELECT 
      o.*,
      CONCAT(u.first_name, ' ', u.last_name) as customer_name
    FROM orders o
    LEFT JOIN users u ON o.customer_id = u.id
    WHERE o.id = ?
  `;

  const itemsQuery = `
    SELECT * FROM order_items WHERE order_id = ?
  `;

  db.query(orderQuery, [id], (err, orderResults) => {
    if (err) {
      console.error('Error fetching order:', err);
      return res.status(500).json({ message: 'Failed to fetch order' });
    }

    if (orderResults.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    db.query(itemsQuery, [id], (err, itemResults) => {
      if (err) {
        console.error('Error fetching order items:', err);
        return res.status(500).json({ message: 'Failed to fetch order items' });
      }

      const order = {
        ...orderResults[0],
        items: itemResults
      };

      res.json(order);
    });
  });
});

// Update order status
router.put('/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { order_status } = req.body;

  const query = 'UPDATE orders SET order_status = ? WHERE id = ?';

  db.query(query, [order_status, id], (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ message: 'Failed to update order status' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order status updated successfully' });
  });
});

// Update payment status
router.put('/orders/:id/payment', (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;

  const query = 'UPDATE orders SET payment_status = ? WHERE id = ?';

  db.query(query, [payment_status, id], (err, result) => {
    if (err) {
      console.error('Error updating payment status:', err);
      return res.status(500).json({ message: 'Failed to update payment status' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Payment status updated successfully' });
  });
});

// Get all users
router.get('/users', (req, res) => {
  console.log('GET /api/admin/users called'); // Debug log
  
  const query = 'SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
    
    console.log('Users found:', results.length); // Debug log
    console.log('Users data:', results); // Debug log
    res.json(results);
  });
});

// Update user role
router.put('/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const query = 'UPDATE users SET role = ? WHERE id = ?';

  db.query(query, [role, id], (err, result) => {
    if (err) {
      console.error('Error updating user role:', err);
      return res.status(500).json({ message: 'Failed to update user role' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User role updated successfully' });
  });
});

// Delete user
router.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM users WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ message: 'Failed to delete user' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router; 