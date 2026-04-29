const mongoose = require('mongoose');

const laceSchema = new mongoose.Schema({
    name: String,
    // Change String to ObjectId for a stronger connection
    compatibleKurta: { type: mongoose.Schema.Types.ObjectId, ref: 'Kurta' },
    glbFile: String,
    thumbnail: String
});

module.exports = mongoose.model('Lace', laceSchema);