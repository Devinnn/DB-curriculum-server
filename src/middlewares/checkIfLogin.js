module.exports = {
    //检查当前是否已经登录
    checkLogin(req, res, next) {
        if (!req.session.userid) {
            res.status(200).send(
                JSON.stringify({
                    result: 'unsigned',
                    message: '当前未登录，请登录！'
                })
            );
            return;
        }
        //如果已经登录，通过
        next();
    },
    //检查当前是否没有登录
    checkNotLogin(req, res, next) {
        if (req.session.userid) {
            res.status(200).send(
                JSON.stringify({
                    result: 'success',
                    userid: req.session.userid,
                    name: req.session.name,
                    message: '已经登录！'
                })
            );
            return;
        }
        //如果没有登录，通过
        next();
    }
};
