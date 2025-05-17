const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes'); // ✅ New line
const cartRoutes = require('./routes/cartRoutes'); // Add this
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Add this
const userRoutes = require('./routes/userRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// API routes
app.use('/api', productRoutes);
app.use('/api', authRoutes); // ✅ New line
app.use('/', cartRoutes); // Add this
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes); // Add this line
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
