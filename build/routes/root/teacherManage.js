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
 * @type GET 获取所有教师列表
 **/

/**
 * @type GET 获取所有教师列表
 **/
router.get('/getTeacherList', CHECK.checkLogin, function (req, res, next) {
    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var sql = '\n        SELECT\n            @ROW :=@ROW + 1 AS id,\n            account,\n            name,\n            password\n        FROM\n            (SELECT @ROW := 0) AS C,\n            teacher\n    ';

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
 * @type POST 新增用户
 * @param
 * String name
 * String password
 **/
router.post('/addUser', CHECK.checkLogin, function (req, res, next) {
    var name = req.body.name;
    var password = req.body.password;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var getLastestId = 'SELECT id FROM teacher ORDER BY id DESC LIMIT 1';

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
                        insertVal = 'INSERT teacher VALUES("' + account + '", "' + (account >= 10 ? 't' + account : 's0' + account) + '", "' + name + '", "' + password + '")';
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
                            msg: '\u4F60\u7684\u7F16\u53F7\u662F' + (account >= 10 ? 't' + account : 't0' + account)
                        }));
                        return _context2.abrupt('return', { result: 'success', msg: '添加用户成功。' });

                    case 13:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            msg: '添加用户失败'
                        }));
                        return _context2.abrupt('return', { result: 'failed', msg: '添加用户失败。' });

                    case 15:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }))().then(function (_ref3) {
        var msg = _ref3.msg;

        console.log(msg);
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
 * 1. 查询这个用户有没有发布课程
 * 2. 如果没有，直接删除
 * 3. 如果有，检测有没有学生选课。
 * 4. 如果有学生选，需要删除两个表。
 * 5. 如果没有学生选，只需删除课程表中的课程，再删除教师。
 **/

router.post('/deleteUser', CHECK.checkLogin, function (req, res, next) {
    var account = req.body.account;
    var id = Number(account.substr(1));
    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var searchCourse = 'SELECT course_id FROM course WHERE course_teacher = "' + id + '"';
    var delCourse = 'DELETE FROM course WHERE course_teacher = "' + id + '"';
    var delUser = 'DELETE FROM teacher WHERE id = "' + id + '"';

    (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var queryCourse, queryDelUser, querySql, final;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return query(searchCourse);

                    case 2:
                        queryCourse = _context3.sent;

                        if (!(queryCourse.length === 0)) {
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
                            msg: '删除用户成功'
                        }));
                        return _context3.abrupt('return', { result: 'success', msg: '删除用户成功' });

                    case 12:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            msg: '删除用户失败'
                        }));
                        return _context3.abrupt('return', { result: 'failed', msg: '删除用户失败。' });

                    case 14:
                        _context3.next = 28;
                        break;

                    case 16:
                        //有多少人选择了多少课程，记录全部删除
                        querySql = queryCourse.map(function (index) {
                            return 'DELETE FROM course_relation WHERE course_id = "' + index['course_id'] + '"';
                        });

                        querySql.push(delCourse, delUser);
                        //开始事务
                        _context3.next = 20;
                        return transcate(querySql);

                    case 20:
                        final = _context3.sent;

                        if (!final) {
                            _context3.next = 26;
                            break;
                        }

                        res.status(200).send((0, _stringify2.default)({
                            result: 'success',
                            message: '删除成功。'
                        }));
                        return _context3.abrupt('return', { result: 'success', msg: '删除成功。' });

                    case 26:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            message: '删除失败。'
                        }));
                        return _context3.abrupt('return', { result: 'failed', msg: '删除失败。' });

                    case 28:
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
        next(new Error('服务器错误。'));
    });
});

/**
 * @type POST 修改密码
 * @param
 * String account
 * String now
 **/

router.post('/modifyPw', CHECK.checkLogin, function (req, res, next) {
    var account = req.body.account;
    var now = req.body.now;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var updatePw = 'UPDATE teacher SET password = "' + now + '" WHERE account = "' + account + '"';

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
                            msg: '修改密码成功。'
                        }));
                        return _context4.abrupt('return', { result: 'success', msg: '修改密码成功。' });

                    case 8:
                        res.status(200).send((0, _stringify2.default)({
                            result: 'failed',
                            msg: '修改密码失败。'
                        }));
                        return _context4.abrupt('return', { result: 'failed', msg: '修改密码失败。' });

                    case 10:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined);
    }))().then(function (_ref7) {
        var msg = _ref7.msg;

        console.log(msg);
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器错误。'));
    });
});

/**
 * @type POST 查看用户发布的课程
 * @param
 * String account
 **/

router.get('/getCourseList', CHECK.checkLogin, function (req, res, next) {
    var account = req.query.account;
    var id = Number(account.substr(1));

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var sql = '\n        SELECT\n            @ROW :=@ROW + 1 AS id,\n            course_id,\n            course_name,\n            course_selected,\n            course_total,\n            course_adress,\n            course_date,\n            course_intro\n        FROM\n            course,\n            (SELECT @ROW := 0) AS A\n        WHERE\n            course_teacher = "' + id + '"\n        ORDER BY course_id ASC\n    ';
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

module.exports = router;