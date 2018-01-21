var path = require('path');
function resolve(url) {
    if (process.env.NODE_ENV === 'production') {
        return path.join(__dirname, 'build', url);
    } else {
        return path.join(__dirname, 'src', url);
    }
}

var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var config = require(resolve('config')); // 文件配置
var routes = require(resolve('routes')); // 路由入口

var app = express();

//解决跨域问题
app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.header('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') res.send(200); /*让options请求快速返回*/
    else next();
});

app.use(cookieParser());

app.use(
    session({
        resave: true,
        saveUninitialized: false,
        name: config.session.key,
        secret: config.session.secret,
        cookie: { maxAge: 10000000 }
    })
);

routes(app);

app.listen(config.port, function(err) {
    if (err) {
        console.error(err);
    }
    console.log('server run!\n');
});
