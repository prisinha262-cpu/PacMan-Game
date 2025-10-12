require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to Atlas (use .env)
const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pacmanDB";
mongoose.connect(MONGO, { dbName: "PacManDB" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: "Username exists" });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash });
    await user.save();
    res.json({ message: "Registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid password" });
    res.json({ message: "OK", username: user.username, highScore: user.highScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// update score: body { username, score }
app.post("/api/score", async (req, res) => {
  try {
    const { username, score } = req.body;
    if (!username || typeof score !== "number") return res.status(400).json({ error: "Invalid" });
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (score > user.highScore) {
      user.highScore = score;
      await user.save();
    }
    res.json({ message: "Score saved", highScore: user.highScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// leaderboard
app.get("/api/leaderboard", async (req, res) => {
  try {
    const top = await User.find().sort({ highScore: -1 }).limit(10).select("username highScore -_id");
    res.json(top);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
// backend/server.js
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const app = express();
app.use(express.json());
app.use(cors());

// Use MONGO_URI from .env OR fallback to the working atlas string you created
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://pacmanuser:pacman123@cluster0.n8whxp1.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, { dbName: "PacManDB" })
  .then(() => console.log("✅ MongoDB Connected to Atlas"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ---------------- Auth ----------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });

    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();
    res.json({ message: "Registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "OK", username: user.username, highScore: user.highScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Scores ----------------
app.post("/api/scores/update", async (req, res) => {
  try {
    const { username, score } = req.body;
    if (!username || typeof score !== "number") return res.status(400).json({ message: "username & score required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (score > user.highScore) {
      user.highScore = score;
      await user.save();
    }
    res.json({ message: "Score updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/scores/leaderboard", async (req, res) => {
  try {
    const top = await User.find({}, "username highScore").sort({ highScore: -1 }).limit(10);
    res.json(top);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Health
app.get("/", (req, res) => res.send("PacMan backend running"));

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
