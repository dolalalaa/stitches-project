const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items:      { type: Array,  required: true },
  totalPrice: { type: Number, required: true },
  // "Placed"  = came from product page (auto accepted)
  // "Pending" = came from design flow (needs shop owner review)
  // "Accepted", "Rejected", "Completed"
  status:     { type: String, default: "Placed" },
  source:     { type: String, default: "product" }, // "product" | "design"
  createdAt:  { type: Date,   default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
