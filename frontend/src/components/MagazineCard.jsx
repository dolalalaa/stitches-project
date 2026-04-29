import React from "react";

export default function MagazineCard({ article }) {

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/400x250?text=Fashion+News";
  };

  return (
    <div style={styles.card} onClick={() => window.open(article.url)}>

      <img
        src={article.image}
        alt=""
        style={styles.image}
        onError={handleImageError}
      />

      <h3>{article.title}</h3>

      <p>
        {article.description
          ? article.description.slice(0, 100) + "..."
          : "No description available"}
      </p>

      <span style={styles.readMore}>Read more →</span>

    </div>
  );
}

const styles = {
  card: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    cursor: "pointer"
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "10px"
  },
  readMore: {
    color: "#C9A0DC",
    fontWeight: "bold"
  }
};