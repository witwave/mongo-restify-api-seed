var user = require('../controllers/user');
var restifyMongoose = require('restify-mongoose');

module.exports = function(server) {
	server.post("/user/login", user.login); // 登陆
	server.post("/user/add", user.add); // 添加用户
	server.post("/user/modify", user.authenticated, user.modify); // 修改
	server.get("/user/get", user.authenticated, user.get); // 获得当前用户的信息
	server.get("/user/get/:uid", user.authenticated, user.get); // 获得指定用户的信息
	server.get("/user/list", user.authenticated, user.list); // 获取用户列表
	//server.get("/user/list",  user.list); // 获取用户列表 ceshi
	server.post("/user/reg", user.reg); // 注册
	server.post("/user/add", user.authenticated, user.add); //添加用户
};