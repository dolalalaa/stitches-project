const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// 1. Import ALL Routes

const magazineRoutes = require("./routes/magazineRoutes");
const paymentRoutes = require("./routes/paymentRoutes"); // Her Route
const fabricRoutes = require('./routes/fabricRoutes');
const commentRoutes = require("./routes/commentRoutes");
const customizationRoutes = require("./routes/customizationRoutes");

const Mannequin = require("./models/Mannequin");
const Kurta = require("./models/Kurta");
const Sleeve = require("./models/Sleeve");
const Neck = require("./models/Neck");
const Lace = require("./models/Lace_base");


dotenv.config();

const app = express();

// 2. Connect to Database
connectDB();

// 3. Middleware
// We'll use her specific CORS but allow your local dev as well
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"] })); 
app.use(express.json());

// 4. Use ALL Routes

app.use("/api/magazine", magazineRoutes);
app.use("/api/payment", paymentRoutes); // Added her payment route
app.use('/api/fabrics', fabricRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/customize", customizationRoutes);

// Get mannequin by size
app.get("/api/mannequin/:size", async (req, res) => {
  try {
    const mannequin = await Mannequin.findOne({ size: req.params.size });
    if (!mannequin) {
      return res.status(404).json({ message: "Mannequin not found" });
    }
    res.json(mannequin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/sleeves/:size", async (req, res) => {
  try {
    const sleeves = await Sleeve.find({ size: req.params.size });
    res.json(sleeves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get necks by size
app.get("/api/necks/:size", async (req, res) => {
  try {
    const necks = await Neck.find({ size: req.params.size });
    res.json(necks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/laces/:kurtaName", async (req, res) => {
  try {
    const laces = await Lace_base.find({ compatibleKurta: req.params.kurtaName });
    res.json(laces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. Health Check
app.get("/", (req, res) => {
  res.json({ message: "Unified Stitches API is running 🚀" });
});

// 6. Define Port (Pick one and stick to it!)
const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});