var restify = require("restify");
var mongoose = require('mongoose');
var logger = require('log4js').getLogger();
var env = process.env.ENV || 'dev';
var config = require('./config')(env);
restify.CORS.ALLOW_HEADERS.push('authorization');
logger.setLevel('TRACE');

var server = restify.createServer({
	name: config.app.name,
	version: config.app.version
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
server.use(restify.fullResponse());
restify.CORS.ALLOW_HEADERS.push('authorization');
//server.pre(restify.pre.userAgentConnection());

mongoose.connect(config.mongo);

//API
require("./route/user")(server);
require("./route/api")(server);

server.listen(8080, function() {
	console.log('env %s', env);
	console.log('%s listening at %s', server.name, server.url);
});