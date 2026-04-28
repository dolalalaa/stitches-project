const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: String,
    measurementId: String,
    fabricId: String,
    fabricName: String,
    selectedKurtaId: String,
    selectedKurtaName: String,
    selectedKurtaPrice: Number,
    selectedSleeveName: String,
    selectedNeckName: String,
    selectedLaceName: String,
    totalPrice: Number,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);