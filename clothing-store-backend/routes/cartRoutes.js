// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get user's cart
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [cart] = await db.query(
      'SELECT * FROM user_cart WHERE user_id = ?',
      [userId]
    );
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, productName, price, size, quantity, imageUrl } = req.body;
    
    // Check if item already exists
    const [existing] = await db.query(
      'SELECT * FROM user_cart WHERE user_id = ? AND product_id = ? AND size = ?',
      [userId, productId, size]
    );
    
    if (existing.length > 0) {
      // Update quantity
      await db.query(
        'UPDATE user_cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ? AND size = ?',
        [quantity, userId, productId, size]
      );
    } else {
      // Insert new item
      await db.query(
        'INSERT INTO user_cart (user_id, product_id, product_name, price, size, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, productId, productName, price, size, quantity, imageUrl]
      );
    }
    
    res.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add to cart' });
  }
});

// Update cart item quantity
router.put('/update', async (req, res) => {
  try {
    const { userId, productId, size, quantity } = req.body;
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await db.query(
        'DELETE FROM user_cart WHERE user_id = ? AND product_id = ? AND size = ?',
        [userId, productId, size]
      );
    } else {
      // Update quantity
      await db.query(
        'UPDATE user_cart SET quantity = ? WHERE user_id = ? AND product_id = ? AND size = ?',
        [quantity, userId, productId, size]
      );
    }
    
    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/remove', async (req, res) => {
  try {
    const { userId, productId, size } = req.body;
    
    await db.query(
      'DELETE FROM user_cart WHERE user_id = ? AND product_id = ? AND size = ?',
      [userId, productId, size]
    );
    
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
});

// Clear cart
router.delete('/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await db.query('DELETE FROM user_cart WHERE user_id = ?', [userId]);
    
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
});

module.exports = router;