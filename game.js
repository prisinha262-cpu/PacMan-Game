// game.js - full playable Pac-Man (tile-based) with local leaderboard
document.addEventListener("DOMContentLoaded", () => {
  // auth
  const current = localStorage.getItem("pm_current");
  if (!current) { alert("Please login first"); window.location.href = "index.html"; return; }
  document.getElementById("playerName").textContent = current;

  // elements
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const lbEl = document.getElementById("leaderboard");
  const restartBtn = document.getElementById("restartBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const startSoundBtn = document.getElementById("startSoundBtn");

  // audio (soft pad + small effects)
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  function playBeep(freq=800, dur=0.05, vol=0.03) {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "sine"; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.stop(audioCtx.currentTime + dur + 0.02);
  }
  startSoundBtn && (startSoundBtn.onclick = () => { ensureAudio(); playBeep(440,0.2,0.04); startSoundBtn.style.display='none'; });

  // GRID
  const TILE = 20;
  const COLS = Math.floor(canvas.width / TILE); // e.g. 21
  const ROWS = Math.floor(canvas.height / TILE);

  // Maze array: 0 empty, 1 wall
  const maze = Array.from({length: ROWS}, (_, y) => Array.from({length: COLS}, (_, x) => {
    if (x === 0 || y === 0 || x === COLS-1 || y === ROWS-1) return 1;
    return 0;
  }));

  // add inner walls to look like a maze (customizable)
  for (let x=2;x<COLS-2;x++) maze[3][x]=1;
  for (let x=2;x<COLS-2;x++) maze[ROWS-4][x]=1;
  for (let y=6;y<ROWS-6;y++) maze[y][Math.floor(COLS/2)] = 1;

  // pellets and power pellets
  let pellets = [], powerPellets = [];
  function populatePellets(){
    pellets = [];
    for (let y=1;y<ROWS-1;y++){
      for (let x=1;x<COLS-1;x++){
        if (maze[y][x] === 0) pellets.push({x,y,e:false});
      }
    }
    powerPellets = [{x:2,y:2,e:false},{x:COLS-3,y:2,e:false},{x:2,y:ROWS-3,e:false},{x:COLS-3,y:ROWS-3,e:false}];
  }

  // state
  let pac = {x:2,y:2,dirX:0,dirY:0, mouth:0};
  let ghosts = [
    {x: COLS-3, y:2, homeX:COLS-3, homeY:2, color:"red"},
    {x: COLS-3, y: ROWS-3, homeX:COLS-3, homeY:ROWS-3, color:"cyan"}
  ];
  let score = 0, lives = 3, frightened = 0;

  // helper: check move possibility
  function canMove(x,y){
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return false;
    return maze[y][x] === 0;
  }

  // BFS pathfinder (grid) used by ghosts to chase pacman — returns next move [dx,dy] or null
  function bfsNext(fromX, fromY, toX, toY){
    const q = [[fromX, fromY]];
    const seen = Array.from({length: ROWS}, ()=>Array(COLS).fill(false));
    const parent = Array.from({length: ROWS}, ()=>Array(COLS).fill(null));
    seen[fromY][fromX] = true;
    while(q.length){
      const [cx, cy] = q.shift();
      if (cx === toX && cy === toY) break;
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      for (const [dx,dy] of dirs){
        const nx = cx + dx, ny = cy + dy;
        if (nx<0||ny<0||nx>=COLS||ny>=ROWS) continue;
        if (seen[ny][nx]) continue;
        if (!canMove(nx,ny)) continue;
        seen[ny][nx] = true;
        parent[ny][nx] = [cx,cy];
        q.push([nx,ny]);
      }
    }
    // if no path found
    if (!parent[toY] || parent[toY][toX] === null) return null;
    // walk back from target to source to find next step
    let cur = [toX,toY];
    while(parent[cur[1]][cur[0]] && !(parent[cur[1]][cur[0]][0] === fromX && parent[cur[1]][cur[0]][1] === fromY)){
      cur = parent[cur[1]][cur[0]];
    }
    return [cur[0]-fromX, cur[1]-fromY];
  }

  // update game logic
  function update(){
    // move pacman if next cell free
    const nx = pac.x + pac.dirX, ny = pac.y + pac.dirY;
    if (canMove(nx,ny)){ pac.x = nx; pac.y = ny; playBeep(900,0.02,0.01); }
    // eat pellets
    for (const p of pellets){
      if (!p.e && p.x === pac.x && p.y === pac.y){
        p.e = true; score += 10; scoreEl.textContent = score; playBeep(1200,0.03,0.02);
      }
    }
    for (const pp of powerPellets){
      if (!pp.e && pp.x === pac.x && pp.y === pac.y){
        pp.e = true; frightened = 200; score += 50; scoreEl.textContent = score; playBeep(1600,0.05,0.04);
      }
    }
    if (frightened > 0) frightened--;

    // move ghosts: use BFS when not frightened, else random walk
    for (const g of ghosts){
      let moved = false;
      if (frightened <= 0){
        const next = bfsNext(g.x, g.y, pac.x, pac.y);
        if (next){
          const [dx,dy] = next;
          if (canMove(g.x+dx, g.y+dy)){ g.x += dx; g.y += dy; moved = true; }
        }
      } 
      if (!moved){
        // random fallback
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        const r = dirs[Math.floor(Math.random()*dirs.length)];
        if (canMove(g.x + r[0], g.y + r[1])) { g.x += r[0]; g.y += r[1]; }
      }
    }

    // collisions with ghosts
    for (const g of ghosts){
      if (g.x === pac.x && g.y === pac.y){
        if (frightened > 0){
          // eat ghost
          score += 200; scoreEl.textContent = score; playBeep(350,0.06,0.04);
          g.x = g.homeX; g.y = g.homeY;
        } else {
          // pac dies
          lives--; livesEl.textContent = lives; playBeep(120,0.18,0.08);
          if (lives <= 0){
            // game over -> save leaderboard and reset
            saveScore(current, score); loadLeaderboard();
            setTimeout(()=> { alert("Game Over — Score saved: " + score); resetBoard(); }, 50);
            return;
          } else {
            // reset positions (not full reset)
            pac.x = 2; pac.y = 2; pac.dirX = 0; pac.dirY = 0;
            ghosts.forEach(h => { h.x = h.homeX; h.y = h.homeY; });
          }
        }
      }
    }

    // win: all pellets eaten
    const allSmall = pellets.every(p => p.e);
    const allPower = powerPellets.every(pp => pp.e);
    if (allSmall && allPower){
      saveScore(current, score); loadLeaderboard();
      setTimeout(()=> { alert("You Win! Score saved: " + score); resetBoard(); }, 50);
      return;
    }
  }

  // drawing
  function drawMaze(){
    ctx.fillStyle = "#070707"; ctx.fillRect(0,0,canvas.width,canvas.height);
    for (let y=0;y<ROWS;y++){
      for (let x=0;x<COLS;x++){
        if (maze[y][x] === 1){
          ctx.fillStyle = "#222"; ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
          ctx.strokeStyle = "rgba(255,234,0,0.06)"; ctx.strokeRect(x*TILE,y*TILE,TILE,TILE);
        }
      }
    }
  }
  function drawPellets(){
    ctx.fillStyle = "#fff";
    for (const p of pellets) if (!p.e) { ctx.beginPath(); ctx.arc(p.x*TILE+TILE/2,p.y*TILE+TILE/2,3,0,Math.PI*2); ctx.fill(); }
    for (const pp of powerPellets) if (!pp.e) { ctx.beginPath(); ctx.arc(pp.x*TILE+TILE/2,pp.y*TILE+TILE/2,6,0,Math.PI*2); ctx.fill(); }
  }
  function drawPac(){
    const cx = pac.x*TILE + TILE/2, cy = pac.y*TILE + TILE/2;
    pac.mouth = (pac.mouth + 1) % 30;
    const ang = 0.25*Math.PI * (Math.sin(pac.mouth/6) + 1);
    ctx.fillStyle = "#ffe600"; ctx.beginPath(); ctx.arc(cx,cy,TILE/2-2,ang,Math.PI*2-ang); ctx.lineTo(cx,cy); ctx.fill();
  }
  function drawGhosts(){
    for (const g of ghosts){
      const cx = g.x*TILE + TILE/2, cy = g.y*TILE + TILE/2;
      ctx.fillStyle = frightened>0 ? "#777" : g.color;
      ctx.beginPath(); ctx.arc(cx,cy,TILE/2-2,Math.PI,0); ctx.fill();
      ctx.fillRect(g.x*TILE+2, g.y*TILE + TILE/2, TILE-4, TILE/2);
    }
  }

  // main loop
  let raf;
  function loop(){
    update();
    drawMaze();
    drawPellets();
    drawPac();
    drawGhosts();
    raf = requestAnimationFrame(loop);
  }

  // input
  window.addEventListener("keydown", (e) => {
    ensureAudio();
    if (e.key === "ArrowUp") { pac.dirX = 0; pac.dirY = -1; }
    if (e.key === "ArrowDown") { pac.dirX = 0; pac.dirY = 1; }
    if (e.key === "ArrowLeft") { pac.dirX = -1; pac.dirY = 0; }
    if (e.key === "ArrowRight") { pac.dirX = 1; pac.dirY = 0; }
  });

  // restart/logout
  restartBtn.addEventListener("click", () => { resetBoard(); });
  logoutBtn.addEventListener("click", () => { localStorage.removeItem("pm_current"); window.location.href = "index.html"; });

  // leaderboard local functions
  function saveScore(name,s){
    const key = "pm_leaderboard";
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    arr.push({ username:name, highScore:s });
    arr.sort((a,b)=> b.highScore - a.highScore);
    localStorage.setItem(key, JSON.stringify(arr.slice(0,20)));
  }
  function loadLeaderboard(){
    const key = "pm_leaderboard";
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    lbEl.innerHTML = "";
    arr.forEach((u,i) => {
      const li = document.createElement("li");
      li.textContent = `${i+1}. ${u.username} — ${u.highScore}`;
      lbEl.appendChild(li);
    });
  }

  // reset board (new round)
  function resetBoard(){
    cancelAnimationFrame(raf);
    populatePellets();
    score = 0; lives = 3; frightened = 0;
    pac = {x:2,y:2,dirX:0,dirY:0,mouth:0};
    ghosts[0].x = ghosts[0].homeX; ghosts[0].y = ghosts[0].homeY;
    ghosts[1].x = ghosts[1].homeX; ghosts[1].y = ghosts[1].homeY;
    scoreEl.textContent = score; livesEl.textContent = lives;
    loadLeaderboard();
    raf = requestAnimationFrame(loop);
  }

  // init
  populatePellets();
  scoreEl.textContent = score; livesEl.textContent = lives;
  loadLeaderboard();
  raf = requestAnimationFrame(loop);
});
