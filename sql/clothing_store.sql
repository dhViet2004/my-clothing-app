-- Dumping database structure for clothing_store
CREATE DATABASE IF NOT EXISTS `clothing_store` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `clothing_store`;

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('client','admin') DEFAULT 'client',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `category` enum('quan_jean','quan_ao','ao_khoac','ao_so_mi','ao_len') NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cart` (
  `cart_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `shipping_address` text NOT NULL,
  PRIMARY KEY (`order_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping structure for table clothing_store.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','bank_transfer') NOT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table clothing_store.products
INSERT INTO `products` (`product_id`, `name`, `description`, `price`, `stock_quantity`, `category`, `url`, `created_at`, `updated_at`) VALUES
    (4, 'Đầm QC phối linen tầng 1', 'Đầm QC phối linen tầng size 33', 199000.00, 43, 'ao_len', NULL, '2025-03-29 16:04:40', '2025-03-30 01:43:24'),
    (5, 'Đầm QC phối linen tầng', 'test', 199000.00, 9, 'quan_jean', NULL, '2025-03-30 00:12:15', '2025-03-30 00:12:15'),
    (6, 'Đầm QC phối linen tầng', 'size 29', 199000.00, 9, 'quan_jean', '/images/VayNgan-Den.jpg', '2025-03-30 01:02:43', '2025-03-30 01:02:43'),
    (7, 'Đầm QC phối linen tầng', 'test 1', 199000.00, 20, 'ao_khoac', '/images/VayNgan-Den.jpg', '2025-03-30 01:06:18', '2025-03-30 01:06:18'),
    (8, 'Đầm QC phối linen tầng', 'test2', 199000.00, 20, 'quan_jean', '/images/VayNgan-Den.jpg', '2025-03-30 01:10:57', '2025-03-30 01:10:57'),
    (9, 'Đầm QC phối linen tầng', 'test 23', 199000.00, 20, 'ao_khoac', '/images/VayNgan-Den.jpg', '2025-03-30 01:14:52', '2025-03-30 01:14:52'),
    (10, 'Đầm QC phối linen tầng', 'test 4', 199000.00, 20, 'ao_so_mi', '/images/VayNgan-Den.jpg', '2025-03-30 01:15:29', '2025-03-30 01:15:29');

-- Dumping data for table clothing_store.users
INSERT INTO `users` (`user_id`, `username`, `password`, `full_name`, `email`, `phone`, `address`, `role`, `created_at`) VALUES
    (5, 'client1', '$2b$10$6t4NCv12zJhBV7CvDec4OLZrcPc9gze2kf3vW88Ph6Az0gl3STu', 'Nguyen Van A', 'client1@email.com', NULL, NULL, 'client', '2025-03-16 14:33:31'),
    (6, 'admin1', '$2b$10$mVoqoH4228zCK9SEMlNI.aDhZx1Nx9uZa32sdzSEui0Xpt9TQye', 'Tran Thi B', 'admin1@email.com', NULL, NULL, 'admin', '2025-03-16 14:33:31');