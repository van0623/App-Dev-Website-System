const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all user routes
router.use(authenticateToken);

// Update user password
router.put('/:id/password', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is updating their own password
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this password' 
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Get current password hash
    const [userRows] = await db.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userRows[0].password);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [userRows] = await db.execute(
      'SELECT id, first_name, last_name, email, phone, address, city, zip_code, role FROM users WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = userRows[0];
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is updating their own profile
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this profile' 
      });
    }
    
    const { first_name, last_name, email, phone, address, city, zip_code } = req.body;
    
    console.log('Updating profile for user:', userId);
    console.log('Update data:', { first_name, last_name, email, phone, address, city, zip_code });
    
    // Update user profile
    await db.execute(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, city = ?, zip_code = ? WHERE id = ?',
      [first_name, last_name, email, phone, address, city, zip_code, userId]
    );
    
    // Get updated user data
    const [userRows] = await db.execute(
      'SELECT id, first_name, last_name, email, phone, address, city, zip_code, role FROM users WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      console.log('User not found after update:', userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = userRows[0];
    console.log('Updated user data:', user);
    
    res.json({ 
      success: true, 
      user, 
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

module.exports = router; 