const mongoose = require('mongoose');

const FabricSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // EXISTING (old)
  textureUrl: { type: String, required: true },
  thumbnailColor: { type: String, required: true },
  category: { type: String },

  // NEW (for browsing/filtering)
  type: { type: String },        // cotton, silk
  color: { type: String },
  pattern: { type: String },
  price: { type: Number },
  image: { type: String }       // Cloudinary preview image
});

module.exports = mongoose.model('Fabric', FabricSchema);