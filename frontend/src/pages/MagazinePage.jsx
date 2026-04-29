import React, { useEffect, useState } from "react";
import axios from "axios";
import MagazineCard from "../components/MagazineCard";
import Sidebar_samee from "../components/Sidebar_samee";

export default function MagazinePage() {

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    axios.get("http://localhost:5000/api/magazine/articles")
      .then(res => {
        setArticles(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });

  }, []);

  if (loading) {
    return <h2 style={{ padding: "20px" }}>Loading fashion articles...</h2>;
  }

  if (articles.length === 0) {
    return <h2 style={{ padding: "20px" }}>No articles found</h2>;
  }

  return (
    <div style={styles.container}>

      <div style={styles.grid}>
        {articles.map((article, index) => (
          <MagazineCard key={index} article={article} />
        ))}
      </div>

      <Sidebar_samee />

    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "20px"
  },
  grid: {
    width: "75%",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    padding: "20px"
  }
};