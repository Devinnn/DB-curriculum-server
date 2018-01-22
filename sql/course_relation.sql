/*
Navicat MySQL Data Transfer

Source Server         : mySQL
Source Server Version : 50552
Source Host           : localhost:3306
Source Database       : database_curriculum

Target Server Type    : MYSQL
Target Server Version : 50552
File Encoding         : 65001

Date: 2018-01-17 01:57:11
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for course_relation
-- ----------------------------
DROP TABLE IF EXISTS `course_relation`;
CREATE TABLE `course_relation` (
  `relate_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int(10) unsigned NOT NULL,
  `course_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`relate_id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `course_relation_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`),
  CONSTRAINT `course_relation_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of course_relation
-- ----------------------------
INSERT INTO `course_relation` VALUES ('3', '3', '6');
INSERT INTO `course_relation` VALUES ('11', '5', '3');
INSERT INTO `course_relation` VALUES ('24', '1', '2');
INSERT INTO `course_relation` VALUES ('25', '1', '3');
INSERT INTO `course_relation` VALUES ('26', '1', '4');
INSERT INTO `course_relation` VALUES ('33', '1', '6');
