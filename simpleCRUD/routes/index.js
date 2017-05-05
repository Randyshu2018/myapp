var express = require('express');
var router = express.Router();

// 导入MySQL模块
var mysql = require('mysql');
var dbConfig = require('../db/DBConfig');
var userSQL = require('../db/Usersql');
// 使用DBConfig.js的配置信息创建一个MySQL连接池
var pool = mysql.createPool( dbConfig.mysql );

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET login page. */
router.route("/login").get(function(req,res){    // 到达此路径则渲染login文件，并传出title值供 login.html使用
    res.render("login",{title:'User Login'});
}).post(function(req,res){                        // 从此路径检测到post方式则进行post数据的处理操作
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
        // 获取前台页面传过来的参数
        var param = req.body;
        // 建立连接 增加一个用户信息
        connection.query(userSQL.getUserByNameAndPassword, [param.username,param.password], function (err, result) {
            if(err){ 										//错误就返回给原post处（login.html) 状态码为500的错误
                     res.send(500);
            }else if(!result || result.length == 0){ 								//查询不到用户名匹配信息，则用户名不存在
                     req.session.error = '用户名不存在';
                     res.send(404);							//	状态码返回404
            }else{
                	//信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
                    req.session.user = result[0];
                    res.send(200);
            }
            // 释放连接
            connection.release();
        });
    });
});

/* GET register page. */
router.route("/register").get(function(req,res){    // 到达此路径则渲染register文件，并传出title值供 register.html使用
    res.render("register",{title:'User register'});
}).post(function(req,res){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
        // 获取前台页面传过来的参数
        var param = req.body;
        // 建立连接 增加一个用户信息
        connection.query(userSQL.getUserByName, [param.username], function (err, result) {
            console.log("result = " + result)
            if (err) {
                res.send(500);
                req.session.error = '网络异常错误！';
            } else if (result && result.length >= 1) {
                req.session.error = '用户名已存在！';
                res.send(500);
            } else {
                connection.query(userSQL.insert, [param.username, param.password], function (err, result) {
                    if (err) {
                        req.session.error = '用户名创建失败！';
                        res.send(500);
                    } else {
                        req.session.error = '用户名创建成功！';
                        res.send(200);
                    }
                });
            }
            // 释放连接
            connection.release();
        });
    });
});

/* GET home page. */
router.get("/home",function(req,res){
    if(!req.session.user){                     //到达/home路径首先判断是否已经登录
        req.session.error = "请先登录"
        res.redirect("/login");                //未登录则重定向到 /login 路径
    }
    res.render("home",{title:'Home'});         //已登录则渲染home页面
});

/* GET logout page. */
router.get("/logout",function(req,res){    // 到达 /logout 路径则登出， session中user,error对象置空，并重定向到根路径
    req.session.user = null;
    req.session.error = null;
    res.redirect("/");
});

router.route("/userList").get(function(req,res){    // 到达此路径则渲染register文件，并传出title值供 register.html使用
    res.render("home",{title:'User register'});
}).post(function(req,res){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
// 获取前台页面传过来的参数var param = req.query || req.params;
// 建立连接 增加一个用户信息
        connection.query(userSQL.queryAll, function(err, result) {
            if(result) {
                // 以json形式，把操作结果返回给前台页面
                responseJSON(res, result);
            }else{
                console.log(err)
            }
            // 释放连接
            connection.release();

        });
    });});

router.route("/delete").get(function(req,res){    // 到达此路径则渲染register文件，并传出title值供 register.html使用
    res.render("home",{title:'User register'});
}).post(function(req,res){
    // 从连接池获取连接
    pool.getConnection(function(err, connection) {
// 获取前台页面传过来的参数
var param = req.body;
// 建立连接 增加一个用户信息
        var user = req.session.user;
        if(param.id  == user.id){
            connection.release();
            req.session.error = '当前登录用户不可删除！';
            res.send(200);
             return;
        }
        connection.query(userSQL.deleteById,[param.id], function(err, result) {
            if(result) {
                // 以json形式，把操作结果返回给前台页面
                req.session.error = '删除用户成功！';
                res.send(200);
            }else{
                console.log(err);
                req.session.error = '删除用户失败！';
                res.send(200);
            }
            // 释放连接
            connection.release();
        });
    });});

router.route("/update").get(function(req,res){    // 到达此路径则渲染register文件，并传出title值供 register.html使用
    res.render("home",{title:'User register'});
}).post(function(req,res){
// 获取前台页面传过来的参数
        var param = req.body;
// 建立连接 增加一个用户信息
        var user = req.session.user;
        if(param.id  == null || param.id == ""){
            req.session.error = '参数错误！';
            res.send(404);
            return;
        }
        if(param.id  == user.id){
            req.session.error = '当前登录用户不可修改！';
            res.send(200);
            return;
        }
         // 从连接池获取连接
        pool.getConnection(function(err, connection) {
        connection.query(userSQL.updateById,[param.username,param.password,param.id], function(err, result) {
            if(result) {
                // 以json形式，把操作结果返回给前台页面
                req.session.error = '修改用户成功！';
                console.log("param.id = " + param.id);
                console.log("user.id = " + user.id);
                // if(user != null && user.id == param.id){
                //     req.session.user = null;
                //     req.send("/login");
                // }
                res.send(200);
            }else{
                console.log(err);
                req.session.error = '修改用户失败！';
                res.send(200);
            }
            // 释放连接
            connection.release();
        });
    });});

    var responseJSON = function (res, ret) {
    if(typeof ret === 'undefined') {
        res.json({     code:'-200',     msg: '操作失败'
        });
    } else {
        res.json(ret);
    }};

module.exports = router;
