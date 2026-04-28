// pages/MeasurementForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MeasurementForm.css";

const FIELDS = [
  { key: "shoulder", label: "Shoulder", icon: " ", unit: "cm", hint: "Measure across the back from shoulder to shoulder" },
  { key: "chest", label: "Chest", icon: " ", unit: "cm", hint: "Measure around the fullest part of your chest" },
  { key: "waist", label: "Waist", icon: " ", unit: "cm", hint: "Measure around your natural waistline" },
  { key: "hip", label: "Hip", icon: " ", unit: "cm", hint: "Measure around the fullest part of your hips" },
  { key: "armLength", label: "Arm Length", icon: " ", unit: "cm", hint: "Measure from shoulder tip to wrist" },
];

const MeasurementForm = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ shoulder: "", chest: "", waist: "", hip: "", armLength: "" });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const newErrors = {};
    FIELDS.forEach(({ key, label }) => {
      if (!values[key]) newErrors[key] = `${label} is required`;
      else if (isNaN(values[key]) || Number(values[key]) <= 0) newErrors[key] = `Enter a valid ${label.toLowerCase()}`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/measurements/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success){localStorage.setItem("chest", values.chest);
        localStorage.setItem("waist", values.waist);
        localStorage.setItem("length", values.armLength);
        setSaved(true);
      }
      else {
        alert("Failed to save. Try again.");
      }
    } catch (err) {
      alert("Server error. Make sure backend is running.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMannequin = () => {
    navigate(`/mannequin?shoulder=${values.shoulder}&chest=${values.chest}&waist=${values.waist}&hip=${values.hip}&armLength=${values.armLength}`);
  };

  const handleContinueShopping = () => {
    navigate("/home");
  };

  const completion = Math.round((Object.values(values).filter(Boolean).length / FIELDS.length) * 100);

  return (
    <div className="mf-root">
      {/* Decorative background blobs */}
      <div className="mf-blob mf-blob-1" />
      <div className="mf-blob mf-blob-2" />

      <div className="mf-container">
        {/* Header */}
        <div className="mf-header">
          <div className="mf-logo">✂️ <span className="mf-logo-sti">Sti</span><span className="mf-logo-tch">tch</span><span className="mf-logo-sti">es</span></div>
          <h1 className="mf-title">Your Measurements</h1>
          <p className="mf-subtitle">Enter your body measurements to get a perfect custom fit</p>

          {/* Progress bar */}
          <div className="mf-progress-wrap">
            <div className="mf-progress-bar">
              <div className="mf-progress-fill" style={{ width: `${completion}%` }} />
            </div>
            <span className="mf-progress-label">{completion}% complete</span>
          </div>
        </div>

        {/* Form */}
        <div className="mf-form-grid">
          {FIELDS.map(({ key, label, icon, unit, hint }) => (
            <div key={key} className={`mf-field ${errors[key] ? "mf-field--error" : ""} ${values[key] ? "mf-field--filled" : ""}`}>
              <label className="mf-label">
                <span className="mf-label-icon">{icon}</span>
                {label}
              </label>
              <div className="mf-input-wrap">
                <input
                  type="number"
                  className="mf-input"
                  placeholder="0"
                  value={values[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  min="1"
                />
                <span className="mf-unit">{unit}</span>
              </div>
              <p className="mf-hint">{hint}</p>
              {errors[key] && <p className="mf-error">{errors[key]}</p>}
            </div>
          ))}
        </div>

        {/* Save Button */}
        {!saved ? (
          <button className="mf-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="mf-btn-inner"><span className="mf-spinner" /> Saving...</span>
            ) : (
              <span className="mf-btn-inner"> Save Measurements</span>
            )}
          </button>
        ) : (
          <div className="mf-saved-section">
            <div className="mf-saved-badge">✅ Measurements saved to your profile!</div>
            <div className="mf-action-buttons">
              <button className="mf-btn-mannequin" onClick={handleCreateMannequin}>
                 Create My Mannequin
              </button>
              <button className="mf-btn-shopping" onClick={handleContinueShopping}>
                 Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementForm;