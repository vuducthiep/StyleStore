CREATE DATABASE  IF NOT EXISTS `stylestore` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `stylestore`;
-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: stylestore
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cart_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `size_id` bigint NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cart_item` (`cart_id`,`product_id`,`size_id`),
  KEY `fk_ci_product` (`product_id`),
  KEY `fk_ci_size` (`size_id`),
  CONSTRAINT `fk_ci_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_size` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (9,5,76,3,1,299000.00,'2026-01-18 11:56:16','2026-01-18 11:56:16'),(10,7,78,2,2,300000.00,'2026-01-19 17:33:32','2026-01-24 14:43:28'),(11,5,78,1,1,300000.00,'2026-01-27 10:56:49','2026-01-27 10:56:49');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `user_id_2` (`user_id`),
  CONSTRAINT `fk_carts_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (5,79,'2026-01-12 20:02:39','2026-01-12 20:02:39'),(6,80,'2026-01-18 14:45:29','2026-01-18 14:45:29'),(7,81,'2026-01-19 17:33:22','2026-01-19 17:33:22');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Áo','All kinds of shirts 2','ACTIVE','2025-12-11 12:49:26','2026-01-24 18:48:26'),(2,'Quần','Jeans, trousers, joggers','ACTIVE','2025-12-11 12:49:26','2026-01-24 18:48:33'),(3,'Giày','Sneakers, boots, sandals','ACTIVE','2025-12-11 12:49:26','2026-01-24 18:48:53'),(4,'Tất','Fashion socks','ACTIVE','2025-12-11 12:49:26','2026-01-24 18:48:58'),(5,'Phụ kiện khác','Belts, hats, glasses','ACTIVE','2025-12-11 12:49:26','2026-01-24 18:49:08'),(6,'Test add category','test1','INACTIVE','2026-01-24 18:46:18','2026-01-24 18:48:07'),(8,'Test2','Test2','INACTIVE','2026-01-24 18:47:05','2026-01-24 18:48:00'),(9,'Test3','Test3','INACTIVE','2026-01-24 18:47:18','2026-01-24 18:48:17');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,'Áo đẹp mà rẻ quá','2026-01-27 12:48:04','2026-01-27 12:48:04',79,79),(2,'Áo đẹp mà rẻ quá','2026-01-27 13:02:08','2026-01-27 13:02:08',79,79),(3,'ssssadmjasd','2026-01-27 13:11:58','2026-01-27 13:11:58',79,79),(6,'Tôi muốn mua','2026-01-27 13:02:08','2026-01-27 13:02:08',78,78),(7,'Đẹp quá','2026-01-27 13:02:08','2026-01-27 13:02:08',78,76),(8,'Sản phẩm rất đẹp, chất lượng tốt!','2026-01-27 10:15:30','2026-01-27 10:15:30',70,76),(9,'Giá hợp lý, đáng tiền. Sẽ ủng hộ shop lâu dài','2026-01-27 10:30:45','2026-01-27 10:30:45',71,77),(10,'Mình rất thích thiết kế này, sang trọng và tinh tế','2026-01-27 11:00:12','2026-01-27 11:00:12',72,78),(11,'Chất liệu vải mềm mại, mặc rất thoải mái','2026-01-27 11:20:33','2026-01-27 11:20:33',73,76),(12,'Shop giao hàng nhanh, đóng gói cẩn thận','2026-01-27 11:45:18','2026-01-27 11:45:18',74,79),(13,'Màu sắc đẹp như hình, không lỗi chỉ may','2026-01-27 12:05:22','2026-01-27 12:05:22',75,80),(14,'Form dáng chuẩn, vừa vặn với size của mình','2026-01-27 12:25:40','2026-01-27 12:25:40',76,76),(15,'Đẹp quá, mình đã mua thêm 2 màu nữa rồi','2026-01-27 12:50:55','2026-01-27 12:50:55',77,77),(16,'Chất lượng xứng đáng với giá tiền, recommend!','2026-01-27 13:02:08','2026-01-27 13:02:08',78,76),(17,'Sản phẩm đúng như mô tả, rất hài lòng','2026-01-27 13:15:25','2026-01-27 13:15:25',79,78),(18,'Thiết kế trẻ trung, phù hợp đi làm và dạo phố','2026-01-26 15:30:10','2026-01-26 15:30:10',70,79),(19,'Mặc lên người rất đẹp, tôn dáng lắm ạ','2026-01-26 16:20:45','2026-01-26 16:20:45',71,80),(20,'Vải không bị xù lông sau khi giặt, tốt lắm','2026-01-26 17:10:30','2026-01-26 17:10:30',72,76),(21,'Shop tư vấn nhiệt tình, chọn được size vừa','2026-01-26 18:05:15','2026-01-26 18:05:15',73,77),(22,'Giá tốt, chất lượng ok, sẽ quay lại ủng hộ','2026-01-26 19:25:50','2026-01-26 19:25:50',74,78),(23,'Màu sắc bắt mắt, dễ phối đồ','2026-01-26 20:40:20','2026-01-26 20:40:20',75,76),(24,'Mình mua tặng bạn, bạn rất thích luôn','2026-01-25 09:15:35','2026-01-25 09:15:35',76,79),(25,'Chất vải mát, thích hợp cho mùa hè','2026-01-25 10:30:40','2026-01-25 10:30:40',77,80),(26,'Đóng gói kỹ càng, giao hàng đúng hẹn','2026-01-25 11:45:55','2026-01-25 11:45:55',78,76),(27,'Sản phẩm chất lượng cao, giá cả phải chăng','2026-01-25 13:20:10','2026-01-25 13:20:10',79,77),(28,'Form áo đẹp, may kỹ, chỉ chắc chắn','2026-01-25 14:50:25','2026-01-25 14:50:25',70,78),(29,'Rất đáng để mua, mình đã giới thiệu cho bạn bè','2026-01-25 16:10:40','2026-01-25 16:10:40',71,76),(30,'Màu đẹp hơn hình, mình rất bất ngờ','2026-01-24 10:25:15','2026-01-24 10:25:15',72,79),(31,'Vải mềm mịn, không gây kích ứng da','2026-01-24 11:40:30','2026-01-24 11:40:30',73,80),(32,'Thiết kế trendy, hợp thời trang hiện đại','2026-01-24 13:15:45','2026-01-24 13:15:45',74,76),(33,'Chất lượng tuyệt vời, mình sẽ mua thêm','2026-01-24 14:30:20','2026-01-24 14:30:20',75,77),(34,'Size chuẩn, không cần chỉnh sửa gì thêm','2026-01-24 15:50:35','2026-01-24 15:50:35',76,78),(35,'Giao hàng nhanh chóng, sản phẩm đẹp như mong đợi','2026-01-24 17:05:50','2026-01-24 17:05:50',77,76),(36,'Giá rẻ mà chất lượng tốt, rất hài lòng','2026-01-23 09:30:25','2026-01-23 09:30:25',78,79),(37,'Sản phẩm 5 sao, shop uy tín, sẽ ủng hộ lâu dài','2026-01-23 10:45:40','2026-01-23 10:45:40',79,80);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `size_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_oi_order` (`order_id`),
  KEY `fk_oi_product` (`product_id`),
  KEY `fk_oi_size` (`size_id`),
  CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_oi_size` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (6,55,12,3,2,450000.00),(7,55,12,3,2,450000.00),(8,56,10,2,1,850000.00),(9,57,11,2,1,850000.00),(10,66,1,1,2,250000.00),(11,67,1,1,2,250000.00),(12,68,1,1,2,250000.00),(16,73,1,1,2,250000.00),(20,78,72,2,2,250000.00),(21,79,72,2,2,250000.00),(22,79,72,2,2,250000.00),(23,81,1,1,2,250000.00),(24,83,72,2,4,299000.00),(25,84,72,2,4,299000.00),(26,84,76,1,2,299000.00),(27,84,76,2,2,299000.00),(28,86,72,2,1,299000.00),(29,86,76,1,2,299000.00),(30,86,76,2,5,299000.00),(31,87,76,1,1,299000.00),(32,88,76,1,1,299000.00),(33,89,76,1,1,299000.00),(34,89,76,3,1,299000.00),(35,90,76,1,1,299000.00),(36,90,76,3,1,299000.00),(37,91,76,1,1,299000.00),(38,91,76,3,1,299000.00),(39,92,76,1,1,299000.00),(40,92,76,3,1,299000.00),(41,93,78,2,1,300000.00),(42,94,78,2,2,300000.00),(43,95,78,2,30,300000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_address` varchar(255) NOT NULL,
  `payment_method` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_order_user` (`user_id`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (45,5,120000.00,'HN','COD','CREATED','2025-03-05 10:15:00','2026-01-06 20:24:08'),(46,5,185000.00,'HN','MOMO','CREATED','2025-03-18 14:20:00','2026-01-06 20:24:08'),(47,5,210000.00,'HCM','ZALOPAY','CREATED','2025-04-07 09:05:00','2026-01-06 20:24:08'),(48,5,99000.00,'HCM','COD','CANCELLED','2025-04-22 19:45:00','2026-01-06 20:24:08'),(49,5,250000.00,'DN','MOMO','SHIPPING','2025-05-03 11:10:00','2026-01-06 20:24:08'),(50,5,175000.00,'DN','ZALOPAY','SHIPPING','2025-05-27 16:30:00','2026-01-06 20:24:08'),(51,5,320000.00,'HN','COD','CANCELLED','2025-06-08 08:50:00','2026-01-06 20:24:08'),(52,5,145000.00,'HN','MOMO','SHIPPING','2025-06-19 21:05:00','2026-01-06 20:24:08'),(53,5,270000.00,'HCM','ZALOPAY','CREATED','2025-07-04 10:25:00','2026-01-06 20:24:08'),(54,5,199000.00,'HCM','COD','CREATED','2025-07-23 15:40:00','2026-01-06 20:24:08'),(55,5,305000.00,'DN','MOMO','CANCELLED','2025-08-06 12:00:00','2026-01-06 20:24:08'),(56,5,165000.00,'DN','ZALOPAY','CANCELLED','2025-08-28 18:35:00','2026-01-06 20:24:08'),(57,5,355000.00,'HN','COD','DELIVERED','2025-09-09 09:15:00','2025-09-09 09:15:00'),(58,5,220000.00,'HN','MOMO','DELIVERED','2025-09-21 20:10:00','2025-09-21 20:10:00'),(59,5,280000.00,'HCM','ZALOPAY','DELIVERED','2025-10-05 13:05:00','2025-10-05 13:05:00'),(60,5,190000.00,'HCM','COD','DELIVERED','2025-10-24 17:45:00','2025-10-24 17:45:00'),(61,5,330000.00,'DN','MOMO','DELIVERED','2025-11-07 08:55:00','2025-11-07 08:55:00'),(62,5,150000.00,'DN','ZALOPAY','DELIVERED','2025-11-26 19:25:00','2025-11-26 19:25:00'),(63,5,360000.00,'HN','COD','DELIVERED','2025-12-08 10:35:00','2025-12-08 10:35:00'),(64,5,210000.00,'HN','MOMO','DELIVERED','2025-12-20 22:15:00','2025-12-20 22:15:00'),(65,10,120000.00,'HN','COD','DELIVERED','2025-03-05 10:15:00','2025-03-05 10:15:00'),(66,79,500000.00,'123 Đường ABC, ...','COD','CREATED','2026-01-13 13:55:48','2026-01-13 13:55:48'),(67,79,500000.00,'123 Đường ABC, ...','COD','CREATED','2026-01-13 13:55:58','2026-01-13 13:55:58'),(68,79,500000.00,'123 Đường ABC, ...','COD','CREATED','2026-01-13 13:56:03','2026-01-13 13:56:03'),(73,79,500000.00,'123 Đường ABC, ...','COD','CREATED','2026-01-13 14:01:26','2026-01-13 14:01:26'),(78,79,500000.00,'123 Đường ABC, ...','COD','SHIPPING','2026-01-13 14:10:44','2026-01-13 14:10:44'),(79,79,1000000.00,'123 Đường ABC, ...','COD','CANCELLED','2026-01-13 14:11:15','2026-01-13 14:11:15'),(81,79,500000.00,'123 Đường ABC, ...','COD','DELIVERED','2026-01-13 14:16:47','2026-01-13 14:16:47'),(83,79,1196000.00,'32, Phường Long Biên, Quận Long Biên, Thành phố Hà Nội','COD','DELIVERED','2026-01-13 15:19:27','2026-01-13 15:19:27'),(84,79,2392000.00,'32, Phường Long Biên, Quận Long Biên, Thành phố Hà Nội','COD','CANCELLED','2026-01-13 17:53:31','2026-01-13 17:53:31'),(86,79,2392000.00,'32, Phường Long Biên, Quận Long Biên, Thành phố Hà Nội','COD','DELIVERED','2026-01-18 11:12:49','2026-01-18 11:12:49'),(87,79,299000.00,'32, Phường Long Biên, Quận Long Biên, Thành phố Hà Nội','COD','CANCELLED','2026-01-18 11:18:12','2026-01-18 11:18:12'),(88,79,299000.00,'32, Phường Long Biên, Quận Long Biên, Thành phố Hà Nội','COD','DELIVERED','2026-01-18 11:24:08','2026-01-18 11:24:08'),(89,79,598000.00,'32, Phường Long Biên, Quận Long Biên, Thành phố Hà Nội','COD','CREATED','2026-01-18 11:56:21','2026-01-18 11:56:21'),(90,79,598000.00,'32, Phường Long Biên, Quận Long Biên, Thành phố Hà Nội','ZALOPAY','SHIPPING','2026-01-18 13:09:07','2026-01-18 13:09:07'),(91,79,598000.00,'DHCNHN, Phường Cầu Diễn, Quận Nam Từ Liêm, Thành phố Hà Nội','COD','CANCELLED','2026-01-18 13:10:32','2026-01-18 13:10:32'),(92,79,598000.00,'32, Phường Long Biên, Quận Long Biên, Thành phố Hà Nội','COD','CANCELLED','2026-01-18 15:17:02','2026-01-18 15:17:02'),(93,81,300000.00,'Xã Vĩnh Sơn, Huyện Vĩnh Tường, Tỉnh Vĩnh Phúc','COD','CREATED','2026-01-20 15:47:11','2026-01-20 15:47:11'),(94,81,600000.00,'Xã Vĩnh Sơn, Huyện Vĩnh Tường, Tỉnh Vĩnh Phúc','COD','CANCELLED','2026-01-24 14:43:36','2026-01-24 14:43:36'),(95,81,9000000.00,'21 dsa, Xã Đồng Quang, Huyện Gia Lộc, Tỉnh Hải Dương','COD','SHIPPING','2026-01-24 15:51:10','2026-01-24 15:51:10');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_sizes`
--

DROP TABLE IF EXISTS `product_sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_sizes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `size_id` bigint NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_ps_product` (`product_id`),
  KEY `fk_ps_size` (`size_id`),
  CONSTRAINT `fk_ps_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ps_size` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_sizes`
--

LOCK TABLES `product_sizes` WRITE;
/*!40000 ALTER TABLE `product_sizes` DISABLE KEYS */;
INSERT INTO `product_sizes` VALUES (1,1,1,19),(2,1,2,21),(3,1,3,21),(4,1,4,20),(5,1,5,20),(11,3,2,40),(12,3,3,42),(13,3,4,35),(14,4,1,20),(15,4,2,20),(16,4,3,20),(17,4,4,15),(18,5,2,50),(19,5,3,50),(20,5,4,50),(21,6,2,20),(22,6,3,20),(23,6,4,15),(24,7,3,100),(25,8,3,80),(29,10,2,60),(30,10,3,60),(31,10,4,50),(32,12,3,12),(33,12,2,1),(34,12,1,1),(35,12,4,0),(36,12,5,0),(37,13,3,1),(38,13,2,2),(39,13,1,3),(40,13,4,4),(41,13,5,11),(42,72,3,23),(43,72,2,3),(44,72,1,1),(45,72,4,3),(46,72,5,21),(47,73,3,12),(48,73,2,32),(49,73,1,12),(50,73,4,43),(51,73,5,21),(52,74,3,21),(53,74,2,43),(54,74,1,21),(55,74,4,43),(56,74,5,53),(57,75,3,12),(58,75,2,32),(59,75,1,12),(60,75,4,32),(61,75,5,32),(62,76,3,17),(63,76,2,25),(64,76,1,2),(65,76,4,3),(66,76,5,123),(67,77,3,11),(68,77,2,20),(69,77,1,122),(70,77,4,12),(71,77,5,22),(72,78,3,12),(73,78,2,179),(74,78,1,13),(75,78,4,432),(76,78,5,24),(77,79,3,10),(78,79,2,10),(79,79,1,10),(80,79,4,11),(81,79,5,11),(82,80,3,0),(83,80,2,0),(84,80,1,0),(85,80,4,0),(86,80,5,0);
/*!40000 ALTER TABLE `product_sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` text,
  `gender` varchar(10) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Classic White Shirt','Comfortable cotton shirt','UNISEX',NULL,19.99,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767694780/stylestore/biqj0x71jydfajpd0csg.jpg',1,'ACTIVE','2025-12-11 12:49:38','2026-01-06 17:19:42'),(3,'Blue Jeans','Slim fit denim jeans','MALE',NULL,29.99,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767694815/stylestore/mtzwgwybr2ziej648kfw.jpg',2,'ACTIVE','2025-12-11 12:49:38','2026-01-06 17:20:16'),(4,'Women Skinny Jeans','High waist skinny jeans','FEMALE',NULL,34.99,'jeans_skinny.jpg',2,'ACTIVE','2025-12-11 12:49:38','2025-12-11 12:49:38'),(5,'Running Sneakers','Lightweight running shoes','UNISEX',NULL,59.99,'sneakers_run.jpg',3,'ACTIVE','2025-12-11 12:49:38','2025-12-11 12:49:38'),(6,'Leather Boots','High quality leather boots','MALE',NULL,89.99,'boots_leather.jpg',3,'ACTIVE','2025-12-11 12:49:38','2025-12-11 12:49:38'),(7,'White Socks Pack','3 pairs of soft socks','UNISEX',NULL,4.99,'socks_white.jpg',4,'ACTIVE','2025-12-11 12:49:38','2025-12-11 12:49:38'),(8,'Long Black Socks','High knee socks','FEMALE',NULL,5.99,'socks_black.jpg',4,'ACTIVE','2025-12-11 12:49:38','2025-12-11 12:49:38'),(10,'Summer Hat','Light and breathable hat','UNISEX',NULL,12.99,'hat_summer.jpg',5,'ACTIVE','2025-12-11 12:49:38','2025-12-11 12:49:38'),(11,'test sp ','1','Nữ',NULL,111.00,'https://i.ibb.co/p6whQM6n/dogecoin-meme-1716599885-9264-1716599891.webp',1,'ACTIVE','2026-01-01 20:42:56','2026-01-03 08:36:26'),(12,'test21 3','quần1','Nam','nike',20000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767694748/stylestore/w70wnx1hzjj3aqhtrxxo.jpg',2,'ACTIVE','2026-01-03 17:07:07','2026-01-08 20:28:17'),(13,'Quần đùi 1','Quần','Nam','nike',101999.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-08 20:29:16','2026-01-08 20:29:16'),(14,'Áo Sơ Mi Nam Trắng','Áo sơ mi nam màu trắng cao cấp','Nam','FILA',299000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/ao_somi_trang.jpg',1,'ACTIVE','2026-01-12 17:11:28','2026-01-12 17:11:28'),(15,'Áo Sơ Mi Nam Trắng','Áo sơ mi nam màu trắng cao cấp','Nam','FILA',299000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/ao_somi_trang.jpg',1,'ACTIVE','2026-01-12 17:11:57','2026-01-12 17:11:57'),(16,'Áo Thun Nam Basic','Áo thun nam cơ bản màu đen','Nam','Nike',199000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/ao_thun_den.jpg',1,'ACTIVE','2026-01-12 17:11:57','2026-01-12 17:11:57'),(17,'Áo Polo Nam Xanh','Áo polo nam màu xanh dương','Nam','Adidas',349000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/ao_polo_xanh.jpg',1,'ACTIVE','2026-01-12 17:11:57','2026-01-12 17:11:57'),(18,'Áo Phông Nữ Hồng','Áo phông nữ màu hồng pastel','Nữ','Uniqlo',179000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/ao_phong_hong.jpg',1,'ACTIVE','2026-01-12 17:11:57','2026-01-12 17:11:57'),(19,'Áo Khoác Denim Nam','Áo khoác denim nam kiểu dáng suông','Nam','Levis',599000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/ao_khoac_denim.jpg',1,'ACTIVE','2026-01-12 17:11:57','2026-01-12 17:11:57'),(20,'Áo Croptop Nữ Đen','Áo croptop nữ màu đen trendy','Nữ','H&M',249000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/ao_croptop_den.jpg',1,'ACTIVE','2026-01-12 17:11:57','2026-01-12 17:11:57'),(21,'Áo Hoodie Nam Xám','Áo hoodie nam màu xám tuyệt vời','Nam','Champion',449000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/ao_hoodie_xam.jpg',1,'ACTIVE','2026-01-12 17:11:57','2026-01-12 17:11:57'),(22,'Áo Linen Nữ Kem','Áo linen nữ màu kem nhẹ nhàng','Nữ','Zara',329000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/ao_linen_kem.jpg',1,'ACTIVE','2026-01-12 17:11:57','2026-01-12 17:11:57'),(23,'Áo Sợi Tre Nam Xanh','Áo sợi tre nam eco-friendly','Nam','Bamboo',279000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/ao_soi_tre.jpg',1,'ACTIVE','2026-01-12 17:11:57','2026-01-12 17:11:57'),(24,'Quần Dài Nam Đen','Quần dài nam màu đen chuẩn form','Nam','Gap',449000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/quan_dai_den.jpg',1,'ACTIVE','2026-01-12 17:12:25','2026-01-12 17:12:25'),(25,'Quần Short Nam Xanh','Quần short nam màu xanh biển','Nam','Nike',249000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/quan_short_xanh.jpg',1,'ACTIVE','2026-01-12 17:12:25','2026-01-12 17:12:25'),(26,'Quần Jeans Nữ Đen','Quần jeans nữ kiểu skinny','Nữ','Zara',549000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/quan_jeans_den.jpg',1,'ACTIVE','2026-01-12 17:12:25','2026-01-12 17:12:25'),(27,'Quần Dài Nữ Trắng','Quần dài nữ màu trắng thanh lịch','Nữ','H&M',379000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/quan_dai_trang.jpg',1,'ACTIVE','2026-01-12 17:12:25','2026-01-12 17:12:25'),(28,'Quần Cargo Nam Xám','Quần cargo nam nhiều túi thực dụng','Nam','Carhartt',599000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/quan_cargo_xam.jpg',1,'ACTIVE','2026-01-12 17:12:25','2026-01-12 17:12:25'),(29,'Quần Legging Nữ Đen','Quần legging nữ co giãn thoải mái','Nữ','Uniqlo',199000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/quan_legging_den.jpg',1,'ACTIVE','2026-01-12 17:12:25','2026-01-12 17:12:25'),(30,'Quần Jeans Nam Xanh','Quần jeans nam màu xanh classic','Nam','Levis',599000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/quan_jeans_nam.jpg',1,'ACTIVE','2026-01-12 17:12:25','2026-01-12 17:12:25'),(31,'Quần Chino Nam Beg','Quần chino nam màu be đơn giản','Nam','Banana Republic',479000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/quan_chino_beg.jpg',1,'ACTIVE','2026-01-12 17:12:25','2026-01-12 17:12:25'),(42,'Áo Sơ Mi Nam Trắng','Áo sơ mi nam cao cấp','Nam','FILA',299000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(43,'Áo Thun Nam Đen','Áo thun nam cơ bản','Nam','Nike',199000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(44,'Áo Polo Nam Xanh','Áo polo nam chất lượng','Nam','Adidas',349000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(45,'Áo Phông Nữ Hồng','Áo phông nữ thoáng mát','Nữ','Uniqlo',179000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(46,'Áo Khoác Denim Nam','Áo khoác denim kiểu suông','Nam','Levis',599000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(47,'Áo Croptop Nữ Đen','Áo croptop nữ hiện đại','Nữ','H&M',249000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(48,'Áo Hoodie Nam Xám','Áo hoodie nam ấm áp','Nam','Champion',449000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(49,'Áo Linen Nữ Kem','Áo linen nữ nhẹ nhàng','Nữ','Zara',329000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1768727234/stylestore/ef90skyp9u9tlmv1trhh.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-18 16:07:14'),(50,'Áo sơ mi nam dài tay cao cấp vải sợi tre','Áo sợi tre nam thân thiện','Nam','Bamboo',279000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-18 16:08:06'),(51,'Áo Tank Top Nam Trắng','Áo tank top nam thoáng','Nam','Calvin Klein',159000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(52,'Áo Knitwear Nữ Kem','Áo len nữ ấm áp','Nữ','Uniqlo',399000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(53,'Áo Sơ Mi Nữ Hoa','Áo sơ mi nữ hoạ tiết','Nữ','MANGO',379000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(54,'Áo Vest Nam Đen','Áo vest nam lịch lãm','Nam','Hugo Boss',899000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(55,'Áo Cánh Dơi Nữ Tím','Áo cánh dơi nữ thoải mái','Nữ','Zara',289000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(56,'Áo Sweater Nam Đỏ','Áo sweater nam ấm cúng','Nam','Gap',369000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(57,'Quần Dài Nam Đen','Quần dài nam chuẩn form','Nam','Gap',449000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(58,'Quần Short Nam Xanh','Quần short nam thoáng','Nam','Nike',249000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(59,'Quần Jeans Nữ Đen','Quần jeans nữ skinny','Nữ','Zara',549000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(60,'Quần Dài Nữ Trắng','Quần dài nữ thanh lịch','Nữ','H&M',379000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(61,'Quần Cargo Nam Xám','Quần cargo nam thực dụng','Nam','Carhartt',599000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(62,'Quần Legging Nữ Đen','Quần legging nữ co giãn','Nữ','Uniqlo',199000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(63,'Quần Jeans Nam Xanh','Quần jeans nam classic','Nam','Levis',599000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(64,'Quần Chino Nam Beg','Quần chino nam đơn giản','Nam','Banana Republic',479000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(65,'Quần Linen Nữ Trắng','Quần linen nữ thoải mái','Nữ','Uniqlo',349000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(66,'Quần Kaki Nam Nâu','Quần kaki nam chất lượng','Nam','Dockers',469000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(67,'Quần Jogger Nam Đen','Quần jogger nam thoáng','Nam','Adidas',329000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(68,'Quần Palazzo Nữ Xanh','Quần palazzo nữ rộng rãi','Nữ','MANGO',419000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(69,'Quần Short Nữ Đỏ','Quần short nữ vải cotton','Nữ','H&M',229000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(70,'Quần Tây Nam Xám','Quần tây nam lịch lãm','Nam','Hugo Boss',699000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(71,'Quần Đùi Nam Xanh Lá','Quần đùi nam thoáng mát','Nam','Nike',269000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1767878955/stylestore/h342eyhq2dyvxhhanjh8.jpg',1,'ACTIVE','2026-01-12 17:18:28','2026-01-12 17:18:28'),(72,'Áo thun nam có cổ màu xanh bích hàng hiệu giá sỉ','Áo thun nam chất lượng cao','Nam','Adidas',299000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1768727165/stylestore/cm2yiad365dtaptw3civ.jpg',1,'ACTIVE','2026-01-12 17:27:08','2026-01-18 16:06:05'),(73,'Áo thun nam dài tay cổ bẻ ADG - Màu đen','Áo thun nam chất lượng cao','Nam','Adidas',299000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1768727107/stylestore/spd6j9ie9j8sp4w8fxwl.jpg',1,'ACTIVE','2026-01-12 17:27:56','2026-01-18 16:05:08'),(74,'Áo Thun Cộc Tay Nam Cotton Ôm Đơn Giản','Áo cộc nam chất lượng cao','Nam','Nike',299000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1768727023/stylestore/qquuwnuilamkwvjzrovv.jpg',1,'ACTIVE','2026-01-13 13:32:50','2026-01-18 16:03:44'),(75,'Áo thun nam có cổ xuất khẩu GAP màu xanh blue ACC65D','Áo cộc nam chất lượng cao','Nam','Nike',299000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1768726227/stylestore/o4w8x0vqpfb6tnpm8hoe.jpg',1,'ACTIVE','2026-01-13 13:32:59','2026-01-18 15:50:27'),(76,'Áo dài cách tân nữ 4 tà','Áo dài chất lượng cao','Nam','BCH',299000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1768725935/stylestore/pgmayesdzhjo5y32nsrn.jpg',2,'ACTIVE','2026-01-13 13:33:49','2026-01-18 16:02:04'),(77,'Áo thun nam có cổ xuất khẩu GAP màu xanh blue ACC65D','Áo sơ mi chất lượng cao','Nam','NTDD',299000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1768725162/stylestore/qvhiazvuzhc8gaoywobr.jpg',2,'ACTIVE','2026-01-18 15:22:37','2026-01-18 16:01:42'),(78,'Áo sơ mi nam dài tay cao cấp vải sợi tre','Áo sơ mi nam dài tay cao cấp vải sợi tre','Nam','Belluni',300000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1768727358/stylestore/taswxfskzkojfswgyjme.jpg',1,'ACTIVE','2026-01-18 16:09:18','2026-01-18 16:09:18'),(79,'Áo khoác da lộn basic cổ bẻ cúc khắc logo GWCL501','Áo khoác da lộn basic cổ bẻ cúc khắc logo GWCL501','Unisex','Tarano',500000.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1768728107/stylestore/poouhxowboscaee0puvy.png',1,'ACTIVE','2026-01-18 16:21:48','2026-01-18 16:21:48'),(80,'12','11','Nam','111',111111.00,'https://res.cloudinary.com/dslt4mgvy/image/upload/v1768730545/stylestore/rmcbfskc8lzn2dipdpcm.jpg',1,'INACTIVE','2026-01-18 17:02:26','2026-01-18 17:44:49');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sizes`
--

DROP TABLE IF EXISTS `sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sizes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sizes`
--

LOCK TABLES `sizes` WRITE;
/*!40000 ALTER TABLE `sizes` DISABLE KEYS */;
INSERT INTO `sizes` VALUES (3,'L'),(2,'M'),(1,'S'),(4,'XL'),(5,'XXL');
/*!40000 ALTER TABLE `sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'USER',
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `phone_number` varchar(20) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (4,'Sarah Parker','sarah@example.com','123456','USER','ACTIVE','0998877665','FEMALE','Florida, USA','2025-12-11 12:49:16','2025-12-11 12:49:16'),(5,'Admin User','admin@example.com','admin123','ADMIN','ACTIVE','0123987654','MALE','Head Office','2025-12-11 12:49:16','2025-12-11 12:49:16'),(6,'string','thiep1@abc.com','$2a$10$QefefmQm5JXrjZ9B94pob.kATyYHPCbhwYdXbe5ozKMfQqOOFcFSe','ADMIN','ACTIVE','0326515832','MALE','hanoi','2025-12-13 16:06:33','2025-12-29 09:14:23'),(7,'vuduchthiep01','thiep21@gmail.com','$2a$10$RdO9mrXmKEiZQT3IaqOLXObFPWhQoNXXrvz..hFVCuffzpcr1k11i','ADMIN','ACTIVE','0326515832','OTHER',NULL,'2025-12-21 17:02:54','2025-12-21 17:19:03'),(8,'David Brown test edit','david.brown@example.com','123456','USER','ACTIVE','0901112223','MALE','Boston, USA','2025-12-21 18:55:50','2025-12-29 09:59:10'),(9,'Linda White','linda.white@example.com','123456','USER','ACTIVE','0120200203','FEMALE','Seattle, USA','2025-12-21 18:55:50','2025-12-29 09:59:27'),(10,'James Wilson','james.wilson@example.com','123456','USER','ACTIVE','0903334445','MALE','Chicago, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(11,'Patricia Taylor','patricia.taylor@example.com','123456','USER','ACTIVE','0904445556','FEMALE','Denver, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(12,'Robert Martinez','robert.martinez@example.com','123456','USER','ACTIVE','0905556667','MALE','Phoenix, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(13,'Barbara Anderson','barbara.anderson@example.com','123456','USER','ACTIVE','0906667778','FEMALE','Las Vegas, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(14,'William Thomas','william.thomas@example.com','123456','USER','ACTIVE','0907778889','MALE','Atlanta, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(15,'Elizabeth Moore','elizabeth.moore@example.com','123456','USER','ACTIVE','0908889990','FEMALE','San Diego, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(16,'Christopher Jackson','chris.jackson@example.com','123456','USER','ACTIVE','0910001112','MALE','Dallas, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(17,'Jennifer Martin','jennifer.martin@example.com','123456','USER','INACTIVE','0911112223','FEMALE','Austin, USA','2025-12-21 18:55:50','2026-01-06 17:37:49'),(18,'Daniel Garcia','daniel.garcia@example.com','123456','USER','ACTIVE','0912223334','MALE','San Jose, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(19,'Susan Rodriguez','susan.rodriguez@example.com','123456','USER','ACTIVE','0913334445','FEMALE','Miami, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(20,'Matthew Hernandez','matt.hernandez@example.com','123456','USER','ACTIVE','0914445556','MALE','Orlando, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(21,'Karen Lopez','karen.lopez@example.com','123456','USER','ACTIVE','0915556667','FEMALE','Tampa, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(22,'Anthony Gonzalez','anthony.gonzalez@example.com','123456','USER','ACTIVE','0916667778','MALE','San Antonio, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(23,'Nancy Perez','nancy.perez@example.com','123456','USER','ACTIVE','0917778889','FEMALE','Houston, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(24,'Mark Harris','mark.harris@example.com','123456','USER','ACTIVE','0918889990','MALE','Portland, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(25,'Lisa Clark','lisa.clark@example.com','123456','USER','ACTIVE','0920001112','FEMALE','San Francisco, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(26,'Steven Lewis','steven.lewis@example.com','123456','USER','ACTIVE','0921112223','MALE','Oakland, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(27,'Donna Walker','donna.walker@example.com','123456','USER','ACTIVE','0922223334','FEMALE','Berkeley, USA','2025-12-21 18:55:50','2025-12-21 18:55:50'),(29,'Nguyễn Văn A','nguyenvana@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234567','MALE','Hà Nội','2025-02-05 10:30:00','2026-01-06 12:56:42'),(30,'Trần Thị B','tranthib@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234568','FEMALE','TP.HCM','2025-02-12 14:20:00','2026-01-06 12:56:42'),(31,'Lê Văn C','levanc@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234569','MALE','Đà Nẵng','2025-02-18 09:15:00','2026-01-06 12:56:42'),(32,'Phạm Thị D','phamthid@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234570','FEMALE','Cần Thơ','2025-02-25 16:45:00','2026-01-06 12:56:42'),(33,'Hoàng Văn E','hoangvane@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234571','MALE','Hải Phòng','2025-03-03 11:00:00','2026-01-06 12:56:51'),(34,'Võ Thị F','vothif@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234572','FEMALE','Huế','2025-03-08 13:30:00','2026-01-06 12:56:51'),(35,'Đặng Văn G','dangvang@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234573','MALE','Nha Trang','2025-03-15 10:20:00','2026-01-06 12:56:51'),(36,'Bùi Thị H','buithih@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234574','FEMALE','Vũng Tàu','2025-03-22 15:45:00','2026-01-06 12:56:51'),(37,'Dương Văn I','duongvani@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234575','OTHER','Đà Lạt','2025-03-28 12:10:00','2026-01-06 12:56:51'),(38,'Mai Thị J','maithij@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234576','FEMALE','Quy Nhơn','2025-04-05 09:30:00','2026-01-06 12:56:51'),(39,'Lý Văn K','lyvank@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234577','MALE','Biên Hòa','2025-04-14 14:20:00','2026-01-06 12:56:51'),(40,'Trịnh Thị L','trinhthil@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234578','FEMALE','Thái Nguyên','2025-04-23 11:50:00','2026-01-06 12:56:51'),(41,'Hồ Văn M','hovanm@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234579','MALE','Vinh','2025-05-06 10:15:00','2026-01-06 12:56:51'),(42,'Tô Thị N','tothin@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234580','FEMALE','Nam Định','2025-05-12 13:40:00','2026-01-06 12:56:51'),(43,'Đinh Văn O','dinhvano@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234581','MALE','Hà Tĩnh','2025-05-19 15:25:00','2026-01-06 12:56:51'),(44,'Phan Thị P','phanthip@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234582','FEMALE','Quảng Ninh','2025-05-27 09:55:00','2026-01-06 12:56:51'),(45,'Vũ Văn Q','vuvanq@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234583','MALE','Thanh Hóa','2025-06-04 11:20:00','2026-01-06 12:56:51'),(46,'Đỗ Thị R','dothir@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234584','FEMALE','Bắc Giang','2025-06-10 14:30:00','2026-01-06 12:56:51'),(47,'Cao Văn S','caovans@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234585','MALE','Hà Nam','2025-06-16 10:45:00','2026-01-06 12:56:51'),(48,'Tạ Thị T','tathit@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234586','FEMALE','Ninh Bình','2025-06-22 12:15:00','2026-01-06 12:56:51'),(49,'Lưu Văn U','luuvanu@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234587','OTHER','Lạng Sơn','2025-06-28 16:00:00','2026-01-06 12:56:51'),(50,'Nghiêm Thị V','nghiemthiv@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234588','FEMALE','Yên Bái','2025-07-07 09:40:00','2026-01-06 12:56:51'),(51,'Khương Văn W','khuongvanw@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234589','MALE','Tuyên Quang','2025-07-15 13:20:00','2026-01-06 12:56:51'),(52,'Ung Thị X','ungthix@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234590','FEMALE','Lai Châu','2025-07-24 15:50:00','2026-01-06 12:56:51'),(53,'Quách Văn Y','quachvany@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234591','MALE','Sơn La','2025-08-03 10:25:00','2026-01-06 12:56:51'),(54,'Bành Thị Z','banhthiz@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234592','FEMALE','Điện Biên','2025-08-11 14:10:00','2026-01-06 12:56:51'),(55,'Thái Văn AA','thaivanaa@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234593','MALE','Cao Bằng','2025-08-18 11:35:00','2026-01-06 12:56:51'),(56,'Quan Thị AB','quanthiab@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234594','FEMALE','Bắc Kạn','2025-08-26 16:20:00','2026-01-06 12:56:51'),(57,'Từ Văn AC','tuvanac@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234595','MALE','Lào Cai','2025-09-02 09:15:00','2026-01-06 12:56:51'),(58,'Đào Thị AD','daothiad@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234596','FEMALE','Hòa Bình','2025-09-08 12:50:00','2026-01-06 12:56:51'),(59,'Tăng Văn AE','tangvanae@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234597','MALE','Phú Thọ','2025-09-14 15:30:00','2026-01-06 12:56:51'),(60,'Ông Thị AF','ongthiaf@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234598','FEMALE','Vĩnh Phúc','2025-09-21 10:40:00','2026-01-06 12:56:51'),(61,'Thang Văn AG','thangvanag@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234599','OTHER','Bắc Ninh','2025-09-28 13:25:00','2026-01-06 12:56:51'),(62,'Lạc Thị AH','lacthiah@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234600','FEMALE','Hải Dương','2025-10-05 11:10:00','2026-01-06 12:56:51'),(63,'Ưng Văn AI','ungvanai@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234601','MALE','Hưng Yên','2025-10-12 14:45:00','2026-01-06 12:56:51'),(64,'Mạc Thị AJ','macthiaj@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234602','FEMALE','Thái Bình','2025-10-19 09:55:00','2026-01-06 12:56:51'),(65,'Đường Văn AK','duongvanak@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234603','MALE','Long An','2025-10-27 16:35:00','2026-01-06 12:56:51'),(66,'La Thị AL','lathial@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234604','FEMALE','Tiền Giang','2025-11-06 10:20:00','2026-01-06 12:56:51'),(67,'Phi Văn AM','phivanam@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234605','MALE','Bến Tre','2025-11-15 13:40:00','2026-01-06 12:56:51'),(68,'Di Thị AN','dithian@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234606','FEMALE','Trà Vinh','2025-11-23 15:15:00','2026-01-06 12:56:51'),(69,'Kiều Văn AO','kieuvanaо@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234607','MALE','Vĩnh Long','2025-12-03 09:30:00','2026-01-06 12:56:51'),(70,'Nhữ Thị AP','nhuthiap@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234608','FEMALE','Đồng Tháp','2025-12-09 12:25:00','2026-01-06 12:56:51'),(71,'Tôn Văn AQ','tonvanaq@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234609','MALE','An Giang','2025-12-15 14:50:00','2026-01-06 12:56:51'),(72,'Viên Thị AR','vienthiar@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','USER','ACTIVE','0901234610','FEMALE','Kiên Giang','2025-12-21 11:05:00','2026-01-06 12:56:51'),(74,'Vũ Đức Thiệp User','thiepUser@abc.com','$2a$10$emEpqrDoEGdjdgvTAsgHuO58uXd0FeX3LZAxySbt855wTd3yMulyu','USER','ACTIVE','0324791334','OTHER',NULL,'2026-01-07 21:07:23','2026-01-07 21:07:23'),(75,'Vũ Đức Thiệp','thiepUser2@abc.com','$2a$10$gjGN2.VjR8GUhu3hCo36o.qv7k2JbLXUTCm7j7rEJFAcOJ0FuQ8sa','USER','ACTIVE','0326515831','OTHER',NULL,'2026-01-12 18:21:32','2026-01-12 18:21:32'),(76,'vũ thiệp','thiepUser3@abc.com','$2a$10$piprCDJ9MUYPXG/ea1K6Lud5YdwToXadOcj6AIOAathVZQmqSsQQq','USER','ACTIVE','0326515812','OTHER',NULL,'2026-01-12 18:27:04','2026-01-12 18:27:04'),(77,'Alice Brown aa','thiepUser4@abc.com','$2a$10$uY/6m0E4oOvftjZzhqjZA.64rQePgv7Ajiyqbfbu/Vqa0.M7f08/S','USER','ACTIVE','1122334455','OTHER',NULL,'2026-01-12 18:32:50','2026-01-12 18:32:50'),(78,'Vũ Đức Thiệp','thiepUser5@abc.com','$2a$10$iW4ToNmqjA2BX/pkghCy4eDg.v4HdVW0jESHZxjcPee0ulr/R4TXW','USER','ACTIVE','0326515832','OTHER',NULL,'2026-01-12 18:37:40','2026-01-12 18:37:40'),(79,'Vũ Đức Thiệp ','thiepUser6@abc.com','$2a$10$Uk8etlYyY37aVPTyg77wbO.l1duz8g7RqyEnyy4guYeLCEK./PWNi','USER','ACTIVE','0326515832','Nam','32, Phường Long Biên, Quận Long Biên, Thành phố Hà Nội','2026-01-12 20:02:38','2026-01-18 13:15:34'),(80,'Vũ Đức Thiệp','thiep011104@gmail.com','$2a$10$zWua1kl60kvyEwsFDqXXceXAlDG6ra4/rB0T/S7QrPwzAMGAwgnAC','USER','ACTIVE','032539532','OTHER','','2026-01-18 14:45:29','2026-01-18 14:45:29'),(81,'Thiệp Vũ Đức','vuducthiep011104@gmail.com','','USER','ACTIVE','0326515832','Nam','Xã Vĩnh Sơn, Huyện Vĩnh Tường, Tỉnh Vĩnh Phúc','2026-01-19 16:43:50','2026-01-24 12:59:01');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-06 17:55:34
