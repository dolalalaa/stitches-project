// pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "../components/PaymentForm";
import { createPaymentIntent } from "../services/paymentService";
import "../styles.css";


console.log("Stripe public key:", process.env.REACT_APP_STRIPE_PUBLIC_KEY);
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const ORDER = {
  customerName: "Rahim Hossain",
  customerEmail: "rahim@example.com",
  currency: "usd",
  amount: 4999,
  items: [
    { name: "Custom Tailored Kurta", quantity: 1, price: 3500 },
    { name: "Measurement Consultation", quantity: 1, price: 1499 },
  ],
};

const OrderSummary = ({ items, amount }) => (
  <div className="card">
    <h3 className="card-title">🛍️ Order Summary</h3>
    {items.map((item, i) => (
      <div key={i} className="order-item">
        <span className="order-item-name">
          {item.name} <span className="order-item-qty">×{item.quantity}</span>
        </span>
        <span className="order-item-price">${(item.price / 100).toFixed(2)}</span>
      </div>
    ))}
    <div className="order-total">
      <span>Total</span>
      <span className="order-total-amount">${(amount / 100).toFixed(2)}</span>
    </div>
  </div>
);

const SuccessMessage = () => (
  <div className="success-box">
    <div className="success-icon">✅</div>
    <h2 className="success-title">Payment Successful!</h2>
    <p className="success-subtitle">Thank you for your order. A confirmation email will be sent shortly.</p>
    <div className="success-banner">🎉 Your custom outfit is being prepared!</div>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="error-box">
    <div className="error-icon">❌</div>
    <h2 className="error-title">Payment Failed</h2>
    <p className="error-subtitle">{message}</p>
    <button className="retry-button" onClick={onRetry}>Try Again</button>
  </div>
);

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initPayment = async () => {
      setStatus("loading");
      try {
        const data = await createPaymentIntent(ORDER);
        setClientSecret(data.clientSecret);
        setOrderId(data.orderId);
        setStatus("idle");
      } catch (err) {
        setErrorMessage(err.message || "Could not initialize payment.");
        setStatus("error");
      }
    };
    initPayment();
  }, []);

  const handleSuccess = () => setStatus("success");
  const handleError = (msg) => { setErrorMessage(msg); setStatus("error"); };
  const handleRetry = () => window.location.reload();

  return (
    <div>
      <header className="header">
        <div className="header-inner">
          <div className="header-logo">
            <span>✂️</span>
            <span>Sti<span className="accent">tch</span>es</span>
          </div>
          <span className="header-badge">🔒 Secure Checkout</span>
        </div>
      </header>

      <main className="main">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Complete your order securely using Stripe</p>

        <div className="checkout-grid">
          {/* Left Column */}
          <div className="left-col">
            <OrderSummary items={ORDER.items} amount={ORDER.amount} />

            <div className="card">
              <h3 className="card-title">👤 Customer Info</h3>
              <p className="customer-name">{ORDER.customerName}</p>
              <p className="customer-email">{ORDER.customerEmail}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="card">
            <h2 className="payment-section-title">💳 Payment Details</h2>

            {status === "loading" && (
              <div className="loading-state">
                <div className="loading-spinner-large" />
                <span>Initializing payment...</span>
              </div>
            )}

            {status === "success" && <SuccessMessage />}

            {status === "error" && !clientSecret && (
              <ErrorMessage message={errorMessage} onRetry={handleRetry} />
            )}

            {clientSecret && status !== "success" && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                {status === "error" ? (
                  <ErrorMessage message={errorMessage} onRetry={handleRetry} />
                ) : (
                  <PaymentForm
                    clientSecret={clientSecret}
                    orderId={orderId}
                    amount={ORDER.amount}
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                )}
              </Elements>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        © 2024 Stitches · Payments secured by Stripe
      </footer>
    </div>
  );
};

export default CheckoutPage;