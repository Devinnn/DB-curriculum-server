'use strict';

module.exports = function (app) {
    /* 共有功能 */
    app.use('/sign', require('./sign'));
    app.use('/modifyPw', require('./modifyPw'));
    app.use('/search', require('./search'));
    app.use('/getCourseList', require('./getCourseList'));
    /* 学生 */
    app.use('/s/selectManage', require('./student/courseManage'));
    /* 教师 */
    app.use('/t/courseManage', require('./teacher/courseManage'));
    /* 管理员 */
    app.use('/r/studentManage', require('./root/studentManage'));
    app.use('/r/teacherManage', require('./root/teacherManage'));
    app.use('/r/courseManage', require('./root/courseManage'));
    //404处理
    app.use(function (req, res) {
        res.status(404).send('Sorry can not Found!');
        return;
    });

    //错误处理
    /* 注意这里要加next不然捕获不到 */
    app.use(function (err, req, res, next) {
        console.log(err);
        res.status(500).send(err);
        return;
    });
};