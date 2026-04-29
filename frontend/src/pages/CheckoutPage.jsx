import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "../components/PaymentForm";
import { createPaymentIntent } from "../services/paymentService";
import "../styles.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const OrderSummary = ({ items, amount }) => (
  <div className="card">
    <h3 className="card-title">🛍️ Order Summary</h3>
    {items.length === 0 ? (
      <p style={{ color: "#999", fontSize: "14px" }}>No orders found.</p>
    ) : (
      items.map((item, i) => (
        <div key={i} className="order-item">
          <span className="order-item-name">
            {item.productName || item.name}{" "}
            <span className="order-item-qty">×{item.quantity}</span>
          </span>
          <span className="order-item-price">৳{item.totalPrice || item.price}</span>
        </div>
      ))
    )}
    <div className="order-total">
      <span>Total</span>
      <span className="order-total-amount">৳{amount}</span>
    </div>
  </div>
);

const SuccessMessage = () => (
  <div className="success-box">
    <div className="success-icon">✅</div>
    <h2 className="success-title">Payment Successful!</h2>
    <p className="success-subtitle">Thank you for your order!</p>
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
  const [clientSecret, setClientSecret]   = useState(null);
  const [orderId, setOrderId]             = useState(null);
  const [status, setStatus]               = useState("idle");
  const [errorMessage, setErrorMessage]   = useState("");
  const [cartItems, setCartItems]         = useState([]);
  const [totalAmount, setTotalAmount]     = useState(0);
  const [customerInfo, setCustomerInfo]   = useState({ name: "", email: "" });

  useEffect(() => {
    // Get logged-in user info
    const stored = localStorage.getItem("stitches_user");
    const user = stored ? JSON.parse(stored) : {};
    setCustomerInfo({ name: user.name || "Customer", email: user.email || "" });

    // Fetch cart from friend's backend (port 1206)
    const userId = user._id;
    if (userId) {
      fetch(`http://localhost:1206/cart?userId=${userId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setCartItems(data.cartItems || []);
            setTotalAmount(data.totalAmount || 0);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (totalAmount <= 0) return;
    const initPayment = async () => {
      setStatus("loading");
      try {
        const data = await createPaymentIntent({
          amount:        totalAmount * 100, // in paisa
          currency:      "bdt",
          customerName:  customerInfo.name,
          customerEmail: customerInfo.email,
          items:         cartItems,
        });
        setClientSecret(data.clientSecret);
        setOrderId(data.orderId);
        setStatus("idle");
      } catch (err) {
        setErrorMessage(err.message || "Could not initialize payment.");
        setStatus("error");
      }
    };
    initPayment();
  }, [totalAmount]);

  const handleSuccess = () => setStatus("success");
  const handleError   = (msg) => { setErrorMessage(msg); setStatus("error"); };
  const handleRetry   = () => window.location.reload();

  return (
    <div>
      <header className="header">
        <div className="header-inner">
          <div className="header-logo"><span>✂️</span><span>Stitches</span></div>
          <span className="header-badge">🔒 Secure Checkout</span>
        </div>
      </header>

      <main className="main">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Complete your order securely</p>

        <div className="checkout-grid">
          <div className="left-col">
            <OrderSummary items={cartItems} amount={totalAmount} />
            <div className="card">
              <h3 className="card-title">👤 Customer Info</h3>
              <p className="customer-name">{customerInfo.name}</p>
              <p className="customer-email">{customerInfo.email}</p>
            </div>
          </div>

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
                    amount={totalAmount}
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                )}
              </Elements>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">© 2024 Stitches · Payments secured by Stripe</footer>
    </div>
  );
};

export default CheckoutPage;