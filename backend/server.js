// server.js - Main entry point for the Express backend
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");




//testing

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:3000" })); // Allow requests from React frontend
app.use(express.json()); // Parse incoming JSON requests

// Routes
app.use("/api/payment", paymentRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Custom-Fit Fashion API is running 🚀" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});