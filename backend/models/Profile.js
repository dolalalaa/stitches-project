// models/Profile.js
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId:     { type: String, required: true, unique: true },
  name:       { type: String, default: "" },
  gender:     { type: String, default: "" },
  mobile:     { type: String, default: "" },
  email:      { type: String, default: "" },
  address:    { type: String, default: "" },
  profilePic: { type: String, default: "" }, // base64
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);