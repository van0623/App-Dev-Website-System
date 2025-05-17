const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  // Implement proper authentication middleware
  // This is a placeholder for demonstration purposes
  // In a real application, you would verify a JWT token
  const { userId, role } = req.body;
  
  if (role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin only' });
  }
  
  next();
};

// Get settings
router.get('/', async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM settings WHERE id = 1');
    
    if (settings.length === 0) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    
    // Convert snake_case to camelCase for frontend
    const formattedSettings = {
      storeName: settings[0].store_name,
      storeEmail: settings[0].store_email,
      storePhone: settings[0].store_phone,
      storeAddress: settings[0].store_address,
      taxRate: parseFloat(settings[0].tax_rate),
      shippingFee: parseFloat(settings[0].shipping_fee),
      freeShippingThreshold: parseFloat(settings[0].free_shipping_threshold),
      maintenanceMode: Boolean(settings[0].maintenance_mode),
      allowGuestCheckout: Boolean(settings[0].allow_guest_checkout),
      enableSales: Boolean(settings[0].enable_sales),
      currency: settings[0].currency,
      currencySymbol: settings[0].currency_symbol
    };
    
    res.json({ success: true, settings: formattedSettings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update settings
router.put('/', isAdmin, async (req, res) => {
  try {
    const {
      storeName,
      storeEmail,
      storePhone,
      storeAddress,
      taxRate,
      shippingFee,
      freeShippingThreshold,
      maintenanceMode,
      allowGuestCheckout,
      enableSales,
      currency,
      currencySymbol
    } = req.body;
    
    // Update settings
    await db.query(`
      UPDATE settings SET
        store_name = ?,
        store_email = ?,
        store_phone = ?,
        store_address = ?,
        tax_rate = ?,
        shipping_fee = ?,
        free_shipping_threshold = ?,
        maintenance_mode = ?,
        allow_guest_checkout = ?,
        enable_sales = ?,
        currency = ?,
        currency_symbol = ?
      WHERE id = 1
    `, [
      storeName,
      storeEmail,
      storePhone,
      storeAddress,
      taxRate,
      shippingFee,
      freeShippingThreshold,
      maintenanceMode,
      allowGuestCheckout,
      enableSales,
      currency,
      currencySymbol
    ]);
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

module.exports = router; 