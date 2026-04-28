const mongoose = require('mongoose');

const mannequinSchema = new mongoose.Schema({
    name: String,
    size: String,
    glbFile: String,
    thumbnail: String
});

module.exports = mongoose.model('Mannequin', mannequinSchema);