const db = require('../config/db');

async function createSettingsTable() {
  try {
    // Create the settings table
    await db.query(`
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
      )
    `);

    console.log('Settings table created or already exists');

    // Check if settings record exists
    const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
    
    // If no settings record exists, create one
    if (rows.length === 0) {
      await db.query(`
        INSERT INTO settings (id) VALUES (1)
      `);
      console.log('Initial settings record created');
    } else {
      console.log('Settings record already exists');
    }

    console.log('Settings table initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing settings table:', error);
    process.exit(1);
  }
}

// Run the function to create the settings table
createSettingsTable(); 