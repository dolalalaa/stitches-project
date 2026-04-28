// routes/measurementRoutes.js
const express = require("express");
const router = express.Router();
const { saveMeasurement, getLatestMeasurement } = require("../controllers/measurementController");

router.post("/save", saveMeasurement);
router.get("/latest", getLatestMeasurement);

module.exports = router;