var config = {
    dev: {
        app: {
            name: 'api',
            version: "1.0.0"
        },
        mongo: "mongodb://192.168.70.138:27017/wbs",
        tokenSecret: 'wbs'
    },
    prd: {
        app: {
            name: 'api',
            version: "1.0.0"
        },
        mongo: "mongodb://127.0.0.1:27017/api",
        tokenSecret: 'wbs'
    }
};

module.exports = function(env) {
    return config[env];
};
