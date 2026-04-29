const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  userId:         { type: String, required: true, unique: true }, // links to User._id
  shopName:       { type: String, required: true },
  ownerName:      { type: String, required: true },
  email:          { type: String, required: true, unique: true },
  phone:          { type: String, default: "" },
  address:        { type: String, default: "" },
  profilePicture: { type: String, default: "" }, // base64 string
  isVerified:     { type: Boolean, default: false },
  createdAt:      { type: Date, default: Date.now },
});

module.exports = mongoose.model("Shop", shopSchema);
