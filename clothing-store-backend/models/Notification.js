const db = require('../config/db');

class Notification {
  static async create({ userId, orderId, type, message }) {
    try {
      const [result] = await db.execute(
        'INSERT INTO notifications (user_id, order_id, type, message) VALUES (?, ?, ?, ?)',
        [userId, orderId, type, message]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getUnreadByUserId(userId) {
    try {
      const [notifications] = await db.execute(
        'SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC',
        [userId]
      );
      return notifications;
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId) {
    try {
      await db.execute(
        'UPDATE notifications SET is_read = TRUE WHERE id = ?',
        [notificationId]
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      await db.execute(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
        [userId]
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async delete(notificationId) {
    try {
      await db.execute('DELETE FROM notifications WHERE id = ?', [notificationId]);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

module.exports = Notification; 