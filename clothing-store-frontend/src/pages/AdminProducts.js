import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import '../App.css';

const AdminProducts = () => {
  const { user } = useUser();
  const { showSuccess, showError } = useNotification();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    size: '',
    color: '',
    stock: '',
    image_url: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'image_url') { // Don't send image_url directly
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append the image file if one was selected
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      } else if (editingProduct && editingProduct.image_url) {
        // If no new image is selected but there's an existing image, send the current image_url
        formDataToSend.append('image_url', editingProduct.image_url);
      }

      if (editingProduct) {
        // Update product
        await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        showSuccess('Product updated successfully!');
      } else {
        // Create product
        await axios.post('http://localhost:5000/api/products', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        showSuccess('Product created successfully!');
      }
      
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showError('Error saving product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      size: product.size,
      color: product.color,
      stock: product.stock,
      image_url: product.image_url
    });
    // Set image preview if there's an existing image
    if (product.image_url) {
      setImagePreview(`http://localhost:5000${product.image_url}`);
    } else {
      setImagePreview(null);
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        showSuccess('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        showError('Error deleting product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      size: '',
      color: '',
      stock: '',
      image_url: ''
    });
    setEditingProduct(null);
    setShowForm(false);
    setImagePreview(null);
    setSelectedFile(null);
  };

  if (!user || user.role !== 'admin') {
    return <div className="access-denied">Access Denied: Admin Only</div>;
  }

  return (
    <div className="admin-products">
      <div className="container">
        <div className="page-header">
          <Link to="/admin/landing" className="back-button">
            Back to Admin Panel
          </Link>
          <h1>Product Management</h1>
          <div className="page-header-actions">
            <button 
              className="btn btn-success" 
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : 'Add New Product'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="product-form-modal">
            <form onSubmit={handleSubmit} className="product-form">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₱)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Shirts">Shirts</option>
                    <option value="Pants">Pants</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Tank Tops">Tank Tops</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Size</label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., S,M,L,XL or 38,39,40"
                  />
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-upload"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <img 
                      src={`http://localhost:5000${product.image_url}`}
                      alt={product.name}
                      className="product-thumbnail"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₱{product.price}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button 
                      onClick={() => handleEdit(product)}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts; 