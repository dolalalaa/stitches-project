const dotenv = require("dotenv");
dotenv.config();

const express  = require("express");
const cors     = require("cors");
const http     = require("http");
const { Server } = require("socket.io");

const connectDB        = require("./config/db");

// ──  Routes ──
const paymentRoutes    = require("./routes/paymentRoutes");
const measurementRoutes = require("./routes/measurementRoutes");
const profileRoutes    = require("./routes/profileRoutes");
const chatRoutes       = require("./routes/chatRoutes");
const authRoutes       = require("./routes/authRoutes");

// ── Samee's Routes & Models ──
const magazineRoutes = require("./routes/magazineRoutes");
const fabricRoutes = require('./routes/fabricRoutes');
const commentRoutes = require("./routes/commentRoutes");
const customizationRoutes = require("./routes/customizationRoutes");

const Mannequin = require("./models/Mannequin");
const Kurta = require("./models/Kurta");
const Sleeve = require("./models/Sleeve");
const Neck = require("./models/Neck");
const Lace_base = require("./models/Lace_base");

const app    = express();
const server = http.createServer(app);

// ── Socket.io — allow both 3000 and 5173 ──────────────────────
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

// ── Connect to MongoDB ────────────────────────────────────────
connectDB();

// ── Middleware — allow both ports ─────────────────────────────
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ──  Route Usage ──────────────────────────────────────
app.use("/api/payment",      paymentRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/profile",      profileRoutes);
app.use("/api/chat",         chatRoutes);
app.use("/api/auth",         authRoutes);

// ── Samee's Route Usage ───────────────────────────────────────
app.use("/api/magazine", magazineRoutes);
app.use('/api/fabrics', fabricRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/customize", customizationRoutes);

// Samee's Custom GET Endpoints
app.get("/api/mannequin/:size", async (req, res) => {
  try {
    const mannequin = await Mannequin.findOne({ size: req.params.size });
    if (!mannequin) return res.status(404).json({ message: "Mannequin not found" });
    res.json(mannequin);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get("/api/sleeves/:size", async (req, res) => {
  try {
    const sleeves = await Sleeve.find({ size: req.params.size });
    res.json(sleeves);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get("/api/kurtas/:size", async (req, res) => {
  try {
    const kurtas = await Kurta.find({ size: req.params.size });
    console.log(`Found ${kurtas.length} kurtas for size ${req.params.size}`);
    res.json(kurtas);
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
});

app.get("/api/necks/:size", async (req, res) => {
  try {
    const necks = await Neck.find({ size: req.params.size });
    res.json(necks);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get("/api/laces/:kurtaId", async (req, res) => {
  try {
    // We now search by the Kurta's Object ID
    const laces = await Lace_base.find({ compatibleKurta: req.params.kurtaId });
    res.json(laces);
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Unified Stitches API is running 🚀" });
});

// ── Socket.io real-time chat (Teammate's Logic) ───────────────
const Message = require("./models/Message");

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);
  socket.on("join_room", (room) => socket.join(room));
  socket.on("load_messages", async (room) => {
    try {
      const messages = await Message.find({ room }).sort({ createdAt: 1 }).limit(50);
      socket.emit("message_history", messages);
    } catch (err) { console.error(err); }
  });
  socket.on("send_message", async (msg) => {
    try {
      const saved = await Message.create({
        room:   msg.room,
        sender: msg.sender,
        text:   msg.text  || null,
        image:  msg.image || null,
        audio:  msg.audio || null,
        time:   msg.time,
      });
      io.to(msg.room).emit("receive_message", saved);
    } catch (err) { console.error(err); }
  });
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});