const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    topic: {
        type: String, 
        required: true
    },
    message: {
        type: String, 
        required: true
    },
    name: {
        type: String, 
        required: true
    },

})

module.exports = mongoose.model('Posts', postSchema);