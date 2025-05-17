const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/db');

// Register Route
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    // Check if email already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, role]
    );

    res.status(201).json({ success: true, message: 'User registered successfully' });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  console.log('=== LOGIN REQUEST RECEIVED ===');
  console.log('Request body:', req.body);
  
  const { email, password } = req.body;
  
  console.log('Email:', email);
  console.log('Password length:', password ? password.length : 'undefined');

  try {
    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    console.log('Query results:', users.length, 'users found');

    if (users.length === 0) {
      console.log('No user found with email:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];
    console.log('User found:', user.first_name, user.last_name);
    
    // Compare password
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Don't send password back to client
    const { password: pwd, ...userWithoutPassword } = user;
    
    console.log('Login successful for user:', user.email);
    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
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

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
