/*
Navicat MySQL Data Transfer

Source Server         : mySQL
Source Server Version : 50552
Source Host           : localhost:3306
Source Database       : database_curriculum

Target Server Type    : MYSQL
Target Server Version : 50552
File Encoding         : 65001

Date: 2018-01-17 01:56:46
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for course
-- ----------------------------
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course` (
  `course_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `course_name` varchar(20) NOT NULL,
  `course_teacher` int(10) unsigned NOT NULL,
  `course_total` tinyint(4) unsigned NOT NULL,
  `course_selected` tinyint(4) unsigned NOT NULL,
  `course_date` varchar(30) NOT NULL,
  `course_adress` varchar(20) NOT NULL,
  `course_category` enum('e','a','h') NOT NULL DEFAULT 'e',
  `course_intro` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  KEY `course_teacher` (`course_teacher`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`course_teacher`) REFERENCES `teacher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of course
-- ----------------------------
INSERT INTO `course` VALUES ('2', 'Java编程入门', '2', '20', '1', '7-12周 10,11,12节 周二', '教三-105', 'e', 'Java编程入门教学');
INSERT INTO `course` VALUES ('3', '大学生安全教育', '3', '40', '2', '13-18周 10,11,12节 周四', '教二-315', 'h', '大学生防骗指南。');
INSERT INTO `course` VALUES ('4', '国学智慧', '4', '60', '1', '1-6周 10,11,12节 周二', '教三-107', 'h', '分析国学大师的著作，分享智慧的奥秘。');
INSERT INTO `course` VALUES ('5', '演讲与口才', '5', '60', '0', '7-12周 10,11,12节 周四', '教三-109', 'h', '讲述如何提升自我的口头表达能力。');
INSERT INTO `course` VALUES ('6', '人工智能', '6', '30', '2', '13-18周 10,11,12节 周二', '教二-222', 'e', '什么是人工智能，人工智能的应用，以及人工只智能的派系。');
INSERT INTO `course` VALUES ('7', '欧美音乐鉴赏', '7', '25', '0', '1-6周 10,11,12节 周一', '教一-317', 'a', '鉴赏不同时期的欧美音乐。');
INSERT INTO `course` VALUES ('8', '电影品鉴', '8', '20', '0', '7-12周 10,11,12节 周四', '教二-225', 'a', '评鉴电影，从不同的角度，或者是新奇的角度去看待一部作品。');
INSERT INTO `course` VALUES ('9', '恋爱心理学', '9', '30', '0', '13-18周 10,11,12节 周二', '教二-410', 'h', '谈恋爱的时候那些心理的波动，教你怎么解决恋爱中的难题。');
INSERT INTO `course` VALUES ('10', '神奇的润滑', '10', '45', '0', '1-6周 10,11,12节 周五', '教三-201', 'h', '工业上使用润滑的案例,神奇的润滑不只是讲润滑油,还有润滑脂,固体润滑剂等。');
INSERT INTO `course` VALUES ('11', '音频剪辑技术', '11', '20', '0', '7-12周 10,11,12节 周四', '实三-418', 'e', '讲述adobe相关套件的使用。');
INSERT INTO `course` VALUES ('12', '多媒体技术实训', '12', '30', '0', '13-18周 10,11,12节 周五', '实三-517', 'e', '各种多媒体技术的入门使用。');
INSERT INTO `course` VALUES ('13', 'photoshop技术', '13', '20', '0', '1-6周 10,11,12节 周日', '实三-428', 'e', '如何使用photoshop进行制图等。');
INSERT INTO `course` VALUES ('14', '数码钢琴', '14', '30', '0', '7-12周 7,8,9节 周日', '综-701', 'a', '钢琴技法入门。');
INSERT INTO `course` VALUES ('15', '数码钢琴', '15', '20', '0', '13-18周 7,8,9节 周六', '综-701', 'a', '钢琴技法入门。');
INSERT INTO `course` VALUES ('16', '钢笔字入门', '16', '25', '0', '1-6周 10,11,12节 周五', '教二-314', 'h', '教你如何学习钢笔字，如何快速的进步。');
INSERT INTO `course` VALUES ('17', '流行音乐演唱技法', '17', '30', '0', '7-12周 10,11,12节 周一', '教一-217', 'a', '通过对流行应约演唱技法的讲解，结合理论，辅以实际练习，教你如何唱好歌。');
INSERT INTO `course` VALUES ('18', '移动安卓应用开发', '18', '40', '0', '13-18周 10,11,12节 周五', '教四-201', 'e', '移动安卓app开发入门。');
INSERT INTO `course` VALUES ('19', '新技术专题', '19', '30', '0', '1-6周 10,11,12节 周三', '教二-222', 'e', '近年来互联网出现的一些新技术。');
INSERT INTO `course` VALUES ('20', '移动安卓应用开发', '20', '20', '0', '7-12周 10,11,12节 周二', '教一-315', 'e', '通过对流行应约演唱技法的讲解，结合理论，辅以实际练习，教你如何唱好歌。');
