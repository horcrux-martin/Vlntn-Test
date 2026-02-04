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

// Popup
const popup = document.getElementById("popup");
const popupClose = document.getElementById("popupClose");
const popupX = document.getElementById("popupX");
const popupBtn = document.getElementById("popupBtn");

// Music
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");
let musicPlaying = false;

// ===== "No" button logic =====
let noIsAbsolute = false;
let noEscapes = 0;
const NO_ESCAPE_LIMIT = 3;

function ensureNoAbsolute() {
  if (noIsAbsolute) return;

  // Only allow absolute positioning after NO is interacted with
  noBtn.style.position = "absolute";
  noBtn.style.left = "50%";
  noBtn.style.top = "75%";
  noBtn.style.transform = "translate(-50%, -50%)";
  noIsAbsolute = true;
}


function moveNo() {
  if (noEscapes >= NO_ESCAPE_LIMIT) return;

  noEscapes++;
  ensureNoAbsolute();

  const area = actions.getBoundingClientRect();
  const btn  = noBtn.getBoundingClientRect();
  const pad = 10;

  const maxX = Math.max(pad, area.width - btn.width - pad);
  const maxY = Math.max(pad, area.height - btn.height - pad);

  // Mobile safe zone: NO should not go above the YES area
  const isMobile = window.innerWidth <= 520;
  const yesRect = yesBtn.getBoundingClientRect();

  let x, y, tries = 0;
  do {
    x = rand(pad, maxX);
    y = rand(pad, maxY);
    tries++;
  } while (
    tries < 16 &&
    isMobile &&
    (y < (yesRect.bottom - area.top + 10))
  );

  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
  noBtn.style.transform = "none";

  if (noEscapes === 1) micro.textContent = "(Not today.)";
  if (noEscapes === 2) micro.textContent = "(Still no.)";

  if (noEscapes === 3) {
    micro.textContent = "(Alright. You win.)";

    // Give up: stop escaping, become clickable, go back into layout
    noBtn.classList.add("is-given-up");
    noBtn.style.position = "relative";
    noBtn.style.left = "auto";
    noBtn.style.top = "auto";
    noBtn.style.transform = "none";
  }
}

// Escape on desktop hover + mobile tap
noBtn.addEventListener("mouseenter", moveNo);
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNo();
}, { passive: false });

window.addEventListener("resize", () => {
  // don't auto-move NO on resize; it can cause overlap/tap issues on mobile
});


// After give-up, clicking NO does a classy “nice try”
noBtn.addEventListener("click", () => {
  if (noEscapes < NO_ESCAPE_LIMIT) return;

  micro.textContent = "(That’s cute. But it’s Yes.)";
  card?.animate?.(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(0)" }
    ],
    { duration: 260, easing: "ease-out" }
  );
});

// ===== Floaties (love floating on YES) =====
const FLOAT_SET = ["💗","💞","💘","🌹","🌸","🌺","✨","🤍","🌻"];
let floatTimer = null;

function spawnFloaty() {
  const el = document.createElement("div");
  el.className = "floaty";
  el.textContent = pick(FLOAT_SET);

  const x = rand(6, 94);
  const size = rand(16, 30);
  const dur = rand(3.1, 6.0);
  const delay = rand(0, 0.5);

  el.style.left = `${x}vw`;
  el.style.bottom = `-10vh`;
  el.style.fontSize = `${size}px`;
  el.style.animationDuration = `${dur}s`;
  el.style.animationDelay = `${delay}s`;

  floaties.appendChild(el);
  setTimeout(() => el.remove(), (dur + delay) * 1000 + 500);
}

function burst(n = 24) { for (let i = 0; i < n; i++) spawnFloaty(); }

function startFloaties() {
  if (floatTimer) return;
  floatTimer = setInterval(spawnFloaty, 105);
}

function stopFloaties() {
  clearInterval(floatTimer);
  floatTimer = null;
}

// ===== Fireworks =====
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

// ===== Music =====
function setMusicIcon() {
  if (!musicBtn) return;
  musicBtn.textContent = musicPlaying ? "❚❚" : "♫";
}

async function forcePlayMusic() {
  if (!bgm || musicPlaying) return;
  try {
    bgm.currentTime = 0;
    bgm.volume = 0.75;
    await bgm.play();
    musicPlaying = true;
    setMusicIcon();
  } catch (e) {
    console.log("Audio blocked:", e);
  }
}

musicBtn?.addEventListener("click", async () => {
  if (!bgm) return;

  if (musicPlaying) {
    bgm.pause();
    musicPlaying = false;
    setMusicIcon();
  } else {
    try {
      await bgm.play();
      musicPlaying = true;
      bgm.volume = Math.max(bgm.volume || 0.65, 0.65);
      setMusicIcon();
    } catch (e) {
      console.log("Audio blocked:", e);
    }
  }
});

// ===== Bouquet popup =====
function openPopup() {
  if (!popup) return;
  popup.classList.add("is-open");
  popup.setAttribute("aria-hidden", "false");
  burst(18);
}

function closePopup() {
  if (!popup) return;
  popup.classList.remove("is-open");
  popup.setAttribute("aria-hidden", "true");
}

popupClose?.addEventListener("click", closePopup);
popupX?.addEventListener("click", closePopup);
popupBtn?.addEventListener("click", closePopup);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopup();
});

// ===== Flow =====
function showReveal() {
  card.style.display = "none";
  reveal.style.display = "flex";
  reveal.setAttribute("aria-hidden", "false");

  burst(30);
  startFloaties();
  startFireworks();

  reveal.animate?.(
    [
      { transform: "translateY(10px) scale(.99)", opacity: 0 },
      { transform: "translateY(0) scale(1)", opacity: 1 }
    ],
    { duration: 420, easing: "cubic-bezier(.2,.9,.2,1)", fill: "both" }
  );
}

// YES: love mode + music + reveal
yesBtn.addEventListener("click", async () => {
  // turn button pink immediately
  yesBtn.classList.add("is-love");
  yesBtn.textContent = "Yes 💗";

  await forcePlayMusic();

  // show reveal after a tiny pause so the color change is visible
  setTimeout(() => showReveal(), 180);
});

// MORE: bouquet surprise popup + extra sparkle
moreBtn?.addEventListener("click", () => {
  openPopup();
  burst(28);
  launchFirework();
});

// RESET: restore everything
resetBtn?.addEventListener("click", () => {
  stopFloaties();
  stopFireworks();
  particles = [];
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  closePopup();

  reveal.style.display = "none";
  reveal.setAttribute("aria-hidden", "true");
  card.style.display = "block";

  // restore YES
  yesBtn.classList.remove("is-love");
  yesBtn.textContent = "Yes";

  // restore NO state
  noEscapes = 0;
  noBtn.classList.remove("is-given-up");
  noBtn.style.position = "relative";
  noBtn.style.left = "auto";
  noBtn.style.top = "auto";
  noBtn.style.transform = "none";
  noIsAbsolute = false;

  micro.textContent = "(The “No” option tends to disappear when it’s outmatched.)";
  burst(10);

  // music stays playing (classy). If you want it to stop on reset:
  // bgm.pause(); musicPlaying=false; setMusicIcon();
});
