const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const app = express();
app.use(express.json());
app.use(cors());

// 🌐 MongoDB Atlas Connection
mongoose.connect("mongodb+srv://pacmanuser:pacman123@cluster0.n8whxp1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  dbName: "PacManDB"
})
  .then(() => console.log("✅ MongoDB Connected to Atlas"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 🧍 Register
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "Username already exists!" });
  }
});

// 🔑 Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(401).json({ error: "Invalid password" });

  res.json({ message: "Login successful", username: user.username, highScore: user.highScore });
});

// 🏆 Update Score
app.post("/update-score", async (req, res) => {
  const { username, score } = req.body;
  const user = await User.findOne({ username });
  if (user && score > user.highScore) {
    user.highScore = score;
    await user.save();
  }
  res.json({ message: "Score updated" });
});

// 📊 Leaderboard
app.get("/leaderboard", async (req, res) => {
  const users = await User.find().sort({ highScore: -1 }).limit(10);
  res.json(users);
});

// 🚀 Start Server
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
