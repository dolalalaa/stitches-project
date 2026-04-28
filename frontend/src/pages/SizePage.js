import React from "react";
import { useLocation } from "react-router-dom";

export default function SizePage() {

  const location = useLocation();
  const fabric = location.state?.fabric;

  return (
    <div style={styles.container}>

      <h2>Select Size</h2>

      {fabric && (
        <div style={styles.card}>
          <img src={fabric.image} style={styles.img} alt="fabric" />
          <h3>{fabric.name}</h3>
        </div>
      )}

      <p style={{marginTop:"20px"}}>Size feature coming soon...</p>

    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    textAlign: "center"
  },
  card: {
    margin: "20px auto",
    width: "250px"
  },
  img: {
    width: "100%",
    borderRadius: "10px"
  }
};