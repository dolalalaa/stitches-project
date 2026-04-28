const Profile = require("../models/Profile");
const mongoose = require("mongoose");

// ── GET PROFILE ───────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id?.toString();
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    let profile = await Profile.findOne({ userId });

    if (!profile) {
      // Auto-create from token data (name is now in the token payload)
      profile = await Profile.create({
        userId,
        name:  req.user?.name  || "",
        email: req.user?.email || "",
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE PROFILE ────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id?.toString();
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { name, gender, mobile, email, address, profilePic } = req.body;

    const updated = await Profile.findOneAndUpdate(
      { userId },
      { name, gender, mobile, email, address, profilePic, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, updateProfile };