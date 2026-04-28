// routes/paymentRoutes.js - Defines API endpoints for payment operations
const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
} = require("../controllers/paymentController");

// POST /api/payment/create-payment-intent
// Called by frontend to get a Stripe client_secret before showing the card form
router.post("/create-payment-intent", createPaymentIntent);

// POST /api/payment/confirm
// Called by frontend after Stripe confirms the payment to update DB record
router.post("/confirm", confirmPayment);

module.exports = router;