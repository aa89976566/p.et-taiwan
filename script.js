// Canvas and UI setup
const canvas = document.getElementById("catCanvas");
const ctx = canvas.getContext("2d");
const feedBtn = document.getElementById("feedBtn");
const fadeOverlay = document.getElementById("fadeOverlay");
const landingPage = document.getElementById("landingPage");

const CAT_W = 64, CAT_H = 48;
const FLOOR_Y = 150;
let catX = 10, catY = FLOOR_Y, catDir = 1;
let sniffFrame = 0;
let step = 0;
let snackShown = false, snackScale = 1, snackGrow = false, fade = false, landed = false;

function drawCat(x, y, sniff=false) {
  // Head
  ctx.fillStyle = "#f7ca48";
  ctx.fillRect(x+16, y, 32, 24);
  // Ears
  ctx.beginPath();
  ctx.moveTo(x+20, y); ctx.lineTo(x+16, y-10); ctx.lineTo(x+24, y); ctx.closePath();
  ctx.moveTo(x+44, y); ctx.lineTo(x+48, y-10); ctx.lineTo(x+40, y); ctx.closePath();
  ctx.fill();
  // Body
  ctx.fillRect(x+10, y+20, 44, 18);
  // Tail
  ctx.save();
  ctx.translate(x+8, y+32);
  ctx.rotate(Math.sin(Date.now()/200)*0.2);
  ctx.fillRect(0, 0, 20, 6);
  ctx.restore();
  // Legs
  ctx.fillRect(x+18, y+36, 8, 11);
  ctx.fillRect(x+38, y+36, 8, 11);
  // Face
  // Eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x+28, y+10, 4, 0, Math.PI*2);
  ctx.arc(x+36, y+10, 4, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x+28, y+10, 2, 0, Math.PI*2);
  ctx.arc(x+36, y+10, 2, 0, Math.PI*2);
  ctx.fill();
  // Nose (sniff animates it)
  ctx.fillStyle = "#ffb347";
  ctx.beginPath();
  ctx.ellipse(x+32, y+16 + (sniff?2*Math.sin(sniffFrame):0), 4, 2, 0, 0, Math.PI*2);
  ctx.fill();
  // Mouth
  ctx.strokeStyle = "#bfa529";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x+32, y+18);
  ctx.lineTo(x+32, y+21);
  ctx.moveTo(x+32, y+21);
  ctx.lineTo(x+29, y+23);
  ctx.moveTo(x+32, y+21);
  ctx.lineTo(x+35, y+23);
  ctx.stroke();
  // Whiskers
  ctx.strokeStyle = "#c2a343";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x+24, y+16); ctx.lineTo(x+10, y+14);
  ctx.moveTo(x+24, y+19); ctx.lineTo(x+10, y+21);
  ctx.moveTo(x+40, y+16); ctx.lineTo(x+54, y+14);
  ctx.moveTo(x+40, y+19); ctx.lineTo(x+54, y+21);
  ctx.stroke();
}

function drawSnack(x, y, scale=1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Snack base
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 16, 0, 0, Math.PI*2);
  ctx.fillStyle = "#f7aa2a";
  ctx.fill();
  // Snack highlight
  ctx.beginPath();
  ctx.ellipse(-8, -3, 10, 6, 0, 0, Math.PI*2);
  ctx.fillStyle = "#fff7c2";
  ctx.fill();
  // Outline
  ctx.strokeStyle = "#c88624";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 16, 0, 0, Math.PI*2);
  ctx.stroke();
  // Smell lines
  ctx.strokeStyle = "#d7b060";
  ctx.setLineDash([3,3]);
  for(let i=-1;i<=1;i++) {
    ctx.beginPath();
    ctx.moveTo(i*8, -18);
    ctx.lineTo(i*8, -32);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw ground
  ctx.fillStyle = "#f3dfab";
  ctx.fillRect(0, FLOOR_Y+CAT_H/2+8, canvas.width, 24);

  // Cat movement and sniffing
  if(!snackShown) {
    if(step%40 === 0) {
      sniffFrame = 0;
    }
    if(step%60 < 40) {
      catX += catDir*1.1;
      if(catX > canvas.width-CAT_W-10) catDir = -1;
      if(catX < 10) catDir = 1;
      drawCat(catX, catY, false);
    } else {
      sniffFrame++;
      drawCat(catX, catY, true);
      // Draw smell lines (cat is sniffing)
      ctx.strokeStyle = "#e2c45c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(catX+32, catY+4);
      ctx.lineTo(catX+32, catY-12+Math.sin(sniffFrame/2)*3);
      ctx.stroke();
    }
    step++;
  } else {
    // Show snack, grow it, cat sniffs it
    drawCat(catX, catY, true);
    drawSnack(catX+CAT_W/2, catY+CAT_H/2+10, snackScale);
    if(snackGrow && snackScale < 2.2) {
      snackScale += 0.07;
    } else if(snackGrow && snackScale >= 2.2) {
      // Begin fade after snack grows
      snackGrow = false;
      setTimeout(() => { fade = true; }, 800);
    }
  }

  // Fade overlay
  if(fade) {
    fadeOverlay.style.opacity = 1;
    setTimeout(() => {
      landingPage.style.opacity = 1;
      landingPage.style.pointerEvents = "auto";
      landed = true;
    }, 2000);
  }

  if(!landed) requestAnimationFrame(animate);
}
// Living room background
ctx.fillStyle = "#e9d5b4"; // warm wall color
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Rug
ctx.beginPath();
ctx.ellipse(canvas.width/2, canvas.height-60, 180, 32, 0, 0, Math.PI*2);
ctx.fillStyle = "#ecd9b0";
ctx.fill();

// Sofa
ctx.fillStyle = "#d2b48c";
ctx.fillRect(120, canvas.height-180, 300, 90);
ctx.fillStyle = "#bfa078";
ctx.fillRect(100, canvas.height-210, 340, 40); // sofa backrest

// Potted plant
ctx.fillStyle = "#8d6748";
ctx.fillRect(canvas.width-120, canvas.height-120, 24, 40); // pot
ctx.beginPath();
ctx.arc(canvas.width-108, canvas.height-120, 28, Math.PI, 0);
ctx.fillStyle = "#b5cba1";
ctx.fill();

// Button event
feedBtn.onclick = () => {
  if(snackShown) return;
  snackShown = true;
  snackGrow = true;
  feedBtn.disabled = true;
  feedBtn.style.opacity = 0.5;
};

window.onload = () => {
  fadeOverlay.style.opacity = 0;
  landingPage.style.opacity = 0;
  landingPage.style.pointerEvents = "none";
  animate();
};
