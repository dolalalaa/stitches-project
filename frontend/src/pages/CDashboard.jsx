// pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios"; // Make sure to install axios: npm install axios
import "./CDashboard.css";

const CDashboard = () => {
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState(null);
  const [orders, setOrders] = useState([]);

  const customerName = localStorage.getItem("customerName") || "Customer";

  useEffect(() => {
    // 1. Fetch from your Backend Controller
    const fetchMeasurements = async () => {
      try {
        // Change the URL below to match your server port (e.g., 5000)
        const response = await axios.get("http://localhost:5000/api/measurements/latest");
        
        // In your controller, the data is inside 'success: true, data: { ... }'
        if (response.data.success) {
          setMeasurements(response.data.data);
        }
      } catch (error) {
        console.error("Could not fetch measurements:", error);
      }
    };

    // 2. Mock Orders (Replace with real API later)
    setOrders([
      { id: "#ORD-7721", status: "In Progress", total: "₱2,500", date: "Oct 24" },
      { id: "#ORD-6540", status: "Delivered", total: "₱1,800", date: "Sep 12" },
    ]);

    fetchMeasurements();
  }, []);

  return (
    <div className="hp-container">
      <Sidebar active="home" />
      
      <main className="hp-main-content">
        <header className="hp-header">
          <div className="hp-user-info">
            <span className="hp-welcome">Hello, <strong>{customerName}</strong></span>
            <div className="hp-avatar-circle" onClick={() => navigate("/profile")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
        </header>

        <div className="hp-scroll-body">
          <section className="hp-welcome-card">
            <div className="hp-welcome-text">
              <h1>Welcome to <span className="text-purple">Stitches</span></h1>
              <p>Your personal tailoring dashboard. Track your fit and your fashion.</p>
              <button className="hp-cta-btn" onClick={() => navigate("/order")}>Create New Order</button>
            </div>
            <div className="hp-hero-icon">✂️</div>
          </section>

          <div className="hp-data-grid">
            
            {/* Measurements Section */}
            <div className="hp-data-card">
              <div className="hp-card-title">
                <h3>📏 My Measurements</h3>
                <button className="hp-edit-link" onClick={() => navigate("/measurements")}>Update</button>
              </div>
              
              {measurements ? (
                <div className="hp-m-list">
                  {/* These keys now match your Measurement.js model exactly */}
                  <div className="hp-m-row"><span>Shoulder</span> <strong>{measurements.shoulder}"</strong></div>
                  <div className="hp-m-row"><span>Chest</span> <strong>{measurements.chest}"</strong></div>
                  <div className="hp-m-row"><span>Waist</span> <strong>{measurements.waist}"</strong></div>
                  <div className="hp-m-row"><span>Hip</span> <strong>{measurements.hip}"</strong></div>
                  <div className="hp-m-row"><span>Arm Length</span> <strong>{measurements.armLength}"</strong></div>
                </div>
              ) : (
                <div className="hp-no-data">No measurements found. Please add yours!</div>
              )}
            </div>

            {/* Order History Section */}
            <div className="hp-data-card">
              <div className="hp-card-title">
                <h3>📦 Recent Orders</h3>
                <button className="hp-edit-link" onClick={() => navigate("/tracker")}>Track All</button>
              </div>
              <div className="hp-order-history">
                {orders.map(order => (
                  <div key={order.id} className="hp-order-item">
                    <div className="hp-order-main">
                      <span className="hp-order-number">{order.id}</span>
                      <span className="hp-order-date">{order.date}</span>
                    </div>
                    <div className="hp-order-side">
                      <span className="hp-order-price">{order.total}</span>
                      <span className={`hp-status-tag ${order.status.toLowerCase().replace(' ', '-')}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CDashboard;