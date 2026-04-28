const mongoose = require('mongoose');

const neckSchema = new mongoose.Schema({
    name: String,
    type: String,
    size: String,
    glbFile: String,
    thumbnail: String
});

module.exports = mongoose.model('Neck', neckSchema);