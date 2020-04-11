-- MySQL dump 10.13  Distrib 5.7.27, for Linux (x86_64)
--
-- Host: 172.17.0.2    Database: reactdb
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.10-MariaDB-1:10.4.10+maria~bionic

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `total_time` int(11) DEFAULT NULL,
  `player_won` int(11) DEFAULT NULL,
  `difficulty_level` int(11) DEFAULT NULL,
  `winning_score` int(11) DEFAULT NULL,
  `player_uid` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
INSERT INTO `games` VALUES (1,120,1,3,99,'billiam','2019-11-15 18:07:47','2019-11-15 18:07:47'),(2,120,1,3,99,'billiam','2019-11-16 07:18:05','2019-11-16 07:18:05'),(3,120,1,2,2,'1sGkH0ebN1TF9Wk9cB3m3BoB2s72','2019-11-16 07:28:06','2019-11-16 07:28:06'),(4,24,1,2,2,'1sGkH0ebN1TF9Wk9cB3m3BoB2s72','2019-11-16 07:28:06','2019-11-16 07:28:06'),(5,32,0,5,3,'1sGkH0ebN1TF9Wk9cB3m3BoB2s72','2019-11-16 07:28:06','2019-11-16 07:28:06'),(6,36,1,4,3,'1sGkH0ebN1TF9Wk9cB3m3BoB2s72','2019-11-16 07:28:06','2019-11-16 07:28:06'),(7,45,0,5,3,'1sGkH0ebN1TF9Wk9cB3m3BoB2s72','2019-11-16 07:28:06','2019-11-16 07:28:06'),(8,35,0,3,3,'1sGkH0ebN1TF9Wk9cB3m3BoB2s72','2019-11-16 07:28:06','2019-11-16 07:28:06'),(9,24,0,5,3,'1sGkH0ebN1TF9Wk9cB3m3BoB2s72','2019-11-16 07:28:06','2019-11-16 07:28:06'),(10,21,0,5,2,'1sGkH0ebN1TF9Wk9cB3m3BoB2s72','2019-11-16 07:28:06','2019-11-16 07:28:06'),(11,142,0,5,7,'1sGkH0ebN1TF9Wk9cB3m3BoB2s72','2019-11-16 07:28:06','2019-11-16 07:28:06');
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `uid` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`info`)),
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('1sGkH0ebN1TF9Wk9cB3m3BoB2s72','bill.bruntrager@gmail.com','{\"displayName\":\"William Bruntrager\",\"email\":\"bill.bruntrager@gmail.com\",\"emailVerified\":true,\"photoURL\":\"https://lh3.googleusercontent.com/a-/AAuE7mAGxqt8zyOM7CL5lSPwGhg-ufSsz_0OXBftrHWv6n8\",\"isAnonymous\":false,\"uid\":\"1sGkH0ebN1TF9Wk9cB3m3BoB2s72\",\"providerData\":[{\"uid\":\"100414281603699425237\",\"displayName\":\"William Bruntrager\",\"photoURL\":\"https://lh3.googleusercontent.com/a-/AAuE7mAGxqt8zyOM7CL5lSPwGhg-ufSsz_0OXBftrHWv6n8\",\"email\":\"bill.bruntrager@gmail.com\",\"phoneNumber\":null,\"providerId\":\"google.com\"}],\"nickname\":\"Frederick\"}','2019-11-16 07:28:06','2019-11-16 07:28:06'),('janedoe','billiam','{\"cool\":true}','2019-11-15 18:27:18','2019-11-15 18:27:18');
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

-- Dump completed on 2019-11-16  3:00:15
