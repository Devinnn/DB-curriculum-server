'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var bodyParser = require('body-parser');
var query = require('../../lib/mysql').query;
var transcate = require('../../lib/mysql').transcate;
var router = express.Router();
var CHECK = require('../../middlewares/checkIfLogin');
var beautifySQL = require('../../lib/helper').stringifySQL;
var checkIfSelf = require('../../lib/helper').checkIfSelf; //限制只能操作自己的账户
var checkIdentity = require('../../lib/helper').checkIdentity; //检查权限

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/**
 * @type GET 查看自己已选课程
 * @param
 * String account
 **/

router.get('/', CHECK.checkLogin, function (req, res, next) {
    var account = req.query.account;
    var id = Number(account.substr(1));

    //检查是否为本人
    if (!checkIfSelf(account, req, res)) {
        return;
    }

    //检查是否为学生
    if (!checkIdentity('s', req, res)) {
        return;
    }

    var sql = '\n        SELECT\n            @ROW :=@ROW + 1 AS id,\n            B.course_id,\n            B.course_name,\n            B.course_category,\n            C. NAME AS course_teacher,\n            B.course_adress,\n            B.course_date,\n            B.course_intro\n        FROM\n            (SELECT @ROW := 0) AS C,\n            (\n                SELECT\n                    *\n                FROM\n                    course_relation\n                WHERE\n                    student_id = "' + id + '"\n                ORDER BY course_id ASC\n            ) AS A\n        INNER JOIN course AS B ON B.course_id = A.course_id\n        INNER JOIN teacher AS C ON B.course_teacher = C.id\n    ';
    (function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(sql) {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return query(sql);

                        case 2:
                            return _context.abrupt('return', _context.sent);

                        case 3:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    })()(beautifySQL(sql)).then(function (results) {
        res.status(200).send((0, _stringify2.default)({
            result: 'success',
            list: results
        }));
        return;
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器出错'));
    });
});

/**
 * 实现流程：
 * 1. 检测是否超过最大选课数量
 * 2. 判断是否已选
 * 3. 检测上课时间是否冲突
 * 4. 检查数据库是否有余量
 * 5. IO操作
 * 6. 更新数据库余量信息
 **/

/**
 * @type POST 添加课程
 * @param
 * String account
 * String course_id
 **/

router.post('/add', CHECK.checkLogin, function (req, res, next) {
    var account = req.body.account;
    var id = Number(account.substr(1));
    var course_id = req.body.course_id;

    //检查是否为本人
    if (!checkIfSelf(account, req, res)) {
        return;
    }

    //检查是否为学生
    if (!checkIdentity('s', req, res)) {
        return;
    }

    var total = 'SELECT COUNT(*) FROM course_relation WHERE student_id = "' + id + '"';
    var selected = 'SELECT * FROM course_relation WHERE student_id = "' + id + '" AND course_id = "' + course_id + '"';
    var checkDateConflick = '\n        SELECT\n            COUNT(*)\n        FROM\n            (\n                SELECT\n                    A.course_id,\n                    B.course_date\n                FROM\n                    (\n                        SELECT\n                            course_id\n                        FROM\n                            course_relation\n                        WHERE\n                            student_id = \'' + id + '\'\n                    ) AS A\n                INNER JOIN course AS B ON A.course_id = B.course_id\n            ) AS C\n        WHERE\n            C.course_date = (select course_date from course where course_id = "' + course_id + '")\n    ';

    var SurplusOrNot = 'SELECT course_total, course_selected FROM course WHERE course_id = "' + course_id + '"';
    var insert = 'INSERT course_relation VALUES(null,"' + id + '","' + course_id + '")';
    var updateNum = 'UPDATE course SET course_selected = course_selected + 1 WHERE course_id = "' + course_id + '"';
    (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var maxSelect, ifSelected, checkDate, Surplus, final;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return query(total);

                    case 2:
                        maxSelect = _context2.sent;

                        if (!(maxSelect[0]['COUNT(*)'] >= 5)) {
                            _context2.next = 6;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '每位学生最多可选五门！'
                        }));
                        return _context2.abrupt('return', { result: 'failed', msg: '每个学生最多可选五门!' });

                    case 6:
                        _context2.next = 8;
                        return query(selected);

                    case 8:
                        ifSelected = _context2.sent;

                        if (!(ifSelected.length !== 0)) {
                            _context2.next = 12;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '课程已选，不能重复选择。'
                        }));
                        return _context2.abrupt('return', { result: 'failed', msg: '课程已选，不能重复选择。' });

                    case 12:
                        _context2.next = 14;
                        return query(beautifySQL(checkDateConflick));

                    case 14:
                        checkDate = _context2.sent;

                        if (!(Number(checkDate[0]['COUNT(*)']) !== 0)) {
                            _context2.next = 18;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '选课时间存在冲突！'
                        }));
                        return _context2.abrupt('return', { result: 'failed', msg: '选课时间存在冲突！' });

                    case 18:
                        _context2.next = 20;
                        return query(SurplusOrNot);

                    case 20:
                        Surplus = _context2.sent;

                        if (!(Number(Surplus[0]['course_total']) === Number(Surplus[0]['course_selected']))) {
                            _context2.next = 24;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '该课程已经没有余量。'
                        }));
                        return _context2.abrupt('return', { result: 'failed', msg: '该课程已经没有余量。' });

                    case 24:
                        _context2.next = 26;
                        return transcate([insert, updateNum]);

                    case 26:
                        final = _context2.sent;

                        if (!final) {
                            _context2.next = 32;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'success',
                            message: '添加成功。'
                        }));
                        return _context2.abrupt('return', { result: 'success', msg: '添加成功。' });

                    case 32:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '添加失败。'
                        }));
                        return _context2.abrupt('return', { result: 'failed', msg: '添加失败。' });

                    case 34:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }))().then(function (_ref3) {
        var result = _ref3.result,
            msg = _ref3.msg;

        if (result === 'failed') {
            console.log(msg);
        } else {
            console.log(msg);
        }
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器错误。'));
    });
});

/**
 * 实现流程：
 * 1. 判断是否已选
 * 2. 检查数据库是否有余量
 * 3. IO操作
 * 4. 更新数据库余量信息
 **/

/**
 * @type POST 删除所选课程
 * @param
 * String account
 * String course_id
 **/
router.post('/delete', CHECK.checkLogin, function (req, res, next) {
    var account = req.body.account;
    var id = Number(account.substr(1));
    var course_id = req.body.course_id;

    //检查是否为本人
    if (!checkIfSelf(account, req, res)) {
        return;
    }

    //检查是否为学生
    if (!checkIdentity('s', req, res)) {
        return;
    }

    var ifSelected = 'SELECT * FROM course_relation WHERE student_id = "' + id + '" AND course_id = "' + course_id + '"';
    var del = 'DELETE FROM course_relation WHERE student_id = \'' + id + '\' AND course_id = \'' + course_id + '\'';
    var updateNum = 'UPDATE course SET course_selected = course_selected - 1 WHERE course_id = "' + course_id + '"';

    (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var selectResult, final;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return query(ifSelected);

                    case 2:
                        selectResult = _context3.sent;

                        if (!(selectResult.length === 0)) {
                            _context3.next = 6;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '课程不存在，不能删除！'
                        }));
                        return _context3.abrupt('return', { result: 'failed', message: '课程不存在，不能删除！' });

                    case 6:
                        _context3.next = 8;
                        return transcate([del, updateNum]);

                    case 8:
                        final = _context3.sent;

                        if (!final) {
                            _context3.next = 14;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'success',
                            message: '退选成功。'
                        }));
                        return _context3.abrupt('return', { result: 'success', msg: '退选成功。' });

                    case 14:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '退选失败！'
                        }));
                        return _context3.abrupt('return', { result: 'failed', msg: '退选失败。' });

                    case 16:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    }))().then(function (_ref5) {
        var msg = _ref5.msg;

        console.log(msg);
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器出错。'));
    });
});

module.exports = router;