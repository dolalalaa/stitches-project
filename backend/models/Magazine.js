const mongoose = require("mongoose");

const magazineSchema = new mongoose.Schema({

  title: String,

  description: String,

  image: String,

  url: String,

  source: String,

  publishedAt: Date,

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 31536000
  }

});

module.exports = mongoose.model("Magazine", magazineSchema);