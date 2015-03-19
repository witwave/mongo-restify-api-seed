var task = require('../models/task');
var user = require('../models/user');
var restifyMongoose = require('restify-mongoose');
module.exports = function(server) {
	restifyMongoose(task).serve('/api/task', server);
	restifyMongoose(user).serve('/api/user', server);
};