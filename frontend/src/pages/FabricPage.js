import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function FabricPage() {

  const [fabrics, setFabrics] = useState([]);

  // ✅ separate filters
  const [type, setType] = useState("");
  const [color, setColor] = useState("");

  const navigate = useNavigate();

  const API = "http://localhost:5000";

  const fetchFabrics = () => {
    axios.get(`${API}/api/fabrics/filter`, {
      params: { type, color }
    })
    .then(res => setFabrics(res.data))
    .catch(err => console.log(err));
  };

  // 🔥 auto filter when typing
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchFabrics();
    }, 400);

    return () => clearTimeout(delay);
  }, [type, color]);

  // 🔥 initial load
  useEffect(() => {
    fetchFabrics();
  }, []);

  return (
    <div style={styles.container}>

      {/* 🔍 FILTER SECTION */}
      <div style={styles.filters}>

        <input
          placeholder="Search by type (cotton...)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Search by color (pink...)"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={styles.input}
        />

      </div>

      {/* 🧵 GRID */}
      <div style={styles.grid}>
        {fabrics.map(f => (
          <div key={f._id} style={styles.card}>

            <img src={f.image} style={styles.img} alt="fabric" />

            <h3>{f.name}</h3>
            <p>{f.type} • {f.color}</p>
            <p>৳ {f.price}</p>

            <button
              style={styles.btn}
              onClick={() => navigate("/size", { state: { fabric: f } })}
            >
              Select Fabric
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "#f9f6fc",
    minHeight: "100vh"
  },
  filters: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px"
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "20px"
  },
  card: {
    background: "white",
    padding: "12px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
  },
  img: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "8px"
  },
  btn: {
    marginTop: "10px",
    background: "#C9A0DC",
    color: "white",
    border: "none",
    padding: "10px",
    width: "100%",
    borderRadius: "6px",
    cursor: "pointer"
  }
};