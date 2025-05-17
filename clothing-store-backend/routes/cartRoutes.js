// routes/cartRoutes.js
const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'clothing_store'
};

// Get user's cart
router.get('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [cart] = await connection.execute(
      'SELECT * FROM user_cart WHERE user_id = ?',
      [userId]
    );
    
    await connection.end();
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/api/cart/add', async (req, res) => {
  try {
    const { userId, productId, productName, price, size, quantity, imageUrl } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if item already exists
    const [existing] = await connection.execute(
      'SELECT * FROM user_cart WHERE user_id = ? AND product_id = ? AND size = ?',
      [userId, productId, size]
    );
    
    if (existing.length > 0) {
      // Update quantity
      await connection.execute(
        'UPDATE user_cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ? AND size = ?',
        [quantity, userId, productId, size]
      );
    } else {
      // Insert new item
      await connection.execute(
        'INSERT INTO user_cart (user_id, product_id, product_name, price, size, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, productId, productName, price, size, quantity, imageUrl]
      );
    }
    
    await connection.end();
    res.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add to cart' });
  }
});

// Update cart item quantity
router.put('/api/cart/update', async (req, res) => {
  try {
    const { userId, productId, size, quantity } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await connection.execute(
        'DELETE FROM user_cart WHERE user_id = ? AND product_id = ? AND size = ?',
        [userId, productId, size]
      );
    } else {
      // Update quantity
      await connection.execute(
        'UPDATE user_cart SET quantity = ? WHERE user_id = ? AND product_id = ? AND size = ?',
        [quantity, userId, productId, size]
      );
    }
    
    await connection.end();
    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/api/cart/remove', async (req, res) => {
  try {
    const { userId, productId, size } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(
      'DELETE FROM user_cart WHERE user_id = ? AND product_id = ? AND size = ?',
      [userId, productId, size]
    );
    
    await connection.end();
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
});

// Clear cart
router.delete('/api/cart/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute('DELETE FROM user_cart WHERE user_id = ?', [userId]);
    
    await connection.end();
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
});

// Create order
router.post('/api/orders/create', async (req, res) => {
  console.log('=== ORDER CREATION STARTED ===');
  console.log('Request body:', req.body);
  
  try {
    const { userId, cartItems, totalAmount, shippingAmount, taxAmount, shippingInfo } = req.body;
    
    // Check each field individually
    console.log('userId:', userId);
    console.log('cartItems:', cartItems);
    console.log('totalAmount:', totalAmount);
    console.log('shippingInfo:', shippingInfo);
    
    // Validate required fields
    if (!userId) {
      console.log('ERROR: Missing userId');
      return res.status(400).json({ success: false, message: 'Missing userId' });
    }
    if (!cartItems || cartItems.length === 0) {
      console.log('ERROR: Missing or empty cartItems');
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    if (!totalAmount) {
      console.log('ERROR: Missing totalAmount');
      return res.status(400).json({ success: false, message: 'Missing totalAmount' });
    }
    if (!shippingInfo) {
      console.log('ERROR: Missing shippingInfo');
      return res.status(400).json({ success: false, message: 'Missing shippingInfo' });
    }
    
    console.log('All validations passed, connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');
    
    // Format shipping address properly
    const shippingAddress = `${shippingInfo.firstName} ${shippingInfo.lastName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zipCode}. Phone: ${shippingInfo.phone}, Email: ${shippingInfo.email}`;
    console.log('Shipping address formatted:', shippingAddress);
    
    // Create order
    const orderQuery = `
      INSERT INTO orders (customer_id, total_amount, shipping_address, order_status, payment_status) 
      VALUES (?, ?, ?, 'pending', 'pending')
    `;
    
    console.log('Executing order query with values:', [userId, totalAmount, shippingAddress]);
    
    const [orderResult] = await connection.execute(orderQuery, [userId, totalAmount, shippingAddress]);
    const orderId = orderResult.insertId;
    
    console.log('Order created successfully with ID:', orderId);
    
    // Add order items
    console.log('Adding order items...');
    for (const item of cartItems) {
      console.log('Processing item:', item);
      
      // Validate item fields
      if (!item.id || !item.name || !item.price || !item.size || !item.quantity) {
        console.log('ERROR: Invalid item data:', item);
        throw new Error('Invalid item data');
      }
      
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, price, size, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, item.id, item.name, item.price, item.size, item.quantity, item.image || '']
      );
      console.log('Item added successfully');
    }
    
    // Clear user's cart
    console.log('Clearing user cart...');
    await connection.execute('DELETE FROM user_cart WHERE user_id = ?', [userId]);
    console.log('Cart cleared successfully');
    
    await connection.end();
    console.log('=== ORDER CREATION COMPLETED ===');
    
    res.json({ success: true, orderNumber: orderId, message: 'Order created successfully' });
  } catch (error) {
    console.log('=== ORDER CREATION FAILED ===');
    console.error('Create order error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
});

module.exports = router;
