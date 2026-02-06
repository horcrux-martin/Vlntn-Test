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
        ctx.fillS
