const express = require("express");
const router  = express.Router();
const Order   = require("../models/Order");
const Product = require("../models/Product");
const Shop    = require("../models/Shop");

// ════════════════════════════════════════════════════════════════
//  SHOP OWNER — PROFILE
// ════════════════════════════════════════════════════════════════

router.get("/profile/:userId", async (req, res) => {
  try {
    const shop = await Shop.findOne({ userId: req.params.userId });
    if (!shop) return res.json({ success: false, message: "Profile not found" });
    res.json({ success: true, shop });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post("/profile", async (req, res) => {
  try {
    const { userId, shopName, ownerName, email, phone, address, profilePicture } = req.body;
    if (!userId || !ownerName || !email)
      return res.status(400).json({ success: false, message: "userId, ownerName and email are required" });

    const existing = await Shop.findOne({ userId });
    if (existing) return res.json({ success: true, shop: existing, message: "Profile already exists" });

    const shop = new Shop({
      userId, shopName: shopName || ownerName + "'s Shop",
      ownerName, email, phone: phone || "", address: address || "", profilePicture: profilePicture || ""
    });
    await shop.save();
    res.json({ success: true, shop });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.patch("/profile/:userId", async (req, res) => {
  try {
    const { shopName, ownerName, phone, address, profilePicture } = req.body;
    const updates = {};
    if (shopName       !== undefined) updates.shopName       = shopName;
    if (ownerName      !== undefined) updates.ownerName      = ownerName;
    if (phone          !== undefined) updates.phone          = phone;
    if (address        !== undefined) updates.address        = address;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    const shop = await Shop.findOneAndUpdate({ userId: req.params.userId }, updates, { new: true });
    if (!shop) return res.status(404).json({ success: false, message: "Profile not found" });
    res.json({ success: true, shop });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ════════════════════════════════════════════════════════════════
//  SHOP OWNER — ORDERS (filtered by shopId)
// ════════════════════════════════════════════════════════════════

// GET /dashboard/orders?userId=xxx
router.get("/orders", async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { shopId: userId } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Accepted", "Rejected", "Completed", "Placed", "Pending"];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(", ")}` });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ════════════════════════════════════════════════════════════════
//  SHOP OWNER — PRODUCTS (filtered by shopId)
// ════════════════════════════════════════════════════════════════

// GET /dashboard/products?userId=xxx
router.get("/products", async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { shopId: userId } : {};
    const products = await Product.find(query).sort({ name: 1 });
    res.json({ success: true, products });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const { name, price, stock, image, type } = req.body;
    const updates = {};
    if (name  !== undefined) updates.name  = name;
    if (price !== undefined) updates.price = Number(price);
    if (stock !== undefined) updates.stock = Number(stock);
    if (image !== undefined) updates.image = image;
    if (type  !== undefined) updates.type  = type;
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// POST /dashboard/products — automatically assigns shopId from userId
router.post("/products", async (req, res) => {
  try {
    const { name, type, stock, price, image, userId } = req.body;
    if (!name || !price || !stock)
      return res.status(400).json({ success: false, message: "name, price and stock are required" });

    // Use userId directly as shopId — no Shop profile lookup needed
    const product = new Product({
      name, type: type || "General",
      stock: Number(stock), price: Number(price),
      currency: "BDT", image: image || "",
      shopId: userId || "",
    });
    await product.save();
    res.json({ success: true, product });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ════════════════════════════════════════════════════════════════
//  PUBLIC — SHOP PAGE
//  GET /dashboard/shop/:shopId  — public, for customers
// ════════════════════════════════════════════════════════════════

router.get("/shop/:shopId", async (req, res) => {
  try {
    const shop = await Shop.findOne({ userId: req.params.shopId });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    const products = await Product.find({ shopId: req.params.shopId });
    res.json({ success: true, shop, products });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ════════════════════════════════════════════════════════════════
//  ADMIN — SHOPS
// ════════════════════════════════════════════════════════════════

router.get("/shops", async (req, res) => {
  try {
    const shops = await Shop.find().sort({ createdAt: -1 });
    res.json({ success: true, shops });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.patch("/shops/:id/verify", async (req, res) => {
  try {
    const { isVerified } = req.body;
    const shop = await Shop.findByIdAndUpdate(req.params.id, { isVerified }, { new: true });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
    res.json({ success: true, shop });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;