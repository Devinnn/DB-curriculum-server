/*
Navicat MySQL Data Transfer

Source Server         : mySQL
Source Server Version : 50552
Source Host           : localhost:3306
Source Database       : database_curriculum

Target Server Type    : MYSQL
Target Server Version : 50552
File Encoding         : 65001

Date: 2018-01-17 01:56:55
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for teacher
-- ----------------------------
DROP TABLE IF EXISTS `teacher`;
CREATE TABLE `teacher` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `account` varchar(8) NOT NULL,
  `name` varchar(8) NOT NULL,
  `password` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of teacher
-- ----------------------------
INSERT INTO `teacher` VALUES ('1', 't01', '林占生', '111111');
INSERT INTO `teacher` VALUES ('2', 't02', '王洪刚', '123456');
INSERT INTO `teacher` VALUES ('3', 't03', '张莹', '123456');
INSERT INTO `teacher` VALUES ('4', 't04', '曹积服', '123456');
INSERT INTO `teacher` VALUES ('5', 't05', '毛泽西', '123456');
INSERT INTO `teacher` VALUES ('6', 't06', '祖国', '123456');
INSERT INTO `teacher` VALUES ('7', 't07', '苏小云', '123456');
INSERT INTO `teacher` VALUES ('8', 't08', '欧阳锋', '123456');
INSERT INTO `teacher` VALUES ('9', 't09', '操小马', '123456');
INSERT INTO `teacher` VALUES ('10', 't10', '钟共', '123456');
INSERT INTO `teacher` VALUES ('11', 't11', '王雪研', '123456');
INSERT INTO `teacher` VALUES ('12', 't12', '张立彬', '123456');
INSERT INTO `teacher` VALUES ('13', 't13', '金春花', '123456');
INSERT INTO `teacher` VALUES ('14', 't14', '杨雪', '123456');
INSERT INTO `teacher` VALUES ('15', 't15', '易本道', '123456');
INSERT INTO `teacher` VALUES ('16', 't16', '史大坨', '123456');
INSERT INTO `teacher` VALUES ('17', 't17', '安若素', '123456');
INSERT INTO `teacher` VALUES ('18', 't18', '庞光大', '123456');
INSERT INTO `teacher` VALUES ('19', 't19', '韦尧', '123456');
INSERT INTO `teacher` VALUES ('20', 't20', '姬旦', '123456');
