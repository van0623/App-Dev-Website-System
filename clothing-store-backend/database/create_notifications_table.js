const db = require('../config/db');

async function createNotificationsTable() {
  try {
    console.log('Creating notifications table...');
    
    // Create notifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_id INT,
        type ENUM('order_status', 'order_cancelled', 'order_confirmed', 'payment_status') NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log('Notifications table created successfully');

    // Add indexes for better performance
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)'
    ];

    for (const query of indexQueries) {
      try {
        await db.query(query);
        console.log('Successfully created index:', query);
      } catch (error) {
        // Ignore errors for indexes that already exist
        if (!error.message.includes('Duplicate key name')) {
          throw error;
        }
        console.log('Index might already exist:', error.message);
      }
    }

    console.log('Notifications table and indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating notifications table:', error);
    process.exit(1);
  }
}

// Run the function
createNotificationsTable(); 