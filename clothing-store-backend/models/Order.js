const db = require('../config/db');

class Order {
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async getById(orderId) {
    try {
      // Get order with its items using a JOIN
      const [rows] = await db.query(`
        SELECT 
          o.*,
          oi.id as item_id,
          oi.product_id,
          oi.product_name,
          oi.price,
          oi.size,
          oi.quantity,
          oi.image_url,
          p.name as current_product_name,
          p.image_url as current_product_image
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.id = ?
        ORDER BY oi.id ASC
      `, [orderId]);

      if (rows.length === 0) {
        return null;
      }

      // Group items by order
      const order = rows.reduce((acc, row) => {
        if (!acc) {
          // Create new order object without the item fields
          const { item_id, product_id, product_name, price, size, quantity, image_url, current_product_name, current_product_image, ...orderData } = row;
          acc = {
            ...orderData,
            items: []
          };
        }

        // Add item to the order if it exists
        if (row.item_id) {
          acc.items.push({
            id: row.item_id,
            product_id: row.product_id,
            product_name: row.current_product_name || row.product_name,
            price: row.price,
            size: row.size,
            quantity: row.quantity,
            image_url: row.current_product_image || row.image_url
          });
        }

        return acc;
      }, null);

      return { success: true, order };
    } catch (err) {
      console.error('Error in getById:', err);
      throw err;
    }
  }

  static async updateStatus(orderId, status) {
    try {
      const [result] = await db.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, orderId]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  static async getByUserId(userId) {
    try {
      if (!userId) {
        return this.getAll();
      }
      
      // Get orders with their items using a JOIN
      const [orders] = await db.query(`
        SELECT 
          o.*,
          oi.id as item_id,
          oi.product_id,
          oi.product_name,
          oi.price,
          oi.size,
          oi.quantity,
          oi.image_url,
          p.name as current_product_name,
          p.image_url as current_product_image
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC, oi.id ASC
      `, [userId]);

      // Group items by order
      const ordersWithItems = orders.reduce((acc, row) => {
        const orderId = row.id;
        let order = acc.find(o => o.id === orderId);
        
        if (!order) {
          // Create new order object without the item fields
          const { item_id, product_id, product_name, price, size, quantity, image_url, current_product_name, current_product_image, ...orderData } = row;
          order = {
            ...orderData,
            items: []
          };
          acc.push(order);
        }

        // Add item to the order if it exists
        if (row.item_id) {
          order.items.push({
            id: row.item_id,
            product_id: row.product_id,
            product_name: row.current_product_name || row.product_name,
            price: row.price,
            size: row.size,
            quantity: row.quantity,
            image_url: row.current_product_image || row.image_url
          });
        }

        return acc;
      }, []);

      return ordersWithItems;
    } catch (err) {
      console.error('Error in getByUserId:', err);
      throw err;
    }
  }

  static async create(orderData) {
    let connection;
    try {
      const { 
        userId, 
        products, 
        totalAmount, 
        shippingAmount,
        taxAmount,
        shippingAddress, 
        paymentMethod,
        status 
      } = orderData;
      
      // Get a connection from the pool
      connection = await db.getConnection();
      
      // Start transaction
      await connection.beginTransaction();
      
      try {
        // Insert the order
        const [orderResult] = await connection.query(
          `INSERT INTO orders (
            user_id, 
            total_amount, 
            shipping_amount,
            tax_amount,
            shipping_address, 
            payment_method,
            order_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, 
            totalAmount, 
            shippingAmount,
            taxAmount,
            shippingAddress, 
            paymentMethod,
            status || 'pending'
          ]
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of products) {
          await connection.query(
            `INSERT INTO order_items (
              order_id, 
              product_id, 
              product_name, 
              price, 
              size, 
              quantity, 
              image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              orderId,
              item.product_id,
              item.product_name,
              item.price,
              item.size,
              item.quantity,
              item.image_url
            ]
          );
        }

        // Commit transaction
        await connection.commit();
        
        return { insertId: orderId };
      } catch (err) {
        // Rollback transaction on error
        await connection.rollback();
        throw err;
      } finally {
        // Always release the connection back to the pool
        if (connection) {
          connection.release();
        }
      }
    } catch (err) {
      console.error('Error in Order.create:', err);
      throw err;
    }
  }

  static async updatePaymentStatus(orderId, paymentStatus) {
    let connection;
    try {
      // Get a connection for transaction
      connection = await db.getConnection();
      await connection.beginTransaction();

      // First, get the current order status with a lock
      const [order] = await connection.query(
        'SELECT order_status, payment_status FROM orders WHERE id = ? FOR UPDATE',
        [orderId]
      );
      
      if (!order || order.length === 0) {
        await connection.rollback();
        throw new Error('Order not found');
      }

      // If order is cancelled, force payment status to 'failed' regardless of input
      if (order[0].order_status === 'cancelled') {
        const [result] = await connection.query(
          'UPDATE orders SET payment_status = ? WHERE id = ?', 
          ['failed', orderId]
        );
        await connection.commit();
        return result;
      }

      // For non-cancelled orders, update payment status as requested
      const [result] = await connection.query(
        'UPDATE orders SET payment_status = ? WHERE id = ?', 
        [paymentStatus, orderId]
      );
      
      await connection.commit();
      return result;
    } catch (err) {
      if (connection) {
        await connection.rollback();
      }
      throw err;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
}

module.exports = Order; 