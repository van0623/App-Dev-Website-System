const db = require('../config/db');

async function checkProductsTable() {
  try {
    // Get table structure
    const [columns] = await db.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'products'
      AND TABLE_SCHEMA = 'clothing_store'
    `);

    console.log('Products table structure:');
    console.table(columns);

    // Check if table exists and has data
    const [rows] = await db.query('SELECT COUNT(*) as count FROM products');
    console.log('\nNumber of products in table:', rows[0].count);

    process.exit(0);
  } catch (error) {
    console.error('Error checking products table:', error);
    process.exit(1);
  }
}

// Run the function to check the products table
checkProductsTable(); 