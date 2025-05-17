-- Drop database if it exists (uncomment if needed)
-- DROP DATABASE IF EXISTS clothing_store;

-- Create the database
CREATE DATABASE IF NOT EXISTS clothing_store;

-- Switch to the database
USE clothing_store;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    zip_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT NOT NULL DEFAULT 1 PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL DEFAULT 'Fear of God',
    store_email VARCHAR(100) NOT NULL DEFAULT 'contact@fearofgod.com',
    store_phone VARCHAR(20) NOT NULL DEFAULT '+63 123 456 7890',
    store_address TEXT NOT NULL DEFAULT '123 Main Street, Manila, Philippines',
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 12.00,
    shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 150.00,
    free_shipping_threshold DECIMAL(10,2) NOT NULL DEFAULT 2000.00,
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    allow_guest_checkout BOOLEAN NOT NULL DEFAULT TRUE,
    enable_sales BOOLEAN NOT NULL DEFAULT TRUE,
    currency VARCHAR(3) NOT NULL DEFAULT 'PHP',
    currency_symbol VARCHAR(3) NOT NULL DEFAULT '₱',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (id = 1)
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    category VARCHAR(100),
    stock_quantity INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'COD',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    size VARCHAR(10),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Insert default settings
INSERT INTO settings (id) VALUES (1)
ON DUPLICATE KEY UPDATE id = 1;

-- Add sample admin user
-- Email: admin@example.com, Password: Admin123! (hashed)
INSERT INTO users (first_name, last_name, email, password, role)
VALUES ('Admin', 'User', 'admin@example.com', '$2b$10$OMQbS0BuLq3ZxWPq9.eZ5.tgxidV/ZNVKL1JB9Th6C5xDz57KfKoy', 'admin')
ON DUPLICATE KEY UPDATE id = id; 