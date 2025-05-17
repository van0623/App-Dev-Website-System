const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'clothing_store'
});

// Get all products
router.get('/products', (req, res) => {
  const query = 'SELECT * FROM products ORDER BY created_at DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ message: 'Failed to fetch products' });
    }
    res.json(results);
  });
});

// Get single product
router.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM products WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ message: 'Failed to fetch product' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(results[0]);
  });
});

// Create new product
router.post('/products', (req, res) => {
  const { name, description, price, category, size, color, stock, image_url } = req.body;

  const query = `
    INSERT INTO products (name, description, price, category, size, color, stock, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, description, price, category, size, color, stock, image_url], (err, result) => {
    if (err) {
      console.error('Error creating product:', err);
      return res.status(500).json({ message: 'Failed to create product' });
    }
    res.status(201).json({ message: 'Product created successfully', id: result.insertId });
  });
});

// Update product
router.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, size, color, stock, image_url } = req.body;

  const query = `
    UPDATE products 
    SET name = ?, description = ?, price = ?, category = ?, size = ?, color = ?, stock = ?, image_url = ?
    WHERE id = ?
  `;

  db.query(query, [name, description, price, category, size, color, stock, image_url, id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ message: 'Failed to update product' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  });
});

// Delete product
router.delete('/products/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM products WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ message: 'Failed to delete product' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

module.exports = router;
