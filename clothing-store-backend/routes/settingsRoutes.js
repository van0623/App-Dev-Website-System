const express = require('express');
const router = express.Router();
const storeSettingsController = require('../controllers/storeSettingsController');
const { isAdmin } = require('../middleware/auth');

// Get store settings (public)
router.get('/', storeSettingsController.getStoreSettings);

// Update store settings (admin only)
router.put('/', isAdmin, storeSettingsController.updateStoreSettings);

module.exports = router; 