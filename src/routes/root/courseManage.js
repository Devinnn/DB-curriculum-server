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
 * @type GET 查看某课程下学生的选课情况
 * @param
 * String course_id
 **/

router.get('/', CHECK.checkLogin, (req, res, next) => {
    var course_id = req.query.course_id;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var sql = `
        SELECT
            @ROW :=@ROW + 1 AS id,
            A.student_id,
            B.name
        FROM
            (SELECT @ROW := 0) AS C,
            (
                SELECT
                    student_id
                FROM
                    course_relation
                WHERE
                    course_id = "${course_id}"
                ORDER BY
                    student_id ASC
            ) AS A
        INNER JOIN student AS B ON B.id = A.student_id
    `;

    (async sql => {
        var results = await query(sql);
        if (results.length !== 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    list: results,
                    course_id: course_id
                })
            );
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    list: [],
                    course_id: course_id
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
 * @type POST 发布课程
 * @param
 * String account
 * String course
 * Number sum
 * Stirng date
 * String adress
 * String cate
 * String intro
 **/

router.post('/addCourse', CHECK.checkLogin, (req, res, next) => {
    var account = req.body.account;
    var id = Number(account.substr(1));
    var course = req.body.course;
    var sum = Number(req.body.sum);
    var date = req.body.date;
    var adress = req.body.adress;
    var cate = req.body.cate;
    var intro = req.body.intro;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var total = `SELECT COUNT(*) FROM course WHERE course_teacher = "${id}"`;
    var checkDateConflick = `
        SELECT
            COUNT(*)
        FROM
            (
                SELECT
                    A.course_name,
                    A.course_date
                FROM
                    (
                        SELECT
                            course_name,
                            course_date
                        FROM
                            course
                        WHERE
                            course_teacher = '${id}'
                    ) AS A
            ) AS C
        WHERE
            C.course_date = "${date}"
    `;
    var checkAdressAvailable = `SELECT COUNT(*) FROM course WHERE course_date = '${date}' AND course_adress = '${adress}'`;
    var insert = `
        INSERT course VALUES(NULL, "${course}", "${id}", ${sum}, 0, "${date}", "${adress}", "${cate}", "${intro}")
    `;

    (async () => {
        //每位老师最多可发布5门课程
        var maxPub = await query(total);
        if (maxPub[0]['COUNT(*)'] >= 5) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '每位老师最多可发布五门课程！'
                })
            );
            return { result: 'failed', msg: '每位老师最多可发布五门课程！' };
        }

        //检测上课时间是否冲突
        var checkDate = await query(beautifySQL(checkDateConflick));
        if (Number(checkDate[0]['COUNT(*)']) !== 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '发布课程时间和已有课程时间冲突！'
                })
            );
            return {
                result: 'failed',
                msg: '发布课程时间和已有课程时间冲突！'
            };
        }

        //检测发布的课程所在时间内课室是否被占用
        var checkAdress = await query(beautifySQL(checkAdressAvailable));
        if (Number(checkAdress[0]['COUNT(*)']) !== 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '相同时间内课室已被占用！'
                })
            );
            return { result: 'failed', msg: '相同时间内课室已被占用！' };
        }

        //IO操作
        var addResult = await query(insert);
        if (addResult.affectRow === 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '发布失败。'
                })
            );
            return { result: 'failed', msg: '发布失败。' };
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    message: '发布成功。'
                })
            );
            return { result: 'success', msg: '发布成功。' };
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
            next(new Error('服务器错误'));
        });
});

/**
 * @type POST 删除课程
 * @param
 * String account
 * String course_id
 **/

router.post('/deleteCourse', CHECK.checkLogin, (req, res, next) => {
    var course_id = req.body.course_id;

    //检查是否为管理员
    if (!checkIdentity('r', req, res)) {
        return;
    }

    var queryCourse = `SELECT COUNT(*) FROM course WHERE course_id = "${course_id}"`;
    var queryRelate = `SELECT COUNT(*) FROM course_relation WHERE course_id = "${course_id}"`;
    var delCourse = `DELETE FROM course WHERE course_id = "${course_id}"`;
    var delRelate = `DELETE FROM course_relation WHERE course_id = "${course_id}"`;

    (async () => {
        //查看是否存在这门课程
        var ifExist = await query(queryCourse);
        if (ifExist[0]['COUNT(*)'] == 0) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '不存在这门课程。'
                })
            );
            return { result: 'failed', msg: '不存在这门课程。' };
        }

        //查看是否有人选这门课程，如果没有直接删除course表中的记录
        var ifSelect = await query(queryRelate);
        if (ifSelect[0]['COUNT(*)'] == 0) {
            var delC = await query(delCourse);
            if (delC.affectRow === 0) {
                res.status(200).send(
                    JSON.stringify({
                        result: 'failed',
                        message: '删除课程失败。'
                    })
                );
                return { result: 'failed', msg: '删除课程失败。' };
            } else {
                res.status(200).send(
                    JSON.stringify({
                        result: 'success',
                        message: '删除课程成功。'
                    })
                );
                return { result: 'success', msg: '删除课程成功。' };
            }
        }

        //否则需要先删除relation表中的内容，再删除course表中的课程。
        var final = await transcate([delRelate, delCourse]);
        if (final) {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    message: '删除课程成功。'
                })
            );
            return { result: 'success', msg: '删除课程成功。' };
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '删除课程失败。'
                })
            );
            return { result: 'failed', msg: '删除课程失败。' };
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
            next(new Error('服务器出错'));
        });
});

module.exports = router;
