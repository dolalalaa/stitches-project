const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
require("dotenv").config();

const Product   = require("./models/Product");
const Order     = require("./models/Order");
const Shop      = require("./models/Shop");
const dashboard = require("./routes/dashboard");

const app  = express();
const PORT = 1206;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/dashboard", dashboard);

// ─── Database Connection ──────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected on port 1206"))
  .catch((err) => console.log("❌ MongoDB connection error:", err.message));

// ─── Per-user cart (keyed by userId) ─────────────────────────
// Each user gets their own cart using their _id as key
const carts = {};

function getCart(userId) {
  if (!userId) return [];
  if (!carts[userId]) carts[userId] = [];
  return carts[userId];
}

function setCart(userId, cart) {
  if (!userId) return;
  carts[userId] = cart;
}

// ════════════════════════════════════════════════════════════════
//  HOME
// ════════════════════════════════════════════════════════════════
app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to Stitches Backend API 🧵" });
});

// ════════════════════════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════════════════════════

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/product/create", async (req, res) => {
  try {
    const newProduct = new Product({
      name:     req.body.name,
      type:     req.body.type,
      stock:    req.body.stock,
      price:    req.body.price,
      currency: req.body.currency || "BDT",
      image:    req.body.image,
      shopId:   req.body.shopId || "",
    });
    await newProduct.save();
    res.json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/product/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted", product: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ════════════════════════════════════════════════════════════════
//  CART — per user using userId
// ════════════════════════════════════════════════════════════════

// Add item to cart
// Frontend must send: { productId, quantity, userId }
app.post("/cart/add", async (req, res) => {
  try {
    const { productId, quantity, userId } = req.body;

    if (!productId || !quantity)
      return res.status(400).json({ success: false, message: "productId and quantity are required" });

    if (quantity <= 0)
      return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (quantity > product.stock)
      return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });

    const cart = getCart(userId);
    const existingItem = cart.find((item) => item.productId === productId);

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock)
        return res.status(400).json({ success: false, message: "Total cart quantity exceeds available stock" });
      existingItem.quantity   = newQty;
      existingItem.totalPrice = newQty * existingItem.unitPrice;
    } else {
      cart.push({
        productId:   product._id.toString(),
        productName: product.name,
        productType: product.type,
        quantity,
        unitPrice:   product.price,
        totalPrice:  quantity * product.price,
        image:       product.image,
        shopId:      product.shopId || "",
      });
    }

    setCart(userId, cart);
    res.json({ success: true, message: "Successfully Added to Cart!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// View cart — frontend sends ?userId=xxx
app.get("/cart", (req, res) => {
  const { userId } = req.query;
  const cart = getCart(userId);
  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  res.json({
    success: true,
    cartItems: cart,
    totalAmount,
    currency: "BDT",
    isEmpty: cart.length === 0,
  });
});

// Remove item from cart
app.delete("/cart/remove/:productId", (req, res) => {
  const { productId }  = req.params;
  const { userId }     = req.query;
  const cart           = getCart(userId);
  const itemIndex      = cart.findIndex((item) => item.productId === productId);

  if (itemIndex === -1)
    return res.status(404).json({ success: false, message: "Product not found in cart" });

  cart.splice(itemIndex, 1);
  setCart(userId, cart);
  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  res.json({
    success: true,
    message: "Item removed from cart",
    cartItems: cart,
    totalAmount,
    isEmpty: cart.length === 0,
  });
});

// ════════════════════════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════════════════════════

app.post("/order/place", async (req, res) => {
  try {
    const { userId, source } = req.body;
    const cart = getCart(userId);

    if (cart.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty." });

    // Check stock for all items
    for (let item of cart) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res.status(404).json({ success: false, message: `Product "${item.productName}" no longer exists` });
      if (item.quantity > product.stock)
        return res.status(400).json({ success: false, message: `Not enough stock for "${item.productName}"` });
    }

    const totalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    // Get shopId from first cart item (already stored on cart item)
    const shopId = cart[0]?.shopId || "";

    const newOrder = new Order({
      items:      [...cart],
      totalPrice,
      status:     source === "design" ? "Pending" : "Placed",
      source:     source || "product",
      shopId,
    });
    await newOrder.save();

    // Deduct stock
    for (let item of cart) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear this user's cart
    setCart(userId, []);

    res.json({
      success: true,
      message: "Order placed successfully!",
      orderId: newOrder._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/order/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ════════════════════════════════════════════════════════════════
//  MANNEQUIN — calls Python microservice on port 5001
// ════════════════════════════════════════════════════════════════
const fetch = (...args) =>
  import("node-fetch").then(({ default: f }) => f(...args));

app.post("/mannequin/generate", async (req, res) => {
  try {
    const { shoulder, chest, waist, hip, armLength } = req.body;
    if (!chest || !waist || !hip || !armLength)
      return res.status(400).json({ success: false, message: "Required: chest, waist, hip, armLength" });

    const response = await fetch("http://localhost:5001/generate", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shoulder: shoulder || 100, chest, waist, hip, armLength }),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not connect to mannequin service.", error: error.message });
  }
});

app.get("/mannequin/file/:mannequinId", async (req, res) => {
  try {
    const { mannequinId } = req.params;
    const response = await fetch(`http://localhost:5001/mannequin/${mannequinId}`);
    if (!response.ok)
      return res.status(404).json({ success: false, message: "Mannequin file not found." });
    res.setHeader("Content-Type", "model/gltf-binary");
    res.setHeader("Content-Disposition", `inline; filename="mannequin_${mannequinId}.glb"`);
    response.body.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch mannequin file.", error: error.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});