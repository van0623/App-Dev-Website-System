const db = require('../config/db');

async function recreateUserCartTable() {
    try {
        // Drop the table if it exists
        await db.query('DROP TABLE IF EXISTS user_cart');
        console.log('Dropped existing user_cart table if it existed');

        // Create the new table
        const createTableSQL = `
            CREATE TABLE user_cart (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                size VARCHAR(50) NOT NULL,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE KEY unique_cart_item (user_id, product_id, size),
                CHECK (quantity > 0 AND quantity <= 10)
            )
        `;

        await db.query(createTableSQL);
        console.log('Successfully created user_cart table');

        // Verify the table was created
        const [tables] = await db.query('SHOW TABLES LIKE "user_cart"');
        if (tables.length > 0) {
            console.log('Verified: user_cart table exists in the database');
            
            // Show table structure
            const [columns] = await db.query('DESCRIBE user_cart');
            console.log('\nTable structure:');
            console.table(columns);
        } else {
            console.error('Error: user_cart table was not created');
        }

    } catch (error) {
        console.error('Error recreating user_cart table:', error);
    } finally {
        // Close the database connection pool
        await db.end();
    }
}

// Run the function
recreateUserCartTable(); 