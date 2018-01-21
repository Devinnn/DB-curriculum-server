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
router.get('/getStudentList', CHECK.checkLogin, (req, res, next) => {
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
            student
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

router.post('/addUser', CHECK.checkLogin, (req, res, next) => {
    var name = req.body.name;
    var password = req.body.password;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var getLastestId = 'SELECT id FROM student ORDER BY id DESC LIMIT 1';

    (async () => {
        var queryId = await query(getLastestId);
        var account = queryId[0]['id'] + 1;

        var insertVal = `INSERT student VALUES("${account}", "${
            account >= 10 ? `s${account}` : `s0${account}`
        }", "${name}", "${password}")`;
        var queryInsert = await query(insertVal);

        if (queryInsert.affectRow !== 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    message: `你的编号是${
                        account >= 10 ? `s${account}` : `s0${account}`
                    }`
                })
            );
            return { result: 'success', message: '添加用户成功。' };
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '添加用户失败'
                })
            );
            return { result: 'failed', message: '添加用户失败。' };
        }
    })()
        .then(({ message }) => {
            console.log(message);
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
 * 1. 查询这个用户有没有选择课程
 * 2. 如果没有，直接删除
 * 3. 如果有，先删除选课关系表中的记录，再更新课程表余量，最后删除用户。
 **/

router.post('/deleteUser', CHECK.checkLogin, (req, res, next) => {
    var account = req.body.account;
    var id = Number(account.substr(1));

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var searchRelate = `SELECT course_id FROM course_relation WHERE student_id = "${id}"`;
    var delUser = `DELETE FROM student WHERE account = "${account}"`;
    var delRelate = `DELETE FROM course_relation WHERE student_id = "${id}"`;

    (async () => {
        //查询选课关系表中有没有这个用户的记录
        var queryRelate = await query(searchRelate);

        //如果没有选择课程，直接一步删除。
        if (queryRelate.length === 0) {
            var queryDelUser = await query(delUser);
            if (queryDelUser.affectRow !== 0) {
                res.status(200).send(
                    JSON.stringify({
                        result: 'success',
                        message: '删除用户成功'
                    })
                );
                return { result: 'success', message: '删除用户成功' };
            } else {
                res.status(200).send(
                    JSON.stringify({
                        result: 'failed',
                        message: '删除用户失败'
                    })
                );
                return { result: 'failed', message: '删除用户失败。' };
            }
        } else {
            //选择多少课程，就删除多少课程
            var querySql = queryRelate.map(index => {
                return `UPDATE course SET course_selected = course_selected - 1 WHERE course_id = "${
                    index['course_id']
                }"`;
            });
            querySql.unshift(delRelate);
            querySql.push(delUser);
            //开始事务
            var final = await transcate(querySql);
            if (final) {
                res.status(200).send(
                    JSON.stringify({
                        result: 'success',
                        message: '删除成功。'
                    })
                );
                return { result: 'success', message: '删除成功。' };
            } else {
                res.status(200).send(
                    JSON.stringify({
                        result: 'failed',
                        message: '删除失败。'
                    })
                );
                return { result: 'failed', message: '删除失败。' };
            }
        }
    })()
        .then(({ message }) => {
            console.log(message);
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
 * String new
 **/

router.post('/modifyPw', CHECK.checkLogin, (req, res, next) => {
    var account = req.body.account;
    var now = req.body.now;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var updatePw = `UPDATE student SET password = "${now}" WHERE account = "${account}"`;

    (async () => {
        var queryUpdatePw = await query(updatePw);

        if (queryUpdatePw.affectRow !== 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    message: '修改密码成功。'
                })
            );
            return { result: 'success', message: '修改密码成功。' };
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '修改密码失败。'
                })
            );
            return { result: 'failed', message: '修改密码失败。' };
        }
    })()
        .then(({ message }) => {
            console.log(message);
        })
        .catch(err => {
            console.error(err);
            next(new Error('服务器错误。'));
        });
});

/**
 * @type GET 查看用户对应课程
 * @param
 * String account
 **/

router.get('/getCourse', CHECK.checkLogin, (req, res, next) => {
    var account = req.query.account;
    var id = Number(account.substr(1));

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var sql = `
        SELECT
            @ROW :=@ROW + 1 AS id,
            B.course_id,
            B.course_name,
            C. NAME AS course_teacher,
            B.course_adress,
            B.course_date,
            B.course_intro
        FROM
            (SELECT @ROW := 0) AS C,
            (
                SELECT
                    *
                FROM
                    course_relation
                WHERE
                    student_id = "${id}"
                ORDER BY course_id ASC
            ) AS A
        INNER JOIN course AS B ON B.course_id = A.course_id
        INNER JOIN teacher AS C ON B.course_teacher = C.id
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

/**
 * @type POST 新增课程
 * @param
 * String account
 * String course_id
 **/

router.post('/addCourse', CHECK.checkLogin, (req, res, next) => {
    var account = req.body.account;
    var id = Number(account.substr(1));
    var course_id = req.body.course_id;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var total = `SELECT COUNT(*) FROM course_relation WHERE student_id = "${id}"`;
    var selected = `SELECT * FROM course_relation WHERE student_id = "${id}" AND course_id = "${course_id}"`;
    var checkDateConflick = `
        SELECT
            COUNT(*)
        FROM
            (
                SELECT
                    A.course_id,
                    B.course_date
                FROM
                    (
                        SELECT
                            course_id
                        FROM
                            course_relation
                        WHERE
                            student_id = '${id}'
                    ) AS A
                INNER JOIN course AS B ON A.course_id = B.course_id
            ) AS C
        WHERE
            C.course_date = (select course_date from course where course_id = "${course_id}")
    `;

    var SurplusOrNot = `SELECT course_total, course_selected FROM course WHERE course_id = "${course_id}"`;
    var insert = `INSERT course_relation VALUES(null,"${id}","${course_id}")`;
    var updateNum = `UPDATE course SET course_selected = course_selected + 1 WHERE course_id = "${course_id}"`;
    (async () => {
        //每个学生最大限选为五门
        var maxSelect = await query(total);
        if (maxSelect[0]['COUNT(*)'] > 5) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '每位学生最多可选五门！'
                })
            );
            return { result: 'failed', message: '每个学生最多可选五门!' };
        }

        //判断课程是否已选
        var ifSelected = await query(selected);
        if (ifSelected.length !== 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '课程已选，不能重复选择。'
                })
            );
            return { result: 'failed', message: '课程已选，不能重复选择。' };
        }

        //检测上课时间是否冲突
        var checkDate = await query(beautifySQL(checkDateConflick));
        if (Number(checkDate[0]['COUNT(*)']) !== 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '选课时间存在冲突！'
                })
            );
            return { result: 'failed', message: '选课时间存在冲突！' };
        }

        //检查数据库是否有余量
        var Surplus = await query(SurplusOrNot);
        if (
            Number(Surplus[0]['course_total']) ===
            Number(Surplus[0]['course_selected'])
        ) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '该课程已经没有余量。'
                })
            );
            return { result: 'failed', message: '该课程已经没有余量。' };
        }

        //IO操作
        //更新数据库的余量
        var final = await transcate([insert, updateNum]);
        if (final) {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    message: '添加成功。'
                })
            );
            return { result: 'success', message: '添加成功。' };
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '添加失败。'
                })
            );
            return { result: 'failed', message: '添加失败。' };
        }
    })()
        .then(({ result, message }) => {
            if (result === 'failed') {
                console.log(message);
            } else {
                console.log(message);
            }
        })
        .catch(err => {
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
router.post('/deleteCourse', CHECK.checkLogin, (req, res, next) => {
    var account = req.body.account;
    var id = Number(account.substr(1));
    var course_id = req.body.course_id;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var ifSelected = `SELECT * FROM course_relation WHERE student_id = "${id}" AND course_id = "${course_id}"`;
    var del = `DELETE FROM course_relation WHERE student_id = '${id}' AND course_id = '${course_id}'`;
    var updateNum = `UPDATE course SET course_selected = course_selected - 1 WHERE course_id = "${course_id}"`;

    (async () => {
        //判断是否已选
        var selectResult = await query(ifSelected);
        if (selectResult.length === 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '课程不存在，不能删除！'
                })
            );
            return { result: 'failed', message: '课程不存在，不能删除！' };
        }

        //IO操作
        //更新数据库
        var final = await transcate([del, updateNum]);
        if (final) {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    message: '退选成功。'
                })
            );
            return { result: 'success', message: '退选成功。' };
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '添加失败。'
                })
            );
            return { result: 'failed', message: '退选失败。' };
        }
    })()
        .then(({ message }) => {
            console.log(message);
        })
        .catch(err => {
            console.error(err);
            next(new Error('服务器出错。'));
        });
});

module.exports = router;
