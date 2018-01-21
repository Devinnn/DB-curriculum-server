module.exports = {
    checkIfStudent(req, res, next) {
        var category = req.body.userid;
        category = category.substring(0, 1);
        if (category === 's') {
            next();
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: '暂无权限'
                })
            );
            return;
        }
    },
    checkIfTeacher(req, res, next) {
        var category = req.body.userid;
        category = category.substring(0, 1);
        if (category === 't') {
            next();
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: '暂无权限'
                })
            );
            return;
        }
    },
    checkIfRoot(req, res, next) {
        var category = req.body.userid;
        category = category.substring(0, 1);
        if (category === 'r') {
            next();
        } else {
            res.status(200).send(
                JSON.stringify({
                    result: '暂无权限'
                })
            );
            return;
        }
    }
};
