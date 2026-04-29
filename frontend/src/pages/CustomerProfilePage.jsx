import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CustomerProfilePage.css";

const CustomerProfilePage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const stored = localStorage.getItem("stitches_user");
  const loggedInUser = stored ? JSON.parse(stored) : {};
  const isShopOwner = loggedInUser.role === "shopOwner" || loggedInUser.role === "shopkeeper";

  useEffect(() => {
    fetch(`http://localhost:5000/api/profile/user/${customerId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProfile(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customerId]);

  if (loading) return (
    <div className="cup-page">
      <div className="cup-loading"><div className="cup-spinner" /><p>Loading profile...</p></div>
    </div>
  );

  if (!profile) return (
    <div className="cup-page"><div className="cup-error"><p>Customer profile not found.</p></div></div>
  );

  return (
    <div className="cup-page">
      <div className="cup-card">

        <div className="cup-avatar-wrap">
          {profile.profilePic
            ? <img src={profile.profilePic} alt={profile.name} className="cup-avatar" />
            : <div className="cup-avatar-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
          }
          <h2 className="cup-name">{profile.name || "Unknown"}</h2>
          <p className="cup-email">{profile.email || ""}</p>
        </div>

        <div className="cup-fields">
          {[
            { label: "Gender",  value: profile.gender },
            { label: "Mobile",  value: profile.mobile },
            { label: "Address", value: profile.address },
          ].map(({ label, value }) => (
            <div key={label} className="cup-field">
              <span className="cup-field-label">{label}</span>
              <span className="cup-field-value">{value || "Not set"}</span>
            </div>
          ))}
        </div>

        {isShopOwner && (
          <button className="cup-chat-btn" onClick={() => navigate(`/shop-chat?customer=${profile.name}`)}>
            💬 Chat with {profile.name}
          </button>
        )}

      </div>
    </div>
  );
};

export default CustomerProfilePage;