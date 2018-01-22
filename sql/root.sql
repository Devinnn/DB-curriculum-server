/*
Navicat MySQL Data Transfer

Source Server         : mySQL
Source Server Version : 50552
Source Host           : localhost:3306
Source Database       : database_curriculum

Target Server Type    : MYSQL
Target Server Version : 50552
File Encoding         : 65001

Date: 2018-01-17 01:57:22
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for root
-- ----------------------------
DROP TABLE IF EXISTS `root`;
CREATE TABLE `root` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `account` varchar(8) NOT NULL,
  `name` varchar(8) NOT NULL,
  `password` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of root
-- ----------------------------
INSERT INTO `root` VALUES ('1', 'root', '管理员', 'root');
