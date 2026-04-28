const dotenv = require("dotenv");
dotenv.config();

const express  = require("express");
const cors     = require("cors");
const http     = require("http");
const { Server } = require("socket.io");

const connectDB        = require("./config/db");
const paymentRoutes    = require("./routes/paymentRoutes");
const measurementRoutes= require("./routes/measurementRoutes");
const profileRoutes    = require("./routes/profileRoutes");
const chatRoutes       = require("./routes/chatRoutes");
const authRoutes       = require("./routes/authRoutes");

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

// ── Routes ────────────────────────────────────────────────────
app.use("/api/payment",      paymentRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/profile",      profileRoutes);
app.use("/api/chat",         chatRoutes);
app.use("/api/auth",         authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Stitches API is running 🚀" });
});

// ── Socket.io real-time chat ──────────────────────────────────
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