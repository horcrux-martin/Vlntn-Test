// script.js
const $ = (sel) => document.querySelector(sel);

const fx = $("#fx");
const ctx = fx.getContext("2d");

const card = $("#card");
const reveal = $("#reveal");

const pill = $("#pill");
const headline = $("#headline");
const copy = $("#copy");
const chapterTitle = $("#chapterTitle");
const chapterBody = $("#chapterBody");
const footerLine = $("#footerLine");

const moreBtn = $("#moreBtn");
const resetBtn = $("#resetBtn");
const resetBtn2 = $("#resetBtn2");
const closeBtn = $("#closeBtn");

const musicBtn = $("#musicBtn");
const bgm = $("#bgm");

function resizeCanvas(){
  fx.width = window.innerWidth * devicePixelRatio;
  fx.height = window.innerHeight * devicePixelRatio;
  fx.style.width = window.innerWidth + "px";
  fx.style.height = window.innerHeight + "px";
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/** Floating minimal emojis */
const floatiesLayer = $("#floaties");
// keep it subtle (no hearts spam)
const floatyEmojis = ["🕊️","✨","🌙","🫧","🖤"];

function spawnFloatyBurst(count = 8){
  for(let i=0;i<count;i++){
    const s = document.createElement("div");
    s.className = "floaty";
    s.textContent = floatyEmojis[Math.floor(Math.random()*floatyEmojis.length)];
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight + 20 + Math.random() * 60;
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.setProperty("--dur", (6 + Math.random()*4) + "s");
    s.style.fontSize = (14 + Math.random()*14) + "px";
    floatiesLayer.appendChild(s);
    setTimeout(() => s.remove(), 10000);
  }
}

/** Fireworks (white-only sparks, soft) */
let particles = [];
let running = false;

function rand(min, max){ return min + Math.random()*(max-min); }

function launchFirework(){
  const startX = rand(80, window.innerWidth - 80);
  const startY = window.innerHeight + 20;
  const targetY = rand(window.innerHeight*0.18, window.innerHeight*0.42);

  particles.push({
    x: startX,
    y: startY,
    vx: rand(-0.8, 0.8),
    vy: rand(-7.2, -9.0),
    life: 0,
    targetY,
    exploded: false,
    type: "rocket"
  });
}

function explode(x, y){
  const n = Math.floor(rand(26, 38));
  for(let i=0;i<n;i++){
    const a = (Math.PI * 2) * (i / n);
    const sp = rand(2.0, 5.6);
    particles.push({
      x, y,
      vx: Math.cos(a) * sp + rand(-0.5,0.5),
      vy: Math.sin(a) * sp + rand(-0.5,0.5),
      g: 0.06,
      life: 0,
      maxLife: rand(58, 92),
      type: "spark"
    });
  }
}

function step(){
  if(!running) return;

  ctx.clearRect(0,0,window.innerWidth, window.innerHeight);

  const next = [];
  for(const p of particles){
    if(p.type === "rocket"){
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;

      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.1, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fill();
      ctx.restore();

      if(!p.exploded && (p.y <= p.targetY || p.life > 88)){
        p.exploded = true;
        explode(p.x, p.y);
      } else {
        next.push(p);
      }
    } else {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.vx *= 0.985;
      p.vy *= 0.985;

      const t = 1 - (p.life / p.maxLife);
      if(t > 0){
        ctx.save();
        ctx.globalAlpha = Math.max(0, t);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.7, 0, Math.PI*2);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();
        ctx.restore();
        next.push(p);
      }
    }
  }
  particles = next;

  requestAnimationFrame(step);
}

function startFx(){
  if(running) return;
  running = true;
  step();
}
function stopFx(){
  running = false;
  particles = [];
  ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
}

/** Chapters */
const chapters = [
  {
    pill: "A last honest page.",
    h: "Hopelessly Devoted to <span class='accent'>You</span>.",
    c: "This isn’t a proposal.<br/>It’s a clean ending — with respect.",
    title: "Chapter 1",
    body:
      "I won’t chase you for an answer anymore. " +
      "I’ll say what’s true once — and then I’ll be quiet.",
    footer: "No more pushing. No more pressure."
  },
  {
    pill: "No bargaining.",
    h: "I liked you <span class='accent'>for real</span>.",
    c: "And that’s exactly why I won’t turn it into noise.",
    title: "Chapter 2",
    body:
      "If my presence ever felt heavy, I’m sorry. " +
      "Liking someone doesn’t give me the right to take their space.",
    footer: "Respect is the baseline."
  },
  {
    pill: "No-contact pledge.",
    h: "I will <span class='accent'>not</span> disturb you.",
    c: "Not as a tactic. Not as drama. Just discipline.",
    title: "Chapter 3",
    body:
      "Starting now: no texts, no calls, no checking, no ‘just one more time’. " +
      "You won’t have to block me to get peace.",
    footer: "Your silence will be honored."
  },
  {
    pill: "Still devoted…",
    h: "…but still <span class='accent'>respectful</span>.",
    c: "Soft feelings. Firm boundaries.",
    title: "Chapter 4",
    body:
      "I’ll keep the good things privately, without turning them into a reason to show up again. " +
      "I’ll move forward quietly — like an adult.",
    footer: "No more appearances."
  },
  {
    pill: "Last page.",
    h: "I wish you <span class='accent'>peace</span>.",
    c: "Even if it’s without me.",
    title: "Chapter 5",
    body:
      "If you ever want to speak someday, it should be because you want to — not because I kept knocking. " +
      "Until then, I’m done disturbing your life.",
    footer: "This is me letting go."
  }
];

let idx = 0;

function setChapter(i){
  const ch = chapters[i];
  pill.textContent = ch.pill;
  headline.innerHTML = ch.h;
  copy.innerHTML = ch.c;
  chapterTitle.textContent = ch.title;
  chapterBody.textContent = ch.body;
  footerLine.textContent = ch.footer;
}

setChapter(idx);

function goReveal(){
  card.style.display = "none";
  reveal.style.display = "block";
  reveal.setAttribute("aria-hidden","false");

  // Soft ending FX
  spawnFloatyBurst(10);
  startFx();
  let launches = 0;
  const t = setInterval(() => {
    launchFirework();
    launches++;
    if(launches >= 4) clearInterval(t);
  }, 520);

  setTimeout(() => stopFx(), 4200);
}

moreBtn.addEventListener("click", () => {
  spawnFloatyBurst(6);
  idx++;
  if(idx < chapters.length){
    setChapter(idx);
    if(idx >= 2){
      startFx();
      launchFirework();
      setTimeout(() => stopFx(), 1400);
    }
    return;
  }
  goReveal();
});

/** Close */
closeBtn.addEventListener("click", () => {
  // Option A: fade out UI, keep background
  document.body.classList.add("closed");
  stopFx();
  spawnFloatyBurst(6);
  setTimeout(() => {
    card.remove();
    reveal.remove();
    footerLine.textContent = "Closed.";
  }, 450);
});

/** Reset */
function resetAll(){
  stopFx();
  idx = 0;
  setChapter(idx);
  reveal.style.display = "none";
  reveal.setAttribute("aria-hidden","true");
  card.style.display = "block";
}

resetBtn.addEventListener("click", resetAll);
resetBtn2.addEventListener("click", resetAll);

/** Music toggle */
let musicOn = false;
musicBtn.addEventListener("click", async () => {
  try{
    if(!musicOn){
      await bgm.play();
      musicOn = true;
      musicBtn.textContent = "❚❚";
    }else{
      bgm.pause();
      musicOn = false;
      musicBtn.textContent = "♫";
    }
  }catch(e){
    spawnFloatyBurst(4);
  }
});

// subtle intro
setTimeout(() => spawnFloatyBurst(5), 700);

const bgm = document.getElementById("bgm");

// autoplay muted
window.addEventListener("load", () => {
  bgm.play().catch(()=>{});
});

// unmute on first interaction
function unlockAudio(){
  bgm.muted = false;
  bgm.volume = 1;
  document.removeEventListener("click", unlockAudio);
  document.removeEventListener("touchstart", unlockAudio);
}

document.addEventListener("click", unlockAudio, { once:true });
document.addEventListener("touchstart", unlockAudio, { once:true });

