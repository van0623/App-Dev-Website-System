const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/db');

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
    user.firstName = user.first_name;
    user.lastName = user.last_name;
    user.zipCode = user.zip_code;
    
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
    const { firstName, lastName, email, phone, address, city, zipCode } = req.body;
    
    await db.execute(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, city = ?, zip_code = ? WHERE id = ?',
      [firstName, lastName, email, phone, address, city, zipCode, userId]
    );
    
    // Get updated user
    const [userRows] = await db.execute(
      'SELECT id, first_name, last_name, email, phone, address, city, zip_code, role FROM users WHERE id = ?',
      [userId]
    );
    
    const user = userRows[0];
    user.firstName = user.first_name;
    user.lastName = user.last_name;
    user.zipCode = user.zip_code;
    
    res.json({ success: true, user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Update user password
router.put('/:id/password', async (req, res) => {
  try {
    const userId = req.params.id;
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

module.exports = router; 