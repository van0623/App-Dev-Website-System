-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
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