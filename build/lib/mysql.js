'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require('../config');
var mysql = require('mysql');

var pool = mysql.createPool(config.mysql);

/**
 * 把mySQL查询功能封装成一个promise
 * @param String sql
 * @returns Promise
 */

//简单查询
var query = function query(sql) {
    var connect = new _promise2.default(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, function (err, results) {
                    connection.release();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            }
        });
    });
    return connect;
};

var transcate = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(handle) {
        var connection, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, sql;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return getConnectionPromise().catch(function (err) {
                            console.error(err);
                        });

                    case 2:
                        connection = _context.sent;
                        _context.prev = 3;
                        _context.next = 6;
                        return TransPromise(connection.beginTransaction.bind(connection));

                    case 6:
                        //继发执行操作
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context.prev = 9;
                        _iterator = (0, _getIterator3.default)(handle);

                    case 11:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context.next = 18;
                            break;
                        }

                        sql = _step.value;
                        _context.next = 15;
                        return queryPromise(connection, sql);

                    case 15:
                        _iteratorNormalCompletion = true;
                        _context.next = 11;
                        break;

                    case 18:
                        _context.next = 24;
                        break;

                    case 20:
                        _context.prev = 20;
                        _context.t0 = _context['catch'](9);
                        _didIteratorError = true;
                        _iteratorError = _context.t0;

                    case 24:
                        _context.prev = 24;
                        _context.prev = 25;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 27:
                        _context.prev = 27;

                        if (!_didIteratorError) {
                            _context.next = 30;
                            break;
                        }

                        throw _iteratorError;

                    case 30:
                        return _context.finish(27);

                    case 31:
                        return _context.finish(24);

                    case 32:
                        _context.next = 34;
                        return TransPromise(connection.commit.bind(connection));

                    case 34:
                        return _context.abrupt('return', true);

                    case 37:
                        _context.prev = 37;
                        _context.t1 = _context['catch'](3);

                        //如果操作，全部回滚
                        console.error(_context.t1);
                        connection.rollback(function () {
                            console.log('操作失败');
                        });
                        return _context.abrupt('return', false);

                    case 42:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[3, 37], [9, 20, 24, 32], [25,, 27, 31]]);
    }));

    return function transcate(_x) {
        return _ref.apply(this, arguments);
    };
}();

function getConnectionPromise() {
    return new _promise2.default(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        });
    });
}

function TransPromise(handle) {
    return new _promise2.default(function (resolve, reject) {
        handle(function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function queryPromise(connection, sql) {
    return new _promise2.default(function (resovle, reject) {
        connection.query(sql, function (err, results) {
            if (err) {
                reject(err);
            } else {
                resovle(results);
            }
        });
    });
}

module.exports = { query: query, transcate: transcate };