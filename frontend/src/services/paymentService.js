// services/paymentService.js
// Handles all API calls to the backend related to payments
// The frontend NEVER touches the Stripe secret key — only the public key

const API_BASE = "http://localhost:5000/api/payment";

/**
 * Calls backend to create a Stripe PaymentIntent.
 * Returns clientSecret used by Stripe Elements to confirm payment.
 */
export const createPaymentIntent = async ({ amount, currency, customerName, customerEmail, items }) => {
  const response = await fetch(`${API_BASE}/create-payment-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency, customerName, customerEmail, items }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create payment intent.");
  }

  return data; // { success, clientSecret, orderId }
};

/**
 * Notifies backend that payment was confirmed by Stripe on frontend.
 * Backend verifies with Stripe and updates order status in MongoDB.
 */
export const confirmPaymentOnServer = async ({ paymentIntentId, orderId }) => {
  const response = await fetch(`${API_BASE}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentIntentId, orderId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to confirm payment.");
  }

  return data; // { success, status, order }
};