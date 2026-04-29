import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("customer");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // If backend returns non-ok status
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Check if login was successful — must have token or user
      if (data.token || data.user) {
        const user = data.user || {};

        // Use role from the dropdown selection
        const finalRole = role === "shopkeeper" ? "shopOwner" : "customer";

        // Save user info to localStorage
        // Use the actual user data from backend — NOT fallback values
        localStorage.setItem("stitches_user", JSON.stringify({
          _id:   user._id  || user.id,   // real MongoDB _id — no fallback
          name:  user.name,              // real name from DB
          email: user.email || email,
          role:  finalRole,
        }));
        localStorage.setItem("token", data.token || "");

        // Redirect based on role
        if (finalRole === "shopOwner") {
          navigate("/shop-dashboard");
        } else {
          navigate("/");
        }
      } else {
        // Backend returned something but no token/user
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch {
      // Backend is completely unreachable
      setError("Cannot connect to server. Please make sure the backend is running on port 5000.");
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
        <h2>Welcome Back</h2>
        <p>Login to your account</p>
        <form onSubmit={handleLogin}>
          <div className="auth-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="auth-group">
            <label>Login as:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="shopkeeper">Shop Owner</option>
            </select>
          </div>

          {error && (
            <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
              {error}
            </p>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="auth-toggle">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;