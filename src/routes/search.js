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
router.post('/', CHECK.checkLogin, (req, res, next) => {
    var param = req.body.param;
    var category = req.body.category
        ? `AND course_category = "${req.body.category}"`
        : '';

    var sql = `
        SELECT
            A.id,
            course_id,
            course_name,
            B. NAME AS course_teacher,
            course_total,
            course_selected,
            course_date,
            course_adress,
            course_category,
            course_intro
        FROM
            (
                SELECT
                    @ROW :=@ROW + 1 AS id,
                    course_id,
                    course_name,
                    course_teacher,
                    course_total,
                    course_selected,
                    course_date,
                    course_adress,
                    course_category,
                    course_intro
                FROM
                    course,
                    (SELECT @ROW := 0) AS ROW
                WHERE
                    (
                        course_name LIKE "%${param}%"
                        OR course_date LIKE "%${param}%"
                        OR course_teacher LIKE "%${param}%"
                        OR course_intro LIKE "%${param}%"
                        OR course_adress LIKE "%${param}%"
                    ) ${category}
                ORDER BY course_id ASC
            ) AS A
        INNER JOIN teacher AS B ON A.course_teacher = B.id
    `;

    (async sql => {
        var results = await query(sql);
        return results;
    })(beautifySQL(sql))
        .then(results => {
            if (results.length == 0) {
                res.status(200).send(
                    JSON.stringify({
                        result: 'success',
                        list: []
                    })
                );
            } else {
                res.status(200).send(
                    JSON.stringify({
                        result: 'success',
                        list: results
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
