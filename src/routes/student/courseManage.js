var express = require('express');
var bodyParser = require('body-parser');
var query = require('../../lib/mysql').query;
var transcate = require('../../lib/mysql').transcate;
var router = express.Router();
var CHECK = require('../../middlewares/checkIfLogin');
var beautifySQL = require('../../lib/helper').stringifySQL;
var checkIfSelf = require('../../lib/helper').checkIfSelf; //限制只能操作自己的账户
var checkIdentity = require('../../lib/helper').checkIdentity; //检查权限

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/**
 * @type GET 查看自己已选课程
 * @param
 * String account
 **/

router.get('/', CHECK.checkLogin, (req, res, next) => {
    var account = req.query.account;
    var id = Number(account.substr(1));

    //检查是否为本人
    if (!checkIfSelf(account, req, res)) {
        return;
    }

    //检查是否为学生
    if (!checkIdentity('s', req, res)) {
        return;
    }

    var sql = `
        SELECT
            @ROW :=@ROW + 1 AS id,
            B.course_id,
            B.course_name,
            B.course_category,
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
 * 实现流程：
 * 1. 检测是否超过最大选课数量
 * 2. 判断是否已选
 * 3. 检测上课时间是否冲突
 * 4. 检查数据库是否有余量
 * 5. IO操作
 * 6. 更新数据库余量信息
 **/

/**
 * @type POST 添加课程
 * @param
 * String account
 * String course_id
 **/

router.post('/add', CHECK.checkLogin, (req, res, next) => {
    var account = req.body.account;
    var id = Number(account.substr(1));
    var course_id = req.body.course_id;

    //检查是否为本人
    if (!checkIfSelf(account, req, res)) {
        return;
    }

    //检查是否为学生
    if (!checkIdentity('s', req, res)) {
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
        if (maxSelect[0]['COUNT(*)'] >= 5) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '每位学生最多可选五门！'
                })
            );
            return { result: 'failed', msg: '每个学生最多可选五门!' };
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
            return { result: 'failed', msg: '课程已选，不能重复选择。' };
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
            return { result: 'failed', msg: '选课时间存在冲突！' };
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
            return { result: 'failed', msg: '该课程已经没有余量。' };
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
            return { result: 'success', msg: '添加成功。' };
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '添加失败。'
                })
            );
            return { result: 'failed', msg: '添加失败。' };
        }
    })()
        .then(({ result, msg }) => {
            if (result === 'failed') {
                console.log(msg);
            } else {
                console.log(msg);
            }
        })
        .catch(err => {
            console.error(err);
            next(new Error('服务器错误。'));
        });
});

/**
 * 实现流程：
 * 1. 判断是否已选
 * 2. 检查数据库是否有余量
 * 3. IO操作
 * 4. 更新数据库余量信息
 **/

/**
 * @type POST 删除所选课程
 * @param
 * String account
 * String course_id
 **/
router.post('/delete', CHECK.checkLogin, (req, res, next) => {
    var account = req.body.account;
    var id = Number(account.substr(1));
    var course_id = req.body.course_id;

    //检查是否为本人
    if (!checkIfSelf(account, req, res)) {
        return;
    }

    //检查是否为学生
    if (!checkIdentity('s', req, res)) {
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
            return { result: 'success', msg: '退选成功。' };
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '退选失败！'
                })
            );
            return { result: 'failed', msg: '退选失败。' };
        }
    })()
        .then(({ msg }) => {
            console.log(msg);
        })
        .catch(err => {
            console.error(err);
            next(new Error('服务器出错。'));
        });
});

module.exports = router;
