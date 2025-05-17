# Fear of God Clothing Store Database Setup

This directory contains everything needed to set up the database for the Fear of God Clothing Store application.

## Database Setup Instructions

### Option 1: Using the SQL Script

1. Make sure you have MySQL server installed and running
2. Open a MySQL client (mysql command line, MySQL Workbench, etc.)
3. Run the SQL script: `setup-database.sql`

```bash
# Using MySQL command line
mysql -u root -p < setup-database.sql
```

### Option 2: Manual Setup

If you prefer to set up the database manually:

1. Create a database named `clothing_store`
2. Use the provided schema to create all necessary tables
3. Insert the default settings record
4. Create an admin user

## Database Structure

The database consists of the following tables:

- **users** - Stores user information (customers and admins)
- **settings** - Stores application-wide settings (single row)
- **products** - Product catalog
- **orders** - Customer orders
- **order_items** - Individual items within orders

## Sample Admin Login

The setup script creates a default admin user:
- Email: admin@example.com
- Password: Admin123!

## Environment Configuration

Make sure your application's environment variables (in .env file) match the database credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=clothing_store
```

## Backup and Restore

To backup your database:

```bash
mysqldump -u root -p clothing_store > clothing_store_backup.sql
```

To restore from a backup:

```bash
mysql -u root -p clothing_store < clothing_store_backup.sql
```

## Notes

- Never commit actual database files (.frm, .ibd, etc.) to version control
- Always commit schema and setup scripts instead
- Sensitive data should be replaced with sample data in any committed scripts 