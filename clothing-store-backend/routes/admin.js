const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Featured Products Routes
router.get('/featured-products', auth, adminController.getFeaturedProducts);
router.post('/featured-products', auth, adminController.addFeaturedProduct);
router.delete('/featured-products/:productId', auth, adminController.removeFeaturedProduct);

// ... existing routes ...

module.exports = router; 