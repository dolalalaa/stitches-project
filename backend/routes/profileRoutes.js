const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profileController");
const auth = require("../middleware/auth");
const Profile = require("../models/Profile");

router.get("/",       auth, getProfile);
router.put("/update", auth, updateProfile);

router.get("/user/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) return res.json({ success: false, message: "Profile not found" });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;