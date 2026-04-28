const mongoose = require('mongoose');

const kurtaSchema = new mongoose.Schema({
    name: String,
    displayName: String,
    size: String,
    glbFile: String,
    thumbnail: String,
    basePrice: Number
});

module.exports = mongoose.model('Kurta', kurtaSchema);