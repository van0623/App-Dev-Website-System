const express = require('express');
const router = express.Router();
const db = require('../config/db');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get all products
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const [product] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Create new product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, size, color, stock } = req.body;
    
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    // Handle image upload
    let image_url = '';
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    // Insert product
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, category, size, color, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, category, size, color, stock, image_url]
    );

    // Get the newly created product
    const [newProduct] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(newProduct[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    // If there was an error and a file was uploaded, delete it
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting uploaded file:', err);
      }
    }
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, size, color, stock } = req.body;
    
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    // Get current product data
    const [currentProduct] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (currentProduct.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle image upload
    let image_url = currentProduct[0].image_url;
    if (req.file) {
      // Delete old image if it exists
      if (image_url) {
        const oldImagePath = path.join(__dirname, '..', image_url);
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      image_url = `/uploads/${req.file.filename}`;
    }

    // Update product
    await db.query(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, size = ?, color = ?, stock = ?, image_url = ? WHERE id = ?',
      [name, description, price, category, size, color, stock, image_url, req.params.id]
    );

    // Get updated product
    const [updatedProduct] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(updatedProduct[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    // If there was an error and a new file was uploaded, delete it
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting uploaded file:', err);
      }
    }
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    // Get the product's image URL before deleting
    const [product] = await db.query('SELECT image_url FROM products WHERE id = ?', [req.params.id]);
    
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete the product
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    // If there was an image, delete it from the uploads folder
    if (product[0].image_url) {
      const imagePath = path.join(__dirname, '..', product[0].image_url);
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error('Error deleting image file:', err);
      }
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;
