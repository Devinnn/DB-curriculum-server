'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    stringifySQL: function stringifySQL(sql) {
        return sql.replace(/\n/g, ' ').replace(/\s{1,}/g, ' ');
    },
    checkIfSelf: function checkIfSelf(account, req, res) {
        if (account !== req.session.userid) {
            res.status(200).send((0, _stringify2.default)({
                result: 'failed',
                message: '不能对其他用户进行操作！'
            }));
            return false;
        } else {
            return true;
        }
    },
    checkIdentity: function checkIdentity(identity, req, res) {
        if (identity !== req.session.userid.slice(0, 1)) {
            res.status(200).send((0, _stringify2.default)({
                result: 'failed',
                message: '该用户没有权限操作'
            }));
            return false;
        } else {
            return true;
        }
    }
};