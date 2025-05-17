const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clothing_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get a promise wrapper around the pool
const promisePool = pool.promise();

console.log('Connected to database.');


module.exports = promisePool;
