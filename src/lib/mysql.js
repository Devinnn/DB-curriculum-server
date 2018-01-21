var config = require('../config');
var mysql = require('mysql');

var pool = mysql.createPool(config.mysql);

/**
 * 把mySQL查询功能封装成一个promise
 * @param String sql
 * @returns Promise
 */

//简单查询
var query = sql => {
    var connect = new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, (err, results) => {
                    connection.release();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            }
        });
    });
    return connect;
};

var transcate = async handle => {
    //首先，需要连接上连接池，返回一个connection对象供后面使用
    var connection = await getConnectionPromise().catch(err => {
        console.error(err);
    });
    //然后开始事务操作
    try {
        await TransPromise(connection.beginTransaction.bind(connection));
        //继发执行操作
        for (var sql of handle) {
            await queryPromise(connection, sql);
        }
        //最后进行一步提交操作
        await TransPromise(connection.commit.bind(connection));

        return true;
    } catch (error) {
        //如果操作，全部回滚
        console.error(error);
        connection.rollback(() => {
            console.log('操作失败');
        });
        return false;
    }
};

function getConnectionPromise() {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        });
    });
}

function TransPromise(handle) {
    return new Promise((resolve, reject) => {
        handle(err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function queryPromise(connection, sql) {
    return new Promise((resovle, reject) => {
        connection.query(sql, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resovle(results);
            }
        });
    });
}

module.exports = { query, transcate };
