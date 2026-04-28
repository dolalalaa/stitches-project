// frontend/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Role Redirection Logic
    if (role === "customer") {
      navigate("/home"); // Customer goes to Homepage first
    } else {
      navigate("/shop-chat"); // Shopkeeper goes to their dashboard
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-wrap">
            <div className="brand-logo">
                <span className="brand-icon">✂️</span>
                <span className="brand-text">Stitches</span>
            </div>
        </div> 
        <h2>Welcome Back</h2>
        <p>Login to your account</p>
        <form onSubmit={handleLogin}>
          <div className="auth-group">
            <label>Email</label>
            <input type="email" required onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="auth-group">
            <label>Password</label>
            <input type="password" required onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="auth-group">
            <label>Login as:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="shopkeeper">Shopkeeper</option>
            </select>
          </div>
          <button type="submit" className="auth-btn">Login</button>
        </form>
        <div className="auth-toggle">
          Don't have an account? <span onClick={() => navigate("/register")}>Register</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;