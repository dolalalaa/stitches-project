const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: { type: Array, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "Placed" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
