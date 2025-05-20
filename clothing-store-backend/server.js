const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Route imports
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// API Routes
app.use('/api/products', productRoutes);      // e.g., /api/products/:id
app.use('/api/auth', authRoutes);             // e.g., /api/auth/login
app.use('/api/cart', cartRoutes);             // Changed for clarity: /api/cart
app.use('/api/orders', orderRoutes);          // e.g., /api/orders/:id
app.use('/api/admin', adminRoutes);           // e.g., /api/admin/stats
app.use('/api/users', userRoutes);            // e.g., /api/users/:id
app.use('/api/settings', settingsRoutes);     // e.g., /api/settings/site

// Fallback route
app.use('/', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
