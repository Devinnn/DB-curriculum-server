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
router.get('/', CHECK.checkLogin, (req, res, next) => {
    var page = req.query.page;
    var limit = req.query.limit;
    var sum = `SELECT CEIL(COUNT(*) / ${limit}) FROM course`;
    var sql = `
        SELECT
            *
        FROM
            (
                SELECT
                    @ROW :=@ROW + 1 AS id,
                    course_id,
                    course_name,
                    A. NAME AS course_teacher,
                    course_total,
                    course_selected,
                    course_date,
                    course_adress,
                    course_category,
                    course_intro
                FROM
                    (SELECT @ROW := 0) AS ROW,
                    course
                INNER JOIN teacher AS A ON course_teacher = A.id
                ORDER BY
                    course_id ASC
            ) AS C
        LIMIT ${(page - 1) * limit}, ${limit}
    `;
    (async sql => {
        var [s, q] = await Promise.all([query(sql[0]), query(sql[1])]);
        return [s, q];
    })([sum, beautifySQL(sql)])
        .then(([s, q]) => {
            var total = Object.values(s[0])[0];
            if (q.length === 0) {
                res.status(200).send(
                    JSON.stringify({
                        result: 'success',
                        list: [],
                        totalPage: total,
                        currentPage: page
                    })
                );
            } else {
                res.status(200).send(
                    JSON.stringify({
                        result: 'success',
                        list: q,
                        totalPage: total
                    })
                );
            }
            return;
        })
        .catch(err => {
            console.error(err);
            next(new Error('服务器错误。'));
        });
});

module.exports = router;
