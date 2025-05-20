const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all products
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, size, color, stock, image_url } = req.body;
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, category, size, color, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, category, size, color, stock, image_url]
    );
    res.status(201).json({ message: 'Product created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, category, size, color, stock, image_url } = req.body;
    const [result] = await db.query(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, size = ?, color = ?, stock = ?, image_url = ? WHERE id = ?',
      [name, description, price, category, size, color, stock, image_url, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;
