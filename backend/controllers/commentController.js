const Comment = require("../models/Comment");
const mongoose = require("mongoose");

// ➕ Add comment
exports.addComment = async (req, res) => {
  try {
    const { shopId, userName, text, rating } = req.body;
    const comment = new Comment({ shopId, userName, text, rating });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment" });
  }
};

// 📥 Get comments ( Average & Top 5)
exports.getComments = async (req, res) => {
  try {
    const { shopId } = req.params;
    const limit = parseInt(req.query.limit) || 5; // Get limit from URL, default to 5

    // 1. Get the comments with a limit
    const comments = await Comment.find({ shopId })
      .sort({ createdAt: -1 })
      .limit(limit);

    // 2. Get Average Rating and Total Count
    const stats = await Comment.aggregate([
      { $match: { shopId: new mongoose.Types.ObjectId(shopId) } },
      { 
        $group: { 
          _id: null, 
          avgRating: { $avg: "$rating" }, 
          totalCount: { $sum: 1 } 
        } 
      }
    ]);

    res.json({
      comments,
      avgRating: stats.length ? stats[0].avgRating.toFixed(1) : 0,
      totalComments: stats.length ? stats[0].totalCount : 0
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching comments" });
  }
};