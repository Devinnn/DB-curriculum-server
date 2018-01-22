## 学生选修课管理系统

采用`node`、`express`、`ES6`搭建后台服务器，结合`gulp`使用`babel`转码。数据库使用`mysql`，具体使用`node-mysql`。

### 目录结构

```
|-- src/ # 源文件
|   |-- /config # 配置文件
|   |-- /lib # 辅助文件
|       |-- mysql.js # 封装mysql方法
|       |-- helper.js # 辅助函数
|   |-- middlewares # 中间件函数
|       |-- checkIdentity.js # 权限判断
|       |-- chekIfLogin.js # 登录状态判断
|   |-- routes # 路由配置
|-- build/ # babel后的文件
|-- sql/ # 数据表
|-- index.js # 文件入口
|-- gulpfile.js # gulp配置文件
|-- .babelrc # babel配置文件
```

### 部分代码说明

封装`mysql`事务：

```javascript
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
```

### 使用说明

安装依赖：`npm install`

开启测试服务器并实时监听文件更改：`npm run dev`

转码`node`：`npm run build`

生产环境下运行：`npm run production`
