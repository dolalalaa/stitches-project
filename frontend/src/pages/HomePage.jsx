// frontend/pages/HomePage.jsx
import React, { useState, useEffect } from "react"; // Added hooks
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./HomePage.css"; 

const HomePage = () => {
  const navigate = useNavigate();
  const customerName = localStorage.getItem("customerName") || "User";
  
  // 1. Set up state to hold the real data
  const [measurements, setMeasurements] = useState({
    chest: "--", 
    waist: "--", 
    armLength: "--" 
  });

  // 2. Fetch the latest data from your profile API
  useEffect(() => {
    const getMyData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/measurements/latest");
        const data = await res.json();
        if (data.success && data.data) {
          // This matches the data your ProfilePage uses
          setMeasurements(data.data);
        }
      } catch (err) {
        console.error("Could not fetch measurements:", err);
      }
    };
    getMyData();
  }, []);

  return (
    <div className="hp-container">
      <Sidebar active="home" />
      
      <div className="hp-main-content">
        <header className="hp-header">
          <div className="brand-logo">
            <span className="brand-icon">✂️</span>
            <span className="brand-text" style={{ fontSize: "20px" }}>Stitches</span>
          </div>

          <div className="hp-profile-box" onClick={() => navigate("/profile")}>
            <span className="hp-user-name">{customerName}</span>
            <div className="hp-avatar">{customerName[0]?.toUpperCase()}</div>
          </div>
        </header>

        <main className="hp-scroll-area">
          <section className="hp-hero">
            <div className="hp-hero-text">
              <h1>Welcome to Stitches, {customerName}! 👋</h1>
              <p>Your perfect fit is just a conversation away. Ready to design today?</p>
              <button className="hp-cta-btn" onClick={() => navigate("/measurements")}>
                Start a New Design
              </button>
            </div>
            <div className="hp-hero-icon">🧵</div>
          </section>

          <div className="hp-data-grid">
            <div className="hp-data-card">
              <div className="hp-card-title">
                <h3>Latest Measurements</h3>
                <button className="hp-edit-link" onClick={() => navigate("/measurements")}>Update</button>
              </div>
              <div className="hp-m-list">
                {/* 3. Displaying the real values from the API */}
                <div className="hp-m-row"><span>Chest:</span> <strong>{measurements.chest} cm</strong></div>
                <div className="hp-m-row"><span>Waist:</span> <strong>{measurements.waist} cm</strong></div>
                <div className="hp-m-row"><span>Length:</span> <strong>{measurements.armLength || measurements.length || "--"} cm</strong></div>
              </div>
            </div>

            <div className="hp-data-card">
              <h3>Recent Orders</h3>
              <div className="hp-order-item">
                <div>
                  <span className="hp-order-number">Order #1024</span>
                  <span className="hp-order-date">Active</span>
                </div>
                <div className="hp-order-side">
                  <span className="hp-status-tag in-progress">Processing</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;