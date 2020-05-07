CREATE DATABASE Love_fund CHARACTER SET utf8 COLLATE utf8_general_ci;use Love_fund; 
-- MySQL dump 10.13  Distrib 5.7.9, for Win64 (x86_64)
--
-- Host: localhost    Database: Love_fund
-- ------------------------------------------------------
-- Server version	5.7.9

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
-- Table structure for table `annual_total`
--

DROP TABLE IF EXISTS `annual_total`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `annual_total` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL COMMENT '分工会号',
  `years` year(4) NOT NULL COMMENT '年份',
  `total` int(11) DEFAULT '0' COMMENT '年度总额',
  `total_number` smallint(6) DEFAULT '0' COMMENT '缴费总人数',
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `annual_total_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `annual_total`
--

LOCK TABLES `annual_total` WRITE;
/*!40000 ALTER TABLE `annual_total` DISABLE KEYS */;
/*!40000 ALTER TABLE `annual_total` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compensation_info`
--

DROP TABLE IF EXISTS `compensation_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `compensation_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL COMMENT '用户ID',
  `compensation_info` text COMMENT '补助信息',
  `compenyear` year(4) NOT NULL DEFAULT '1970' COMMENT '补助年份',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `compensation_info_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `worker_information` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compensation_info`
--

LOCK TABLES `compensation_info` WRITE;
/*!40000 ALTER TABLE `compensation_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `compensation_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `department` (
  `department_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '分工会号',
  `department_name` varchar(20) NOT NULL COMMENT '分工会名称',
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `department_name` (`department_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (2,'后勤');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_info`
--

DROP TABLE IF EXISTS `payment_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_info` (
  `department_id` int(11) NOT NULL COMMENT '分工会号',
  `id` int(11) NOT NULL,
  `payyear` year(4) NOT NULL DEFAULT '1970' COMMENT '缴费年份',
  `fee` smallint(3) NOT NULL DEFAULT '0' COMMENT '缴费金额',
  `after_payment` char(2) DEFAULT '否' COMMENT '是否补缴',
  `note` varchar(100) DEFAULT '无' COMMENT '备注',
  PRIMARY KEY (`id`,`department_id`,`payyear`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `payment_info_ibfk_1` FOREIGN KEY (`id`) REFERENCES `worker_information` (`id`),
  CONSTRAINT `payment_info_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_info`
--

LOCK TABLES `payment_info` WRITE;
/*!40000 ALTER TABLE `payment_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worker_information`
--

DROP TABLE IF EXISTS `worker_information`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `worker_information` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `IDNumber` char(18) NOT NULL COMMENT '身份证号',
  `name` varchar(100) NOT NULL COMMENT '职工姓名',
  `sex` char(2) NOT NULL COMMENT '职工性别',
  `department_id` int(11) NOT NULL COMMENT '分工会号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDNumber` (`IDNumber`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `worker_information_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker_information`
--

LOCK TABLES `worker_information` WRITE;
/*!40000 ALTER TABLE `worker_information` DISABLE KEYS */;
/*!40000 ALTER TABLE `worker_information` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-05-07 14:23:37
