// 用户信息模块
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;
var SALT_WORK_FACTOR = 10;


// Schema
var UserSchema = new Schema({
    username: {
        type: String,
        index: {
            unique: true
        }
    },
    password: {
        type: String
    },
    password_salt: {
        type: String
    },
    realname: {
        type: String
    },
    status: {
        type: Number,
        default: 1
    },
    roles: {
        type: Schema.Types.Mixed,
        default: {}
    },
    administrator: {        // 是否超级管理员
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
    updateAt: {
        type: Date,
        default: Date.now()
    }
});

UserSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createAt = this.updateAt = Date.now();
        var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
        var hash = bcrypt.hashSync(this.password, salt);
        this.password = hash;
        this.password_salt = salt;
    } else {
        this.updateAt = Date.now();
    }
    next();
});

UserSchema.pre("update", function(next) {
    // 重置密码
    if (this.password) {
        var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
        var hash = bcrypt.hashSync(this.password, salt);
        this.password = hash;
        this.password_salt = salt;
    }
    this.updateAt = Date.now();
    next();
});

UserSchema.methods = {
    // 密码匹配
    comparePassword: function (password) {
        return bcrypt.compareSync(password, this.password);
    }
};


// Model
var UserModel = mongoose.model('User', UserSchema);
UserModel.modify = function(uid, content, callback) {
    if (content.password) {
        var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
        var hash = bcrypt.hashSync(content.password, salt);
        content.password = hash;
        content.password_salt = salt;
    }
    content.updateAt = Date.now();
    this.update({_id: uid}, content, callback);
};


module.exports = UserModel;