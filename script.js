// ===== Helpers =====
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ===== Elements =====
const card = document.getElementById("card");
const reveal = document.getElementById("reveal");

const actions = document.getElementById("actions");
const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");
const micro  = document.getElementById("micro");

const moreBtn = document.getElementById("moreBtn");
const resetBtn = document.getElementById("resetBtn");

const floaties = document.getElementById("floaties");

// Music
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");
let musicPlaying = false;

// ===== "No" button: evasive =====
let noIsAbsolute = false;

function ensureNoAbsolute() {
  if (noIsAbsolute) return;
  noBtn.style.position = "absolute";
  noBtn.style.left = "62%";
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

  micro.textContent = "(It refuses to cooperate.)";
}

noBtn.addEventListener("mouseenter", moveNo);
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNo();
}, { passive: false });

window.addEventListener("resize", () => {
  if (noIsAbsolute) moveNo();
});

// ===== Floaties (more pink/red/flowers, still tasteful) =====
const FLOAT_SET = ["🌹","🌸","🌺","💗","💞","🤍","✨","🌻","🌼"];
let floatTimer = null;

function spawnFloaty() {
  const el = document.createElement("div");
  el.className = "floaty";
  el.textContent = pick(FLOAT_SET);

  const x = rand(6, 94);
  const size = rand(16, 30);
  const dur = rand(3.2, 6.0);
  const delay = rand(0, 0.5);

  el.style.left = `${x}vw`;
  el.style.bottom = `-10vh`;
  el.style.fontSize = `${size}px`;
  el.style.animationDuration = `${dur}s`;
  el.style.animationDelay = `${delay}s`;

  floaties.appendChild(el);

  const ttl = (dur + delay) * 1000 + 400;
  setTimeout(() => el.remove(), ttl);
}

function burst(n = 22) {
  for (let i = 0; i < n; i++) spawnFloaty();
}

function startFloaties() {
  if (floatTimer) return;
  floatTimer = setInterval(spawnFloaty, 110);
}

function stopFloaties() {
  clearInterval(floatTimer);
  floatTimer = null;
}

// ===== Fireworks (soft + cinematic) =====
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let particles = [];
let fireworksOn = false;
let fwTimer = null;

function launchFirework() {
  const cx = rand(0.18, 0.82) * window.innerWidth;
  const cy = rand(0.16, 0.54) * window.innerHeight;

  const colors = ["#ffffff", "#ff3d7a", "#ff6ea8", "#f7c948", "#0b0c10"];

  const count = Math.floor(rand(42, 76));
  for (let i = 0; i < count; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(1.5, 5.4);

    particles.push({
      x: cx, y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: rand(40, 78),
      color: pick(colors),
      size: rand(1.5, 3.2),
      drag: rand(0.965, 0.985),
      gravity: rand(0.02, 0.06)
    });
  }
}

function tickFx() {
  if (!fireworksOn && particles.length === 0) return;

  // gentle trail
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
    ctx.globalAlpha = Math.min(1, p.life / 44);
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  requestAnimationFrame(tickFx);
}

function startFireworks() {
  fireworksOn = true;
  launchFirework(); launchFirework();
  tickFx();
  fwTimer = setInterval(() => {
    launchFirework();
    if (Math.random() < 0.28) launchFirework();
  }, 700);
}

function stopFireworks() {
  fireworksOn = false;
  clearInterval(fwTimer);
  fwTimer = null;
}

// ===== Music controls =====
function setMusicIcon() {
  if (!musicBtn) return;
  musicBtn.textContent = musicPlaying ? "❚❚" : "♫";
}

function fadeInMusic(target = 0.75) {
  if (!bgm) return;

  bgm.volume = 0;
  const playPromise = bgm.play();
  if (playPromise && typeof playPromise.then === "function") {
    playPromise.catch(() => {});
  }
  musicPlaying = true;
  setMusicIcon();

  let v = 0;
  const fade = setInterval(() => {
    v += 0.02;
    bgm.volume = Math.min(v, target);
    if (v >= target) clearInterval(fade);
  }, 120);
}

musicBtn?.addEventListener("click", () => {
  if (!bgm) return;

  if (musicPlaying) {
    bgm.pause();
    musicPlaying = false;
    setMusicIcon();
  } else {
    const p = bgm.play();
    if (p && typeof p.then === "function") p.catch(() => {});
    musicPlaying = true;
    bgm.volume = Math.max(bgm.volume || 0.6, 0.6);
    setMusicIcon();
  }
});

// ===== Flow =====
function showReveal() {
  // Start music only after user gesture (browser-friendly)
  if (bgm && !musicPlaying) fadeInMusic(0.75);

  card.style.display = "none";
  reveal.style.display = "flex";
  reveal.setAttribute("aria-hidden", "false");

  burst(28);
  startFloaties();
  startFireworks();

  reveal.animate(
    [
      { transform: "translateY(10px) scale(.99)", opacity: 0 },
      { transform: "translateY(0) scale(1)", opacity: 1 }
    ],
    { duration: 420, easing: "cubic-bezier(.2,.9,.2,1)", fill: "both" }
  );
}

yesBtn.addEventListener("click", showReveal);

moreBtn?.addEventListener("click", () => {
  burst(30);
  launchFirework();
});

resetBtn?.addEventListener("click", () => {
  stopFloaties();
  stopFireworks();
  particles = [];
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  reveal.style.display = "none";
  reveal.setAttribute("aria-hidden", "true");
  card.style.display = "block";

  // restore "No"
  noBtn.style.position = "relative";
  noBtn.style.left = "auto";
  noBtn.style.top = "auto";
  noBtn.style.transform = "none";
  noIsAbsolute = false;

  micro.textContent = "(The “No” option tends to disappear when it’s outmatched.)";
  burst(10);

  // keep music playing on reset (classy). If you want it to stop, tell me.
});
