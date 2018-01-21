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
 * @type POST 修改用户密码
 * @param
 * String account
 * String pre
 * String now
 **/
router.post('/', CHECK.checkLogin, function (req, res, next) {
    var account = req.body.account;
    var pre = req.body.pre;
    var now = req.body.now;

    var category = account.substring(0, 1);
    var table = category === 's' ? 'student' : category === 't' ? 'teacher' : 'root';

    if (pre == '') {
        res.status(200).send((0, _stringify2.default)({
            result: 'failed',
            message: '请输入旧密码。'
        }));
        return;
    }

    if (now == '') {
        res.status(200).send((0, _stringify2.default)({
            result: 'failed',
            message: '请输入新密码。'
        }));
        return;
    }

    if (pre === now) {
        res.status(200).send((0, _stringify2.default)({
            result: 'failed',
            message: '旧密码不能和新密码相同！'
        }));
        return;
    }

    var sql = 'UPDATE ' + table + ' SET password="' + now + '" WHERE account="' + account + '" AND password="' + pre + '"';
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
        if (results.affectedRows !== 1) {
            res.status(200).send((0, _stringify2.default)({
                result: 'failed',
                message: '原密码输入错误！'
            }));
        } else {
            res.status(200).send((0, _stringify2.default)({
                result: 'success',
                message: '修改成功！'
            }));
        }
        return;
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器出错。'));
    });
});

module.exports = router;