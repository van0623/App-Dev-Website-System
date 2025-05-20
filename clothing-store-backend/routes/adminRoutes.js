const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM products) as totalProducts,
        (SELECT COUNT(*) FROM orders) as totalOrders,
        (SELECT COUNT(DISTINCT id) FROM users) as totalUsers,
        (SELECT COUNT(DISTINCT id) FROM users WHERE role = 'admin') as totalAdmins,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status = 'delivered') as totalRevenue
    `;

    const [results] = await db.query(statsQuery);
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Get all orders for admin
router.get('/orders', async (req, res) => {
  try {
    const query = `
      SELECT 
        o.*,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;

    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get single order with items
router.get('/orders/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const orderQuery = `
      SELECT 
        o.*,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;

    const [orderResults] = await db.query(orderQuery, [id]);

    if (orderResults.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const [itemResults] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);

    const order = {
      ...orderResults[0],
      items: itemResults
    };

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { order_status } = req.body;

  try {
    const [result] = await db.query('UPDATE orders SET order_status = ? WHERE id = ?', [order_status, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Update payment status
router.put('/orders/:id/payment', async (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;

  try {
    const [result] = await db.query('UPDATE orders SET payment_status = ? WHERE id = ?', [payment_status, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(results);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
