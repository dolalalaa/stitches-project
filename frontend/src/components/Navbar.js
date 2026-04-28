import React from "react";

export default function Navbar() {
  return (
    <div style={styles.nav}>
      <h2 style={styles.logo} onClick={() => window.location.reload()}>
        STITCHES
      </h2>
    </div>
  );
}

const styles = {
  nav: {
    backgroundColor: "#C9A0DC",
    padding: "15px 30px"
  },
  logo: {
    color: "white",
    cursor: "pointer"
  }
};