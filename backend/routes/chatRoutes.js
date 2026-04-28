// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// GET messages for a room
router.get("/:room", async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .sort({ createdAt: 1 }).limit(50);
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;