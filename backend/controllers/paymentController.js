const Order = require("../models/Order");

const createPaymentIntent = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { amount, currency, customerName, customerEmail, items } = req.body;

  if (!amount || !currency || !customerName || !customerEmail) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, currency, receipt_email: customerEmail,
      metadata: { customerName, customerEmail },
    });

    const order = await Order.create({
      customerName, customerEmail, amount, currency,
      stripePaymentIntentId: paymentIntent.id,
      status: "pending", items: items || [],
    });

    res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret, orderId: order._id });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const confirmPayment = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { paymentIntentId, orderId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const newStatus = paymentIntent.status === "succeeded" ? "succeeded" : "failed";
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });
    res.status(200).json({ success: true, status: newStatus, order: updatedOrder });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPaymentIntent, confirmPayment };