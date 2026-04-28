// models/Measurement.js
const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema(
  {
    shoulder:  { type: Number, required: true },
    chest:     { type: Number, required: true },
    waist:     { type: Number, required: true },
    hip:       { type: Number, required: true },
    armLength: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Measurement", measurementSchema);