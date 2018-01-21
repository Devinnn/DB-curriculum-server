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
 * @type GET 获取所有学生列表
 **/
router.get('/getStudentList', CHECK.checkLogin, function (req, res, next) {
    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var sql = '\n        SELECT\n            @ROW :=@ROW + 1 AS id,\n            account,\n            name,\n            password\n        FROM\n            (SELECT @ROW := 0) AS C,\n            student\n    ';

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
                                    list: results
                                }));
                            } else {
                                res.status(200).send((0, _stringify2.default)({
                                    result: 'success',
                                    list: []
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
 * @type POST 新增用户，系统自动生成账号
 * @param
 * String name
 * String password
 **/

/**
 * 实现流程
 * 1. 定位到最后一个id
 * 2. 把id加1，插入数据库
 * 3. 返回账号
 **/

router.post('/addUser', CHECK.checkLogin, function (req, res, next) {
    var name = req.body.name;
    var password = req.body.password;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var getLastestId = 'SELECT id FROM student ORDER BY id DESC LIMIT 1';

    (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var queryId, account, insertVal, queryInsert;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return query(getLastestId);

                    case 2:
                        queryId = _context2.sent;
                        account = queryId[0]['id'] + 1;
                        insertVal = 'INSERT student VALUES("' + account + '", "' + (account >= 10 ? 's' + account : 's0' + account) + '", "' + name + '", "' + password + '")';
                        _context2.next = 7;
                        return query(insertVal);

                    case 7:
                        queryInsert = _context2.sent;

                        if (!(queryInsert.affectRow !== 0)) {
                            _context2.next = 13;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'success',
                            message: '\u4F60\u7684\u7F16\u53F7\u662F' + (account >= 10 ? 's' + account : 's0' + account)
                        }));
                        return _context2.abrupt('return', { result: 'success', message: '添加用户成功。' });

                    case 13:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '添加用户失败'
                        }));
                        return _context2.abrupt('return', { result: 'failed', message: '添加用户失败。' });

                    case 15:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }))().then(function (_ref3) {
        var message = _ref3.message;

        console.log(message);
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器错误。'));
    });
});

/**
 * @type POST 删除用户
 * @param
 * String account
 **/

/**
 * 实现流程：
 * 1. 查询这个用户有没有选择课程
 * 2. 如果没有，直接删除
 * 3. 如果有，先删除选课关系表中的记录，再更新课程表余量，最后删除用户。
 **/

router.post('/deleteUser', CHECK.checkLogin, function (req, res, next) {
    var account = req.body.account;
    var id = Number(account.substr(1));

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var searchRelate = 'SELECT course_id FROM course_relation WHERE student_id = "' + id + '"';
    var delUser = 'DELETE FROM student WHERE account = "' + account + '"';
    var delRelate = 'DELETE FROM course_relation WHERE student_id = "' + id + '"';

    (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var queryRelate, queryDelUser, querySql, final;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return query(searchRelate);

                    case 2:
                        queryRelate = _context3.sent;

                        if (!(queryRelate.length === 0)) {
                            _context3.next = 16;
                            break;
                        }

                        _context3.next = 6;
                        return query(delUser);

                    case 6:
                        queryDelUser = _context3.sent;

                        if (!(queryDelUser.affectRow !== 0)) {
                            _context3.next = 12;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'success',
                            message: '删除用户成功'
                        }));
                        return _context3.abrupt('return', { result: 'success', message: '删除用户成功' });

                    case 12:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '删除用户失败'
                        }));
                        return _context3.abrupt('return', { result: 'failed', message: '删除用户失败。' });

                    case 14:
                        _context3.next = 29;
                        break;

                    case 16:
                        //选择多少课程，就删除多少课程
                        querySql = queryRelate.map(function (index) {
                            return 'UPDATE course SET course_selected = course_selected - 1 WHERE course_id = "' + index['course_id'] + '"';
                        });

                        querySql.unshift(delRelate);
                        querySql.push(delUser);
                        //开始事务
                        _context3.next = 21;
                        return transcate(querySql);

                    case 21:
                        final = _context3.sent;

                        if (!final) {
                            _context3.next = 27;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'success',
                            message: '删除成功。'
                        }));
                        return _context3.abrupt('return', { result: 'success', message: '删除成功。' });

                    case 27:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '删除失败。'
                        }));
                        return _context3.abrupt('return', { result: 'failed', message: '删除失败。' });

                    case 29:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    }))().then(function (_ref5) {
        var message = _ref5.message;

        console.log(message);
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器错误。'));
    });
});

/**
 * @type POST 修改密码
 * @param
 * String account
 * String new
 **/

router.post('/modifyPw', CHECK.checkLogin, function (req, res, next) {
    var account = req.body.account;
    var now = req.body.now;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var updatePw = 'UPDATE student SET password = "' + now + '" WHERE account = "' + account + '"';

    (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var queryUpdatePw;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return query(updatePw);

                    case 2:
                        queryUpdatePw = _context4.sent;

                        if (!(queryUpdatePw.affectRow !== 0)) {
                            _context4.next = 8;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'success',
                            message: '修改密码成功。'
                        }));
                        return _context4.abrupt('return', { result: 'success', message: '修改密码成功。' });

                    case 8:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '修改密码失败。'
                        }));
                        return _context4.abrupt('return', { result: 'failed', message: '修改密码失败。' });

                    case 10:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined);
    }))().then(function (_ref7) {
        var message = _ref7.message;

        console.log(message);
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器错误。'));
    });
});

/**
 * @type GET 查看用户对应课程
 * @param
 * String account
 **/

router.get('/getCourse', CHECK.checkLogin, function (req, res, next) {
    var account = req.query.account;
    var id = Number(account.substr(1));

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var sql = '\n        SELECT\n            @ROW :=@ROW + 1 AS id,\n            B.course_id,\n            B.course_name,\n            C. NAME AS course_teacher,\n            B.course_adress,\n            B.course_date,\n            B.course_intro\n        FROM\n            (SELECT @ROW := 0) AS C,\n            (\n                SELECT\n                    *\n                FROM\n                    course_relation\n                WHERE\n                    student_id = "' + id + '"\n                ORDER BY course_id ASC\n            ) AS A\n        INNER JOIN course AS B ON B.course_id = A.course_id\n        INNER JOIN teacher AS C ON B.course_teacher = C.id\n    ';
    (function () {
        var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(sql) {
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.next = 2;
                            return query(sql);

                        case 2:
                            return _context5.abrupt('return', _context5.sent);

                        case 3:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        return function (_x2) {
            return _ref8.apply(this, arguments);
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
 * @type POST 新增课程
 * @param
 * String account
 * String course_id
 **/

router.post('/addCourse', CHECK.checkLogin, function (req, res, next) {
    var account = req.body.account;
    var id = Number(account.substr(1));
    var course_id = req.body.course_id;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var total = 'SELECT COUNT(*) FROM course_relation WHERE student_id = "' + id + '"';
    var selected = 'SELECT * FROM course_relation WHERE student_id = "' + id + '" AND course_id = "' + course_id + '"';
    var checkDateConflick = '\n        SELECT\n            COUNT(*)\n        FROM\n            (\n                SELECT\n                    A.course_id,\n                    B.course_date\n                FROM\n                    (\n                        SELECT\n                            course_id\n                        FROM\n                            course_relation\n                        WHERE\n                            student_id = \'' + id + '\'\n                    ) AS A\n                INNER JOIN course AS B ON A.course_id = B.course_id\n            ) AS C\n        WHERE\n            C.course_date = (select course_date from course where course_id = "' + course_id + '")\n    ';

    var SurplusOrNot = 'SELECT course_total, course_selected FROM course WHERE course_id = "' + course_id + '"';
    var insert = 'INSERT course_relation VALUES(null,"' + id + '","' + course_id + '")';
    var updateNum = 'UPDATE course SET course_selected = course_selected + 1 WHERE course_id = "' + course_id + '"';
    (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        var maxSelect, ifSelected, checkDate, Surplus, final;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.next = 2;
                        return query(total);

                    case 2:
                        maxSelect = _context6.sent;

                        if (!(maxSelect[0]['COUNT(*)'] > 5)) {
                            _context6.next = 6;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '每位学生最多可选五门！'
                        }));
                        return _context6.abrupt('return', { result: 'failed', message: '每个学生最多可选五门!' });

                    case 6:
                        _context6.next = 8;
                        return query(selected);

                    case 8:
                        ifSelected = _context6.sent;

                        if (!(ifSelected.length !== 0)) {
                            _context6.next = 12;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '课程已选，不能重复选择。'
                        }));
                        return _context6.abrupt('return', { result: 'failed', message: '课程已选，不能重复选择。' });

                    case 12:
                        _context6.next = 14;
                        return query(beautifySQL(checkDateConflick));

                    case 14:
                        checkDate = _context6.sent;

                        if (!(Number(checkDate[0]['COUNT(*)']) !== 0)) {
                            _context6.next = 18;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '选课时间存在冲突！'
                        }));
                        return _context6.abrupt('return', { result: 'failed', message: '选课时间存在冲突！' });

                    case 18:
                        _context6.next = 20;
                        return query(SurplusOrNot);

                    case 20:
                        Surplus = _context6.sent;

                        if (!(Number(Surplus[0]['course_total']) === Number(Surplus[0]['course_selected']))) {
                            _context6.next = 24;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '该课程已经没有余量。'
                        }));
                        return _context6.abrupt('return', { result: 'failed', message: '该课程已经没有余量。' });

                    case 24:
                        _context6.next = 26;
                        return transcate([insert, updateNum]);

                    case 26:
                        final = _context6.sent;

                        if (!final) {
                            _context6.next = 32;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'success',
                            message: '添加成功。'
                        }));
                        return _context6.abrupt('return', { result: 'success', message: '添加成功。' });

                    case 32:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '添加失败。'
                        }));
                        return _context6.abrupt('return', { result: 'failed', message: '添加失败。' });

                    case 34:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, undefined);
    }))().then(function (_ref10) {
        var result = _ref10.result,
            message = _ref10.message;

        if (result === 'failed') {
            console.log(message);
        } else {
            console.log(message);
        }
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器错误。'));
    });
});

/**
 * @type POST 删除所选课程
 * @param
 * String account
 * String course_id
 **/
router.post('/deleteCourse', CHECK.checkLogin, function (req, res, next) {
    var account = req.body.account;
    var id = Number(account.substr(1));
    var course_id = req.body.course_id;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var ifSelected = 'SELECT * FROM course_relation WHERE student_id = "' + id + '" AND course_id = "' + course_id + '"';
    var del = 'DELETE FROM course_relation WHERE student_id = \'' + id + '\' AND course_id = \'' + course_id + '\'';
    var updateNum = 'UPDATE course SET course_selected = course_selected - 1 WHERE course_id = "' + course_id + '"';

    (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
        var selectResult, final;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.next = 2;
                        return query(ifSelected);

                    case 2:
                        selectResult = _context7.sent;

                        if (!(selectResult.length === 0)) {
                            _context7.next = 6;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '课程不存在，不能删除！'
                        }));
                        return _context7.abrupt('return', { result: 'failed', message: '课程不存在，不能删除！' });

                    case 6:
                        _context7.next = 8;
                        return transcate([del, updateNum]);

                    case 8:
                        final = _context7.sent;

                        if (!final) {
                            _context7.next = 14;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'success',
                            message: '退选成功。'
                        }));
                        return _context7.abrupt('return', { result: 'success', message: '退选成功。' });

                    case 14:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '添加失败。'
                        }));
                        return _context7.abrupt('return', { result: 'failed', message: '退选失败。' });

                    case 16:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, undefined);
    }))().then(function (_ref12) {
        var message = _ref12.message;

        console.log(message);
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器出错。'));
    });
});

module.exports = router;