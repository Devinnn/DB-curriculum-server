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
router.post('/', CHECK.checkLogin, (req, res, next) => {
    var account = req.body.account;
    var pre = req.body.pre;
    var now = req.body.now;

    var category = account.substring(0, 1);
    var table =
        category === 's' ? 'student' : category === 't' ? 'teacher' : 'root';

    if (pre == '') {
        res.status(200).send(
            JSON.stringify({
                result: 'failed',
                message: '请输入旧密码。'
            })
        );
        return;
    }

    if (now == '') {
        res.status(200).send(
            JSON.stringify({
                result: 'failed',
                message: '请输入新密码。'
            })
        );
        return;
    }

    if (pre === now) {
        res.status(200).send(
            JSON.stringify({
                result: 'failed',
                message: '旧密码不能和新密码相同！'
            })
        );
        return;
    }

    var sql = `UPDATE ${table} SET password="${now}" WHERE account="${account}" AND password="${pre}"`;
    (async sql => {
        var results = await query(sql);
        return results;
    })(sql)
        .then(results => {
            if (results.affectedRows !== 1) {
                res.status(200).send(
                    JSON.stringify({
                        result: 'failed',
                        message: '原密码输入错误！'
                    })
                );
            } else {
                res.status(200).send(
                    JSON.stringify({
                        result: 'success',
                        message: '修改成功！'
                    })
                );
            }
            return;
        })
        .catch(err => {
            console.error(err);
            next(new Error('服务器出错。'));
        });
});

module.exports = router;
