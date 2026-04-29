import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", role: "customer"
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed.");
        setLoading(false);
        return;
      }

      if (data.token || data.user) {
        const user = data.user || {};
        const finalRole = formData.role === "shopkeeper" ? "shopOwner" : formData.role;

        localStorage.setItem("stitches_user", JSON.stringify({
          _id:   user._id,
          name:  user.name,
          email: user.email,
          role:  finalRole,
        }));
        if (data.token) localStorage.setItem("token", data.token);

        if (finalRole === "shopOwner") {
          navigate("/shop-dashboard");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Cannot connect to server. Make sure backend is running on port 5000.");
    }

    setLoading(false);
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
            <input type="text" required value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="auth-group">
            <label>Email</label>
            <input type="email" required value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="auth-group">
            <label>Phone Number</label>
            <input type="tel" value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="auth-group">
            <label>Password</label>
            <input type="password" required value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="auth-group">
            <label>I am a:</label>
            <select value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="customer">Customer</option>
              <option value="shopkeeper">Shop Owner</option>
            </select>
          </div>
          {error && (
            <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>{error}</p>
          )}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <div className="auth-toggle">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;