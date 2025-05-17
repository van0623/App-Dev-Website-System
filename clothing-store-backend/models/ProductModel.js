const db = require('../config/db');

const getAll = (callback) => {
  db.query('SELECT * FROM products', callback);
};

const getById = (id, callback) => {
  db.query('SELECT * FROM products WHERE id = ?', [id], callback);
};

module.exports = { getAll, getById };
