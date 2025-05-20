const db = require('../config/db');

async function updateProductsTable() {
  try {
    // Add new columns if they don't exist
    const alterQueries = [
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS name VARCHAR(255) AFTER id",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) AFTER price",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(50) AFTER image_url",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS size VARCHAR(20) AFTER category",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS color VARCHAR(50) AFTER size",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ];

    for (const query of alterQueries) {
      try {
        await db.query(query);
      } catch (error) {
        // Ignore errors for columns that already exist
        if (!error.message.includes('Duplicate column name')) {
          throw error;
        }
      }
    }

    // Rename title to name if title exists
    try {
      await db.query("ALTER TABLE products CHANGE title name VARCHAR(255) NOT NULL");
    } catch (error) {
      // Ignore error if title column doesn't exist
      if (!error.message.includes('Unknown column')) {
        throw error;
      }
    }
    
    console.log('Products table updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating products table:', error);
    process.exit(1);
  }
}

updateProductsTable(); 