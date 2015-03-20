var restify = require("restify");
restify.CORS.ALLOW_HEADERS.push('authorization');
var mongoose = require('mongoose');
var env = process.env.ENV || 'dev';
var debug = process.env.DEBUG || 'TRACE';
var config = require('./config')(env);
var port = process.env.PORT || 8080;
var log4js = require('log4js');
log4js.configure(config.loger);

log = log4js.getLogger('file');
logmailer = log4js.getLogger("mailer");
log.setLevel(debug);

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

server.listen(port, function() {
	log.info('ENV %s', env);
	log.info('PORT %s', port);
	log.info('%s listening at %s', server.name, server.url);
});