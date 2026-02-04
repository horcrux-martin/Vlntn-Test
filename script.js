// ===== Helpers =====
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const panel = document.getElementById("panel");
const reveal = document.getElementById("reveal");

const actions = document.getElementById("actions");
const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");

const note = document.getElementById("note");
const floaties = document.getElementById("floaties");

const moreBtn = document.getElementById("moreBtn");
const resetBtn = document.getElementById("resetBtn");

// ===== "No" button: evasive, but tasteful =====
let noIsAbsolute = false;

function ensureNoAbsolute() {
  if (noIsAbsolute) return;

  // Allow it to move within the "actions" container
  noBtn.style.position = "absolute";
  noBtn.style.left = "60%";
  noBtn.style.top = "50%";
  noBtn.style.transform = "translate(-50%, -50%)";
  noIsAbsolute = true;
}

function moveNo() {
  ensureNoAbsolute();

  const area = actions.getBoundingClientRect();
  const btn  = noBtn.getBoundingClientRect();

  const pad = 8;
  const maxX = Math.max(pad, area.width - btn.width - pad);
  const maxY = Math.max(pad, area.height - btn.height - pad);

  const x = rand(pad, maxX);
  const y = rand(pad, maxY);

  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
  noBtn.style.transform = "none";

  note.textContent = "(It refuses to cooperate.)";
}

// Desktop hover
noBtn.addEventListener("mouseenter", moveNo);

// Mobile tap (prevent accidental click)
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNo();
}, { passive: false });

window.addEventListener("resize", () => {
  // keep it inside bounds after resize
  if (noIsAbsolute) moveNo();
});

// ===== Floaties (petals + minimal hearts) =====
const FLOAT_SET = ["🌻","🌼","🌷","✨","💛","🤍"];
let floatTimer = null;

function spawnFloatyBurst(n = 18) {
  for (let i = 0; i < n; i++) spawnFloaty();
}

function spawnFloaty() {
  const el = document.createElement("div");
  el.className = "floaty";
  el.textContent = pick(FLOAT_SET);

  const x = rand(6, 94);
  const size = rand(16, 28);
  const dur = rand(3.6, 6.6);
  const delay = rand(0, 0.6);

  el.style.left = `${x}vw`;
  el.style.bottom = `-10vh`;
  el.style.fontSize = `${size}px`;
  el.style.animationDuration = `${dur}s`;
  el.style.animationDelay = `${delay}s`;

  floaties.appendChild(el);

  const ttl = (dur + delay) * 1000 + 300;
  setTimeout(() => el.remove(), ttl);
}

function startFloaties() {
  if (floatTimer) return;
  floatTimer = setInterval(spawnFloaty, 140);
}

function stopFloaties() {
  clearInterval(floatTimer);
  floatTimer = null;
}

// ===== Fireworks (soft + classy) =====
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");

let W, H;
function resize() {
  const dpr = window.devicePixelRatio || 1;
  W = canvas.width  = Math.floor(window.innerWidth * dpr);
  H = canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

let particles = [];
let fireworksOn = false;
let fwTimer = null;

function launch() {
  const cx = rand(0.18, 0.82) * window.innerWidth;
  const cy = rand(0.18, 0.55) * window.innerHeight;

  // restrained palette
  const colors = ["#ffffff", "#f6c445", "#f2a900", "#ff6ea8", "#1a1f26"];

  const count = Math.floor(rand(36, 64));
  for (let i = 0; i < count; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(1.4, 5.0);
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: rand(38, 72),
      color: pick(colors),
      size: rand(1.4, 3.0),
      drag: rand(0.965, 0.985),
      gravity: rand(0.02, 0.06)
    });
  }
}

function tick() {
  if (!fireworksOn && particles.length === 0) return;

  // gentle fade trail
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter(p => p.life > 0);

  for (const p of particles) {
    p.vx *= p.drag;
    p.vy = p.vy * p.drag + p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;

    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.min(1, p.life / 40);
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  requestAnimationFrame(tick);
}

function startFireworks() {
  fireworksOn = true;
  // initial
  launch(); launch();
  tick();
  fwTimer = setInterval(() => {
    launch();
    if (Math.random() < 0.25) launch();
  }, 720);
}

function stopFireworks() {
  fireworksOn = false;
  clearInterval(fwTimer);
  fwTimer = null;
}

// ===== Yes flow =====
function showReveal() {
  panel.style.display = "none";
  reveal.style.display = "flex";
  reveal.setAttribute("aria-hidden", "false");

  // effects
  spawnFloatyBurst(22);
  startFloaties();
  startFireworks();

  // subtle entrance animation
  reveal.animate(
    [
      { transform: "translateY(10px) scale(.99)", opacity: 0 },
      { transform: "translateY(0) scale(1)", opacity: 1 }
    ],
    { duration: 420, easing: "cubic-bezier(.2,.9,.2,1)", fill: "both" }
  );
}

yesBtn.addEventListener("click", showReveal);

// ===== Buttons on reveal =====
moreBtn.addEventListener("click", () => {
  spawnFloatyBurst(28);
  launch();
});

resetBtn.addEventListener("click", () => {
  // reset visuals
  stopFloaties();
  stopFireworks();
  particles = [];
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // restore view
  reveal.style.display = "none";
  reveal.setAttribute("aria-hidden", "true");
  panel.style.display = "block";

  // restore "No" position
  noBtn.style.position = "relative";
  noBtn.style.left = "auto";
  noBtn.style.top = "auto";
  noBtn.style.transform = "none";
  noIsAbsolute = false;

  note.textContent = "(The “No” option is… unreliable.)";
  spawnFloatyBurst(10);
});
