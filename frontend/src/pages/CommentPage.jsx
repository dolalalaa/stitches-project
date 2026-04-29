import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import CommentCard from "../components/CommentCard";
import StarRating from "../components/StarRating";

export default function CommentPage() {
  const { shopId } = useParams();

  const [comments, setComments] = useState([]);
  const [userName, setUserName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  
  // New States for "See More" and Average
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  const API = "http://localhost:5000";

  // 📥 Fetch comments (Updated to handle object and limit)
  const fetchComments = () => {
    axios.get(`${API}/api/comments/${shopId}?limit=${limit}`)
      .then(res => {
        // res.data is now { comments: [], avgRating: X, totalComments: Y }
        setComments(res.data.comments);
        setAvgRating(res.data.avgRating);
        setTotal(res.data.totalComments);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchComments();
  }, [shopId, limit]); // Refetch when shopId or limit changes

  // ➕ Add comment
  const handleSubmit = () => {
    if (!userName || !text || !rating) {
      alert("Fill all fields");
      return;
    }

    axios.post(`${API}/api/comments`, { // Check if your route is /add or just /
      shopId,
      userName,
      text,
      rating
    })
    .then(() => {
      setUserName(""); // Clear name if you want, or keep it
      setText("");
      setRating(0);
      setLimit(5); // Reset limit to see your new comment at the top
      fetchComments();
    });
  };

  return (
    <div style={styles.container}>

      {/* ⭐ Average (Using avgRating from Backend) */}
      <div style={styles.summary}>
        <h2>⭐ {avgRating} / 5</h2>
        <p>{total} comments</p>
      </div>

      {/* ✍️ Input */}
      <div style={styles.box}>
        <input
          placeholder="Your name"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          style={styles.input}
        />

        <StarRating rating={rating} setRating={setRating} />

        <textarea
          placeholder="Write a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
          style={styles.textarea}
        />

        <button onClick={handleSubmit} style={styles.button}>
          Post
        </button>
      </div>

      {/* 📝 Comments List */}
      {comments.map((c, i) => (
        <CommentCard key={c._id || i} comment={c} />
      ))}

      {/* ➕ See More Button */}
      {comments.length < total && (
        <button 
          onClick={() => setLimit(limit + 5)} 
          style={styles.seeMore}
        >
          See More Reviews
        </button>
      )}

    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif"
  },
  summary: {
    background: "#C9A0DC",
    color: "white",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    marginBottom: "20px"
  },
  box: {
    background: "#f9f9f9",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "1px solid #eee"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd"
  },
  textarea: {
    width: "100%",
    height: "80px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd"
  },
  button: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    background: "#C9A0DC",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  seeMore: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    background: "transparent",
    color: "#C9A0DC",
    border: "2px solid #C9A0DC",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};