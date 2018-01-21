'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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
var checkIdentity = require('../../lib/helper').checkIdentity; //检查权限

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/**
 * @type GET 查看某课程下学生的选课情况
 * @param
 * String course_id
 **/

router.get('/', CHECK.checkLogin, function (req, res, next) {
    var course_id = req.query.course_id;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var sql = '\n        SELECT\n            @ROW :=@ROW + 1 AS id,\n            A.student_id,\n            B.name\n        FROM\n            (SELECT @ROW := 0) AS C,\n            (\n                SELECT\n                    student_id\n                FROM\n                    course_relation\n                WHERE\n                    course_id = "' + course_id + '"\n                ORDER BY\n                    student_id ASC\n            ) AS A\n        INNER JOIN student AS B ON B.id = A.student_id\n    ';

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

                            if (results.length !== 0) {
                                res.status(200).send((0, _stringify2.default)({
                                    result: 'success',
                                    list: results,
                                    course_id: course_id
                                }));
                            } else {
                                res.status(200).send((0, _stringify2.default)({
                                    result: 'success',
                                    list: [],
                                    course_id: course_id
                                }));
                            }

                            return _context.abrupt('return');

                        case 5:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, undefined);
        }));

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    })()(beautifySQL(sql)).then(function () {
        console.log('操作成功。');
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器错误。'));
    });
});

/**
 * @type POST 发布课程
 * @param
 * String account
 * String course
 * Number sum
 * Stirng date
 * String adress
 * String cate
 * String intro
 **/

router.post('/addCourse', CHECK.checkLogin, function (req, res, next) {
    var account = req.body.account;
    var id = Number(account.substr(1));
    var course = req.body.course;
    var sum = Number(req.body.sum);
    var date = req.body.date;
    var adress = req.body.adress;
    var cate = req.body.cate;
    var intro = req.body.intro;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var total = 'SELECT COUNT(*) FROM course WHERE course_teacher = "' + id + '"';
    var checkDateConflick = '\n        SELECT\n            COUNT(*)\n        FROM\n            (\n                SELECT\n                    A.course_name,\n                    A.course_date\n                FROM\n                    (\n                        SELECT\n                            course_name,\n                            course_date\n                        FROM\n                            course\n                        WHERE\n                            course_teacher = \'' + id + '\'\n                    ) AS A\n            ) AS C\n        WHERE\n            C.course_date = "' + date + '"\n    ';
    var checkAdressAvailable = 'SELECT COUNT(*) FROM course WHERE course_date = \'' + date + '\' AND course_adress = \'' + adress + '\'';
    var insert = '\n        INSERT course VALUES(NULL, "' + course + '", "' + id + '", ' + sum + ', 0, "' + date + '", "' + adress + '", "' + cate + '", "' + intro + '")\n    ';

    (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var maxPub, checkDate, checkAdress, addResult;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return query(total);

                    case 2:
                        maxPub = _context2.sent;

                        if (!(maxPub[0]['COUNT(*)'] >= 5)) {
                            _context2.next = 6;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '每位老师最多可发布五门课程！'
                        }));
                        return _context2.abrupt('return', { result: 'failed', msg: '每位老师最多可发布五门课程！' });

                    case 6:
                        _context2.next = 8;
                        return query(beautifySQL(checkDateConflick));

                    case 8:
                        checkDate = _context2.sent;

                        if (!(Number(checkDate[0]['COUNT(*)']) !== 0)) {
                            _context2.next = 12;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '发布课程时间和已有课程时间冲突！'
                        }));
                        return _context2.abrupt('return', {
                            result: 'failed',
                            msg: '发布课程时间和已有课程时间冲突！'
                        });

                    case 12:
                        _context2.next = 14;
                        return query(beautifySQL(checkAdressAvailable));

                    case 14:
                        checkAdress = _context2.sent;

                        if (!(Number(checkAdress[0]['COUNT(*)']) !== 0)) {
                            _context2.next = 18;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '相同时间内课室已被占用！'
                        }));
                        return _context2.abrupt('return', { result: 'failed', msg: '相同时间内课室已被占用！' });

                    case 18:
                        _context2.next = 20;
                        return query(insert);

                    case 20:
                        addResult = _context2.sent;

                        if (!(addResult.affectRow === 0)) {
                            _context2.next = 26;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '发布失败。'
                        }));
                        return _context2.abrupt('return', { result: 'failed', msg: '发布失败。' });

                    case 26:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'success',
                            message: '发布成功。'
                        }));
                        return _context2.abrupt('return', { result: 'success', msg: '发布成功。' });

                    case 28:
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
        next(new Error('服务器错误'));
    });
});

/**
 * @type POST 删除课程
 * @param
 * String account
 * String course_id
 **/

router.post('/deleteCourse', CHECK.checkLogin, function (req, res, next) {
    var course_id = req.body.course_id;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var queryCourse = 'SELECT COUNT(*) FROM course WHERE course_id = "' + course_id + '"';
    var queryRelate = 'SELECT COUNT(*) FROM course_relation WHERE course_id = "' + course_id + '"';
    var delCourse = 'DELETE FROM course WHERE course_id = "' + course_id + '"';
    var delRelate = 'DELETE FROM course_relation WHERE course_id = "' + course_id + '"';

    (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var ifExist, ifSelect, delC, final;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return query(queryCourse);

                    case 2:
                        ifExist = _context3.sent;

                        if (!(ifExist[0]['COUNT(*)'] == 0)) {
                            _context3.next = 6;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '不存在这门课程。'
                        }));
                        return _context3.abrupt('return', { result: 'failed', msg: '不存在这门课程。' });

                    case 6:
                        _context3.next = 8;
                        return query(queryRelate);

                    case 8:
                        ifSelect = _context3.sent;

                        if (!(ifSelect[0]['COUNT(*)'] == 0)) {
                            _context3.next = 20;
                            break;
                        }

                        _context3.next = 12;
                        return query(delCourse);

                    case 12:
                        delC = _context3.sent;

                        if (!(delC.affectRow === 0)) {
                            _context3.next = 18;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '删除课程失败。'
                        }));
                        return _context3.abrupt('return', { result: 'failed', msg: '删除课程失败。' });

                    case 18:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'success',
                            message: '删除课程成功。'
                        }));
                        return _context3.abrupt('return', { result: 'success', msg: '删除课程成功。' });

                    case 20:
                        _context3.next = 22;
                        return transcate([delRelate, delCourse]);

                    case 22:
                        final = _context3.sent;

                        if (!final) {
                            _context3.next = 28;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'success',
                            message: '删除课程成功。'
                        }));
                        return _context3.abrupt('return', { result: 'success', msg: '删除课程成功。' });

                    case 28:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '删除课程失败。'
                        }));
                        return _context3.abrupt('return', { result: 'failed', msg: '删除课程失败。' });

                    case 30:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    }))().then(function (_ref5) {
        var result = _ref5.result,
            msg = _ref5.msg;

        if (result === 'failed') {
            console.log(msg);
        } else {
            console.log(msg);
        }
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器出错'));
    });
});

module.exports = router;