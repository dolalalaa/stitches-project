const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: "BDT" },
  image: { type: String },
});

module.exports = mongoose.model("Product", productSchema);
