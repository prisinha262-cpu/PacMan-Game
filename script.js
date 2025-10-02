const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Pac-Man object
let pacman = {
  x: 50,
  y: 50,
  size: 20,
  dx: 20,
  dy: 0
};

// Pellets array
let pellets = [];
let score = 0;

// Create pellets on grid
function createPellets() {
  for (let i = 40; i < canvas.width; i += 40) {
    for (let j = 40; j < canvas.height; j += 40) {
      pellets.push({ x: i, y: j, eaten: false });
    }
  }
}

// Draw pellets
function drawPellets() {
  pellets.forEach(p => {
    if (!p.eaten) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.closePath();
    }
  });
}

// Draw Pac-Man
function drawPacman() {
  ctx.beginPath();
  ctx.arc(pacman.x, pacman.y, pacman.size, 0.2 * Math.PI, 1.8 * Math.PI);
  ctx.lineTo(pacman.x, pacman.y);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();
}

// Draw Score
function drawScore() {
  ctx.fillStyle = "yellow";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
}

// Clear screen
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Update game
function update() {
  clearCanvas();
  drawPellets();
  drawPacman();
  drawScore();

  // Move Pac-Man
  pacman.x += pacman.dx;
  pacman.y += pacman.dy;

  // Wall collision
  if (pacman.x < 0) pacman.x = canvas.width;
  if (pacman.x > canvas.width) pacman.x = 0;
  if (pacman.y < 0) pacman.y = canvas.height;
  if (pacman.y > canvas.height) pacman.y = 0;

  // Check collision with pellets
  pellets.forEach(p => {
    let dist = Math.hypot(pacman.x - p.x, pacman.y - p.y);
    if (!p.eaten && dist < pacman.size) {
      p.eaten = true;
      score += 10;
    }
  });

  requestAnimationFrame(update);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    pacman.dx = 20; pacman.dy = 0;
  } else if (e.key === "ArrowLeft") {
    pacman.dx = -20; pacman.dy = 0;
  } else if (e.key === "ArrowUp") {
    pacman.dy = -20; pacman.dx = 0;
  } else if (e.key === "ArrowDown") {
    pacman.dy = 20; pacman.dx = 0;
  }
});

// Start game
createPellets();
update();
