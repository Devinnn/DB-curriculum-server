var express = require('express');
var bodyParser = require('body-parser');
var query = require('../lib/mysql').query;
var router = express.Router();
var CHECK = require('../middlewares/checkIfLogin');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/**
 * @type POST 登录
 * @param
 * String account
 * String password
 **/
router.post('/', CHECK.checkNotLogin, (req, res, next) => {
    var account = req.body.account;
    var password = req.body.password;
    var category = account.substring(0, 1);
    var table =
        category === 's' ? 'student' : category === 't' ? 'teacher' : 'root';

    /* 非空处理 */
    if (!account || !password || !category) {
        res.status(200).send(
            JSON.stringify({
                result: 'failed',
                message: '登录项内容不能为空！'
            })
        );
        return;
    }
    var sql = `SELECT account,password,name FROM ${table} WHERE account="${account}" AND password="${password}"`;
    (async sql => {
        var results = await query(sql);
        return results;
    })(sql)
        .then(results => {
            if (results.length == 0) {
                res.status(200).send(
                    JSON.stringify({
                        result: 'failed',
                        message: '密码不正确或账号不存在！'
                    })
                );
            } else {
                req.session.userid = results[0].account;
                req.session.name = results[0].name;
                res.status(200).send(
                    JSON.stringify({
                        result: 'success',
                        message: '登录成功。',
                        userid: results[0].account,
                        name: results[0].name
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

/**
 * @type GET 退出登录
 **/
router.get('/', CHECK.checkLogin, (req, res) => {
    req.session.userid = null;
    res.status(200).send(
        JSON.stringify({
            result: '登出成功！'
        })
    );
    return;
});

module.exports = router;
