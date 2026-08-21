// henry.js — parte da Wanessa
// Responsabilidade única: guardar o estado do personagem e desenhá-lo
// no Canvas. NÃO sabe que existe reconhecimento de voz — só expõe
// executarAcao(nome), que qualquer coisa pode chamar (voz, teclado, etc).

// ---------------------------------------------------------------------
// Sprites por estado. RIGHT não tem array próprio — reaproveita LEFT
// espelhado no desenho (ver drawHenry). Enquanto uma imagem não existe
// ou falha ao carregar, o Canvas desenha um retângulo colorido com o
// nome do estado escrito, então dá pra testar tudo antes da arte ficar
// pronta ou enquanto os arquivos ainda não foram baixados.
// ---------------------------------------------------------------------
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

// posição do Henry no Canvas — LEFT/RIGHT alteram henryX de verdade,
// senão o personagem só troca de sprite "andando parado" no mesmo lugar.
// 480 é a largura do canvas definida no index.html (width="480") —
// se mudarem o tamanho do canvas lá, ajustem aqui também.
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

// ---------------------------------------------------------------------
// Desenha o Henry no Canvas a cada frame, com espelhamento pro RIGHT
// e fallback (retângulo + texto) enquanto a imagem não carregou
// ---------------------------------------------------------------------
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
    // preserva a proporção original da foto em vez de esticar pra
    // 120x120 fixo — fotos reais raramente são quadradas, e forçar o
    // tamanho quadrado é o que causa a distorção/"colapso" visual
    const scale = Math.min(HENRY_SIZE / img.naturalWidth, HENRY_SIZE / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    // centraliza dentro do espaço reservado de HENRY_SIZE x HENRY_SIZE
    const offsetX = (HENRY_SIZE - drawW) / 2;
    const offsetY = (HENRY_SIZE - drawH) / 2;
    ctx.drawImage(img, drawX + offsetX, HENRY_Y + offsetY, drawW, drawH);
  } else {
    // fallback: em vez de retângulo colorido, usa a imagem do IDLE
    // (sempre a primeira a existir) — assim o gato aparece mesmo
    // antes dos frames específicos de cada estado estarem prontos
    const fallbackImg = getImage(SPRITES.IDLE[0]);
    if (fallbackImg.complete && !fallbackImg.failed && fallbackImg.naturalWidth > 0) {
      ctx.drawImage(fallbackImg, drawX, HENRY_Y, HENRY_SIZE, HENRY_SIZE);
    }
  }
  ctx.restore();
}

setInterval(() => { currentFrame++; }, 250);

function renderLoop() {
  // é aqui que o Henry realmente anda — sem isso, LEFT/RIGHT só trocam
  // de sprite no mesmo lugar, parecendo "andar parado"
  if (currentState === "LEFT") henryX -= MOVE_SPEED;
  if (currentState === "RIGHT") henryX += MOVE_SPEED;

  // não deixa o Henry sair da área visível do canvas
  henryX = Math.max(0, Math.min(canvas.width - HENRY_SIZE, henryX));

  drawHenry();
  requestAnimationFrame(renderLoop);
}
renderLoop();

// ---------------------------------------------------------------------
// Regras de decisão: duração própria por ação, cooldown pra JUMP/MAGIC,
// e reset de frame só quando o estado muda de verdade
// ---------------------------------------------------------------------
// com 1 imagem só por estado, aumentamos a duração pra dar tempo de
// perceber a troca antes de voltar pro IDLE (ajuste esses valores em ms
// conforme o que ficar melhor na apresentação)
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

  // só reinicia a animação se o estado mudou de verdade
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