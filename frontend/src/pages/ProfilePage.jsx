// pages/ProfilePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [profile, setProfile] = useState({
    name: "", gender: "", mobile: "", email: "", address: "", profilePic: ""
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Pre-fill from localStorage first
        const stored = localStorage.getItem("stitches_user");
        const localUser = stored ? JSON.parse(stored) : {};

        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setProfile({
            ...data.data,
            name:  data.data.name  || localUser.name  || "",
            email: data.data.email || localUser.email || "",
          });
        } else {
          setProfile((prev) => ({
            ...prev,
            name:  localUser.name  || "",
            email: localUser.email || "",
          }));
        }
      } catch (err) {
        const stored = localStorage.getItem("stitches_user");
        const localUser = stored ? JSON.parse(stored) : {};
        setProfile((prev) => ({
          ...prev,
          name:  localUser.name  || "",
          email: localUser.email || "",
        }));
      }
    };

    const fetchMeasurements = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/measurements/latest");
        const data = await res.json();
        if (data.success) setMeasurements(data.data);
      } catch (err) { console.error(err); }
    };

    fetchProfile();
    fetchMeasurements();
  }, []);

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, profilePic: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("✅ Profile updated successfully!");
        setEditing(false);
        localStorage.setItem("customerName", profile.name);
      } else {
        setMsg("❌ Failed to save. Try again.");
      }
    } catch (err) {
      setMsg("❌ Server error.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customerName");
    navigate("/login");
  };

  const FIELDS = [
    { key: "name",    label: "Name",    type: "text",  placeholder: "Your full name" },
    { key: "gender",  label: "Gender",  type: "text",  placeholder: "Male / Female / Other" },
    { key: "mobile",  label: "Mobile",  type: "tel",   placeholder: "Your phone number" },
    { key: "email",   label: "Email",   type: "email", placeholder: "Your email address" },
    { key: "address", label: "Address", type: "text",  placeholder: "Your address" },
  ];

  return (
    <div className="pp-root">
      <Sidebar active="profile" />
      <div className="pp-main">

        {/* Top bar */}
        <div className="pp-topbar">
          <h2 className="pp-topbar-title">My Profile</h2>
          <div className="pp-avatar-sm" onClick={() => navigate("/profile")}>
            {profile.profilePic
              ? <img src={profile.profilePic} alt="avatar" />
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
            }
          </div>
        </div>

        <div className="pp-body">

          {/* Left — profile card */}
          <div className="pp-card">

            {/* Profile picture */}
            <div className="pp-pic-wrap">
              <div className="pp-pic" onClick={() => editing && fileRef.current.click()}>
                {profile.profilePic
                  ? <img src={profile.profilePic} alt="profile" />
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                }
                {editing && <div className="pp-pic-overlay">📷 Change</div>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePicChange} style={{ display: "none" }} />
              <h3 className="pp-name">{profile.name || "Your Name"}</h3>
              <p className="pp-email-display">{profile.email || "your@email.com"}</p>
            </div>

            {/* Fields */}
            <div className="pp-fields">
              {FIELDS.map(({ key, label, type, placeholder }) => (
                <div key={key} className="pp-field">
                  <label className="pp-label">{label}</label>
                  {editing ? (
                    <input
                      type={type}
                      className="pp-input"
                      value={profile[key]}
                      placeholder={placeholder}
                      onChange={(e) => setProfile((prev) => ({ ...prev, [key]: e.target.value }))}
                    />
                  ) : (
                    <div className="pp-value">
                      {profile[key] || <span className="pp-empty">Not set</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Status message */}
            {msg && <div className="pp-msg">{msg}</div>}

            {/* Edit / Save / Cancel buttons */}
            <div className="pp-btn-row">
              {editing ? (
                <>
                  <button className="pp-btn-save" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "💾 Save Profile"}
                  </button>
                  <button className="pp-btn-cancel" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </>
              ) : (
                <button className="pp-btn-edit" onClick={() => setEditing(true)}>
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {/* Logout button */}
            <div className="pp-logout-wrap">
              <button className="pp-btn-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>

          </div>

          {/* Right — measurements card */}
          <div className="pp-measurements-card">
            <h3 className="pp-mc-title">📏 My Saved Measurements</h3>
            {measurements ? (
              <div className="pp-mc-grid">
                {["shoulder", "chest", "waist", "hip", "armLength"].map((key) => (
                  <div key={key} className="pp-mc-item">
                    <span className="pp-mc-label">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace("L", " L")}
                    </span>
                    <span className="pp-mc-value">{measurements[key]} cm</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pp-mc-empty">
                <p>No measurements saved yet.</p>
                <button className="pp-mc-btn" onClick={() => navigate("/measurements")}>
                  📏 Add Measurements
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;