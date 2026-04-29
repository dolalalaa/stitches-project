const express = require('express');
const router = express.Router();
const Fabric = require('../models/Fabric');
const upload = require('../config/upload'); //  Cloudinary upload config

// GET all fabrics from MongoDB
router.get('/all', async (req, res) => {
  try {
    const fabrics = await Fabric.find();
    res.json(fabrics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  NEW FILTER ROUTE
router.get('/filter', async (req, res) => {
  try {
    const { type, color } = req.query;

    let filter = {};

    if (type) {
      filter.type = { $regex: type, $options: "i" }; //  partial match
    }

    if (color) {
      filter.color = { $regex: color, $options: "i" }; // partial match
    }

    const fabrics = await Fabric.find(filter);

    res.json(fabrics);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========== ADD FABRIC ROUTE ==========
// POST - Add new fabric with image upload
router.post('/add', upload.single('fabricImage'), async (req, res) => {
  try {
    const { name, type, color, pattern, price, category, textureUrl, thumbnailColor, shopOwnerId } = req.body;
    
    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path;
    }

    const fabric = new Fabric({
      name,
      type: type || '',
      color: color || '',
      pattern: pattern || '',
      price: price ? parseFloat(price) : null,
      category: category || 'standard',
      textureUrl: textureUrl || '',
      thumbnailColor: thumbnailColor || '#000000',
      image: imageUrl,
      shopOwnerId: shopOwnerId || null
    });

    const savedFabric = await fabric.save();
    res.status(201).json({ 
      success: true, 
      message: 'Fabric added successfully!',
      fabric: savedFabric 
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// GET - Get fabrics by shop owner
router.get('/shop/:shopId', async (req, res) => {
  try {
    const fabrics = await Fabric.find({ shopOwnerId: req.params.shopId });
    res.json(fabrics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE - Delete fabric by ID
router.delete('/:id', async (req, res) => {
  try {
    const fabric = await Fabric.findByIdAndDelete(req.params.id);
    if (!fabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }
    res.json({ message: 'Fabric deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;