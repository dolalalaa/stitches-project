// controllers/profileController.js
const Profile = require("../models/Profile");

// GET profile
const getProfile = async (req, res) => {
  try {
    // Using userId from token — adjust based on your auth system
    const userId = req.user?.id || req.headers["x-user-id"] || "default_user";
    let profile = await Profile.findOne({ userId });
    if (!profile) profile = await Profile.create({ userId });
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.headers["x-user-id"] || "default_user";
    const { name, gender, mobile, email, address, profilePic } = req.body;

    const updated = await Profile.findOneAndUpdate(
      { userId },
      { name, gender, mobile, email, address, profilePic },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, updateProfile };