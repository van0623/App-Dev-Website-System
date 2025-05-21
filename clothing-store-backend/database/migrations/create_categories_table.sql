-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name) VALUES 
    ('Accessories'),
    ('Hoodies'),
    ('Outerwear'),
    ('Shirts'),
    ('Pants'),
    ('Shoes'),
    ('Tank Tops')
ON DUPLICATE KEY UPDATE name = VALUES(name); 