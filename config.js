var config = {
    dev: {
        app: {
            name: 'api',
            version: "1.0.0"
        },
        mongo: "mongodb://192.168.70.138:27017/wbs",
        tokenSecret: 'xxxxx',
        loger: {
            "appenders": [{
                type: "console"
            }, {
                type: "file",
                filename: "logs/access.log",
                category: 'file'
            }, {
                "type": "smtp",
                "recipients": "logfilerecipient@logging.com",
                "sendInterval": 5,
                "transport": "SMTP",
                "SMTP": {
                    "host": "smtp.gmail.com",
                    "secureConnection": true,
                    "port": 465,
                    "auth": {
                        "user": "someone@gmail",
                        "pass": "********************"
                    },
                    "debug": true
                },
                "category": "mailer"
            }],
            replaceConsole: true
        }
    },
    prd: {
        app: {
            name: 'api',
            version: "1.0.0"
        },
        mongo: "mongodb://127.0.0.1:27017/api",
        tokenSecret: 'xxxxxx',
        loger: {
            "appenders": [{
                type: "console"
            }, {
                type: "file",
                filename: "logs/access.log",
                category: 'file'
            }, {
                "type": "smtp",
                "recipients": "logfilerecipient@logging.com",
                "sendInterval": 5,
                "transport": "SMTP",
                "SMTP": {
                    "host": "smtp.gmail.com",
                    "secureConnection": true,
                    "port": 465,
                    "auth": {
                        "user": "someone@gmail",
                        "pass": "********************"
                    },
                    "debug": true
                },
                "category": "mailer"
            }],
            replaceConsole: true
        }
    }
};

module.exports = function(env) {
    return config[env];
};