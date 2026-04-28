const express = require('express');
const router = express.Router();
const Fabric = require('../models/Fabric');

// GET all fabrics from MongoDB
router.get('/all', async (req, res) => {
  try {
    const fabrics = await Fabric.find();
    res.json(fabrics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

// 🔥 NEW FILTER ROUTE
router.get('/filter', async (req, res) => {
  try {
    const { type, color } = req.query;

    let filter = {};

    if (type) {
      filter.type = { $regex: type, $options: "i" }; // 🔥 partial match
    }

    if (color) {
      filter.color = { $regex: color, $options: "i" }; // 🔥 partial match
    }

    const fabrics = await Fabric.find(filter);

    res.json(fabrics);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});