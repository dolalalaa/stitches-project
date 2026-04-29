import React from "react";

export default function CommentCard({ comment }) {
  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <strong>{comment.userName}</strong>
        <span>{"★".repeat(comment.rating)}</span>
      </div>

      <p>{comment.text}</p>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  top: {
    display: "flex",
    justifyContent: "space-between"
  }
};