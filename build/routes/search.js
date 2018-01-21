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
var query = require('../lib/mysql').query;
var router = express.Router();
var CHECK = require('../middlewares/checkIfLogin');
var beautifySQL = require('../lib/helper').stringifySQL;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/**
 * @type post 搜索
 * @param
 * String param
 * String category
 **/
router.post('/', CHECK.checkLogin, function (req, res, next) {
    var param = req.body.param;
    var category = req.body.category ? 'AND course_category = "' + req.body.category + '"' : '';

    var sql = '\n        SELECT\n            A.id,\n            course_id,\n            course_name,\n            B. NAME AS course_teacher,\n            course_total,\n            course_selected,\n            course_date,\n            course_adress,\n            course_category,\n            course_intro\n        FROM\n            (\n                SELECT\n                    @ROW :=@ROW + 1 AS id,\n                    course_id,\n                    course_name,\n                    course_teacher,\n                    course_total,\n                    course_selected,\n                    course_date,\n                    course_adress,\n                    course_category,\n                    course_intro\n                FROM\n                    course,\n                    (SELECT @ROW := 0) AS ROW\n                WHERE\n                    (\n                        course_name LIKE "%' + param + '%"\n                        OR course_date LIKE "%' + param + '%"\n                        OR course_teacher LIKE "%' + param + '%"\n                        OR course_intro LIKE "%' + param + '%"\n                        OR course_adress LIKE "%' + param + '%"\n                    ) ' + category + '\n                ORDER BY course_id ASC\n            ) AS A\n        INNER JOIN teacher AS B ON A.course_teacher = B.id\n    ';

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
    })()(beautifySQL(sql)).then(function (results) {
        if (results.length == 0) {
            res.status(200).send((0, _stringify2.default)({
                result: 'success',
                list: []
            }));
        } else {
            res.status(200).send((0, _stringify2.default)({
                result: 'success',
                list: results
            }));
        }
        return;
    }).catch(function (err) {
        console.error(err);
        next(new Error('服务器出错。'));
    });
});

module.exports = router;