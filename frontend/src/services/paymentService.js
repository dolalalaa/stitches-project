// services/paymentService.js
const API_BASE = "http://localhost:5000/api/payment";

export const createPaymentIntent = async ({ amount, currency, customerName, customerEmail, items, totalPrice }) => {
  const response = await fetch(`${API_BASE}/create-payment-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency, customerName, customerEmail, items, totalPrice }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create payment intent.");
  }

  return data;
};

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

  return data;
};