const db = require('../config/db');

async function addOrderColumns() {
  try {
    console.log('Adding new columns to orders table...');
    
    // Add new columns if they don't exist
    const alterQueries = [
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10,2) DEFAULT 0.00",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0.00",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'COD'"
    ];

    for (const query of alterQueries) {
      try {
        await db.query(query);
        console.log('Successfully executed:', query);
      } catch (error) {
        // Ignore errors for columns that already exist
        if (!error.message.includes('Duplicate column name')) {
          throw error;
        }
        console.log('Column might already exist:', error.message);
      }
    }

    console.log('Orders table updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating orders table:', error);
    process.exit(1);
  }
}

// Run the function
addOrderColumns(); 