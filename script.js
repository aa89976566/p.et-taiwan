const canvas = document.getElementById("catCanvas");
const ctx = canvas.getContext("2d");
const feedBtn = document.getElementById("feedBtn");
const fadeOverlay = document.getElementById("fadeOverlay");
const landingPage = document.getElementById("landingPage");

// Cat variables
const CAT_W = 110, CAT_H = 88;
let catX = 140, catY = 290, catDir = 1;
let catMeowTimer = 0, catMeowDuration = 0;

// Dog variables
const DOG_W = 120, DOG_H = 80;
let dogX = 640, dogY = 305, dogAnim = 0;

let snackShown = false, snackScale = 1, snackGrow = false, fade = false, landed = false;
let step = 0;

function drawLivingRoom() {
  // Wall
  ctx.fillStyle = "#ecd3a1";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Rug
  ctx.beginPath();
  ctx.ellipse(canvas.width/2, 360, 250, 38, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#e9b876";
  ctx.fill();

  // Sofa
  ctx.save();
  ctx.translate(240, 220);
  ctx.fillStyle = "#a8845b";
  ctx.fillRect(-60, 0, 230, 65);
  ctx.fillStyle = "#d6bb9c";
  ctx.fillRect(-80, -32, 270, 38);
  ctx.restore();

  // TV
  ctx.save();
  ctx.translate(700, 60);
  ctx.fillStyle = "#232d38";
  ctx.fillRect(-45, 0, 90, 48);
  ctx.fillStyle = "#b1f1e3";
  ctx.fillRect(-39, 6, 78, 31);
  ctx.restore();

  // Computer (on the right)
  ctx.save();
  ctx.translate(700, 145);
  ctx.fillStyle = "#353360";
  ctx.fillRect(-20, 0, 40, 25);
  ctx.fillStyle = "#aaf2e2";
  ctx.fillRect(-15, 5, 30, 14);
  ctx.restore();

  // Alien lamp
  ctx.save();
  ctx.translate(120, 70);
  ctx.beginPath();
  ctx.arc(0, 0, 21, 0, 2 * Math.PI);
  ctx.fillStyle = "#f7f791";
  ctx.shadowColor = '#f7f791';
  ctx.shadowBlur = 36;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(-2, 22);
  ctx.lineTo(-2, 54);
  ctx.lineTo(2, 54);
  ctx.lineTo(2, 22);
  ctx.closePath();
  ctx.fillStyle = "#a8845b";
  ctx.fill();
  ctx.restore();
}

function drawCat(x, y, sniff = false, meow = false) {
  ctx.save();
  ctx.translate(x, y);

  // Body (round and plushy)
  ctx.beginPath();
  ctx.ellipse(0, 34, 45, 33, 0, 0, 2*Math.PI);
  ctx.fillStyle = "#f7ca48";
  ctx.fill();

  // Head (round)
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, 2*Math.PI);
  ctx.fillStyle = "#f7ca48";
  ctx.fill();

  // Ears (rounded triangles)
  ctx.beginPath();
  ctx.moveTo(-16, -24); ctx.lineTo(-29, -41); ctx.lineTo(-3, -20);
  ctx.moveTo(16, -24); ctx.lineTo(29, -41); ctx.lineTo(3, -20);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.beginPath();
  ctx.arc(-10, -7, 6, 0, 2*Math.PI);
  ctx.arc(10, -7, 6, 0, 2*Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-10, -7, 3, 0, 2*Math.PI);
  ctx.arc(10, -7, 3, 0, 2*Math.PI);
  ctx.fillStyle = "#000";
  ctx.fill();

  // Nose
  ctx.beginPath();
  ctx.ellipse(0, 4 + (sniff ? 2*Math.sin(step/3) : 0), 5, 2.5, 0, 0, 2*Math.PI);
  ctx.fillStyle = "#ffb347";
  ctx.fill();

  // Mouth
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(-4, 14);
  ctx.moveTo(0, 10);
  ctx.lineTo(4, 14);
  ctx.strokeStyle = "#bfa529";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Whiskers
  ctx.beginPath();
  ctx.moveTo(-16, 7); ctx.lineTo(-32, 3);
  ctx.moveTo(-16, 10); ctx.lineTo(-32, 14);
  ctx.moveTo(16, 7); ctx.lineTo(32, 3);
  ctx.moveTo(16, 10); ctx.lineTo(32, 14);
  ctx.strokeStyle = "#c2a343";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Tail (wiggle)
  ctx.save();
  ctx.translate(38, 39);
  ctx.rotate(Math.sin(step/18)*0.33);
  ctx.beginPath();
  ctx.ellipse(0, 0, 29, 8, 0, 0, 2 * Math.PI);
  ctx.fillStyle = "#f7ca48";
  ctx.fill();
  ctx.restore();

  ctx.restore();

  // Meow bubble
  if (meow) {
    ctx.save();
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#fff8c2";
    ctx.strokeStyle = "#2e1a0f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + 50, y - 60, 44, 23, 0, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#bfa529";
    ctx.fillText("MEOW", x + 20, y - 52);
    ctx.restore();
  }
}

function drawDog(x, y) {
  ctx.save();
  ctx.translate(x, y);
  // Body
  ctx.beginPath();
  ctx.ellipse(0, 30, 43, 27, 0, 0, 2 * Math.PI);
  ctx.fillStyle = "#d1bfa3";
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(0, 0, 27, 0, 2 * Math.PI);
  ctx.fillStyle = "#d1bfa3";
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.ellipse(-18, -18, 7, 16, -0.4, 0, 2*Math.PI);
  ctx.ellipse(18, -18, 7, 16, 0.4, 0, 2*Math.PI);
  ctx.fillStyle = "#a2846e";
  ctx.fill();

  // Eyes
  ctx.beginPath();
  ctx.arc(-7, -5, 4, 0, 2*Math.PI);
  ctx.arc(7, -5, 4, 0, 2*Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-7, -5, 2, 0, 2*Math.PI);
  ctx.arc(7, -5, 2, 0, 2*Math.PI);
  ctx.fillStyle = "#000";
  ctx.fill();

  // Nose
  ctx.beginPath();
  ctx.arc(0, 4, 3, 0, 2*Math.PI);
  ctx.fillStyle = "#5b4a32";
  ctx.fill();

  // Mouth
  ctx.beginPath();
  ctx.moveTo(0, 10); ctx.lineTo(-2, 13);
  ctx.moveTo(0, 10); ctx.lineTo(2, 13);
  ctx.strokeStyle = "#5b4a32";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Tail (wagging)
  ctx.save();
  ctx.translate(36, 38);
  ctx.rotate(Math.sin(step/11)*0.5);
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 6, 0, 0, 2 * Math.PI);
  ctx.fillStyle = "#d1bfa3";
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawSnack(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Dry meat (alien)
  for (let i = -1; i <= 1; i++) {
    ctx.save();
    ctx.rotate(0.22 * i);
    ctx.beginPath();
    ctx.moveTo(i*19, 0);
    ctx.lineTo(i*19+10, 13);
    ctx.strokeStyle = "#b7662a";
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(i*19+8, 13, 7, 0, Math.PI*2);
    ctx.fillStyle = "#e3a96a";
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLivingRoom();

  // Alien symbols on wall for effect
  ctx.save();
  ctx.font = "bold 34px Arial";
  ctx.fillStyle = "#d4ff47";
  ctx.globalAlpha = 0.22;
  ctx.fillText("⏣ ⍟ ⟁ ⧫ ☍", 120, 80);
  ctx.globalAlpha = 1;
  ctx.restore();

  // Dog
  drawDog(dogX, dogY);

  // Cat walking logic and meow
  if (!snackShown) {
    if (step % 180 === 0) { // Meow every 3 seconds
      catMeowDuration = 30;
    }
    if (catMeowDuration > 0) {
      catMeowDuration--;
      drawCat(catX, catY, false, true);
    } else {
      drawCat(catX, catY, (step % 80 > 60), false);
    }

    // Cat walks between two points
    if (catX > 650) catDir = -1;
    if (catX < 120) catDir = 1;
    catX += catDir * 1.4;
    step++;
  } else {
    // Show snack, cat sniffs it
    drawCat(catX, catY, true, false);
    drawSnack(catX + 40, catY + 48, snackScale);
    if (snackGrow && snackScale < 2.3) {
      snackScale += 0.07;
    } else if (snackGrow && snackScale >= 2.3) {
      snackGrow = false;
      setTimeout(() => { fade = true; }, 700);
    }
  }

  // Fade overlay
  if (fade) {
    fadeOverlay.style.opacity = 1;
    setTimeout(() => {
      landingPage.style.opacity = 1;
      landingPage.style.pointerEvents = "auto";
      landed = true;
    }, 1600);
  }

  if (!landed) requestAnimationFrame(animate);
}

// --- Button logic and landing page ---
feedBtn.addEventListener("click", () => {
  if (!snackShown) {
    snackShown = true;
    snackGrow = true;
  }
});

// Initialize fade and landing page hidden
fadeOverlay.style.opacity = 0;
landingPage.style.opacity = 0;
landingPage.style.pointerEvents = "none";

// Start animation
animate();
