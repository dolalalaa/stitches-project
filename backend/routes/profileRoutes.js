// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profileController");

router.get("/", getProfile);
router.put("/update", updateProfile);

module.exports = router;