const mongoose = require('mongoose');

const sleeveSchema = new mongoose.Schema({
    name: String,
    type: String,
    size: String,
    glbFile: String,
    thumbnail: String
});

module.exports = mongoose.model('Sleeve', sleeveSchema);