// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Constants for validation
const MAX_QUANTITY_PER_ITEM = 10;
const MIN_QUANTITY_PER_ITEM = 1;
const MAX_ITEMS_IN_CART = 20;

// Helper function to validate cart item
const validateCartItem = (item) => {
  const errors = [];
  
  if (!item.userId) errors.push('User ID is required');
  if (!item.productId) errors.push('Product ID is required');
  if (!item.productName) errors.push('Product name is required');
  if (!item.price) errors.push('Price is required');
  if (!item.size) errors.push('Size is required');
  if (!item.quantity) errors.push('Quantity is required');
  if (!item.imageUrl) errors.push('Image URL is required');

  // Validate numeric fields
  if (item.price && isNaN(Number(item.price))) errors.push('Price must be a number');
  if (item.quantity && isNaN(Number(item.quantity))) errors.push('Quantity must be a number');

  // Validate quantity limits
  if (item.quantity) {
    const quantity = Number(item.quantity);
    if (quantity < MIN_QUANTITY_PER_ITEM) errors.push(`Quantity must be at least ${MIN_QUANTITY_PER_ITEM}`);
    if (quantity > MAX_QUANTITY_PER_ITEM) errors.push(`Quantity cannot exceed ${MAX_QUANTITY_PER_ITEM}`);
  }

  return errors;
};

// Apply authentication middleware to all cart routes
router.use(authenticateToken);

// Get user's cart
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify that the authenticated user is accessing their own cart
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this cart'
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const [cart] = await db.query(
      'SELECT * FROM user_cart WHERE user_id = ?',
      [userId]
    );

    // Validate cart data
    const validatedCart = cart.map(item => ({
      ...item,
      quantity: Math.min(Math.max(Number(item.quantity) || 0, MIN_QUANTITY_PER_ITEM), MAX_QUANTITY_PER_ITEM)
    }));

    res.json({ 
      success: true, 
      cart: validatedCart,
      message: cart.length > 0 ? 'Cart retrieved successfully' : 'Cart is empty'
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch cart. Please try again later.' 
    });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, productName, price, size, quantity, imageUrl } = req.body;

    // Verify that the authenticated user is adding to their own cart
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this cart'
      });
    }

    // Validate all required fields
    const validationErrors = validateCartItem(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart item data',
        errors: validationErrors
      });
    }

    // Check if item already exists in cart
    const [existingItem] = await db.query(
      'SELECT * FROM user_cart WHERE user_id = ? AND product_id = ? AND size = ?',
      [userId, productId, size]
    );

    if (existingItem.length > 0) {
      // Update quantity if item exists
      const newQuantity = Math.min(existingItem[0].quantity + Number(quantity), MAX_QUANTITY_PER_ITEM);
      
      await db.query(
        'UPDATE user_cart SET quantity = ? WHERE user_id = ? AND product_id = ? AND size = ?',
        [newQuantity, userId, productId, size]
      );

      return res.json({
        success: true,
        message: `Updated quantity of ${productName} to ${newQuantity}`,
        action: 'updated'
      });
    }

    // Check cart size limit
    const [cartCount] = await db.query(
      'SELECT COUNT(*) as count FROM user_cart WHERE user_id = ?',
      [userId]
    );

    if (cartCount[0].count >= MAX_ITEMS_IN_CART) {
      return res.status(400).json({
        success: false,
        message: `Cart is full (maximum ${MAX_ITEMS_IN_CART} items)`
      });
    }

    // Insert new item
    await db.query(
      'INSERT INTO user_cart (user_id, product_id, product_name, price, size, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, productId, productName, price, size, quantity, imageUrl]
    );

    res.json({
      success: true,
      message: `Added ${productName} to cart`,
      action: 'added'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart. Please try again later.'
    });
  }
});

// Update cart item quantity
router.put('/update', async (req, res) => {
  try {
    const { userId, productId, size, quantity } = req.body;
    
    // Verify that the authenticated user is updating their own cart
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this cart'
      });
    }

    // Validate required fields
    if (!userId || !productId || !size || quantity === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Check if item exists
    const [existing] = await db.query(
      'SELECT * FROM user_cart WHERE user_id = ? AND product_id = ? AND size = ?',
      [userId, productId, size]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found in cart' 
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await db.query(
        'DELETE FROM user_cart WHERE user_id = ? AND product_id = ? AND size = ?',
        [userId, productId, size]
      );
      
      res.json({ 
        success: true, 
        message: `Removed ${existing[0].product_name} from cart`,
        action: 'removed'
      });
    } else if (quantity > MAX_QUANTITY_PER_ITEM) {
      return res.status(400).json({ 
        success: false, 
        message: `Maximum quantity is ${MAX_QUANTITY_PER_ITEM}` 
      });
    } else {
      // Update quantity
      await db.query(
        'UPDATE user_cart SET quantity = ? WHERE user_id = ? AND product_id = ? AND size = ?',
        [quantity, userId, productId, size]
      );
      
      res.json({ 
        success: true, 
        message: `Updated quantity of ${existing[0].product_name} to ${quantity}`,
        action: 'updated'
      });
    }
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update cart. Please try again.' 
    });
  }
});

// Remove item from cart
router.delete('/remove', async (req, res) => {
  try {
    const { userId, productId, size } = req.body;
    
    // Verify that the authenticated user is removing from their own cart
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this cart'
      });
    }

    // Validate required fields
    if (!userId || !productId || !size) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Get item details before removal for the success message
    const [item] = await db.query(
      'SELECT product_name FROM user_cart WHERE user_id = ? AND product_id = ? AND size = ?',
      [userId, productId, size]
    );

    if (item.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found in cart' 
      });
    }

    await db.query(
      'DELETE FROM user_cart WHERE user_id = ? AND product_id = ? AND size = ?',
      [userId, productId, size]
    );
    
    res.json({ 
      success: true, 
      message: `Removed ${item[0].product_name} from cart`,
      action: 'removed'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove item. Please try again.' 
    });
  }
});

// Clear cart
router.delete('/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify that the authenticated user is clearing their own cart
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this cart'
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Check if cart is empty
    const [cartCount] = await db.query(
      'SELECT COUNT(*) as count FROM user_cart WHERE user_id = ?',
      [userId]
    );

    if (cartCount[0].count === 0) {
      return res.json({ 
        success: true, 
        message: 'Cart is already empty',
        action: 'already_empty'
      });
    }
    
    await db.query('DELETE FROM user_cart WHERE user_id = ?', [userId]);
    
    res.json({ 
      success: true, 
      message: 'Cart cleared successfully',
      action: 'cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear cart. Please try again.' 
    });
  }
});

module.exports = router;