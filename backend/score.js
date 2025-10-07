const express = require("express");
const router = express.Router();
const Score = require("../models/scoreModel");

// POST /score → save user score
router.post("/", async (req, res) => {
  const { username, score } = req.body;
  try {
    const newScore = new Score({ username, score });
    await newScore.save();
    res.status(201).json({ message: "Score saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /score → top 10 scores
router.get("/", async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
