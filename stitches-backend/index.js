const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Product = require("./models/Product");
const Order = require("./models/Order");

const app = express();
const PORT = 1206;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Database Connection ──────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err.message));

// ─── In-memory cart (per session, beginner-friendly) ──────────
// Note: In a real app this would be saved in DB per user
let cart = [];

// ════════════════════════════════════════════════════════════════
//  HOME
// ════════════════════════════════════════════════════════════════
app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to Stitches Backend API 🧵" });
});

// ════════════════════════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════════════════════════

// Get all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single product by ID
app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new product (for seeding/testing)
app.post("/product/create", async (req, res) => {
  try {
    const newProduct = new Product({
      name: req.body.name,
      type: req.body.type,
      stock: req.body.stock,
      price: req.body.price,
      currency: req.body.currency || "BDT",
      image: req.body.image,
    });
    await newProduct.save();
    res.json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a product by ID (for cleanup/testing)
app.delete("/product/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted", product: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ════════════════════════════════════════════════════════════════
//  CART
// ════════════════════════════════════════════════════════════════

// Add item to cart
app.post("/cart/add", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ success: false, message: "productId and quantity are required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
    }

    // Check if product is already in cart
    const existingItem = cart.find((item) => item.productId === productId);

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: "Total cart quantity exceeds available stock" });
      }
      existingItem.quantity = newQty;
      existingItem.totalPrice = newQty * existingItem.unitPrice;
    } else {
      cart.push({
        productId: product._id.toString(),
        productName: product.name,
        productType: product.type,
        quantity,
        unitPrice: product.price,
        totalPrice: quantity * product.price,
        image: product.image,
      });
    }

    res.json({ success: true, message: "Successfully Added to Cart!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// View cart
app.get("/cart", (req, res) => {
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
  const { productId } = req.params;
  const itemIndex = cart.findIndex((item) => item.productId === productId);

  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: "Product not found in cart" });
  }

  cart.splice(itemIndex, 1);
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

// Place order
app.post("/order/place", async (req, res) => {
  try {
    if (cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty. Add products before placing an order." });
    }

    // Check stock for all items
    for (let item of cart) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product "${item.productName}" no longer exists` });
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Not enough stock for "${item.productName}"` });
      }
    }

    const totalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    // Save order to MongoDB
    const newOrder = new Order({
      items: [...cart],
      totalPrice,
      status: "Placed",
    });
    await newOrder.save();

    // Deduct stock for each product
    for (let item of cart) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    cart = [];

    res.json({
      success: true,
      message: "Order placed successfully!",
      orderId: newOrder._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get order by ID
app.get("/order/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
