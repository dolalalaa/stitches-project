// components/PaymentForm.jsx
import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { confirmPaymentOnServer } from "../services/paymentService";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#1a1a2e",
      fontFamily: "'DM Sans', sans-serif",
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": { color: "#A78BFA" },
    },
    invalid: {
      color: "#e53e3e",
      iconColor: "#e53e3e",
    },
  },
};

const PaymentForm = ({ clientSecret, orderId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCardError(null);

    if (!stripe || !elements) return;

    setIsLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        setCardError(error.message);
        onError(error.message);
        setIsLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        await confirmPaymentOnServer({ paymentIntentId: paymentIntent.id, orderId });
        onSuccess();
      }
    } catch (err) {
      onError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Card Input */}
      <div className="form-group">
        <label className="form-label">Card Details</label>
        <div className="card-input-wrapper">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        {cardError && (
          <p className="card-error">⚠️ {cardError}</p>
        )}
      </div>

      {/* Total Amount */}
      <div className="amount-row">
        <span className="amount-label">Total</span>
        <span className="amount-value">${(amount / 100).toFixed(2)} USD</span>
      </div>

      {/* Pay Button */}
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="pay-button"
      >
        {isLoading ? (
          <span className="pay-button-inner">
            <span className="spinner" />
            Processing...
          </span>
        ) : (
          "💳 Pay Now"
        )}
      </button>

      {/* Security Note */}
      <p className="security-note">
        🔒 Secured by <strong>Stripe</strong> — your card info is never stored on our servers
      </p>
    </form>
  );
};

export default PaymentForm;