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

// Draw Pac-Man
function drawPacman() {
  ctx.beginPath();
  ctx.arc(pacman.x, pacman.y, pacman.size, 0.2 * Math.PI, 1.8 * Math.PI); 
  ctx.lineTo(pacman.x, pacman.y);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();
}

// Clear screen
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Update game
function update() {
  clearCanvas();
  drawPacman();

  // Move Pac-Man
  pacman.x += pacman.dx;
  pacman.y += pacman.dy;

  // Wall collision
  if (pacman.x < 0) pacman.x = canvas.width;
  if (pacman.x > canvas.width) pacman.x = 0;
  if (pacman.y < 0) pacman.y = canvas.height;
  if (pacman.y > canvas.height) pacman.y = 0;

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

update();
