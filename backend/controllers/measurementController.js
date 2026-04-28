// controllers/measurementController.js
const Measurement = require("../models/Measurement");

/**
 * @route  POST /api/measurements/save
 * @desc   Save user measurements to MongoDB
 */
const saveMeasurement = async (req, res) => {
  const { shoulder, chest, waist, hip, armLength } = req.body;

  if (!shoulder || !chest || !waist || !hip || !armLength) {
    return res.status(400).json({
      success: false,
      message: "All measurements are required.",
    });
  }

  try {
    const measurement = await Measurement.create({
      shoulder: Number(shoulder),
      chest: Number(chest),
      waist: Number(waist),
      hip: Number(hip),
      armLength: Number(armLength),
    });

    res.status(201).json({
      success: true,
      message: "Measurements saved successfully!",
      data: measurement,
    });
  } catch (error) {
    console.error("❌ Save measurement error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route  GET /api/measurements/latest
 * @desc   Get the latest saved measurements (for profile page)
 */
const getLatestMeasurement = async (req, res) => {
  try {
    const measurement = await Measurement.findOne().sort({ createdAt: -1 });
    if (!measurement) {
      return res.status(404).json({ success: false, message: "No measurements found." });
    }
    res.status(200).json({ success: true, data: measurement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { saveMeasurement, getLatestMeasurement };