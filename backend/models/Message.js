// models/Message.js


const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  room:    { type: String, required: true },
  sender:  { type: String, required: true },
  text:    { type: String, default: null },
  image:   { type: String, default: null }, // base64
  audio:   { type: String, default: null }, // base64 audio
  time:    { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);