module.exports = {
    stringifySQL(sql) {
        return sql.replace(/\n/g, ' ').replace(/\s{1,}/g, ' ');
    },
    checkIfSelf(account, req, res) {
        if (account !== req.session.userid) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '不能对其他用户进行操作！'
                })
            );
            return false;
        } else {
            return true;
        }
    },
    checkIdentity(identity, req, res) {
        if (identity !== req.session.userid.slice(0, 1)) {
            res.status(200).send(
                JSON.stringify({
                    result: 'failed',
                    message: '该用户没有权限操作'
                })
            );
            return false;
        } else {
            return true;
        }
    }
};
