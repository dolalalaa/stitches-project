// models/Order.js - Mongoose model to store order/payment records
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // User's name on the order
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    // User's email address
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Total amount in cents (Stripe works in smallest currency unit)
    amount: {
      type: Number,
      required: true,
    },

    // Currency code, e.g., "usd"
    currency: {
      type: String,
      default: "usd",
    },

    // Stripe PaymentIntent ID for reference & tracking
    stripePaymentIntentId: {
      type: String,
      required: true,
    },

    // Payment status: pending → succeeded or failed
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },

    // Order items (flexible array of product objects)
    items: [
      {
        name: String,
        quantity: Number,
        price: Number, // price in cents
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Order", orderSchema);