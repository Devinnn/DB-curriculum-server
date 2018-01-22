/*
Navicat MySQL Data Transfer

Source Server         : mySQL
Source Server Version : 50552
Source Host           : localhost:3306
Source Database       : database_curriculum

Target Server Type    : MYSQL
Target Server Version : 50552
File Encoding         : 65001

Date: 2018-01-17 01:57:16
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for student
-- ----------------------------
DROP TABLE IF EXISTS `student`;
CREATE TABLE `student` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `account` varchar(8) NOT NULL,
  `name` varchar(8) NOT NULL,
  `password` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of student
-- ----------------------------
INSERT INTO `student` VALUES ('1', 's01', '张小东', '123456');
INSERT INTO `student` VALUES ('2', 's02', '范建', '123456');
INSERT INTO `student` VALUES ('3', 's03', '牛合珠', '123456');
INSERT INTO `student` VALUES ('4', 's04', '关云常', '123456');
INSERT INTO `student` VALUES ('5', 's05', '闪电球', '123456');
INSERT INTO `student` VALUES ('6', 's06', '武六七', '123456');
INSERT INTO `student` VALUES ('7', 's07', '邢星', '123456');
INSERT INTO `student` VALUES ('8', 's08', '夏建仁', '123456');
INSERT INTO `student` VALUES ('9', 's09', '贺赫赫', '123456');
INSERT INTO `student` VALUES ('10', 's10', '李黎黎', '123456');
INSERT INTO `student` VALUES ('11', 's11', '佟童童', '123456');
INSERT INTO `student` VALUES ('12', 's12', '戴笠帽', '123456');
INSERT INTO `student` VALUES ('13', 's13', '卜爱国', '123456');
INSERT INTO `student` VALUES ('14', 's14', '黄浪漫', '123456');
INSERT INTO `student` VALUES ('15', 's15', '郝风光', '123456');
INSERT INTO `student` VALUES ('16', 's16', '杨黎子', '123456');
INSERT INTO `student` VALUES ('17', 's17', '吴立尧', '123456');
INSERT INTO `student` VALUES ('18', 's18', '路直达', '123456');
INSERT INTO `student` VALUES ('19', 's19', '原子量', '123456');
INSERT INTO `student` VALUES ('20', 's20', '史团团', '123456');
INSERT INTO `student` VALUES ('21', 's21', '蔡帝', '123456');
INSERT INTO `student` VALUES ('22', 's22', '麦银', '123456');
INSERT INTO `student` VALUES ('23', 's23', '郝帅', '123456');
INSERT INTO `student` VALUES ('24', 's24', '郝健', '123456');
INSERT INTO `student` VALUES ('25', 's25', '郝会生', '123456');
INSERT INTO `student` VALUES ('26', 's26', '瓦哈哈', '123456');
