const SPRITES = {
  IDLE: ["assets/sprites/henry/idle-1.png"],
  LEFT: ["assets/sprites/henry/left-1.png"],
  JUMP: ["assets/sprites/henry/jump-1.png"],
  MAGIC: ["assets/sprites/henry/magic-1.png"],
  // RIGHT não tem array próprio — usa o frame de LEFT espelhado no desenho
};

let currentState = "IDLE";
let currentFrame = 0;
const loadedImages = {};

// posição do Henry no Canvas — LEFT/RIGHT alteram henryX de verdade, senão o personagem só troca de sprite "andando parado" no mesmo lugar.
// sim, isso estava ocorrendo :c
const HENRY_SIZE = 120;
let henryX = 480 / 2 - HENRY_SIZE / 2;
const HENRY_Y = 100;
const MOVE_SPEED = 2; // pixels por frame

function getImage(path) {
  if (loadedImages[path]) return loadedImages[path];
  const img = new Image();
  img.src = path;
  img.onerror = () => { img.failed = true; };
  loadedImages[path] = img;
  return img;
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function drawHenry() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const isRight = currentState === "RIGHT";
  const spriteKey = isRight ? "LEFT" : currentState; // RIGHT usa os frames de LEFT
  const frames = SPRITES[spriteKey];
  const img = getImage(frames[currentFrame % frames.length]);
  const isImageReady = img.complete && !img.failed && img.naturalWidth > 0;

  const drawX = isRight ? canvas.width - henryX - HENRY_SIZE : henryX;

  ctx.save();
  if (isRight) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // espelha horizontalmente
  }

  if (isImageReady) {
    // preserva a proporção original
    const scale = Math.min(HENRY_SIZE / img.naturalWidth, HENRY_SIZE / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    // centraliza dentro do espaço 
    const offsetX = (HENRY_SIZE - drawW) / 2;
    const offsetY = (HENRY_SIZE - drawH) / 2;
    ctx.drawImage(img, drawX + offsetX, HENRY_Y + offsetY, drawW, drawH);
  } else {
    // o gato aparece mesmo antes dos frames de cada estado estarem prontos
    const fallbackImg = getImage(SPRITES.IDLE[0]);
    if (fallbackImg.complete && !fallbackImg.failed && fallbackImg.naturalWidth > 0) {
      ctx.drawImage(fallbackImg, drawX, HENRY_Y, HENRY_SIZE, HENRY_SIZE);
    }
  }
  ctx.restore();
}

setInterval(() => { currentFrame++; }, 250);

function renderLoop() {
  if (currentState === "LEFT") henryX -= MOVE_SPEED;
  if (currentState === "RIGHT") henryX += MOVE_SPEED;

  // não deixa o Henry sair 
  henryX = Math.max(0, Math.min(canvas.width - HENRY_SIZE, henryX));

  drawHenry();
  requestAnimationFrame(renderLoop);
}
renderLoop();

const ACTION_DURATION = { LEFT: 1500, RIGHT: 1500, JUMP: 1500, MAGIC: 2000 };
const COOLDOWN_MS = 1600; // maior que ACTION_DURATION.JUMP, senão o cooldown nem chega a valer
const lastActionTime = { JUMP: 0, MAGIC: 0 };
let actionTimeout = null;

const CLASS_TO_STATE = {
  "Pulo": "JUMP",
  "Esquerda": "LEFT",
  "Direita": "RIGHT",
  "Magia": "MAGIC",
};

function executarAcao(label) {
  const state = CLASS_TO_STATE[label];

  // ruído de fundo ou classe não mapeada: não interrompe a animação em andamento
  if (!state) return;

  const now = Date.now();
  if ((state === "JUMP" || state === "MAGIC") && now - lastActionTime[state] < COOLDOWN_MS) {
    return; // ainda em cooldown, ignora
  }
  if (state === "JUMP" || state === "MAGIC") {
    lastActionTime[state] = now;
  }

  // só reinicia a animação se o estado mudou 
  if (currentState !== state) {
    currentState = state;
    currentFrame = 0;
  }

  // reagenda o retorno ao IDLE — se um novo comando chegar antes, cancela o anterior
  clearTimeout(actionTimeout);
  actionTimeout = setTimeout(() => {
    currentState = "IDLE";
    currentFrame = 0;
  }, ACTION_DURATION[state]);
}

// ---------------------------------------------------------------------
// DEBUG_KEYBOARD: true durante o desenvolvimento (testa sem depender da
// voz), false na apresentação. Melhor que apagar o código — se o
// reconhecimento de voz falhar na hora, dá pra ligar de novo (F12 →
// console → DEBUG_KEYBOARD = true) e testar a animação isoladamente.
// ---------------------------------------------------------------------
let DEBUG_KEYBOARD = false;
if (DEBUG_KEYBOARD) {
  window.addEventListener("keydown", (e) => {
    if (e.key === "j") executarAcao("Pula");
    if (e.key === "a") executarAcao("Esquerda");
    if (e.key === "d") executarAcao("Direita");
    if (e.key === "m") executarAcao("Magia");
  });
}