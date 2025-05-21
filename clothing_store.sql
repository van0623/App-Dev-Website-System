-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 21, 2025 at 08:30 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `clothing_store`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 'Accessories', NULL, '2025-05-20 07:45:18', '2025-05-20 07:45:18'),
(2, 'Hoodies', NULL, '2025-05-20 07:45:18', '2025-05-20 07:45:18'),
(3, 'Outerwear', NULL, '2025-05-20 07:45:18', '2025-05-20 07:45:18'),
(4, 'Shirts', NULL, '2025-05-20 07:45:18', '2025-05-20 07:45:18'),
(5, 'Pants', NULL, '2025-05-20 07:45:18', '2025-05-20 07:45:18'),
(6, 'Shoes', NULL, '2025-05-20 07:45:18', '2025-05-20 07:45:18'),
(7, 'Tank Tops', NULL, '2025-05-20 07:45:18', '2025-05-20 07:45:18');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `type` enum('order_status','order_cancelled','order_confirmed','payment_status') NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `order_id`, `type`, `message`, `is_read`, `created_at`) VALUES
(1, 1, 23, 'order_confirmed', 'Your order #23 has been confirmed.', 0, '2025-05-21 02:53:54'),
(2, 1, 24, 'order_confirmed', 'Your order #24 has been confirmed.', 0, '2025-05-21 02:54:31'),
(9, 1, 24, 'order_cancelled', 'Your order #24 has been cancelled.', 0, '2025-05-21 03:06:50'),
(10, 1, 24, 'order_cancelled', 'Your order #24 has been cancelled.', 0, '2025-05-21 03:07:58'),
(11, 1, 23, 'order_cancelled', 'Your order #23 has been cancelled.', 0, '2025-05-21 03:21:20'),
(12, 1, 11, 'order_cancelled', 'Your order #11 has been cancelled.', 0, '2025-05-21 04:08:09'),
(13, 2, 25, 'order_confirmed', 'Your order #25 has been confirmed.', 0, '2025-05-21 04:22:11'),
(14, 2, 25, 'order_cancelled', 'Your order #25 has been cancelled.', 0, '2025-05-21 04:22:23'),
(15, 1, 13, 'order_cancelled', 'Your order #13 has been cancelled.', 0, '2025-05-21 04:44:16'),
(16, 1, 24, 'order_cancelled', 'Your order #24 has been cancelled.', 0, '2025-05-21 04:57:13'),
(17, 1, 24, 'order_cancelled', 'Your order #24 has been cancelled.', 0, '2025-05-21 05:09:27'),
(18, 2, 26, 'order_confirmed', 'Your order #26 has been confirmed.', 0, '2025-05-21 05:43:20'),
(19, 2, 25, 'order_cancelled', 'Your order #25 has been cancelled.', 0, '2025-05-21 05:43:57'),
(20, 2, 26, 'order_cancelled', 'Your order #26 has been cancelled.', 0, '2025-05-21 05:44:13'),
(21, 2, 27, 'order_confirmed', 'Your order #27 has been confirmed.', 0, '2025-05-21 05:44:22'),
(22, 2, 28, 'order_confirmed', 'Your order #28 has been confirmed.', 0, '2025-05-21 06:07:41');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_address` text NOT NULL,
  `order_status` enum('pending','shipped','delivered','canceled') DEFAULT 'pending',
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `payment_method` varchar(50) DEFAULT 'COD',
  `shipping_amount` decimal(10,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `shipping_address`, `order_status`, `payment_status`, `created_at`, `updated_at`, `payment_method`, `shipping_amount`, `tax_amount`) VALUES
(2, 1, 658.88, 'das dasd, sdd, asd, 343. Phone: 3213, Email: adsa@gmail.com', 'delivered', 'paid', '2025-05-14 15:41:56', '2025-05-17 05:15:04', 'COD', 0.00, 0.00),
(3, 4, 1106.88, 'fsdf sfdsd, dasd, 123, 2312312. Phone: 321321, Email: jjjj@gmail.com', 'pending', 'pending', '2025-05-19 15:12:12', '2025-05-19 15:12:12', 'COD', 0.00, 0.00),
(4, 4, 1890.88, 'fsdf sfdsd, dsaa, 2131, 2312312. Phone: 321321, Email: aaaaa@gmail.com', 'pending', 'pending', '2025-05-19 15:12:41', '2025-05-19 15:12:41', 'COD', 0.00, 0.00),
(11, 1, 1556.00, '{\"firstName\":\"Ivan\",\"lastName\":\"Geringer\",\"email\":\"ivanrolfg@gmail.com\",\"phone\":\"09934323434\",\"address\":\"123, NDH\",\"city\":\"taguig city\",\"zipCode\":\"1234\"}', 'pending', '', '2025-05-20 04:51:12', '2025-05-21 05:00:50', 'credit_card', 0.00, 0.00),
(12, 1, 1556.00, '{\"firstName\":\"Ivan\",\"lastName\":\"Geringer\",\"email\":\"ivanrolfg@gmail.com\",\"phone\":\"09934323434\",\"address\":\"123, NDH\",\"city\":\"taguig city\",\"zipCode\":\"1234\"}', 'pending', 'pending', '2025-05-20 08:27:36', '2025-05-20 08:27:36', 'credit_card', 0.00, 0.00),
(13, 1, 2240.00, '{\"firstName\":\"Ivan\",\"lastName\":\"Geringer\",\"email\":\"ivanrolfg@gmail.com\",\"phone\":\"09934323434\",\"address\":\"123, NDH\",\"city\":\"taguig city\",\"zipCode\":\"1234\"}', '', '', '2025-05-20 08:29:25', '2025-05-21 06:19:31', 'credit_card', 0.00, 0.00),
(21, 1, 1442.88, '{\"firstName\":\"Ivan\",\"lastName\":\"Geringer\",\"email\":\"ivanrolfg@gmail.com\",\"phone\":\"09934323434\",\"address\":\"123, NDH\",\"city\":\"taguig city\",\"zipCode\":\"1234\"}', 'pending', 'pending', '2025-05-20 08:40:47', '2025-05-20 08:40:47', 'cash-on-delivery', 0.00, 0.00),
(22, 1, 492.00, '123, NDH, taguig city, 1234', 'delivered', 'paid', '2025-05-21 02:52:45', '2025-05-21 03:16:12', 'cash-on-delivery', 100.00, 42.00),
(23, 1, 492.00, '123, NDH, taguig city, 1234', 'pending', '', '2025-05-21 02:53:54', '2025-05-21 05:00:50', 'cash-on-delivery', 100.00, 42.00),
(24, 1, 1218.88, '123, NDH, taguig city, 1234', '', '', '2025-05-21 02:54:31', '2025-05-21 05:09:27', 'cash-on-delivery', 100.00, 119.88),
(25, 2, 1556.00, 'fsdfsdf, sdffsdf, 4234234', '', '', '2025-05-21 04:22:11', '2025-05-21 05:43:57', 'cash-on-delivery', 100.00, 156.00),
(26, 2, 1106.88, 'fsdfsdf, sdffsdf, 4234234', '', '', '2025-05-21 05:43:19', '2025-05-21 06:16:47', 'cash-on-delivery', 100.00, 107.88),
(27, 2, 1106.88, 'fsdfsdf, sdffsdf, 4234234', 'pending', 'pending', '2025-05-21 05:44:22', '2025-05-21 05:44:22', 'cash-on-delivery', 100.00, 107.88),
(28, 2, 1442.88, 'NDH, sdffsdf, 4234234', 'pending', 'pending', '2025-05-21 06:07:41', '2025-05-21 06:07:41', 'cash-on-delivery', 100.00, 143.88);

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `size` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `image_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `size`, `quantity`, `image_url`, `created_at`) VALUES
(1, 2, 3, 'Hope Cap', 499.00, 'One Size', 1, 'https://via.placeholder.com/400x400/6f42c1/FFFFFF?text=Hope+Cap', '2025-05-14 15:41:56'),
(2, 3, 1, 'Faith T-Shirt', 899.00, 'L', 1, 'https://via.placeholder.com/400x400/2c5aa0/FFFFFF?text=Faith+T-Shirt', '2025-05-19 15:12:13'),
(3, 4, 2, 'Prayer Hoodie', 1599.00, 'S', 1, 'https://via.placeholder.com/400x400/28a745/FFFFFF?text=Prayer+Hoodie', '2025-05-19 15:12:42'),
(4, 11, 2, 'Black Oversized Hoodie', 1300.00, 'S,M,L,XL', 1, NULL, '2025-05-20 04:51:12'),
(5, 12, 4, 'Minimalist Acid Wash Gray Cap', 1300.00, 'Free Size', 1, NULL, '2025-05-20 08:27:36'),
(6, 13, 5, 'Black Graphic Tee', 2000.00, 'S,M,L,XL', 1, NULL, '2025-05-20 08:29:25'),
(7, 21, 3, 'Beige Cargo Pants', 1199.00, '30', 1, '/uploads/image-1747712450617-221252233.png', '2025-05-20 08:40:47'),
(8, 22, 12, 'Ribbed Tank Top', 350.00, 'XL', 1, '/uploads/image-1747714279062-942907148.png', '2025-05-21 02:52:45'),
(9, 23, 12, 'Ribbed Tank Top', 350.00, 'XL', 1, '/uploads/image-1747714279062-942907148.png', '2025-05-21 02:53:54'),
(10, 24, 7, 'Olive Green Pants ', 999.00, 'S', 1, '/uploads/image-1747713012859-857042296.jpg', '2025-05-21 02:54:31'),
(11, 25, 2, 'Black Oversized Hoodie', 1300.00, 'M', 1, '/uploads/image-1747712295645-350995789.jpg', '2025-05-21 04:22:11'),
(12, 26, 8, 'Fear of God Logo Tee', 899.00, 'S', 1, '/uploads/image-1747713527960-498863987.png', '2025-05-21 05:43:19'),
(13, 27, 8, 'Fear of God Logo Tee', 899.00, 'S', 1, '/uploads/image-1747713527960-498863987.png', '2025-05-21 05:44:22'),
(14, 28, 3, 'Beige Cargo Pants', 1199.00, '30', 1, '/uploads/image-1747712450617-221252233.png', '2025-05-21 06:07:41');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `size` varchar(20) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `image_url`, `category`, `size`, `color`, `created_at`, `updated_at`) VALUES
(1, 'White Tshirts ', 'Classic white crew neck t-shirt made with soft cotton.', 499.00, 20, '/uploads/image-1747711489735-369242794.jpg', 'Shirts', 'S,M,L,XL', 'White', '2025-05-20 03:24:49', '2025-05-20 03:24:49'),
(2, 'Black Oversized Hoodie', 'Cozy oversized hoodie with kangaroo pocket.', 1300.00, 19, '/uploads/image-1747712295645-350995789.jpg', 'Hoodies', 'S,M,L,XL', 'Black', '2025-05-20 03:38:15', '2025-05-20 04:51:12'),
(3, 'Beige Cargo Pants', 'Durable cargo pants with multiple pockets.', 1199.00, 19, '/uploads/image-1747712450617-221252233.png', 'Pants', '30, 32, 34, 36', 'Beige ', '2025-05-20 03:40:50', '2025-05-20 08:40:47'),
(4, 'Minimalist Acid Wash Gray Cap', 'Adjustable cap with minimal embroidery.', 399.00, 39, '/uploads/image-1747712613407-955547641.jpg', 'Accessories', 'Free Size', 'Acid Wash Gray', '2025-05-20 03:43:33', '2025-05-20 08:27:36'),
(5, 'Black Graphic Tee', 'Premium cotton shirt with bold front print.', 700.00, 24, '/uploads/image-1747712744244-797147632.png', 'Shirts', 'S,M,L,XL', 'Black', '2025-05-20 03:45:44', '2025-05-20 08:29:25'),
(6, 'Classic Denim Jacket', 'Vintage-inspired denim jacket with button front.', 2000.00, 25, '/uploads/image-1747712866405-795475000.jpg', 'Outerwear', 'S,M,L,XL', 'Blue', '2025-05-20 03:47:46', '2025-05-20 03:47:46'),
(7, 'Olive Green Pants ', 'Tapered fit joggers with stretch waistband.', 999.00, 30, '/uploads/image-1747713012859-857042296.jpg', 'Pants', 'S,M,L', 'Olive Green', '2025-05-20 03:50:12', '2025-05-20 03:50:12'),
(8, 'Fear of God Logo Tee', 'Streetwear-inspired shirt with minimalist branding.', 899.00, 50, '/uploads/image-1747713527960-498863987.png', 'Shirts', 'S,M,L,XL', 'Off White ', '2025-05-20 03:58:47', '2025-05-20 03:58:47'),
(9, 'Cream Zip-Up Hoodie', 'Soft fleece hoodie with full zipper and side pockets.', 1699.00, 35, '/uploads/image-1747713639915-412192202.png', 'Hoodies', 'S,M,L,XL', 'Cream', '2025-05-20 04:00:39', '2025-05-20 04:00:39'),
(10, 'Baggy Sweatpants', 'Baggy sweatpants are loose, comfy pants made from soft fabric, perfect for lounging or casual wear.\r\n', 1599.00, 35, '/uploads/image-1747714022570-34677401.png', 'Outerwear', '30, 32, 34, 36', 'Black', '2025-05-20 04:07:02', '2025-05-21 03:17:12'),
(11, 'Break Her Bed Unstructured Hat', 'Break Her Bed Unstructured Hat is a relaxed-fit cap with soft fabric and bold embroidery for a casual streetwear vibe.\r\n', 650.00, 10, '/uploads/image-1747714151340-546280732.png', 'Accessories', 'Free Size', 'White', '2025-05-20 04:09:11', '2025-05-20 04:09:11'),
(12, 'Ribbed Tank Top', 'Ribbed Tank Top is a stretchy, form-fitting sleeveless shirt with a textured ribbed pattern, perfect for layering or casual wear.\r\n', 350.00, 15, '/uploads/image-1747714279062-942907148.png', 'Tank Tops', 'S,M,L,XL', 'Black', '2025-05-20 04:11:19', '2025-05-20 04:11:19');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `store_name` varchar(100) NOT NULL DEFAULT 'Fear of God',
  `store_email` varchar(100) NOT NULL DEFAULT 'contact@fearofgod.com',
  `store_phone` varchar(20) NOT NULL DEFAULT '+63 123 456 7890',
  `store_address` text NOT NULL DEFAULT '123 Main Street, Manila, Philippines',
  `tax_rate` decimal(5,2) NOT NULL DEFAULT 12.00,
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT 150.00,
  `free_shipping_threshold` decimal(10,2) NOT NULL DEFAULT 2000.00,
  `maintenance_mode` tinyint(1) NOT NULL DEFAULT 0,
  `allow_guest_checkout` tinyint(1) NOT NULL DEFAULT 1,
  `enable_sales` tinyint(1) NOT NULL DEFAULT 1,
  `currency` varchar(3) NOT NULL DEFAULT 'PHP',
  `currency_symbol` varchar(3) NOT NULL DEFAULT '₱',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `store_name`, `store_email`, `store_phone`, `store_address`, `tax_rate`, `shipping_fee`, `free_shipping_threshold`, `maintenance_mode`, `allow_guest_checkout`, `enable_sales`, `currency`, `currency_symbol`, `created_at`, `updated_at`) VALUES
(1, 'Premium Streetwear', 'info@premiumstreetwear.com', '+63 123 456 7890', '123 Fashion District, Manila, Philippines', 12.00, 150.00, 2000.00, 0, 1, 1, 'PHP', '₱', '2025-05-15 08:30:32', '2025-05-21 02:24:19');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL DEFAULT '',
  `last_name` varchar(50) NOT NULL DEFAULT '',
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','customer') NOT NULL DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `role`, `created_at`, `phone`, `address`, `city`, `zip_code`, `updated_at`) VALUES
(1, 'Ivan', 'Geringer', 'ivanrolfg@gmail.com', '$2b$10$ZtjjsG0TwhXXh0nJktygFOwkYgW.x1oB.NLXDBFeIuh64ax4yo5jq', 'customer', '2025-05-14 14:25:05', '09934323434', '123, NDH', 'taguig city', '1234', '2025-05-20 00:40:39'),
(2, 'admin1', 'Geringer', 'admin1@gmail.com', '$2b$10$9eXDQ6cgWshMPIW/f/FCNOYpS6k629Cw7qVaYriLRy9OO2aQ1glQe', 'admin', '2025-05-14 15:51:12', '4234234', 'NDH', 'Baguio City', '4234234', '2025-05-21 06:18:55'),
(3, 'admin2', 'minad', 'admin2@gmial.com', '$2b$10$Rk0yB2UPkGgJOD5zX8FpCOeSUlABD1BsmjhUk/4Qxr9qTBLdtilXq', 'admin', '2025-05-15 03:31:13', NULL, NULL, NULL, NULL, '2025-05-20 00:40:39'),
(4, 'jessa', 'Galang ', 'jessa@gmail.com', '$2b$10$QY/1SfT1Yhs8QaCxy8NgLe9PyOgJRVqPTE3VVHJW9q3J0seHqX/IK', 'customer', '2025-05-15 07:20:51', '2312312', 'dasdasd', 'dasdasd', '31231', '2025-05-20 00:53:03'),
(5, 'rose ann', 'geringer', 'rose@gmail.com', '$2b$10$4oTrJZCECkVBAJfEp2.IOueO3Q6UP3uEt9xfghLxdD5eGNu5wQKzi', 'customer', '2025-05-20 00:29:42', NULL, NULL, NULL, NULL, '2025-05-20 00:40:39'),
(6, 'seth', 'tolen', 'lavern@gmail.com', '$2b$10$V1Dg2rScloxgMmm0MY48dOXQSawUaZWKlXUCHSTLuo3AQNWJDIQPO', 'customer', '2025-05-20 00:38:26', NULL, NULL, NULL, NULL, '2025-05-20 00:40:39'),
(7, 'lavern', 'tolen', 'tolen@gmail.com', '$2b$10$Hqw6wydOucL0uHpqXtLIr.1rcYKwQDsyAWB3C7UWMEOEvUReSQqwq', 'customer', '2025-05-20 00:41:47', NULL, NULL, NULL, NULL, '2025-05-21 03:43:06');

-- --------------------------------------------------------

--
-- Table structure for table `user_cart`
--

CREATE TABLE `user_cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `size` varchar(50) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user_id` (`user_id`),
  ADD KEY `idx_notifications_order_id` (`order_id`),
  ADD KEY `idx_notifications_type` (`type`),
  ADD KEY `idx_notifications_is_read` (`is_read`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_ibfk_1` (`user_id`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_cart`
--
ALTER TABLE `user_cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_item` (`user_id`,`product_id`,`size`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_cart`
--
ALTER TABLE `user_cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_details`
--
ALTER TABLE `order_details`
  ADD CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_cart`
--
ALTER TABLE `user_cart`
  ADD CONSTRAINT `user_cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
