-- phpMyAdmin SQL Dump
-- version 4.5.2
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: 2020-05-07 06:35:08
-- 服务器版本： 5.7.9
-- PHP Version: 7.0.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ptpvideo`
--

-- --------------------------------------------------------

--
-- 表的结构 `usertable`
--

DROP TABLE IF EXISTS `usertable`;
CREATE TABLE IF NOT EXISTS `usertable` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `user_name` varchar(20) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `user_type` varchar(20) NOT NULL DEFAULT 'user' COMMENT '用户类型',
  `login_count` char(1) NOT NULL DEFAULT '0' COMMENT '同时登录数，不得超过3',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name` (`user_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `usertable`
--

INSERT INTO `usertable` (`user_id`, `user_name`, `password`, `user_type`, `login_count`) VALUES
(1, 'root', '$2y$10$hmTK5KTKRoY9bT1NxAbUrOXtg0MntY3lGS5QaVDJYoKEk56Cc2sLS', 'admin', '2'),
(2, 'guest', '$2y$10$3b0ffHC9vkBYScmmK8O.jeWpl.NUBQX47xFSUfFvxWCx4A/Nwr3W.', 'user', '0');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
