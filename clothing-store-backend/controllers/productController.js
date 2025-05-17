const Product = require('../models/ProductModel');

// Get all products
const getAllProducts = (req, res) => {
  Product.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch products' });
    }
    res.json(results);
  });
};

// Get a product by ID
const getProductById = (req, res) => {
  const productId = req.params.id;
  Product.getById(productId, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch product' });
    }
    res.json(result);
  });
};

module.exports = { getAllProducts, getProductById };
