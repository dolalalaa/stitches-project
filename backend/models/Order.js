const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items:      { type: Array,  required: true },
  totalPrice: { type: Number, required: true },
  status:     { type: String, default: "Placed" },
  source:     { type: String, default: "product" },
  shopId:     { type: String, default: "" }, // ← links order to a shop
  customerName: { type: String, default: "" },
  customerId:   { type: String, default: "" },
  createdAt:  { type: Date,   default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);