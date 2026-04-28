const mongoose = require('mongoose');

const laceSchema = new mongoose.Schema({
    name: String,
    compatibleKurta: String,
    glbFile: String,
    thumbnail: String
});

module.exports = mongoose.model('Lace', laceSchema);