const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

// ── User model ───────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  phone:     { type: String, default: '' },
  password:  { type: String, required: true },
  role:      { type: String, default: 'customer' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// ── Shop model (for auto-creating profile on register) ──────
const shopSchema = new mongoose.Schema({
  userId:         { type: String, required: true, unique: true },
  shopName:       { type: String, default: '' },
  ownerName:      { type: String, default: '' },
  email:          { type: String, default: '' },
  phone:          { type: String, default: '' },
  address:        { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  isVerified:     { type: Boolean, default: false },
  createdAt:      { type: Date, default: Date.now },
});

const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);

// ── REGISTER ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'An account with this email already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const finalRole = role === 'shopkeeper' ? 'shopOwner' : (role || 'customer');

    const user = new User({
      name, email, phone: phone || '', password: hashed, role: finalRole,
    });
    await user.save();

    // Auto-create shop profile if registering as shop owner
    if (finalRole === 'shopOwner' || finalRole === 'shopkeeper') {
      const existingShop = await Shop.findOne({ userId: user._id.toString() });
      if (!existingShop) {
        await new Shop({
          userId:    user._id.toString(),
          shopName:  name + "'s Shop",
          ownerName: name,
          email:     email,
          phone:     phone || '',
        }).save();
      }
    }

    // ✅ name is now included in the token payload
    const token = jwt.sign(
      { _id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'stitches_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── LOGIN ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'No account found with this email.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Incorrect password.' });

    // ✅ name is now included in the token payload
    const token = jwt.sign(
      { _id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'stitches_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;