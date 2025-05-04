-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               MySQL 8.0
-- Server OS:                    Win64
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping database structure for clothing_store
CREATE DATABASE IF NOT EXISTS `clothing_store` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */;
USE `clothing_store`;

-- Dumping structure for table clothing_store.cart
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
) ENGINE=InnoDB AUTO_INCREMENT=208 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table clothing_store.cart
INSERT INTO `cart` (`cart_id`, `user_id`, `product_id`, `quantity`, `added_at`) VALUES
	(129, 3, 2, 1, '2025-04-27 05:35:53');

-- Dumping structure for table clothing_store.orders
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table clothing_store.orders
INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status`, `order_date`, `shipping_address`) VALUES
	(1, 2, 299000.00, 'delivered', '2025-04-26 07:18:24', 'Default address'),
	(2, 2, 80000.00, 'delivered', '2025-04-26 07:29:55', 'Chưa cập nhật địa chỉ'),
	(3, 2, 379000.00, 'delivered', '2025-04-26 08:41:50', 'Chưa cập nhật địa chỉ'),
	(4, 2, 379000.00, 'delivered', '2025-04-26 09:25:50', 'Chưa cập nhật địa chỉ'),
	(5, 3, 569000.00, 'pending', '2025-04-27 05:30:04', 'Chưa cập nhật địa chỉ'),
	(6, 3, 569000.00, 'pending', '2025-04-27 05:31:15', 'Chưa cập nhật địa chỉ'),
	(7, 2, 500000.00, 'pending', '2025-04-27 05:33:40', 'Chưa cập nhật địa chỉ'),
	(8, 2, 379000.00, 'pending', '2025-04-27 05:36:04', 'Chưa cập nhật địa chỉ'),
	(9, 2, 379000.00, 'pending', '2025-04-27 05:36:29', 'Chưa cập nhật địa chỉ'),
	(10, 2, 400000.00, 'pending', '2025-04-27 05:36:45', 'Chưa cập nhật địa chỉ'),
	(11, 2, 400000.00, 'pending', '2025-04-27 05:38:30', 'Chưa cập nhật địa chỉ'),
	(12, 2, 400000.00, 'pending', '2025-04-27 05:50:18', 'Chưa cập nhật địa chỉ'),
	(13, 5, 80000.00, 'pending', '2025-04-28 15:16:06', 'TP.Hồ Chí Minh'),
	(14, 4, 270000.00, 'delivered', '2025-04-28 15:17:32', 'TP.Hồ Chí Minh'),
	(15, 4, 80000.00, 'delivered', '2025-04-28 15:20:15', 'tp.HCM\n'),
	(16, 4, 80000.00, 'delivered', '2025-04-28 15:24:23', 'tp.HCM\n'),
	(17, 4, 190000.00, 'delivered', '2025-04-28 15:29:30', 'tp.HCM\n'),
	(18, 4, 80000.00, 'delivered', '2025-04-28 15:32:05', 'tp.HCM\n'),
	(19, 4, 190000.00, 'processing', '2025-04-28 15:33:36', 'tp.HCM\n'),
	(20, 4, 80000.00, 'processing', '2025-04-28 15:33:59', 'tp.HCM\n'),
	(21, 4, 190000.00, 'shipped', '2025-04-28 15:34:35', 'tp.HCM\n'),
	(22, 4, 190000.00, 'delivered', '2025-04-28 15:36:48', 'tp.HCM\n'),
	(23, 4, 190000.00, 'delivered', '2025-04-28 15:38:02', 'tp.HCM\n'),
	(24, 4, 190000.00, 'delivered', '2025-05-03 13:39:48', 'tp.HCM\n'),
	(25, 4, 80000.00, 'delivered', '2025-05-03 14:25:23', 'tp.HCM\n'),
	(26, 4, 270000.00, 'delivered', '2025-05-03 14:29:58', 'tp.HCM\n');

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
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table clothing_store.order_details
INSERT INTO `order_details` (`order_detail_id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
	(1, 1, 2, 1, 299000.00),
	(2, 2, 3, 1, 80000.00),
	(3, 3, 2, 1, 299000.00),
	(4, 3, 3, 1, 80000.00),
	(5, 4, 2, 1, 299000.00),
	(6, 4, 3, 1, 80000.00),
	(7, 5, 2, 1, 299000.00),
	(8, 5, 3, 1, 80000.00),
	(9, 5, 4, 1, 190000.00),
	(10, 6, 2, 1, 299000.00),
	(11, 6, 3, 1, 80000.00),
	(12, 6, 4, 1, 190000.00),
	(13, 7, 9, 1, 300000.00),
	(14, 7, 8, 1, 200000.00),
	(15, 8, 2, 1, 299000.00),
	(16, 8, 3, 1, 80000.00),
	(17, 9, 2, 1, 299000.00),
	(18, 9, 3, 1, 80000.00),
	(19, 10, 8, 1, 200000.00),
	(20, 10, 7, 1, 200000.00),
	(21, 11, 8, 1, 200000.00),
	(22, 11, 7, 1, 200000.00),
	(23, 12, 8, 1, 200000.00),
	(24, 12, 7, 1, 200000.00),
	(25, 13, 3, 1, 80000.00),
	(26, 14, 3, 1, 80000.00),
	(27, 14, 4, 1, 190000.00),
	(28, 15, 3, 1, 80000.00),
	(29, 16, 3, 1, 80000.00),
	(30, 17, 4, 1, 190000.00),
	(31, 18, 3, 1, 80000.00),
	(32, 19, 4, 1, 190000.00),
	(33, 20, 3, 1, 80000.00),
	(34, 21, 4, 1, 190000.00),
	(35, 22, 5, 1, 190000.00),
	(36, 23, 4, 1, 190000.00),
	(37, 24, 4, 1, 190000.00),
	(38, 25, 3, 1, 80000.00),
	(39, 26, 3, 1, 80000.00),
	(40, 26, 4, 1, 190000.00);

-- Dumping structure for table clothing_store.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','bank_transfer') NOT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table clothing_store.payments
INSERT INTO `payments` (`payment_id`, `order_id`, `amount`, `payment_method`, `payment_status`, `transaction_id`, `payment_date`) VALUES
	(1, 1, 299000.00, 'cash', 'completed', NULL, '2025-04-26 07:18:24'),
	(2, 2, 80000.00, 'cash', 'completed', NULL, '2025-04-26 07:29:55'),
	(3, 3, 379000.00, 'bank_transfer', 'completed', '2302394203422324', '2025-04-26 08:41:50'),
	(4, 4, 379000.00, 'bank_transfer', 'completed', '2302394203422324', '2025-04-26 09:25:50'),
	(5, 5, 569000.00, 'cash', 'pending', NULL, '2025-04-27 05:30:04'),
	(6, 6, 569000.00, 'cash', 'pending', NULL, '2025-04-27 05:31:15'),
	(7, 7, 500000.00, 'cash', 'pending', NULL, '2025-04-27 05:33:40'),
	(8, 8, 379000.00, 'cash', 'pending', NULL, '2025-04-27 05:36:04'),
	(9, 9, 379000.00, 'cash', 'pending', NULL, '2025-04-27 05:36:30'),
	(10, 10, 400000.00, 'cash', 'pending', NULL, '2025-04-27 05:36:45'),
	(11, 11, 400000.00, 'cash', 'pending', NULL, '2025-04-27 05:38:30'),
	(12, 12, 400000.00, 'cash', 'pending', NULL, '2025-04-27 05:50:18'),
	(13, 13, 80000.00, 'cash', 'pending', NULL, '2025-04-28 15:16:06'),
	(14, 14, 270000.00, 'cash', 'completed', NULL, '2025-04-28 15:17:32'),
	(15, 15, 80000.00, 'cash', 'pending', NULL, '2025-04-28 15:20:15'),
	(16, 16, 80000.00, 'cash', 'pending', NULL, '2025-04-28 15:24:23'),
	(17, 17, 190000.00, 'cash', 'completed', NULL, '2025-04-28 15:29:30'),
	(18, 18, 80000.00, 'cash', 'completed', NULL, '2025-04-28 15:32:05'),
	(19, 19, 190000.00, 'cash', 'pending', NULL, '2025-04-28 15:33:36'),
	(20, 20, 80000.00, 'cash', 'pending', NULL, '2025-04-28 15:33:59'),
	(21, 21, 190000.00, 'cash', 'pending', NULL, '2025-04-28 15:34:35'),
	(22, 22, 190000.00, 'cash', 'completed', NULL, '2025-04-28 15:36:48'),
	(23, 23, 190000.00, 'cash', 'completed', NULL, '2025-04-28 15:38:02'),
	(24, 24, 190000.00, 'cash', 'completed', NULL, '2025-05-03 13:39:48'),
	(25, 25, 80000.00, 'cash', 'completed', NULL, '2025-05-03 14:26:56'),
	(26, 26, 270000.00, 'cash', 'completed', NULL, '2025-05-03 14:30:25');

-- Dumping structure for table clothing_store.products
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `category` enum('dam_vay','quan_jean','quan_au','ao_so_mi','ao_khoac','ao_len','chan_vay','quan_short','ao_phong') NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table clothing_store.products
INSERT INTO `products` (`product_id`, `name`, `description`, `price`, `stock_quantity`, `category`, `url`, `created_at`, `updated_at`) VALUES
	(2, 'Váy Hỡ Vai', 'size 39', 299000.00, 20, 'dam_vay', '/images/VayNgan-Den.jpg', '2025-04-26 07:08:55', '2025-04-26 09:08:12'),
	(3, 'Áo trắng', 'size 37', 80000.00, 20, 'ao_len', '/images/Ao-Trang.jpg', '2025-04-26 07:10:06', '2025-04-26 07:10:06'),
	(4, 'Áo khoát', 'Áo khoát màu màu đen', 190000.00, 11, 'ao_khoac', '/images/AoKhoac-Den.jpg', '2025-04-26 07:11:40', '2025-04-26 07:11:40'),
	(5, 'Áo khoát', 'Áo khoát xanh', 190000.00, 11, 'ao_khoac', '/images/AoKhoac-Xanh.jpg', '2025-04-26 07:12:12', '2025-04-26 07:12:12'),
	(6, 'Váy cut vai', 'màu trắng đen size 39', 330000.00, 22, 'dam_vay', '/images/Vay-CutVai.jpg', '2025-04-26 07:13:13', '2025-04-26 07:13:13'),
	(7, 'Váy Trung Đen', 'Váy ngắn màu đen size XXl', 200000.00, 11, 'dam_vay', '/images/Vay-Trung-Den.jpg', '2025-04-26 07:15:08', '2025-04-26 07:15:08'),
	(8, 'Váy ngắn xám', 'Váy ngắn màu xám size 39', 200000.00, 11, 'dam_vay', '/images/VayNgan-Xam.jpg', '2025-04-26 07:16:18', '2025-04-26 07:16:18'),
	(9, 'Váy tay dài ', 'Váy tay dài màu tím size 33', 300000.00, 30, 'dam_vay', '/images/VayTayDai-Tim.jpg', '2025-04-26 07:17:20', '2025-04-26 07:17:20'),
	(10, 'Váy tay dài ', 'size 32', 300000.00, 30, 'quan_jean', '/images/VayTayDai-Tim.jpg', '2025-04-26 09:04:32', '2025-04-26 09:04:32'),
	(11, 'Váy tay dài ', 'size 38', 300000.00, 30, 'dam_vay', '/images/VayTayDai-Tim.jpg', '2025-04-26 09:25:03', '2025-04-26 09:25:03');

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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table clothing_store.users
INSERT INTO `users` (`user_id`, `username`, `password`, `full_name`, `email`, `phone`, `address`, `role`, `created_at`, `avatar`) VALUES
	(1, 'admin', '$2b$10$JK.YYxHap.cw8Ay7HncBRuHmp7Be87CABSl9pH2TvNZW4jSSfQRJa', 'Đặng Hoàng Việt', 'dviet037@gmail.com', NULL, NULL, 'admin', '2025-04-26 06:05:54', NULL),
	(2, 'user', '$2b$10$.a0zOv7Pc3mVWaYOhW5Ofe2c6CpbsrY71tzJd648Jg535EnwNk2q6', 'Nguyễn Thị Mỹ Nhân', 'nguyenthien110120@gmail.com', NULL, NULL, 'client', '2025-04-26 07:18:10', NULL),
	(3, 'user01', '$2b$10$4AoKFhblYIWU4C0osV2s6uYsBDRhlVPn3WRpdQwXB9FCEQ584ckF2', 'Đặng Hoàng Việt', 'dvies123@gmail.com', NULL, NULL, 'client', '2025-04-26 09:42:32', NULL),
	(4, 'dhoangviet1612', '$2b$10$ow7eFunWjr6Yiuqgtg8CuOc85bOBWt8C1yMxXRymOxWh7VfHR0Dki', 'Viet Hoang', 'dhoangviet1612@gmail.com', '0364601530', 'tp.HCM\n', 'client', '2025-04-28 15:03:11', NULL),
	(5, 'duongsatlachong', '$2b$10$WyN6F8O0eNWSgafj.vQIHO9EE67j3p2iCPywC1KkUEmgqXy7IuHPC', 'DuongSatLacHong', 'duongsatlachong@gmail.com', '0364601530', 'TP.Hồ Chí Minh', 'client', '2025-04-28 15:04:39', NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;