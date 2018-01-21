'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var bodyParser = require('body-parser');
var query = require('../lib/mysql').query;
var router = express.Router();
var CHECK = require('../middlewares/checkIfLogin');
var beautifySQL = require('../lib/helper').stringifySQL;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/**
 * @type GET 获取选课列表
 * @param
 * String page
 * String limit
 **/
router.get('/', CHECK.checkLogin, function (req, res, next) {
    var page = req.query.page;
    var limit = req.query.limit;
    var sum = 'SELECT CEIL(COUNT(*) / ' + limit + ') FROM course';
    var sql = '\n        SELECT\n            *\n        FROM\n            (\n                SELECT\n                    @ROW :=@ROW + 1 AS id,\n                    course_id,\n                    course_name,\n                    A. NAME AS course_teacher,\n                    course_total,\n                    course_selected,\n                    course_date,\n                    course_adress,\n                    course_category,\n                    course_intro\n                FROM\n                    (SELECT @ROW := 0) AS ROW,\n                    course\n                INNER JOIN teacher AS A ON course_teacher = A.id\n                ORDER BY\n                    course_id ASC\n            ) AS C\n        LIMIT ' + (page - 1) * limit + ', ' + limit + '\n    ';
    (function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(sql) {
            var _ref2, _ref3, s, q;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return _promise2.default.all([query(sql[0]), query(sql[1])]);

                        case 2:
                            _ref2 = _context.sent;
                            _ref3 = (0, _slicedToArray3.default)(_ref2, 2);
                            s = _ref3[0];
                            q = _ref3[1];
                            return _context.abrupt('return', [s, q]);

                        case 7:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, undefined);
        }));

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    })()([sum, beautifySQL(sql)]).then(function (_ref4) {
        var _ref5 = (0, _slicedToArray3.default)(_ref4, 2),
            s = _ref5[0],
            q = _ref5[1];

        var total = (0, _values2.default)(s[0])[0];
        if (q.length === 0) {
            res.status(200).send((0, _stringify2.default)({
                result: 'success',
                list: [],
                totalPage: total,
                currentPage: page
            }));
        } else {
            res.status(200).send((0, _stringify2.default)({
                result: 'success',
                list: q,
                totalPage: total
            }));
        }
        return;
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器错误。'));
    });
});

module.exports = router;