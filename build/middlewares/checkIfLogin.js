'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    //检查当前是否已经登录
    checkLogin: function checkLogin(req, res, next) {
        if (!req.session.userid) {
            res.status(200).send((0, _stringify2.default)({
                result: 'unsigned',
                message: '当前未登录，请登录！'
            }));
            return;
        }
        //如果已经登录，通过
        next();
    },

    //检查当前是否没有登录
    checkNotLogin: function checkNotLogin(req, res, next) {
        if (req.session.userid) {
            res.status(200).send((0, _stringify2.default)({
                result: 'success',
                userid: req.session.userid,
                name: req.session.name,
                message: '已经登录！'
            }));
            return;
        }
        //如果没有登录，通过
        next();
    }
};