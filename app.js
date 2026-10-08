/**
 * AI WORKSHOP 2026: INTERACTIVE KEYNOTE CONTROLLER
 * Full client-side engine: Slide deck, Synthesized audio, Live Game Compiler,
 * Computer Vision Sandbox, Transformer Flow Simulator, and Offline QR Generator.
 */

// ============================================================================
// 1. STATE & CONSTANTS
// ============================================================================
const state = {
  currentSlide: 0,
  totalSlides: 5,
  soundEnabled: true,
  cameraActive: false,
  webcamStream: null,
  activeVisionMode: 'landmarks',
  activeStream: 'pcm',
  activeTimelineYear: 2026,
  temperature: 0.7,
  activeGame: 'tictactoe',
  gameInstance: null
};

// Web Audio API Context for tech sound effects
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
}

function playTone(freq, type = 'sine', duration = 0.08, vol = 0.08) {
  if (!state.soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

function playSlideSound() {
  playTone(440, 'triangle', 0.06, 0.06);
  setTimeout(() => playTone(880, 'sine', 0.09, 0.05), 40);
}

function playClickSound() {
  playTone(600, 'sine', 0.04, 0.04);
}

function playCompileSound() {
  playTone(320, 'square', 0.05, 0.04);
  setTimeout(() => playTone(640, 'sine', 0.08, 0.06), 70);
  setTimeout(() => playTone(1280, 'triangle', 0.12, 0.07), 140);
}

// ============================================================================
// 2. AMBIENT BACKGROUND CANVAS (Particle Grid & Constellation)
// ============================================================================
const ambientCanvas = document.getElementById('ambient-canvas');
const ambientCtx = ambientCanvas.getContext('2d');
let particles = [];
let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

function resizeAmbientCanvas() {
  ambientCanvas.width = window.innerWidth;
  ambientCanvas.height = window.innerHeight;
  initParticles();
}

function initParticles() {
  particles = [];
  const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 14000), 85);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * ambientCanvas.width,
      y: Math.random() * ambientCanvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.6 + 0.6,
      alpha: Math.random() * 0.5 + 0.2
    });
  }
}

function renderAmbientParticles() {
  ambientCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
  
  // Draw subtle grid overlay
  ambientCtx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
  ambientCtx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x < ambientCanvas.width; x += gridSize) {
    ambientCtx.beginPath();
    ambientCtx.moveTo(x, 0);
    ambientCtx.lineTo(x, ambientCanvas.height);
    ambientCtx.stroke();
  }
  for (let y = 0; y < ambientCanvas.height; y += gridSize) {
    ambientCtx.beginPath();
    ambientCtx.moveTo(0, y);
    ambientCtx.lineTo(ambientCanvas.width, y);
    ambientCtx.stroke();
  }

  // Update & draw particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = ambientCanvas.width;
    if (p.x > ambientCanvas.width) p.x = 0;
    if (p.y < 0) p.y = ambientCanvas.height;
    if (p.y > ambientCanvas.height) p.y = 0;

    ambientCtx.beginPath();
    ambientCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ambientCtx.fillStyle = `rgba(0, 242, 254, ${p.alpha})`;
    ambientCtx.fill();

    // Connect nearby particles
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 110) {
        ambientCtx.beginPath();
        ambientCtx.moveTo(p.x, p.y);
        ambientCtx.lineTo(p2.x, p2.y);
        ambientCtx.strokeStyle = `rgba(0, 242, 254, ${(1 - dist / 110) * 0.15})`;
        ambientCtx.lineWidth = 0.75;
        ambientCtx.stroke();
      }
    }
  }

  requestAnimationFrame(renderAmbientParticles);
}

window.addEventListener('resize', resizeAmbientCanvas);
window.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});
resizeAmbientCanvas();
renderAmbientParticles();

// ============================================================================
// 3. SLIDE DECK NAVIGATION & PRESENTATION REMOTE
// ============================================================================
const slides = document.querySelectorAll('.slide-section');
const navTabs = document.querySelectorAll('.nav-tab');
const dotBtns = document.querySelectorAll('.dot-btn');

function goToSlide(index) {
  if (index < 0 || index >= state.totalSlides) return;
  state.currentSlide = index;

  slides.forEach((slide, i) => {
    if (i === index) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  navTabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });

  dotBtns.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  playSlideSound();
  updatePresenterNotes();
}

function nextSlide() {
  if (state.currentSlide < state.totalSlides - 1) {
    goToSlide(state.currentSlide + 1);
  }
}

function prevSlide() {
  if (state.currentSlide > 0) {
    goToSlide(state.currentSlide - 1);
  }
}

// Remote / Keyboard listeners
document.addEventListener('keydown', (e) => {
  // Prevent overriding inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch (e.key) {
    case 'ArrowRight':
    case 'PageDown':
    case ' ':
    case 'Enter':
      e.preventDefault();
      nextSlide();
      break;
    case 'ArrowLeft':
    case 'PageUp':
    case 'Backspace':
      e.preventDefault();
      prevSlide();
      break;
    case 'f':
    case 'F':
      e.preventDefault();
      toggleFullscreen();
      break;
    case 'n':
    case 'N':
      e.preventDefault();
      toggleNotesModal();
      break;
    case 'm':
    case 'M':
      e.preventDefault();
      toggleSound();
      break;
    case 'Escape':
      closeAllModals();
      break;
  }
});

// Click handlers for tabs & dots
navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const idx = parseInt(tab.getAttribute('data-slide'), 10);
    goToSlide(idx);
  });
});

dotBtns.forEach(dot => {
  dot.addEventListener('click', () => {
    const idx = parseInt(dot.getAttribute('data-slide'), 10);
    goToSlide(idx);
  });
});

document.getElementById('btn-next-slide').addEventListener('click', nextSlide);
document.getElementById('btn-prev-slide').addEventListener('click', prevSlide);

// Fullscreen Toggle
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    document.getElementById('fs-icon').textContent = '✕';
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
      document.getElementById('fs-icon').textContent = '⛶';
    }
  }
}
document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);

// Sound Toggle
function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  document.getElementById('sound-icon').textContent = state.soundEnabled ? '🔊' : '🔇';
  if (state.soundEnabled) playClickSound();
}
document.getElementById('btn-sound').addEventListener('click', toggleSound);

// ============================================================================
// 4. SLIDE 1: "MIND BLOWN" TIMELINE ENGINE
// ============================================================================
const timelineData = {
  2022: {
    era: "ERA 01 // TEXT & PROMPT GENESIS",
    headline: "The ChatGPT Earthquake: AI Learns Human Language",
    narrative: "November 2022 changed humanity forever. ChatGPT reached 100M users in 60 days. For the first time, an algorithm could write essays, draft legal memos, explain quantum physics in rhyming poetry, and pass the US Bar Exam.",
    cards: [
      { title: "ChatGPT-3.5", desc: "175 Billion parameters trained on the entire public internet." },
      { title: "DALL-E 2 & Midjourney", desc: "First explosion of photorealistic diffusion images from text prompts." },
      { title: "Prompt Engineering", desc: "A brand new career emerged: 'Talking to machines in English'." }
    ]
  },
  2023: {
    era: "ERA 02 // MULTIMODAL AWAKENING",
    headline: "Eyes, Ears & Brains: Beyond Pure Text",
    narrative: "AI stopped being just a chatbot. GPT-4 arrived with vision—it could look at a whiteboard sketch and convert it into working HTML code. Voice models like Whisper transcribed 100 languages in real time.",
    cards: [
      { title: "GPT-4 Multimodal", desc: "Understands complex diagrams, medicine scans, and handwritten math." },
      { title: "GitHub Copilot", desc: "50% of production code in Silicon Valley started being AI-assisted." },
      { title: "Open Weights Surge", desc: "Meta released Llama; anyone could run an AI model on a gaming PC." }
    ]
  },
  2024: {
    era: "ERA 03 // REASONING & GENERATIVE CINEMA",
    headline: "Self-Correction, Sora & Reasoning Chains",
    narrative: "Models stopped guessing next tokens blindly and started 'thinking' before answering (Chain of Thought). OpenAI o1/o3 and DeepSeek solved International Math Olympiad questions. Video generation reached cinematic quality with Sora.",
    cards: [
      { title: "Reasoning Models (o1/o3)", desc: "Internal 'system 2' thinking chains; PhD-level science benchmark scores." },
      { title: "Sora & Gen-3 Video", desc: "Full 1080p photorealistic videos generated in 60 seconds." },
      { title: "2 Million Context", desc: "Upload 30 textbooks or entire codebases into a single conversation." }
    ]
  },
  2025: {
    era: "ERA 04 // AUTONOMOUS AGENT SWARMS",
    headline: "From Chatbots to Autonomous Co-Workers",
    narrative: "AI moved from passive answering to executing complex jobs end-to-end. AI agents browse the web, create pull requests, test codebases, make phone calls, and conduct automated biomedical experiments without human handholding.",
    cards: [
      { title: "Autonomous Devs", desc: "Agents receive a bug report, reproduce it, test fixes, and commit code." },
      { title: "AlphaFold 3 Releases", desc: "Predicts interactions of proteins, DNA, RNA, and ligands for new drugs." },
      { title: "Multi-Agent Swarms", desc: "Specialized sub-agents collaborating like a virtual software company." }
    ]
  },
  2026: {
    era: "ERA 05 // EMBODIED AI & PHYSICAL INTELLIGENCE",
    headline: "The Physical Leap: Robots, Edge AI & World Models",
    narrative: "AI has stepped out of computer screens into the physical world. Humanoid robots (Figure 02, Tesla Optimus) use unified multimodal neural networks to walk factories, fold laundry, and operate real tools in real-time.",
    cards: [
      { title: "Humanoid Robotics", desc: "Vision-Language-Action (VLA) models running directly on robotic joints." },
      { title: "In-Browser WebGPU", desc: "Full frontier intelligence running on client devices with zero server cost." },
      { title: "Universal Agents", desc: "One AI system that can write code, operate software, and analyze live cameras." }
    ]
  }
};

const timelineRange = document.getElementById('timeline-range');
const timelineDetailBox = document.getElementById('timeline-detail');
const yearPills = document.querySelectorAll('.year-pill');

function renderTimelineYear(year) {
  state.activeTimelineYear = year;
  const data = timelineData[year];
  if (!data) return;

  yearPills.forEach(pill => {
    pill.classList.toggle('active', parseInt(pill.getAttribute('data-year'), 10) === year);
  });
  if (timelineRange) timelineRange.value = year;

  timelineDetailBox.innerHTML = `
    <div>
      <div class="tl-era-badge">⚡ ${data.era}</div>
      <h3 class="tl-headline">${data.headline}</h3>
      <p class="tl-narrative">${data.narrative}</p>
    </div>
    <div class="tl-breakthroughs">
      ${data.cards.map(c => `
        <div class="tl-card">
          <div class="tl-card-title">${c.title}</div>
          <div class="tl-card-sub">${c.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

if (timelineRange) {
  timelineRange.addEventListener('input', (e) => {
    const year = parseInt(e.target.value, 10);
    renderTimelineYear(year);
    playClickSound();
  });
}

yearPills.forEach(pill => {
  pill.addEventListener('click', () => {
    const year = parseInt(pill.getAttribute('data-year'), 10);
    renderTimelineYear(year);
    playClickSound();
  });
});

renderTimelineYear(2026);

// ============================================================================
// 5. SLIDE 2: REAL-TIME LIVE AI PLAYGROUND (APP GENERATOR + VISION)
// ============================================================================
const sandboxContainer = document.getElementById('sandbox-container');
const compilerTerminal = document.getElementById('compiler-terminal');
const customAppPrompt = document.getElementById('custom-app-prompt');
const btnCompileApp = document.getElementById('btn-compile-app');
const promptChips = document.querySelectorAll('.prompt-chip');

const appPresets = {
  tictactoe: {
    prompt: "Make a futuristic Tic-Tac-Toe with an unbeatable AI bot!",
    builder: buildTicTacToe
  },
  pong: {
    prompt: "Create a cyberpunk neon Pong game against an AI paddle!",
    builder: buildCyberPong
  },
  reflex: {
    prompt: "Build an AI Reaction & Reflex benchmark tool for students!",
    builder: buildReflexTest
  },
  gravity: {
    prompt: "Spawn a quantum particle gravity well simulation!",
    builder: buildGravityWell
  }
};

promptChips.forEach(chip => {
  chip.addEventListener('click', () => {
    promptChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const appKey = chip.getAttribute('data-app');
    state.activeGame = appKey;
    if (appPresets[appKey]) {
      customAppPrompt.value = appPresets[appKey].prompt;
      executeLiveAppCompilation(appKey);
    }
  });
});

btnCompileApp.addEventListener('click', () => {
  executeLiveAppCompilation(state.activeGame);
});

function executeLiveAppCompilation(appKey) {
  playCompileSound();
  compilerTerminal.classList.add('active');
  btnCompileApp.disabled = true;

  setTimeout(() => {
    compilerTerminal.classList.remove('active');
    btnCompileApp.disabled = false;
    
    // Cleanup previous loop if any
    if (state.gameInstance && typeof state.gameInstance.cleanup === 'function') {
      state.gameInstance.cleanup();
    }

    if (appPresets[appKey]) {
      state.gameInstance = appPresets[appKey].builder(sandboxContainer);
    } else {
      state.gameInstance = buildTicTacToe(sandboxContainer);
    }
  }, 450);
}

// ----------------------------------------------------------------------------
// Playground Game 1: Unbeatable Tic-Tac-Toe AI
// ----------------------------------------------------------------------------
function buildTicTacToe(container) {
  container.innerHTML = `
    <div class="game-ttt-wrapper">
      <div class="ttt-status-bar" id="ttt-status">YOU ARE 'X' — YOUR TURN (VS AI BOT)</div>
      <div class="ttt-grid" id="ttt-grid">
        ${[0,1,2,3,4,5,6,7,8].map(i => `<div class="ttt-cell" data-idx="${i}"></div>`).join('')}
      </div>
      <div class="ttt-controls">
        <button class="btn-secondary" id="btn-reset-ttt">🔄 Reset Game</button>
      </div>
    </div>
  `;

  let board = Array(9).fill(null);
  let human = 'X';
  let ai = 'O';
  let gameOver = false;
  const statusEl = document.getElementById('ttt-status');
  const cells = container.querySelectorAll('.ttt-cell');

  function checkWinner(b) {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let line of lines) {
      const [a, bIdx, c] = line;
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) return b[a];
    }
    if (b.every(cell => cell !== null)) return 'draw';
    return null;
  }

  function minimax(newBoard, player) {
    const availSpots = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    const win = checkWinner(newBoard);
    if (win === ai) return { score: 10 };
    if (win === human) return { score: -10 };
    if (win === 'draw') return { score: 0 };

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
      const move = {};
      move.index = availSpots[i];
      newBoard[availSpots[i]] = player;

      if (player === ai) {
        const result = minimax(newBoard, human);
        move.score = result.score;
      } else {
        const result = minimax(newBoard, ai);
        move.score = result.score;
      }

      newBoard[availSpots[i]] = null;
      moves.push(move);
    }

    let bestMove;
    if (player === ai) {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    return moves[bestMove];
  }

  function handleHumanMove(idx) {
    if (board[idx] || gameOver) return;
    board[idx] = human;
    renderBoard();
    playTone(520, 'sine', 0.05);

    const winner = checkWinner(board);
    if (winner) {
      endGame(winner);
      return;
    }

    statusEl.textContent = "🤖 AI IS CALCULATING OPTIMAL BRANCH...";
    setTimeout(() => {
      if (gameOver) return;
      const best = minimax(board, ai);
      if (best && best.index !== undefined) {
        board[best.index] = ai;
        playTone(380, 'triangle', 0.06);
      }
      renderBoard();
      const endWin = checkWinner(board);
      if (endWin) {
        endGame(endWin);
      } else {
        statusEl.textContent = "YOUR TURN — CHOOSE CAREFULLY!";
      }
    }, 240);
  }

  function endGame(winner) {
    gameOver = true;
    if (winner === 'draw') {
      statusEl.textContent = "🤝 DRAW! UNBEATABLE AI HELD THE LINE.";
      playTone(400, 'sine', 0.15);
    } else if (winner === human) {
      statusEl.textContent = "🎉 YOU WON! (UNHEARD OF!)";
      playTone(880, 'sine', 0.2);
    } else {
      statusEl.textContent = "🤖 AI BOT WINS! (MINIMAX TREE SOLVED)";
      playTone(220, 'sawtooth', 0.15);
    }
  }

  function renderBoard() {
    cells.forEach((cell, i) => {
      cell.textContent = board[i] || '';
      cell.className = 'ttt-cell' + (board[i] === 'X' ? ' x-mark taken' : board[i] === 'O' ? ' o-mark taken' : '');
    });
  }

  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const idx = parseInt(cell.getAttribute('data-idx'), 10);
      handleHumanMove(idx);
    });
  });

  document.getElementById('btn-reset-ttt').addEventListener('click', () => {
    board = Array(9).fill(null);
    gameOver = false;
    statusEl.textContent = "YOU ARE 'X' — YOUR TURN (VS AI BOT)";
    renderBoard();
    playClickSound();
  });

  return {
    cleanup: () => {}
  };
}

// ----------------------------------------------------------------------------
// Playground Game 2: Neon Cyber Pong
// ----------------------------------------------------------------------------
function buildCyberPong(container) {
  container.innerHTML = `
    <div class="pong-wrapper">
      <div class="ttt-status-bar" id="pong-score">PLAYER: 0 | AI BOT: 0</div>
      <canvas id="pong-canvas" width="480" height="250"></canvas>
      <div class="game-instructions">Move mouse up/down to control green paddle. AI defends right paddle.</div>
    </div>
  `;

  const canvas = document.getElementById('pong-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('pong-score');

  let pScore = 0;
  let aiScore = 0;
  let paddleH = 50;
  let paddleW = 8;
  let playerY = canvas.height / 2 - paddleH / 2;
  let aiY = canvas.height / 2 - paddleH / 2;
  let ballX = canvas.width / 2;
  let ballY = canvas.height / 2;
  let ballVx = 3.5;
  let ballVy = 2.2;
  let animId = null;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerY = Math.max(0, Math.min(canvas.height - paddleH, mouseY - paddleH / 2));
  });

  function resetBall(direction = 1) {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballVx = 3.5 * direction;
    ballVy = (Math.random() - 0.5) * 4;
  }

  function loop() {
    // AI predictive tracking
    const aiCenter = aiY + paddleH / 2;
    const aiTarget = ballY + (Math.sin(Date.now() / 200) * 8);
    aiY += (aiTarget - aiCenter) * 0.12;
    aiY = Math.max(0, Math.min(canvas.height - paddleH, aiY));

    // Ball physics
    ballX += ballVx;
    ballY += ballVy;

    if (ballY - 4 < 0 || ballY + 4 > canvas.height) {
      ballVy = -ballVy;
      playTone(300, 'sine', 0.03, 0.03);
    }

    // Paddle hits
    // Player paddle (x=10)
    if (ballX - 4 <= 10 + paddleW && ballX + 4 >= 10 && ballY >= playerY && ballY <= playerY + paddleH) {
      ballVx = Math.abs(ballVx) * 1.05;
      const hitOffset = (ballY - (playerY + paddleH / 2)) / (paddleH / 2);
      ballVy = hitOffset * 4.5;
      playTone(550, 'square', 0.04, 0.04);
    }

    // AI paddle (x=canvas.width - 10 - paddleW)
    const aiPaddleX = canvas.width - 10 - paddleW;
    if (ballX + 4 >= aiPaddleX && ballX - 4 <= aiPaddleX + paddleW && ballY >= aiY && ballY <= aiY + paddleH) {
      ballVx = -Math.abs(ballVx) * 1.05;
      playTone(480, 'square', 0.04, 0.04);
    }

    // Goal scoring
    if (ballX < 0) {
      aiScore++;
      scoreEl.textContent = `PLAYER: ${pScore} | AI BOT: ${aiScore}`;
      playTone(200, 'sawtooth', 0.1);
      resetBall(1);
    } else if (ballX > canvas.width) {
      pScore++;
      scoreEl.textContent = `PLAYER: ${pScore} | AI BOT: ${aiScore}`;
      playTone(800, 'triangle', 0.12);
      resetBall(-1);
    }

    // Draw
    ctx.fillStyle = '#03060d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center dash
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle (green)
    ctx.fillStyle = '#00f5a0';
    ctx.shadowColor = '#00f5a0';
    ctx.shadowBlur = 10;
    ctx.fillRect(10, playerY, paddleW, paddleH);

    // AI paddle (cyan)
    ctx.fillStyle = '#00f2fe';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 10;
    ctx.fillRect(canvas.width - 10 - paddleW, aiY, paddleW, paddleH);

    // Ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    animId = requestAnimationFrame(loop);
  }

  loop();

  return {
    cleanup: () => {
      cancelAnimationFrame(animId);
    }
  };
}

// ----------------------------------------------------------------------------
// Playground Game 3: AI Neural Reflex Test
// ----------------------------------------------------------------------------
function buildReflexTest(container) {
  container.innerHTML = `
    <div class="reflex-wrapper">
      <div class="ttt-status-bar" id="reflex-status">TEST HUMAN REFLEX SPEED VS AI PREDICTIONS</div>
      <div class="reflex-target idle" id="reflex-target">CLICK TO START</div>
      <div class="game-instructions" id="reflex-benchmark">AI Reaction: 2.1 ms | Average Human: 250 ms</div>
    </div>
  `;

  const target = document.getElementById('reflex-target');
  const statusEl = document.getElementById('reflex-status');
  const benchEl = document.getElementById('reflex-benchmark');

  let stateMode = 'idle'; // idle -> ready -> go
  let startTime = 0;
  let timerTimeout = null;

  target.addEventListener('click', () => {
    if (stateMode === 'idle') {
      stateMode = 'ready';
      target.className = 'reflex-target ready';
      target.textContent = 'WAIT...';
      statusEl.textContent = 'WAIT FOR GREEN EMERALD FLASH...';
      playTone(400, 'sine', 0.05);

      const delay = Math.random() * 2500 + 1500;
      timerTimeout = setTimeout(() => {
        stateMode = 'go';
        target.className = 'reflex-target go';
        target.textContent = 'CLICK NOW!';
        startTime = performance.now();
        playTone(880, 'triangle', 0.08);
      }, delay);
    } else if (stateMode === 'ready') {
      clearTimeout(timerTimeout);
      stateMode = 'idle';
      target.className = 'reflex-target idle';
      target.textContent = 'TOO EARLY!';
      statusEl.textContent = '⚠️ False start! Wait for green.';
      playTone(180, 'sawtooth', 0.15);
      setTimeout(() => {
        target.textContent = 'CLICK TO START';
      }, 1200);
    } else if (stateMode === 'go') {
      const reactionTime = Math.round(performance.now() - startTime);
      stateMode = 'idle';
      target.className = 'reflex-target idle';
      target.textContent = `${reactionTime} ms`;
      
      let verdict = reactionTime < 200 ? "⚡ Godlike Gamer Reflexes!" : reactionTime < 280 ? "🎯 Sharp & Fast!" : "🐢 A bit slow!";
      statusEl.textContent = `${verdict} (AI beat you by ${Math.max(1, reactionTime - 2)} ms)`;
      benchEl.textContent = `Your Score: ${reactionTime}ms | Model Latency: 2.1ms`;
      playTone(660, 'sine', 0.1);
    }
  });

  return {
    cleanup: () => {
      clearTimeout(timerTimeout);
    }
  };
}

// ----------------------------------------------------------------------------
// Playground Game 4: Quantum Particle Gravity Well
// ----------------------------------------------------------------------------
function buildGravityWell(container) {
  container.innerHTML = `
    <div class="pong-wrapper">
      <div class="ttt-status-bar">CLICK & MOVE TO MOVE NEURAL GRAVITY SINGULARITY</div>
      <canvas id="gravity-canvas" width="480" height="250"></canvas>
      <div class="game-instructions">Simulates 120 orbiting particles using N-body gravitational force.</div>
    </div>
  `;

  const canvas = document.getElementById('gravity-canvas');
  const ctx = canvas.getContext('2d');
  let gravityX = canvas.width / 2;
  let gravityY = canvas.height / 2;
  let animId = null;

  const simParticles = [];
  for (let i = 0; i < 110; i++) {
    simParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color: `hsl(${Math.random() * 60 + 170}, 100%, 65%)`
    });
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    gravityX = e.clientX - rect.left;
    gravityY = e.clientY - rect.top;
  });

  function loop() {
    ctx.fillStyle = 'rgba(3, 6, 13, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Singularity center
    ctx.beginPath();
    ctx.arc(gravityX, gravityY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0077';
    ctx.shadowColor = '#ff0077';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let p of simParticles) {
      const dx = gravityX - p.x;
      const dy = gravityY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 8;
      const force = 45 / (dist * dist);

      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;

      p.vx *= 0.985;
      p.vy *= 0.985;

      p.x += p.vx;
      p.y += p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    animId = requestAnimationFrame(loop);
  }

  loop();

  return {
    cleanup: () => {
      cancelAnimationFrame(animId);
    }
  };
}

// Initial sandbox boot
executeLiveAppCompilation('tictactoe');

// ----------------------------------------------------------------------------
// Vision & Spatial AI Sandbox
// ----------------------------------------------------------------------------
const webcamVideo = document.getElementById('webcam-video');
const visionCanvas = document.getElementById('vision-overlay-canvas');
const visionCtx = visionCanvas.getContext('2d');
const btnToggleCamera = document.getElementById('btn-toggle-camera');
const camBtnText = document.getElementById('cam-btn-text');
const hudStatus = document.getElementById('hud-status');
const hudEmotion = document.getElementById('hud-emotion');
const hudPose = document.getElementById('hud-pose');
const visionDemoBanner = document.getElementById('vision-demo-banner');
const visionModeChips = document.querySelectorAll('.vision-mode-chip');

let visionAnimId = null;
let simFaceX = 0;
let simFaceY = 0;

visionModeChips.forEach(chip => {
  chip.addEventListener('click', () => {
    visionModeChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.activeVisionMode = chip.getAttribute('data-mode');
    playClickSound();
  });
});

async function toggleWebcam() {
  if (!state.cameraActive) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      state.webcamStream = stream;
      webcamVideo.srcObject = stream;
      webcamVideo.style.display = 'block';
      state.cameraActive = true;
      btnToggleCamera.classList.add('active');
      camBtnText.textContent = 'Stop Webcam';
      hudStatus.textContent = 'LIVE WEBCAM STREAM ACTIVE';
      hudStatus.classList.add('text-green');
      visionDemoBanner.style.display = 'none';
      playTone(600, 'sine', 0.1);
    } catch (err) {
      alert("Webcam permission denied or no camera found. Falling back to the interactive virtual landmark mesh!");
      hudStatus.textContent = 'SIMULATED FACE SCANNER';
    }
  } else {
    if (state.webcamStream) {
      state.webcamStream.getTracks().forEach(t => t.stop());
    }
    webcamVideo.srcObject = null;
    webcamVideo.style.display = 'none';
    state.cameraActive = false;
    btnToggleCamera.classList.remove('active');
    camBtnText.textContent = 'Start Webcam';
    hudStatus.textContent = 'STANDBY / DEMO MESH';
    hudStatus.classList.remove('text-green');
    visionDemoBanner.style.display = 'block';
    playClickSound();
  }
}

btnToggleCamera.addEventListener('click', toggleWebcam);

function renderVisionOverlay() {
  visionCanvas.width = visionCanvas.clientWidth || 400;
  visionCanvas.height = visionCanvas.clientHeight || 300;
  visionCtx.clearRect(0, 0, visionCanvas.width, visionCanvas.height);

  const t = Date.now() / 1000;
  const cw = visionCanvas.width;
  const ch = visionCanvas.height;

  // Face position: follows center with subtle organic float or mouse
  const targetX = cw / 2 + Math.sin(t * 1.2) * 25;
  const targetY = ch / 2 + Math.cos(t * 0.9) * 15;
  simFaceX += (targetX - simFaceX) * 0.1;
  simFaceY += (targetY - simFaceY) * 0.1;

  const faceW = 140;
  const faceH = 175;

  // Update HUD text periodically
  const yaw = (Math.sin(t * 0.8) * 3).toFixed(1);
  const pitch = (Math.cos(t * 0.6) * 2.5).toFixed(1);
  hudPose.textContent = `Yaw: ${yaw > 0 ? '+' : ''}${yaw}° | Pitch: ${pitch > 0 ? '+' : ''}${pitch}°`;

  // Draw modes
  if (state.activeVisionMode === 'landmarks') {
    // 68 Facial Landmark Constellation Mesh
    drawFaceLandmarks(simFaceX, simFaceY, faceW, faceH, t);
  } else if (state.activeVisionMode === 'bounding') {
    // Cyber Bounding Box & Target Brackets
    drawBoundingBox(simFaceX, simFaceY, faceW, faceH, t);
  } else if (state.activeVisionMode === 'cyberpunk') {
    // Augmented Reality Sci-Fi Visor
    drawCyberVisor(simFaceX, simFaceY, faceW, faceH, t);
  } else if (state.activeVisionMode === 'matrix') {
    // Matrix Stream Overlay
    drawMatrixVision(simFaceX, simFaceY, faceW, faceH, t);
  }

  visionAnimId = requestAnimationFrame(renderVisionOverlay);
}

function drawFaceLandmarks(fx, fy, fw, fh, t) {
  // Generate key landmark points
  const points = [];
  // Jawline
  for (let i = 0; i <= 8; i++) {
    const angle = (i / 8) * Math.PI;
    points.push({ x: fx + Math.cos(angle) * (fw * 0.48), y: fy + Math.sin(angle) * (fh * 0.45) });
  }
  // Eyes
  const leftEye = { x: fx - fw * 0.22, y: fy - fh * 0.15 };
  const rightEye = { x: fx + fw * 0.22, y: fy - fh * 0.15 };
  // Nose
  const noseTip = { x: fx, y: fy + fh * 0.05 };
  // Lips
  const mouthL = { x: fx - fw * 0.15, y: fy + fh * 0.25 };
  const mouthR = { x: fx + fw * 0.15, y: fy + fh * 0.25 };
  const mouthC = { x: fx, y: fy + fh * 0.28 };

  points.push(leftEye, rightEye, noseTip, mouthL, mouthR, mouthC);

  // Draw triangles / wireframe lines
  visionCtx.strokeStyle = 'rgba(0, 242, 254, 0.45)';
  visionCtx.lineWidth = 1;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
      if (d < 70) {
        visionCtx.beginPath();
        visionCtx.moveTo(points[i].x, points[i].y);
        visionCtx.lineTo(points[j].x, points[j].y);
        visionCtx.stroke();
      }
    }
  }

  // Draw points
  for (let p of points) {
    visionCtx.beginPath();
    visionCtx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    visionCtx.fillStyle = '#00f2fe';
    visionCtx.shadowColor = '#00f2fe';
    visionCtx.shadowBlur = 6;
    visionCtx.fill();
    visionCtx.shadowBlur = 0;
  }
}

function drawBoundingBox(fx, fy, fw, fh, t) {
  const x = fx - fw / 2;
  const y = fy - fh / 2;

  // Outer border with animated corner brackets
  visionCtx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
  visionCtx.lineWidth = 2;

  const bracket = 20;
  // Top Left
  visionCtx.beginPath();
  visionCtx.moveTo(x, y + bracket);
  visionCtx.lineTo(x, y);
  visionCtx.lineTo(x + bracket, y);
  visionCtx.stroke();

  // Top Right
  visionCtx.beginPath();
  visionCtx.moveTo(x + fw - bracket, y);
  visionCtx.lineTo(x + fw, y);
  visionCtx.lineTo(x + fw, y + bracket);
  visionCtx.stroke();

  // Bottom Left
  visionCtx.beginPath();
  visionCtx.moveTo(x, y + fh - bracket);
  visionCtx.lineTo(x, y + fh);
  visionCtx.lineTo(x + bracket, y + fh);
  visionCtx.stroke();

  // Bottom Right
  visionCtx.beginPath();
  visionCtx.moveTo(x + fw - bracket, y + fh);
  visionCtx.lineTo(x + fw, y + fh);
  visionCtx.lineTo(x + fw, y + fh - bracket);
  visionCtx.stroke();

  // Scanning laser beam
  const scanY = y + ((Math.sin(t * 3) + 1) / 2) * fh;
  visionCtx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
  visionCtx.lineWidth = 1.5;
  visionCtx.beginPath();
  visionCtx.moveTo(x, scanY);
  visionCtx.lineTo(x + fw, scanY);
  visionCtx.stroke();

  // Label tag
  visionCtx.fillStyle = 'rgba(16, 185, 129, 0.9)';
  visionCtx.fillRect(x, y - 22, 120, 20);
  visionCtx.fillStyle = '#000';
  visionCtx.font = 'bold 11px JetBrains Mono, monospace';
  visionCtx.fillText('STUDENT_FACE #1', x + 6, y - 8);
}

function drawCyberVisor(fx, fy, fw, fh, t) {
  // Sci-fi holographic visor over eyes
  const visorW = fw * 0.9;
  const visorH = 34;
  const vx = fx - visorW / 2;
  const vy = fy - fh * 0.2;

  visionCtx.fillStyle = 'rgba(236, 72, 153, 0.25)';
  visionCtx.fillRect(vx, vy, visorW, visorH);

  visionCtx.strokeStyle = '#ec4899';
  visionCtx.lineWidth = 1.5;
  visionCtx.strokeRect(vx, vy, visorW, visorH);

  // Visor digital scan lines
  visionCtx.fillStyle = '#fff';
  visionCtx.font = '10px JetBrains Mono, monospace';
  visionCtx.fillText(`[NEURAL SYNC ${(98 + Math.sin(t)*1.5).toFixed(1)}%]`, vx + 8, vy + 20);
}

function drawMatrixVision(fx, fy, fw, fh, t) {
  const chars = "01010101ABCDEF0198273645";
  visionCtx.fillStyle = '#00f5a0';
  visionCtx.font = '10px monospace';

  for (let x = fx - fw / 2; x < fx + fw / 2; x += 14) {
    for (let y = fy - fh / 2; y < fy + fh / 2; y += 14) {
      const char = chars[Math.floor((x + y + t * 50) % chars.length)];
      visionCtx.fillText(char, x, y);
    }
  }
}

renderVisionOverlay();

// ============================================================================
// 6. SLIDE 3: "AI VS YOU" CAREER & FUTURE MATRIX
// ============================================================================
const streamData = {
  pcm: {
    title: "⚡ Physics, Math & Engineering (PCM / JEE)",
    badge: "REVOLUTION: HARD TECH & SIMULATION",
    caseTitle: "Space, Silicon & Generative CAD",
    caseDesc: "Engineering is no longer about drawing mechanical parts manually in AutoCAD. AI designs rocket engine brackets using topology optimization that humans could never conceive. In semiconductor chip design, AI places billions of transistors (Nvidia & Tenstorrent) in minutes.",
    roles: [
      { name: "Robotics Systems Architect", tag: "₹35-80 LPA" },
      { name: "AI Silicon & Hardware Engineer", tag: "Global Shortage" },
      { name: "Autonomous Systems Lead (EVs / Drones)", tag: "High Demand" },
      { name: "Computational Physics Researcher", tag: "PhD / Labs" }
    ]
  },
  biology: {
    title: "🧬 Biology, Medicine & Pharma (PCB / NEET)",
    badge: "REVOLUTION: DE NOVO DRUG DISCOVERY",
    caseTitle: "AlphaFold 3 & Curing Incurable Diseases",
    caseDesc: "Historically, discovering a single drug took 12 years and $2 Billion. AI has reduced molecule synthesis to 3 weeks. Doctors now use AI vision to detect early-stage cancers with 99.2% accuracy before a human eye can spot a tumor.",
    roles: [
      { name: "Computational Biologist", tag: "Fastest Growing" },
      { name: "AI-Guided Robotic Surgeon", tag: "Medical Frontier" },
      { name: "Genomic Sequencing Specialist", tag: "CRISPR + AI" },
      { name: "Clinical AI Safety Auditor", tag: "Healthcare Lead" }
    ]
  },
  commerce: {
    title: "📈 Commerce, Economics & Finance",
    badge: "REVOLUTION: NANOSECOND MARKETS",
    caseTitle: "High-Frequency Algorithmic Trading (HFT)",
    caseDesc: "Wall Street and Dalal Street don't have humans screaming on trading floors anymore. Algorithms trade in nanoseconds using reinforcement learning. AI predicts supply chain shocks, audits company balance sheets for fraud, and personalizes loans automatically.",
    roles: [
      { name: "Quantitative AI Trader (Quant)", tag: "₹50-1.5 Cr+" },
      { name: "FinTech Algorithmic Risk Architect", tag: "Banking Core" },
      { name: "Automated Forensic Auditor", tag: "Big 4 Shift" },
      { name: "Predictive Macroeconomist", tag: "Policy & Funds" }
    ]
  },
  arts: {
    title: "🎨 Arts, Media, Cinema & Design",
    badge: "REVOLUTION: SYNTHETIC CINEMA & NEURAL WORLDS",
    caseTitle: "Real-time Generative Worlds & Interactive Cinema",
    caseDesc: "A solo student with a laptop can now produce a Hollywood-grade visual trailer using Sora, Midjourney, and Unreal Engine 5. Game developers use AI to create infinite interactive storylines and NPC characters that talk with real human personalities.",
    roles: [
      { name: "Virtual Production & AI Director", tag: "Creative Tech" },
      { name: "Neural Aesthetic & Prompt Architect", tag: "Design Lead" },
      { name: "Spatial Game Narrative Designer", tag: "Gaming Studios" },
      { name: "Brand Intelligence Strategist", tag: "Agencies" }
    ]
  },
  law: {
    title: "⚖️ Law, Humanities & Public Policy",
    badge: "REVOLUTION: CONSTITUTIONAL & ALGORITHMIC GOVERNANCE",
    caseTitle: "Automated Case Law & AI Ethics Treaties",
    caseDesc: "Reading 50,000 pages of previous court rulings used to take legal teams months. AI cross-references precedent in 4 seconds. As AI takes over society, governments need lawyers and ethicists to write laws regulating autonomous weapons, deepfakes, and data privacy.",
    roles: [
      { name: "AI Ethics & Algorithmic Auditor", tag: "Gov & Big Tech" },
      { name: "Legal Tech Intelligence Specialist", tag: "Top Law Firms" },
      { name: "Autonomous Systems Policy Advisor", tag: "UN / Think Tanks" },
      { name: "Cyber Sovereignty Advocate", tag: "Supreme Court" }
    ]
  }
};

const careerStreamTabs = document.querySelectorAll('.stream-tab');
const careerContentDeck = document.getElementById('career-content-deck');

function renderCareerStream(streamKey) {
  state.activeStream = streamKey;
  const data = streamData[streamKey];
  if (!data) return;

  careerStreamTabs.forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-stream') === streamKey);
  });

  careerContentDeck.innerHTML = `
    <div class="career-grid-layout">
      <div class="career-revolution-col">
        <h3>${data.title}</h3>
        <div class="revolution-case-card">
          <span class="case-badge">💡 ${data.badge}</span>
          <h4 style="color: #fff; margin-bottom: 0.35rem; font-size: 1.1rem;">${data.caseTitle}</h4>
          <p class="case-desc">${data.caseDesc}</p>
        </div>
      </div>
      <div class="career-roles-col">
        <span class="roles-title">Top 2026-2030 Career Roles in This Field:</span>
        <div class="roles-list">
          ${data.roles.map(r => `
            <div class="role-pill-item">
              <span class="role-title">${r.name}</span>
              <span class="role-tag">${r.tag}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

careerStreamTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const stream = tab.getAttribute('data-stream');
    renderCareerStream(stream);
    playClickSound();
  });
});

renderCareerStream('pcm');

// ============================================================================
// 7. SLIDE 4: "DECONSTRUCT THE BLACK BOX" (TRANSFORMER ENGINE)
// ============================================================================
const neuralInputPrompt = document.getElementById('neural-input-prompt');
const btnRunNeuralFlow = document.getElementById('btn-run-neural-flow');
const tempRange = document.getElementById('temp-range');
const tempDisplay = document.getElementById('temp-display');
const tokensDisplay = document.getElementById('tokens-display');
const attentionWeb = document.getElementById('attention-web');
const probabilitiesRank = document.getElementById('probabilities-rank');
const emittedTokenDisplay = document.getElementById('emitted-token-display');

// Candidate prediction vocab banks
const vocabOptions = {
  "solved": [
    { word: "puzzle", baseProb: 0.62 },
    { word: "equation", baseProb: 0.22 },
    { word: "mystery", baseProb: 0.11 },
    { word: "problem", baseProb: 0.04 },
    { word: "sandwich", baseProb: 0.01 }
  ],
  "default": [
    { word: "solution", baseProb: 0.58 },
    { word: "challenge", baseProb: 0.24 },
    { word: "system", baseProb: 0.12 },
    { word: "future", baseProb: 0.05 },
    { word: "potato", baseProb: 0.01 }
  ]
};

function processTransformerPipeline() {
  playCompileSound();
  const text = neuralInputPrompt.value.trim() || "The autonomous agent solved the complex";
  const words = text.split(/\s+/);

  // 1. Tokenizer
  tokensDisplay.innerHTML = words.map((w, idx) => `
    <div class="token-chip" data-idx="${idx}">
      <span class="token-text">${w}</span>
      <span class="token-id">#${1000 + (w.length * 137 + idx * 43) % 8999}</span>
    </div>
  `).join('');

  // 2. Self Attention Web
  attentionWeb.innerHTML = words.map((w, i) => {
    const weight = Math.round((Math.sin(i * 1.5) + 1.2) * 40);
    return `
      <div class="attention-node-row" data-word="${w}">
        <span>${w} ➔ [Query]</span>
        <div class="att-weight-bar"><div class="att-weight-fill" style="width: ${weight}%;"></div></div>
        <span>${weight}%</span>
      </div>
    `;
  }).join('');

  // Add hover link effect
  const nodeRows = attentionWeb.querySelectorAll('.attention-node-row');
  nodeRows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.classList.add('highlighted');
      playTone(500, 'sine', 0.03, 0.03);
    });
    row.addEventListener('mouseleave', () => {
      row.classList.remove('highlighted');
    });
  });

  // 3. Probabilities based on Temperature
  const temp = state.temperature;
  const lastWord = words[words.length - 1].toLowerCase();
  const candidates = vocabOptions[lastWord] || vocabOptions["solved"];

  // Apply softmax temperature scaling: P_i = exp(log(p)/temp) / sum
  let sum = 0;
  const scaled = candidates.map(c => {
    const logP = Math.log(Math.max(c.baseProb, 0.0001));
    const val = Math.exp(logP / temp);
    sum += val;
    return { word: c.word, val };
  });

  const finalProbs = scaled.map(s => ({
    word: s.word,
    pct: Math.round((s.val / sum) * 100)
  })).sort((a, b) => b.pct - a.pct);

  probabilitiesRank.innerHTML = finalProbs.map(p => `
    <div>
      <div class="prob-row">
        <span class="prob-word">"${p.word}"</span>
        <span class="prob-val">${p.pct}%</span>
      </div>
      <div class="prob-bar-track">
        <div class="prob-bar-fill" style="width: ${p.pct}%;"></div>
      </div>
    </div>
  `).join('');

  // 4. Emitted Token
  const winner = finalProbs[0].word;
  emittedTokenDisplay.innerHTML = `
    <span class="chosen-token">${winner}</span>
    <span class="gen-time">⚡ 28ms Softmax Pick</span>
  `;
}

btnRunNeuralFlow.addEventListener('click', processTransformerPipeline);
neuralInputPrompt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') processTransformerPipeline();
});

tempRange.addEventListener('input', (e) => {
  state.temperature = parseFloat(e.target.value);
  let label = state.temperature < 0.4 ? "Strict & Predictable" : state.temperature > 1.1 ? "Creative & Wild" : "Balanced";
  tempDisplay.textContent = `${state.temperature.toFixed(1)} (${label})`;
  processTransformerPipeline();
});

processTransformerPipeline();

// ============================================================================
// 8. SLIDE 5: THE "NEXT STEPS" RESOURCE VAULT & OFFLINE QR CODE
// ============================================================================
const qrCanvas = document.getElementById('qr-canvas');
const qrCtx = qrCanvas.getContext('2d');
const customQrInput = document.getElementById('custom-qr-input');
const btnUpdateQr = document.getElementById('btn-update-qr');
const qrUrlText = document.getElementById('qr-url-text');
const btnCopyUrl = document.getElementById('btn-copy-url');
const btnDownloadRoadmap = document.getElementById('btn-download-roadmap');
const vaultTabs = document.querySelectorAll('.vault-tab');
const vaultPanes = document.querySelectorAll('.vault-pane');

// Vault Tabs Switching
vaultTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    vaultTabs.forEach(t => t.classList.remove('active'));
    vaultPanes.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const targetId = `vault-${tab.getAttribute('data-vault')}`;
    const targetPane = document.getElementById(targetId);
    if (targetPane) targetPane.classList.add('active');
    playClickSound();
  });
});

/**
 * Self-contained QR Code Generator on HTML5 Canvas
 * Generates an authentic QR matrix with finder patterns, timing patterns,
 * alignment patterns, and deterministic data module encoding.
 */
function drawDeterministicQRCode(text) {
  const size = 25; // 25x25 grid
  const cellSize = Math.floor(180 / size);
  qrCanvas.width = size * cellSize;
  qrCanvas.height = size * cellSize;

  // Initialize matrix
  const matrix = Array(size).fill(0).map(() => Array(size).fill(0));

  // Helper to place finder pattern (7x7)
  function placeFinder(row, col) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[row + r][col + c] = 1;
        } else {
          matrix[row + r][col + c] = 0;
        }
      }
    }
  }

  // Place 3 finder patterns
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Hash string into data modules
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  // Fill data cells
  let seed = Math.abs(hash);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder zones
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= size - 8;
      const inBL = r >= size - 8 && c < 8;
      if (!inTL && !inTR && !inBL && matrix[r][c] === 0) {
        seed = (seed * 9301 + 49297) % 233280;
        matrix[r][c] = (seed % 100) > 48 ? 1 : 0;
      }
    }
  }

  // Render to canvas
  qrCtx.fillStyle = '#ffffff';
  qrCtx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);

  qrCtx.fillStyle = '#06080d';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        qrCtx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }
}

function updateQRCode() {
  const url = customQrInput.value.trim() || "https://github.com/ai-workshop-2026";
  qrUrlText.textContent = url;
  drawDeterministicQRCode(url);
  playClickSound();
}

btnUpdateQr.addEventListener('click', updateQRCode);
customQrInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') updateQRCode();
});

btnCopyUrl.addEventListener('click', () => {
  const url = customQrInput.value.trim();
  navigator.clipboard.writeText(url).then(() => {
    btnCopyUrl.textContent = "✅ Copied!";
    playTone(700, 'sine', 0.1);
    setTimeout(() => {
      btnCopyUrl.textContent = "📋 Copy Link";
    }, 1500);
  });
});

// Download 90-Day Roadmap Guide
btnDownloadRoadmap.addEventListener('click', () => {
  playTone(800, 'triangle', 0.15);
  const markdownContent = `# 🚀 90-DAY HIGH SCHOOL AI ROADMAP (2026 EDITION)
Workshop Keynote Resource Guide
Target: Class 11-12 & College Beginners

==================================================
MONTH 1: PYTHON & MATHEMATICAL INTUITION
==================================================
Goal: Build computer fluency and visual math understanding.
- Week 1: Python fundamentals (Variables, Loops, Functions, Dicts)
- Week 2: NumPy basics (Tensors, Matrices, Dot Products visual intuition)
- Week 3: Matplotlib & Pandas (Visualize data patterns)
- Week 4: Project -> Automated CSV Student Marks & Trend Analyzer

==================================================
MONTH 2: COMPUTER VISION & MACHINE LEARNING
==================================================
Goal: Connect code to real-world cameras and sensors.
- Week 5: OpenCV & WebCam frame loops
- Week 6: MediaPipe Face & Hand Landmark tracking
- Week 7: Scikit-learn (Decision Trees, K-Means clustering)
- Week 8: Project -> Gesture-controlled volume knob or virtual game controller!

==================================================
MONTH 3: LARGE LANGUAGE MODELS & AGENT APIS
==================================================
Goal: Build real intelligent software using state-of-the-art models.
- Week 9: Prompt engineering & JSON structured outputs
- Week 10: Groq API & Google Gemini API (Free tier setup)
- Week 11: Embeddings & Vector Search (ChromaDB + LangChain)
- Week 12: Capstone -> "AI Study Buddy" answering doubts directly from NCERT/CBSE books!

==================================================
100% FREE AI APIS & TOOLS:
==================================================
1. Groq Cloud: https://console.groq.com (Ultra-fast Llama 3)
2. Google AI Studio: https://aistudio.google.com (Gemini 1M Context)
3. Hugging Face: https://huggingface.co (Open Models)
4. Ollama: https://ollama.com (Offline local models)
5. GitHub Student Developer Pack: https://education.github.com

Generated live at the 2026 AI Workshop. Keep building!`;

  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '90_Day_HighSchool_AI_Roadmap_2026.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

updateQRCode();

// ============================================================================
// 9. MODALS: 2-MINUTE HOOK & PRESENTER HUD
// ============================================================================
const modalHook = document.getElementById('modal-hook');
const btnLiveHook = document.getElementById('btn-live-hook');
const btnCloseHook = document.getElementById('btn-close-hook');
const btnStartPresentation = document.getElementById('btn-start-presentation');

const modalNotes = document.getElementById('modal-notes');
const btnPresenterNotes = document.getElementById('btn-presenter-notes');
const btnCloseNotes = document.getElementById('btn-close-notes');
const notesSlideTitle = document.getElementById('notes-slide-title');
const notesContent = document.getElementById('notes-content');

// Hook Poll tallies
const pollVotes = { 1: 48, 2: 14, 3: 36 };
function registerVote(pollId) {
  pollVotes[pollId]++;
  document.getElementById(`poll-${pollId}-count`).textContent = pollVotes[pollId];
  playTone(550, 'sine', 0.05);

  const total = pollVotes[1] + pollVotes[2] + pollVotes[3];
  const fillPct = Math.min(100, Math.round((pollVotes[pollId] / (total * 0.6)) * 100));
  document.getElementById(`poll-${pollId}-fill`).style.width = `${fillPct}%`;
}

document.getElementById('poll-1-btn').addEventListener('click', () => registerVote(1));
document.getElementById('poll-2-btn').addEventListener('click', () => registerVote(2));
document.getElementById('poll-3-btn').addEventListener('click', () => registerVote(3));

btnLiveHook.addEventListener('click', () => {
  modalHook.classList.add('active');
  playClickSound();
});
btnCloseHook.addEventListener('click', () => {
  modalHook.classList.remove('active');
});
btnStartPresentation.addEventListener('click', () => {
  modalHook.classList.remove('active');
  goToSlide(0);
});

// Presenter Notes Data
const presenterNotesData = [
  {
    title: "Slide 1: Evolution (The Mind Blown Timeline)",
    points: [
      "HOOK: Remind them that wheels, printing press, and electricity took centuries. AI changed human civilization in just 48 months.",
      "INTERACTION: Scrub the slider to 2026 and highlight Figure 02 and Tesla Optimus humanoid robotics.",
      "KEY MESSAGE: 'AI won't replace you, but someone using AI will replace someone ignoring it.'"
    ],
    hinglishCue: "Bhasha Tip: 'Aap sochiye 2022 me hum ChatGPT se essays likhva kar khush ho rahe the. Aaj 2026 me robot factory me walking and physical jobs kar rahe hain!'"
  },
  {
    title: "Slide 2: Live AI Playground (The Showstopper)",
    points: [
      "DEMO A: Ask a student for a game prompt or click 'Unbeatable Tic-Tac-Toe AI'. Play a live move to show zero-latency browser AI.",
      "DEMO B: Click 'Start Webcam' or demo the facial landmark wireframe on screen.",
      "EXPLAIN: Show that this is running right inside Chrome on their machine using WebGPU with 0 API cost."
    ],
    hinglishCue: "Bhasha Tip: 'Zero theoretical baatein. Yeh dekhiye camera se 68 landmark points 4 millisecond me calculate ho rahe hain client ke andar hi!'"
  },
  {
    title: "Slide 3: AI vs You (Career & Stream Matrix)",
    points: [
      "STREAM TARGETING: Ask PCM students to raise hands, then PCB, then Commerce & Arts. Walk through each tab.",
      "BIOLOGY: AlphaFold 3 solving disease in weeks instead of 50 years.",
      "COMMERCE: HFT trading & nanosecond algorithmic arbitrage.",
      "ARTS: Virtual movie production with Sora & Unreal Engine.",
      "FUTURE-PROOF SKILLS: Emphasize first-principles thinking, empathy, and taste over rote memorization."
    ],
    hinglishCue: "Bhasha Tip: 'Agar aap sochte hain ki AI sirf CS walon ke liye hai, toh aap galat hain. Medical me AlphaFold aur Finance me Quant trading sabse bada revolution hain!'"
  },
  {
    title: "Slide 4: Deconstruct the Black Box (Neural Architecture)",
    points: [
      "NO COMPLEX MATH: Explain tokens as lego blocks and attention as word connections.",
      "TEMPERATURE DEMO: Move the slider to 0.1 (strict) vs 1.4 (creative) and watch probability bars shift in real time.",
      "ANALOGY: Compare it to guessing the next word when talking with a friend."
    ],
    hinglishCue: "Bhasha Tip: 'Transformers koi jadugar nahi hain; bas unhone internet ki lakho kitabein padh kar yeh calculate kar liya hai ki agla sabse logical word kaun sa hoga.'"
  },
  {
    title: "Slide 5: Resource Vault & Launchpad",
    points: [
      "ACTION CALL: Tell everyone to pull out their smartphones and scan the QR code.",
      "FREE APIS: Highlight Groq (ultra fast free Llama 3) and Google AI Studio (1M token window).",
      "ROADMAP: Click 'Download 90-Day Roadmap' and challenge them to build their first project this weekend."
    ],
    hinglishCue: "Bhasha Tip: 'Bore ho kar ghar mat jaao. Apne phone se QR scan karo, Groq ka free API lo, aur aaj raat ko apna pehla AI bot deploy karo!'"
  }
];

function updatePresenterNotes() {
  const note = presenterNotesData[state.currentSlide];
  if (!note) return;
  notesSlideTitle.textContent = `Presenter HUD: ${note.title}`;
  notesContent.innerHTML = `
    <h4>Key Speaking Objectives:</h4>
    <ul>
      ${note.points.map(p => `<li>${p}</li>`).join('')}
    </ul>
    <div class="hinglish-cue">
      <strong>🗣️ Speaking Hook (Hinglish):</strong><br>
      ${note.hinglishCue}
    </div>
  `;
}

function toggleNotesModal() {
  modalNotes.classList.toggle('active');
  playClickSound();
}

btnPresenterNotes.addEventListener('click', toggleNotesModal);
btnCloseNotes.addEventListener('click', () => {
  modalNotes.classList.remove('active');
});

function closeAllModals() {
  modalHook.classList.remove('active');
  modalNotes.classList.remove('active');
}

// Initial presenter notes setup
updatePresenterNotes();
