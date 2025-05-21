const mysql = require('mysql2/promise');

async function createOrdersTable() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'clothing_store'
    });

    console.log('Connected to database');

    // Add new columns if they don't exist
    try {
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10,2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'COD'
      `);
      console.log('New columns added successfully');
    } catch (error) {
      console.error('Error adding new columns:', error);
    }

    // Create orders table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        total_amount DECIMAL(10,2) NOT NULL,
        shipping_amount DECIMAL(10,2) DEFAULT 0.00,
        tax_amount DECIMAL(10,2) DEFAULT 0.00,
        shipping_address TEXT NOT NULL,
        order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'COD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('Orders table created successfully');

    // Create order_items table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
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
      )
    `);
    console.log('Order items table created successfully');

    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error updating tables:', error);
  }
}

createOrdersTable(); 