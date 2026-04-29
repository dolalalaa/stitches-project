// components/Sidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const NAV_ITEMS = [
  { key: "home",         label: "Home",         icon: "🏠", path: "/home" },
  { key: "designs",      label: "My Designs",   icon: "🎨", path: "/designs" },
  { key: "order",        label: "Order",        icon: "📦", path: "/order" },
  { key: "measurements", label: "Measurements", icon: "📏", path: "/measurements" },
  { key: "chat",         label: "Chat",         icon: "💬", path: "/chat" },
  { key: "payment",      label: "Payment",      icon: "💳", path: "/payment" },
  { key: "cart",         label: "Shopping Cart", icon: "🛒", path: "/cart" },      
  { key: "tracker",      label: "Order Tracker", icon: "🚚", path: "/order-tracker" }, 
];

const Sidebar = ({ active }) => {
  const navigate = useNavigate();

  return (
    <div className="sb-root">
      <div className="sb-logo" onClick={() => navigate("/home")}>
        ✂️ <span className="sb-logo-text">Stitches</span>
      </div>
      <nav className="sb-nav">
        <p className="sb-nav-label">Menu</p>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.key}
            className={`sb-item ${active === item.key ? "sb-item--active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sb-item-icon">{item.icon}</span>
            <span className="sb-item-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;