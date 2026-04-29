const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Profile = require("../models/Profile");
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

// GET all shops a customer has chatted with
router.get("/shops/:customerName", async (req, res) => {
  try {
    const { customerName } = req.params;
    const rooms = await Message.find({
      room: new RegExp(`^${customerName}_`)
    }).distinct("room");

    const shops = rooms.map((room) => ({
      id:   room,
      name: room.replace(`${customerName}_`, ""),
    }));

    res.json({ success: true, shops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all unique customers who chatted with a shop
router.get("/rooms/:shopName", async (req, res) => {
  try {
    const { shopName } = req.params;
    const rooms = await Message.find({
      room: new RegExp(`_${shopName}$`)
    }).distinct("room");

    const customers = await Promise.all(rooms.map(async (room) => {
      const name = room.replace(`_${shopName}`, "");
      const profile = await Profile.findOne({ name });
      return {
        id:         room,
        name:       name,
        customerId: profile ? profile.userId : null,
      };
    }));

    res.json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;