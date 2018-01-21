'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var bodyParser = require('body-parser');
var query = require('../lib/mysql').query;
var router = express.Router();
var CHECK = require('../middlewares/checkIfLogin');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/**
 * @type POST 登录
 * @param
 * String account
 * String password
 **/
router.post('/', CHECK.checkNotLogin, function (req, res, next) {
    var account = req.body.account;
    var password = req.body.password;
    var category = account.substring(0, 1);
    var table = category === 's' ? 'student' : category === 't' ? 'teacher' : 'root';

    /* 非空处理 */
    if (!account || !password || !category) {
        res.status(200).send((0, _stringify2.default)({
            result: 'failed',
            message: '登录项内容不能为空！'
        }));
        return;
    }
    var sql = 'SELECT account,password,name FROM ' + table + ' WHERE account="' + account + '" AND password="' + password + '"';
    (function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(sql) {
            var results;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return query(sql);

                        case 2:
                            results = _context.sent;
                            return _context.abrupt('return', results);

                        case 4:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, undefined);
        }));

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    })()(sql).then(function (results) {
        if (results.length == 0) {
            res.status(200).send((0, _stringify2.default)({
                result: 'failed',
                message: '密码不正确或账号不存在！'
            }));
        } else {
            req.session.userid = results[0].account;
            req.session.name = results[0].name;
            res.status(200).send((0, _stringify2.default)({
                result: 'success',
                message: '登录成功。',
                userid: results[0].account,
                name: results[0].name
            }));
        }
        return;
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器出错。'));
    });
});

/**
 * @type GET 退出登录
 **/
router.get('/', CHECK.checkLogin, function (req, res) {
    req.session.userid = null;
    res.status(200).send((0, _stringify2.default)({
        result: '登出成功！'
    }));
    return;
});

module.exports = router;