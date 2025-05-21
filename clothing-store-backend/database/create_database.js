const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    // Create connection without database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS clothing_store');
    console.log('Database created or already exists');

    // Use the database
    await connection.query('USE clothing_store');
    console.log('Using clothing_store database');

    // Create all necessary tables
    const createTables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(50) NOT NULL DEFAULT '',
        last_name VARCHAR(50) NOT NULL DEFAULT '',
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        address VARCHAR(255) DEFAULT NULL,
        city VARCHAR(100) DEFAULT NULL,
        zip_code VARCHAR(20) DEFAULT NULL,
        role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      // Settings table
      `CREATE TABLE IF NOT EXISTS settings (
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
      )`,

      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(255),
        category VARCHAR(100),
        size VARCHAR(50),
        color VARCHAR(50),
        stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Orders table
      `CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        total_amount DECIMAL(10,2) NOT NULL,
        shipping_address TEXT NOT NULL,
        order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'COD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )`,

      // Order items table
      `CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        size VARCHAR(10),
        quantity INT NOT NULL,
        image_url VARCHAR(255),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )`,

      // Notifications table
      `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_id INT,
        type ENUM('order_status', 'order_cancelled', 'order_confirmed', 'payment_status') NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )`
    ];

    // Execute all table creation queries
    for (const query of createTables) {
      await connection.query(query);
    }
    console.log('All tables created successfully');

    // Insert default settings if not exists
    const [settings] = await connection.query('SELECT * FROM settings WHERE id = 1');
    if (settings.length === 0) {
      await connection.query('INSERT INTO settings (id) VALUES (1)');
      console.log('Default settings created');
    }

    // Create default admin user if not exists
    const [admins] = await connection.query('SELECT * FROM users WHERE role = "admin" LIMIT 1');
    if (admins.length === 0) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await connection.query(
        'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        ['Admin', 'User', 'admin@example.com', hashedPassword, 'admin']
      );
      console.log('Default admin user created with email: admin@example.com and password: Admin123!');
    }

    await connection.end();
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

createDatabase(); 