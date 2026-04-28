import React from "react";

export default function StarRating({ rating, setRating }) {
  return (
    <div>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          onClick={() => setRating(star)}
          style={{
            fontSize: "25px",
            cursor: "pointer",
            color: star <= rating ? "#C9A0DC" : "#ccc"
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}