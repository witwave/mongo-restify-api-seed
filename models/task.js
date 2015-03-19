var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = new Schema({
     name: {
        type: String,
        unique: true
    },
    code: {
        type: String,
        unique: true
    },
    unit: String,
    table: String,
    prefixRowKey: String,//ROWKEY前缀
    column: String,
    category: String,
    meta: {
        create_at: Date,
        update_at: Date
    }
});

module.exports =  mongoose.model('Task', TaskSchema);