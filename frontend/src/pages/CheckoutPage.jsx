import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "../components/PaymentForm";
import { createPaymentIntent } from "../services/paymentService";
import "../styles.css";

const stripePromise = loadStripe("pk_test_51TJrXtFmqPq0E72ilzj6zsqcBo3ViU18ed9Ilf0L2xTpJHP5Uz99Usfj5mBGAccvsiCa5jjdMHwdPCkj4pvm9Fgx0057r2eKHi");

const cartItems = [
  { productName: "Custom Kurta (Navy Blue)",     quantity: 1, totalPrice: 1200 },
  { productName: "Tailored Trousers (Charcoal)", quantity: 2, totalPrice: 1800 },
  { productName: "Embroidered Panjabi",           quantity: 1, totalPrice: 950  },
];
const totalAmount = 3950;

const OrderSummary = () => (
  <div className="card">
    <h3 className="card-title">🛍️ Order Summary</h3>
    {cartItems.map((item, i) => (
      <div key={i} className="order-item">
        <span className="order-item-name">
          {item.productName}{" "}
          <span className="order-item-qty">×{item.quantity}</span>
        </span>
        <span className="order-item-price">৳{item.totalPrice}</span>
      </div>
    ))}
    <div className="order-total">
      <span>Total</span>
      <span className="order-total-amount">৳{totalAmount}</span>
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
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId]           = useState(null);
  const [status, setStatus]             = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "" });

  useEffect(() => {
    // ✅ Get logged-in user from localStorage
    const stored = localStorage.getItem("stitches_user");
    const user = stored ? JSON.parse(stored) : {};
    setCustomerInfo({ name: user.name || "Customer", email: user.email || "" });
  }, []);

  useEffect(() => {
    if (!customerInfo.name || customerInfo.name === "") return;

    const initPayment = async () => {
      setStatus("loading");
      try {
        const data = await createPaymentIntent({
          amount:        totalAmount * 100,
          currency:      "bdt",
          customerName:  customerInfo.name,
          customerEmail: customerInfo.email,
          items:         cartItems,
          totalPrice:    totalAmount,
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
  }, [customerInfo]);

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
            <OrderSummary />
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