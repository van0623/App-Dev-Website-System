const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/db');

// Middleware to validate request data
const validateRegister = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone(),
  body('zipCode').optional().isPostalCode('any'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Register Route
router.post('/register', validateRegister, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { firstName, lastName, email, password, role, phone, address, city, zipCode } = req.body;

  try {
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, password, role, phone, address, city, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, role || 'customer', phone, address, city, zipCode]
    );

    const [newUser] = await db.query(
      'SELECT id, first_name, last_name, email, role, phone, address, city, zip_code, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser[0].id, email: newUser[0].email, role: newUser[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser[0],
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
});

// Login Route
router.post('/login', validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const [users] = await db.query(
      'SELECT id, first_name, last_name, email, password, role, phone, address, city, zip_code, created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Don't send password back to client
    const { password: pwd, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Failed to login. Please try again.' });
  }
});

// Get user profile
router.get('/profile/:id', async (req, res) => {
  const userId = req.params.id;
  
  try {
    const [users] = await db.query(
      'SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = ?', 
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get the most recent order's shipping address
    const [orders] = await db.query(
      'SELECT shipping_address FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    const userProfile = {
      ...users[0],
      shipping_address: orders.length > 0 ? orders[0].shipping_address : null
    };

    res.json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
