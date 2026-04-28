// config/db.js - MongoDB connection using Mongoose
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

   
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Combined the descriptive text with the actual error object
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;