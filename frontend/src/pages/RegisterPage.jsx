// frontend/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", role: "customer"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // 1. Save data to localStorage immediately for the session
    localStorage.setItem("userRole", formData.role);
    localStorage.setItem("customerName", formData.name);
    localStorage.setItem("token", "dummy-token-for-now"); // Simulate login token

    alert("Registration Successful! Welcome to Stitches.");
    
    // 2. Direct navigation to dashboard/homepage based on role
    if (formData.role === "customer") {
      navigate("/home");
    } else {
      navigate("/shop-chat");
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
        <h2>Create Account</h2>
        <p>Join the Stitches community</p>
        <form onSubmit={handleSubmit}>
          <div className="auth-group">
            <label>Full Name</label>
            <input type="text" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="auth-group">
            <label>Email</label>
            <input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="auth-group">
            <label>Phone Number</label>
            <input type="tel" required onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="auth-group">
            <label>Password</label>
            <input type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="auth-group">
            <label>I am a:</label>
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="customer">Customer</option>
              <option value="shopkeeper">Shopkeeper</option>
            </select>
          </div>
          <button type="submit" className="auth-btn">Register & Enter</button>
        </form>
        <div className="auth-toggle">
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;