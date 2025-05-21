/* Updated check_clothing_store_tables.js – list all tables and drop unused table (user_cart) */

const pool = require('../config/db');

async function checkClothingStoreTables() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Connected to database. Running SQL command to list all tables in 'clothing_store'...");
    const [rows] = await connection.query("SHOW TABLES FROM clothing_store;");
    console.log("Tables in clothing_store:");
    console.table(rows);

    // Drop unused table (user_cart) – destructive command
    console.log("\nDropping unused table (user_cart) from clothing_store...");
    await connection.query("DROP TABLE IF EXISTS user_cart;");
    console.log("Table 'user_cart' dropped (if it existed).");
  } catch (err) {
    console.error("Error listing or dropping tables:", err);
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

checkClothingStoreTables().catch(console.error); 