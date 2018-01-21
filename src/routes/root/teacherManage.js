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
router.get('/getTeacherList', CHECK.checkLogin, (req, res, next) => {
    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var sql = `
        SELECT
            @ROW :=@ROW + 1 AS id,
            account,
            name,
            password
        FROM
            (SELECT @ROW := 0) AS C,
            teacher
    `;

    (async sql => {
        var results = await query(sql);
        if (results.length !== 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    list: results
                })
            );
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    list: []
                })
            );
        }

        return;
    })(beautifySQL(sql))
        .then(() => {
            console.log('操作成功。');
        })
        .catch(err => {
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
router.post('/addUser', CHECK.checkLogin, (req, res, next) => {
    var name = req.body.name;
    var password = req.body.password;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var getLastestId = 'SELECT id FROM teacher ORDER BY id DESC LIMIT 1';

    (async () => {
        var queryId = await query(getLastestId);
        var account = queryId[0]['id'] + 1;

        var insertVal = `INSERT teacher VALUES("${account}", "${
            account >= 10 ? `t${account}` : `s0${account}`
        }", "${name}", "${password}")`;
        var queryInsert = await query(insertVal);

        if (queryInsert.affectRow !== 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    msg: `你的编号是${
                        account >= 10 ? `t${account}` : `t0${account}`
                    }`
                })
            );
            return { result: 'success', msg: '添加用户成功。' };
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    msg: '添加用户失败'
                })
            );
            return { result: 'failed', msg: '添加用户失败。' };
        }
    })()
        .then(({ msg }) => {
            console.log(msg);
        })
        .catch(err => {
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

router.post('/deleteUser', CHECK.checkLogin, (req, res, next) => {
    var account = req.body.account;
    var id = Number(account.substr(1));
    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var searchCourse = `SELECT course_id FROM course WHERE course_teacher = "${id}"`;
    var delCourse = `DELETE FROM course WHERE course_teacher = "${id}"`;
    var delUser = `DELETE FROM teacher WHERE id = "${id}"`;

    (async () => {
        //查询课程中教师发布的课程
        var queryCourse = await query(searchCourse);

        //如果没有课程，直接一步删除。
        if (queryCourse.length === 0) {
            var queryDelUser = await query(delUser);
            if (queryDelUser.affectRow !== 0) {
                res.status(200).send(
                    JSON.stringify({
                        result: 'success',
                        msg: '删除用户成功'
                    })
                );
                return { result: 'success', msg: '删除用户成功' };
            } else {
                res.status(200).send(
                    JSON.stringify({
                        result: 'failed',
                        msg: '删除用户失败'
                    })
                );
                return { result: 'failed', msg: '删除用户失败。' };
            }
        } else {
            //有多少人选择了多少课程，记录全部删除
            var querySql = queryCourse.map(index => {
                return `DELETE FROM course_relation WHERE course_id = "${
                    index['course_id']
                }"`;
            });
            querySql.push(delCourse, delUser);
            //开始事务
            var final = await transcate(querySql);
            if (final) {
                res.status(200).send(
                    JSON.stringify({
                        result: 'success',
                        message: '删除成功。'
                    })
                );
                return { result: 'success', msg: '删除成功。' };
            } else {
                res.status(200).send(
                    JSON.stringify({
                        result: 'failed',
                        message: '删除失败。'
                    })
                );
                return { result: 'failed', msg: '删除失败。' };
            }
        }
    })()
        .then(({ msg }) => {
            console.log(msg);
        })
        .catch(err => {
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

router.post('/modifyPw', CHECK.checkLogin, (req, res, next) => {
    var account = req.body.account;
    var now = req.body.now;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var updatePw = `UPDATE teacher SET password = "${now}" WHERE account = "${account}"`;

    (async () => {
        var queryUpdatePw = await query(updatePw);

        if (queryUpdatePw.affectRow !== 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    msg: '修改密码成功。'
                })
            );
            return { result: 'success', msg: '修改密码成功。' };
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    msg: '修改密码失败。'
                })
            );
            return { result: 'failed', msg: '修改密码失败。' };
        }
    })()
        .then(({ msg }) => {
            console.log(msg);
        })
        .catch(err => {
            console.error(err);
            next(new Error('服务器错误。'));
        });
});

/**
 * @type POST 查看用户发布的课程
 * @param
 * String account
 **/

router.get('/getCourseList', CHECK.checkLogin, (req, res, next) => {
    var account = req.query.account;
    var id = Number(account.substr(1));

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var sql = `
        SELECT
            @ROW :=@ROW + 1 AS id,
            course_id,
            course_name,
            course_selected,
            course_total,
            course_adress,
            course_date,
            course_intro
        FROM
            course,
            (SELECT @ROW := 0) AS A
        WHERE
            course_teacher = "${id}"
        ORDER BY course_id ASC
    `;
    (async function(sql) {
        return await query(sql);
    })(beautifySQL(sql))
        .then(results => {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    list: results
                })
            );
            return;
        })
        .catch(err => {
            console.error(err);
            next(new Error('服务器出错'));
        });
});

module.exports = router;
