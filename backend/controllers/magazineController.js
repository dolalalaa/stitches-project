const axios = require("axios");
const Magazine = require("../models/Magazine");
exports.fetchFashionNews = async (req, res) => {
  try {
    const response = await axios.get(
      `https://gnews.io/api/v4/search?q=fashion&lang=en&apikey=${process.env.GNEWS_API_KEY}`
    );
    const articles = response.data.articles;
    const savedArticles = [];
    for (let article of articles) {
      const news = new Magazine({
        title: article.title,
        description: article.description,
        image: article.image,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt
      });
      await news.save();
      savedArticles.push(news);
    }
    res.json(savedArticles);

  } catch (error) {
    res.status(500).json({ message: "Error fetching fashion news" });
  }

};



// Get stored magazine articles from database
exports.getMagazineArticles = async (req, res) => {

  try {

    const articles = await Magazine
      .find()
      .sort({ publishedAt: -1 });

    res.json(articles);

  } catch (error) {

    res.status(500).json({ message: "Error retrieving articles" });

  }

};