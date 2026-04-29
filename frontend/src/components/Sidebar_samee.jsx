import React, { useState } from "react";

export default function Sidebar() {

  const [selected, setSelected] = useState("");

  const today = new Date();
  const date = today.toDateString();

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌸";
    return "Good Evening ✨";
  };

  return (
    <div style={styles.sidebar}>

      {/* Date Card */}
      <div style={styles.card}>
        <h3>{date}</h3>
        <p>{getGreeting()}</p>
        <p>Stay stylish 💜</p>
      </div>

      {/* Poll */}
      <div style={styles.card}>
        <h4>Today's Style Poll 👗</h4>
        <p>What color are you wearing today?</p>

        {["Black", "White", "Pastel", "Bright"].map(color => (
          <button
            key={color}
            onClick={() => setSelected(color)}
            style={{
              ...styles.button,
              backgroundColor: selected === color ? "#C9A0DC" : "#eee"
            }}
          >
            {color}
          </button>
        ))}

        {selected && <p>You chose: {selected}</p>}
      </div>

    </div>
  );
}

const styles = {
  sidebar: {
    width: "25%",
    padding: "20px"
  },
  card: {
    background: "white",
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },
  button: {
    display: "block",
    margin: "5px 0",
    padding: "8px",
    border: "none",
    cursor: "pointer"
  }
};