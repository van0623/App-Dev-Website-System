const db = require('../config/db');

async function createUsersTable() {
  try {
    console.log('Creating users table if it doesn\'t exist...');
    
    // SQL to create the users table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
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
      )
    `;
    
    await db.query(createTableSQL);
    console.log('Users table created or already exists');

    // Add new columns if they don't exist
    try {
      await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL');
      await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(255) DEFAULT NULL');
      await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT NULL');
      await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20) DEFAULT NULL');
      console.log('New columns added successfully');
    } catch (err) {
      console.log('Columns might already exist:', err.message);
    }
    
    // Check if there's at least one admin user
    const [admins] = await db.query('SELECT * FROM users WHERE role = "admin" LIMIT 1');
    
    if (admins.length === 0) {
      // Create a default admin user if none exists
      console.log('Creating default admin user...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      await db.query(
        'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        ['Admin', 'User', 'admin@example.com', hashedPassword, 'admin']
      );
      
      console.log('Default admin user created with email: admin@example.com and password: Admin123!');
    }
    
    console.log('Table setup completed successfully');
  } catch (err) {
    console.error('Error creating users table:', err);
  }
  process.exit(0);
}

createUsersTable(); 