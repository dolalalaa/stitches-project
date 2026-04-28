const express = require("express");
const router = express.Router();

const {
 fetchFashionNews,
 getMagazineArticles
} = require("../controllers/magazineController");

router.get("/fetch", fetchFashionNews);

router.get("/articles", getMagazineArticles);

module.exports = router;