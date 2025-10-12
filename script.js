// script.js
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const msg = document.getElementById("message");

// show message helper
function showMessage(text, ok=true){
  if (!msg) return;
  msg.textContent = text;
  msg.style.color = ok ? "lime" : "salmon";
}

// Register (store in localStorage simple)
if (registerBtn){
  registerBtn.addEventListener("click", () => {
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    if (!u || !p) { showMessage("Fill both fields", false); return; }
    localStorage.setItem("pm_user_" + u, p);
    showMessage("Registered ✓ — please Login", true);
  });
}

// Login: validate and set current
if (loginBtn){
  loginBtn.addEventListener("click", () => {
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    if (!u || !p) { showMessage("Fill both fields", false); return; }
    const stored = localStorage.getItem("pm_user_" + u);
    if (stored && stored === p) {
      localStorage.setItem("pm_current", u);
      window.location.href = "game.html";
    } else {
      showMessage("Invalid credentials", false);
    }
  });
}

// Particle background
(function particles(){
  const c = document.getElementById("particleCanvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  function resize(){ c.width = innerWidth; c.height = innerHeight; }
  window.addEventListener("resize", resize); resize();
  const arr = [];
  for (let i=0;i<110;i++){
    arr.push({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*2+0.6,vx:(Math.random()-0.5)*0.9,vy:(Math.random()-0.5)*0.9,a:0.6+Math.random()*0.4});
  }
  function loop(){
    ctx.clearRect(0,0,c.width,c.height);
    for (const p of arr){
      p.x += p.vx; p.y += p.vy;
      if (p.x<0) p.x=c.width; if (p.x>c.width) p.x=0;
      if (p.y<0) p.y=c.height; if (p.y>c.height) p.y=0;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,234,0,${p.a})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();
