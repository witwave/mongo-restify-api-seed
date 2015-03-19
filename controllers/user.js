//var Q = require("q");
var User = require("../models/user");
var logger = require('log4js').getLogger();
var jwt = require('jwt-simple');
var moment = require('moment');
var Q = require("q");
// 安全token
var tokenSecret = require('../config')(process.env.ENV || 'development', ["tokenSecret"]);

// 用户登录
exports.login = function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    var username = req.params.username;
    var password = req.params.password;
    if (username && password) {
        var condition = {
            username: username
        };
        User.findOne(condition, function(err, doc) {
            logger.debug(doc);
            if (doc && doc.comparePassword(password)) {
                var payload = {
                    user: doc,
                    iat: new Date().getTime(),
                    exp: moment().add(7, 'days').valueOf()
                };
                var token = jwt.encode(payload, tokenSecret);
                res.send({
                    username: doc.username,
                    realname: doc.realname,
                    token: token
                });
                logger.info("[%s] token: %s", username, token);
                next();
            } else {
                res.send(403, "No Access");
            }
        });
    } else {
        logger.debug("login params: %s", req.params);
        res.send(500, "miss params");
    }
};

// 验证登陆
exports.authenticated = function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    var token = req.header('Authorization') || req.params.token || req.query.token;
    if (token) {
        try {
            var token = req.headers.authorization.split(' ')[1];
            var decoded = jwt.decode(token, tokenSecret);
            if (decoded.exp <= Date.now()) {
                res.send(400, "Access token has expired");
            } else {
                // 用户对象
                req.User = decoded.user;
                req.token = token;
                next();
            }
        } catch (err) {
            res.send(500, err);
        }
    } else {
        res.send(403, "no access");
    }
};

// 用户添加
exports.add = function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.params.username && req.params.password) {
        var username = req.params.username;
        var password = req.params.password;
        var condition = {
            username: username
        };
        User.findOne(condition, function(err, doc) {
            if (err) next(err);
            if (doc) res.send(500, '邮箱已经被使用');
            var user = new User();
            user.username = req.params.username;
            user.password = req.params.password;
            user.realname = req.params.username.split('@')[0];
            user.administrator = req.params.administator | false;
            user.roles = req.params.roles && req.params.roles instanceof Array ? req.params.roles : {};
            console.log(user);
            user.save(function(err, doc) {
                if (err) {
                    res.send(500, err.toString());
                } else {
                    res.send({
                        id: doc._id.toString(),
                        username: doc.username
                    });
                    next();
                }
            });
        });

    } else {
        logger.debug("register params: %s, %s", req.params.roles, req.params);
        res.send(500, "参数丢失");
    }
};

// 用户注册
exports.reg = function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.params.username && req.params.password) {
        var user = new User();
        user.username = req.params.username;
        user.password = req.params.password;
        user.realname = req.params.username.split('@')[0];
        user.roles = {};

        user.save(function(err, doc) {
            if (err) {
                res.send(500, err.toString());
            } else {
                res.send({
                    id: doc._id.toString(),
                    username: doc.username
                });
                next();
            }
        });
    } else {
        logger.debug("register params: %s, %s", req.User.roles.user, req.params);
        res.send(500, "miss params");
    }
};

// 获取指定的用户ID
var getPointUid = function(req) {
    var uid = req.params.uid || req.query.uid ? req.params.uid || req.query.uid : req.User._id;
    if (req.User.roles.user || req.User._id.toString() == uid) {
        return uid;
    }
    return null;
};

// 用户更新
exports.modify = function(req, res, next) {
    logger.debug("user.modify :: %s == %s", req.User._id.toString(), req.params.uid);
    var uid = getPointUid(req);
    if (uid) {
        var content = {};
        req.params.password ? content.password = req.params.password : null;
        req.params.realname ? content.realname = req.params.realname : null;
        req.params.roles && req.params.roles instanceof Array ? content.roles : null;
        User.modify(uid, content, function(err, doc) {
            if (err) {
                res.send(500, err);
            } else {
                var token = req.token;
                if (req.User._id.toString() == uid) {
                    // 重置token
                    var payload = {
                        user: doc,
                        iat: new Date().getTime(),
                        exp: moment().add(7, 'days').valueOf()
                    };
                    token = jwt.encode(payload, tokenSecret);
                }
                res.send({
                    token: token
                });
                next();
            }
        });
    } else {
        res.send(403, "no role");
    }
};

// 获取用户信息
exports.get = function(req, res, next) {
    var uid = getPointUid(req);
    logger.debug(uid);
    if (uid) {
        User.findOne({
            _id: uid
        }, function(err, doc) {
            if (err) {
                res.send(500, err);
            } else {
                res.send(doc);
                next();
            }
        });
    } else {
        res.send(403, "no role");
    }
};

// 获取用户列表
exports.list = function(req, res, next) {
    logger.debug("list user:role=%s,admin=%s", req.User.roles, req.User.administrator);
    if ((req.User && req.User.roles && req.User.roles.user) || (req.User && req.User.administrator)) {
        var limit = req.query.limit || 20;
        var offset = req.query.offset || 0;
        var count = 0;
        Q.all([
            // 统计查询总数
            User.count({}, function(err, num) {
                count = num;
            }),
            // 用户列表
            User.find({}, null, function(err, docs) {
                res.send({
                    count: count,
                    list: docs
                });
                next();
            })
        ]);
    } else {
        res.send(403, "no role");
    }
};

// 比对用户权限
exports.validate = function(req, res, next) {
    if (req.params.role) {
        User.find({
            _id: req.User._id
        }, function(err, doc) {
            if (err) {
                res.send(500, err);
            } else {
                var result = false;
                if (doc) {
                    var roleArr = req.params.role.split(".");
                    var roles = doc.roles;
                    for (var i = 0; i < roleArr.length && i < 2; i++) {
                        if (roles instanceof Array) {
                            // 数组类型
                            var ther = null;
                            for (var j = 0; j < roles.length; j++) {
                                if (roles[j] == roleArr[i]) {
                                    ther = roles[j];
                                    break;
                                }
                            }
                            if (ther) {
                                result = true;
                                roles = ther;
                            } else {
                                result = false;
                                break;
                            }
                        } else {
                            // 对象类型
                            if (roles[roleArr[i]]) {
                                roles = roles[roleArr[i]];
                                result = true;
                            } else {
                                result = false;
                                break;
                            }
                        }
                    }
                }
            }
            res.send(result);
            next();
        });
    } else {
        res.send(500, "miss params");
    }
};