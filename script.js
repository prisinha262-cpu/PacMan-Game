const api = "http://localhost:5000";
let username = "";
let score = 0;

// Buttons
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const restartBtn = document.getElementById("restartBtn");

loginBtn.onclick = async () => {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  if (!user || !pass) return alert("Fill all fields!");

  const res = await fetch(`${api}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass })
  });

  const data = await res.json();
  if (res.ok) {
    username = data.username;
    startGame();
  } else alert(data.error);
};

registerBtn.onclick = async () => {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  if (!user || !pass) return alert("Fill all fields!");

  const res = await fetch(`${api}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass })
  });

  const data = await res.json();
  alert(data.message || data.error);
};

function startGame() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("welcome").innerText = `Welcome, ${username}!`;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  let pacman = { x: 200, y: 200, size: 20 };
  let food = { x: Math.random() * 380, y: Math.random() * 380 };
  score = 0;
  document.getElementById("score").innerText = score;

  function draw() {
    ctx.clearRect(0, 0, 400, 400);
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.size / 2, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fill();

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, 10, 10);
  }

  function update() {
    if (Math.abs(pacman.x - food.x) < 10 && Math.abs(pacman.y - food.y) < 10) {
      score++;
      document.getElementById("score").innerText = score;
      food = { x: Math.random() * 380, y: Math.random() * 380 };
    }
  }

  window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") pacman.y -= 10;
    if (e.key === "ArrowDown") pacman.y += 10;
    if (e.key === "ArrowLeft") pacman.x -= 10;
    if (e.key === "ArrowRight") pacman.x += 10;
  });

  function loop() {
    draw();
    update();
    requestAnimationFrame(loop);
  }
  loop();
  loadLeaderboard();
}

restartBtn.onclick = async () => {
  await fetch(`${api}/update-score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, score })
  });
  alert("Game Over! Your score saved.");
  loadLeaderboard();
  location.reload();
};

async function loadLeaderboard() {
  const res = await fetch(`${api}/leaderboard`);
  const data = await res.json();
  const board = document.getElementById("leaderboard");
  board.innerHTML = "";
  data.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `${u.username}: ${u.highScore}`;
    board.appendChild(li);
  });
}
