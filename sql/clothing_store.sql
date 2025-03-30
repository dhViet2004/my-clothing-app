-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.6.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for clothing_store
CREATE DATABASE IF NOT EXISTS `clothing_store` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `clothing_store`;

-- Dumping structure for table clothing_store.cart
CREATE TABLE IF NOT EXISTS `cart` (
  `cart_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `added_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`cart_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table clothing_store.cart: ~0 rows (approximately)

-- Dumping structure for table clothing_store.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `order_date` timestamp NULL DEFAULT current_timestamp(),
  `shipping_address` text NOT NULL,
  PRIMARY KEY (`order_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table clothing_store.orders: ~0 rows (approximately)

-- Dumping structure for table clothing_store.order_details
CREATE TABLE IF NOT EXISTS `order_details` (
  `order_detail_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`order_detail_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table clothing_store.order_details: ~0 rows (approximately)

-- Dumping structure for table clothing_store.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','bank_transfer') NOT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`payment_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table clothing_store.payments: ~0 rows (approximately)

-- Dumping structure for table clothing_store.products
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `category` enum('quan_jean','quan_ao','ao_khoac','ao_so_mi','ao_len') NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table clothing_store.products: ~7 rows (approximately)
INSERT INTO `products` (`product_id`, `name`, `description`, `price`, `stock_quantity`, `category`, `url`, `created_at`, `updated_at`) VALUES
	(4, 'Đầm QC phối linen tầng 1', 'Đầm QC phối linen tầng size 33', 199000.00, 43, 'ao_len', NULL, '2025-03-29 16:04:40', '2025-03-30 01:43:24'),
	(5, 'Đầm QC phối linen tầng', 'test', 199000.00, 9, 'quan_jean', NULL, '2025-03-30 00:12:15', '2025-03-30 00:12:15'),
	(6, 'Đầm QC phối linen tầng', 'size 29', 199000.00, 9, 'quan_jean', '/images/VayNgan-Den.jpg', '2025-03-30 01:02:43', '2025-03-30 01:02:43'),
	(7, 'Đầm QC phối linen tầng', 'test 1', 199000.00, 20, 'ao_khoac', '/images/VayNgan-Den.jpg', '2025-03-30 01:06:18', '2025-03-30 01:06:18'),
	(8, 'Đầm QC phối linen tầng', 'test2', 199000.00, 20, 'quan_jean', '/images/VayNgan-Den.jpg', '2025-03-30 01:10:57', '2025-03-30 01:10:57'),
	(9, 'Đầm QC phối linen tầng', 'test 23', 199000.00, 20, 'ao_khoac', '/images/VayNgan-Den.jpg', '2025-03-30 01:14:52', '2025-03-30 01:14:52'),
	(10, 'Đầm QC phối linen tầng', 'test 4', 199000.00, 20, 'ao_so_mi', '/images/VayNgan-Den.jpg', '2025-03-30 01:15:29', '2025-03-30 01:15:29');

-- Dumping structure for table clothing_store.users
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('client','admin') DEFAULT 'client',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table clothing_store.users: ~2 rows (approximately)
INSERT INTO `users` (`user_id`, `username`, `password`, `full_name`, `email`, `phone`, `address`, `role`, `created_at`) VALUES
	(5, 'client1', '$2b$10$6t4NCv12zJhBV7CvD\\ec4OLZrcPc9gze2kf3vW88Ph6Az0gl3ST\\u', 'Nguyen Van A', 'client1@email.com', NULL, NULL, 'client', '2025-03-16 14:33:31'),
	(6, 'admin1', '$2b$10$mVoqoH4\\228zCK9SEMlNI.aDhZx1Nx9uZa32sdzSEui0Xpt9T\\Qye', 'Tran Thi B', 'admin1@email.com', NULL, NULL, 'admin', '2025-03-16 14:33:31');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
