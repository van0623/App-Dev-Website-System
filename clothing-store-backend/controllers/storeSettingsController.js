const db = require('../config/db');

// Get store settings
exports.getStoreSettings = async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM settings WHERE id = 1');
    if (settings.length === 0) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(settings[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store settings', error: error.message });
  }
};

// Update store settings
exports.updateStoreSettings = async (req, res) => {
  try {
    const {
      store_name,
      store_email,
      store_phone,
      store_address,
      tax_rate,
      shipping_fee,
      free_shipping_threshold,
      maintenance_mode,
      allow_guest_checkout,
      enable_sales,
      currency,
      currency_symbol
    } = req.body;

    const [result] = await db.query(
      `UPDATE settings 
       SET store_name = ?,
           store_email = ?,
           store_phone = ?,
           store_address = ?,
           tax_rate = ?,
           shipping_fee = ?,
           free_shipping_threshold = ?,
           maintenance_mode = ?,
           allow_guest_checkout = ?,
           enable_sales = ?,
           currency = ?,
           currency_symbol = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [
        store_name,
        store_email,
        store_phone,
        store_address,
        tax_rate,
        shipping_fee,
        free_shipping_threshold,
        maintenance_mode,
        allow_guest_checkout,
        enable_sales,
        currency,
        currency_symbol
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    const [updatedSettings] = await db.query('SELECT * FROM settings WHERE id = 1');
    res.json(updatedSettings[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating store settings', error: error.message });
  }
}; 