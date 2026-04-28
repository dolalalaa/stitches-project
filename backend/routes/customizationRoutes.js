const express = require('express');
const router = express.Router();
const Kurta = require('../models/Kurta');
const Sleeve = require('../models/Sleeve');
const Neck = require('../models/Neck');
const Lace = require('../models/Lace_base');
const Mannequin = require('../models/Mannequin');
const Order = require('../models/Order');

// Get mannequin by size
router.get('/mannequin/:size', async (req, res) => {
    try {
        const mannequin = await Mannequin.findOne({ size: req.params.size });
        res.json(mannequin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get kurtas by size
router.get('/kurtas/:size', async (req, res) => {
    try {
        const kurtas = await Kurta.find({ size: req.params.size });
        res.json(kurtas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get sleeves by size
router.get('/sleeves/:size', async (req, res) => {
    try {
        const sleeves = await Sleeve.find({ size: req.params.size });
        res.json(sleeves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get necks by size
router.get('/necks/:size', async (req, res) => {
    try {
        const necks = await Neck.find({ size: req.params.size });
        res.json(necks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get laces by kurta name
router.get('/laces/:kurtaName', async (req, res) => {
    try {
        const laces = await Lace.find({ compatibleKurta: req.params.kurtaName });
        res.json(laces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Save order
router.post('/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;