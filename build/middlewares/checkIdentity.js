'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    checkIfStudent: function checkIfStudent(req, res, next) {
        var category = req.body.userid;
        category = category.substring(0, 1);
        if (category === 's') {
            next();
        } else {
            res.status(200).send((0, _stringify2.default)({
                result: '暂无权限'
            }));
            return;
        }
    },
    checkIfTeacher: function checkIfTeacher(req, res, next) {
        var category = req.body.userid;
        category = category.substring(0, 1);
        if (category === 't') {
            next();
        } else {
            res.status(200).send((0, _stringify2.default)({
                result: '暂无权限'
            }));
            return;
        }
    },
    checkIfRoot: function checkIfRoot(req, res, next) {
        var category = req.body.userid;
        category = category.substring(0, 1);
        if (category === 'r') {
            next();
        } else {
            res.status(200).send((0, _stringify2.default)({
                result: '暂无权限'
            }));
            return;
        }
    }
};