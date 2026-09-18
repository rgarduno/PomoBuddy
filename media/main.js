(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  // Elementos del DOM
  const canvas = document.getElementById('pixelCanvas');
  const ctx = canvas.getContext('2d');
  const stage = document.getElementById('stage');
  const speechBubble = document.getElementById('speechBubble');
  const speechText = document.getElementById('speechText');
  const partyEffects = document.getElementById('partyEffects');
  const timerDisplay = document.getElementById('timerDisplay');
  const modeBadge = document.getElementById('modeBadge');
  const progressBar = document.getElementById('progressBar');
  const currentRoundEl = document.getElementById('currentRound');
  const totalRoundsEl = document.getElementById('totalRounds');
  const btnStartPause = document.getElementById('btnStartPause');
  const startPauseIcon = document.getElementById('startPauseIcon');
  const startPauseLabel = document.getElementById('startPauseLabel');
  const btnReset = document.getElementById('btnReset');
  const btnSkip = document.getElementById('btnSkip');
  const modeIcon = document.getElementById('modeIcon');
  const btnBall = document.getElementById('btnBall');
  const btnSettings = document.getElementById('btnSettings');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  const settingsBackdrop = document.getElementById('settingsBackdrop');
  const soundToggle = document.getElementById('soundToggle');
  const avatarButtons = document.querySelectorAll('.avatar-btn');

  // Pelotita interactiva estilo pets
  let toyBall = null;

  // Estado local
  let currentAvatar = 'neko';
  let soundEnabled = true;
  let timerState = {
    mode: 'WORK',
    status: 'IDLE',
    remainingSeconds: 25 * 60,
    totalSeconds: 25 * 60,
    currentRound: 1,
    totalRounds: 4,
  };

  let animationFrameId = null;
  let animTick = 0;
  let currentMood = 'IDLE'; // 'IDLE', 'WORK', 'DANCE', 'ERROR', 'SAVED', 'CYCLE'
  let moodTimeout = null;

  // Frases de diálogo personalizadas por cada personaje
  const quotesByAvatar = {
    neko: {
      work: [
        '¡Miau! Hora de picar código 💻',
        'Tecleando con mis patitas a 300 WPM 🐾',
        'Un cafecito con leche y a seguir ☕',
        'Cazando bugs como si fueran ratoncitos 🐭',
        'Ronroneando con código limpio y elegante ✨',
      ],
      dance: [
        '¡Miau! ¡A mover la colita y bailar! 🕺',
        '¡Descanso merecido! ¿Hora de una sardina? 🐟',
        '¡Fiesta gatuna! Ronroneos al máximo 🎉',
        'Estira la espalda como un buen gato 🐱',
      ],
      error: '¡Fssss! ¿Quién dejó este error aquí? 😾',
      fixed: '¡Miau! Código limpio y sin bichos ✨',
      saved: '¡Miau! Guardado seguro en disco 👍',
    },
    wizard: {
      work: [
        '¡Abracadabra! Que compile sin warnings ✨',
        'Invocando sabiduría ancestral de StackOverflow 📜',
        'Conjuro de enfoque: ¡máxima concentración! 🔮',
        'Poción de cafeína consumida con éxito ☕',
        'Un bug a la vez, el código es pura magia 🧙‍♂️',
      ],
      dance: [
        '¡Maná recargado! A bailar con el báculo 🕺',
        '¡Hechizo de fiesta y luces activado! 🎉',
        'Pausa mágica para estirar la túnica 🧘‍♂️',
        '¡Victoria arcana! Disfruta tu descanso ✨',
      ],
      error: '¡Por Merlín! Una perturbación en el código 😵‍💫',
      fixed: '¡Hechizo ejecutado con éxito! Código purificado ✨',
      saved: '¡Grimorio actualizado! Archivo guardado 👍',
    },
    robot: {
      work: [
        'OPTIMIZANDO CICLOS DE CPU... 🤖',
        '01000110 01001111 01000011 01010101 01010011 (FOCUS)',
        'PROCESANDO DATOS A MÁXIMA VELOCIDAD ⚡',
        'ESTADO DEL SISTEMA: 100% EFICIENTE 🔋',
        'ELIMINANDO GLITCHES DEL SISTEMA 💻',
      ],
      dance: [
        'PROTOCOLO DE BAILE ACTIVADO: DANCE.EXE 🕺',
        'REFRIGERACIÓN LÍQUIDA EN CURSO... FIESTA 🎉',
        'LUCES DISCO EN BUCLE INFINITO 🪩',
        'MODO DIVERSIÓN: FRECUENCIA MÁXIMA 🤖',
      ],
      error: 'ALERTA CRÍTICA: EXCEPCIÓN DETECTADA EN LÍNEA ACTIVA 🚨',
      fixed: 'BUG RESUELTO: COMPILACIÓN EXITOSA [OK] ✨',
      saved: 'DATOS ALMACENADOS EN DISCO DURO [OK] 👍',
    },
  };

  function getRandomQuote(category) {
    const charQuotes = quotesByAvatar[currentAvatar] || quotesByAvatar.neko;
    const list = charQuotes[category];
    if (Array.isArray(list)) {
      return list[Math.floor(Math.random() * list.length)];
    }
    return list || '¡Avanzando con todo!';
  }

  // ==========================================
  // 1. SINTETIZADOR DE AUDIO RETRO 8-BIT
  // ==========================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  // Desbloqueo proactivo ante cualquier primer gesto en el panel
  window.addEventListener('click', initAudio, { once: true });
  window.addEventListener('keydown', initAudio, { once: true });

  function playTone(freq, type, duration, startTime = 0, gainLevel = 0.1) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
          doPlayTone(freq, type, duration, startTime, gainLevel);
        }).catch(() => {});
        return;
      }
      doPlayTone(freq, type, duration, startTime, gainLevel);
    } catch (e) {
      console.warn('Audio no disponible', e);
    }
  }

  function doPlayTone(freq, type, duration, startTime, gainLevel) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
    gain.gain.setValueAtTime(gainLevel, audioCtx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + startTime);
    osc.stop(audioCtx.currentTime + startTime + duration);
  }

  function playWorkStartSound() {
    initAudio();
    // Melodía ascendente retro de inicio
    playTone(330, 'square', 0.1, 0);     // E4
    playTone(392, 'square', 0.1, 0.1);   // G4
    playTone(523.25, 'square', 0.18, 0.2); // C5
  }

  function playBreakDanceSound() {
    initAudio();
    // Fanfarria festiva de baile 8-bit
    playTone(523.25, 'triangle', 0.12, 0);       // C5
    playTone(659.25, 'square', 0.12, 0.12);     // E5
    playTone(783.99, 'square', 0.14, 0.24);     // G5
    playTone(1046.50, 'triangle', 0.35, 0.38);  // C6
    playTone(880, 'square', 0.15, 0.75);        // A5
    playTone(1046.50, 'square', 0.4, 0.9);      // C6 final
  }

  function playCycleVictorySound() {
    initAudio();
    // Melodía triunfal épica de fanfarria 8-bit al completar las 4 rondas
    const notes = [
      { f: 523.25, d: 0.14, t: 0 },    // C5
      { f: 523.25, d: 0.14, t: 0.14 }, // C5
      { f: 523.25, d: 0.14, t: 0.28 }, // C5
      { f: 659.25, d: 0.35, t: 0.42 }, // E5
      { f: 587.33, d: 0.15, t: 0.77 }, // D5
      { f: 659.25, d: 0.2, t: 0.92 },  // E5
      { f: 783.99, d: 0.4, t: 1.12 },  // G5
      { f: 1046.5, d: 0.75, t: 1.55 }, // C6 largo triunfal
    ];
    notes.forEach((n) => playTone(n.f, 'square', n.d, n.t, 0.12));
  }

  function playErrorBlip() {
    initAudio();
    // Glitch de alarma descendente
    playTone(300, 'sawtooth', 0.15, 0, 0.15);
    playTone(200, 'sawtooth', 0.2, 0.12, 0.12);
  }

  function playSaveChime() {
    initAudio();
    // Tintineo agudo de éxito
    playTone(987.77, 'sine', 0.1, 0, 0.08); // B5
    playTone(1318.5, 'sine', 0.2, 0.08, 0.1); // E6
  }

  function playClick() {
    initAudio();
    playTone(600, 'square', 0.04, 0, 0.04);
  }

  // ==========================================
  // 2. MOTOR DE RENDERIZADO Y FÍSICAS DE MOVIMIENTO
  // ==========================================
  const PIXEL_SCALE = 5;
  const V_HEIGHT = 32;
  let V_WIDTH = 32;

  function resizeCanvas() {
    const stageWidth = stage.clientWidth || 280;
    V_WIDTH = Math.max(32, Math.floor(stageWidth / PIXEL_SCALE));
    canvas.width = V_WIDTH * PIXEL_SCALE;
    canvas.height = V_HEIGHT * PIXEL_SCALE;
  }
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 50);

  // Variables de posición y movimiento
  let avatarX = 16;
  let facingDir = 1; // 1 = derecha, -1 = izquierda
  let walkSpeed = 0.22;
  let isWalking = false;
  let walkPauseTimer = 0;
  let isSittingInChair = false;
  let jumpY = 0;
  let jumpVy = 0;
  let currentAvatarOriginX = 16;
  let clickParticles = [];

  // Función para pintar un pixel con soporte de volteo horizontal (espejo)
  function p(vx, vy, color) {
    if (!color || color === '.') return;
    let actualX = vx;
    if (facingDir === -1) {
      actualX = Math.round(currentAvatarOriginX - (vx - currentAvatarOriginX));
    }
    ctx.fillStyle = color;
    ctx.fillRect(actualX * PIXEL_SCALE, vy * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
  }

  // --- PARTÍCULAS INTERACTIVAS (CORAZONES Y ESTRELLAS AL HACER CLIC) ---
  function emitClickStars(vx, vy) {
    for (let i = 0; i < 6; i++) {
      clickParticles.push({
        x: vx + (Math.random() * 8 - 4),
        y: vy - 2,
        vy: -0.6 - Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 1.2,
        life: 25 + Math.floor(Math.random() * 10),
        color: ['#ff007f', '#ffd700', '#00e5ff', '#ffffff', '#ff5e7e'][i % 5],
      });
    }
  }

  function updateAndDrawParticles() {
    for (let i = clickParticles.length - 1; i >= 0; i--) {
      const part = clickParticles[i];
      part.x += part.vx;
      part.y += part.vy;
      part.life--;
      ctx.fillStyle = part.color;
      ctx.fillRect(
        Math.round(part.x) * PIXEL_SCALE,
        Math.round(part.y) * PIXEL_SCALE,
        PIXEL_SCALE,
        PIXEL_SCALE
      );
      if (part.life <= 0) {
        clickParticles.splice(i, 1);
      }
    }
  }

  // --- SILLA PIXEL ART DE DESCANSO ---
  function drawChair(cx, cy) {
    const WOOD = '#8d6e63';
    const WOOD_DARK = '#5d4037';
    const CUSHION = '#ff5e7e';
    const CUSHION_LIGHT = '#ff80ab';

    // Respaldo de la sillita
    for (let y = -10; y <= -2; y++) {
      ctx.fillStyle = WOOD_DARK;
      ctx.fillRect((cx - 3) * PIXEL_SCALE, (cy + y) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
      ctx.fillStyle = WOOD;
      ctx.fillRect((cx - 2) * PIXEL_SCALE, (cy + y) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
    }
    // Asiento mullido
    for (let x = -3; x <= 3; x++) {
      ctx.fillStyle = CUSHION_LIGHT;
      ctx.fillRect((cx + x) * PIXEL_SCALE, (cy - 1) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
      ctx.fillStyle = CUSHION;
      ctx.fillRect((cx + x) * PIXEL_SCALE, cy * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
    }
    // Patas de la sillita
    ctx.fillStyle = WOOD_DARK;
    ctx.fillRect((cx - 3) * PIXEL_SCALE, (cy + 1) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE * 4);
    ctx.fillStyle = WOOD;
    ctx.fillRect((cx + 3) * PIXEL_SCALE, (cy + 1) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE * 4);
  }

  // --- TROFEO DE CELEBRACIÓN DE CICLO (RONDA 4/4) ---
  function drawTrophy(step) {
    const xOffset = Math.round(V_WIDTH / 2);
    const yOffset = Math.round(14 + Math.sin(step * 0.2) * 2);
    const GOLD = '#f1c40f';
    const HIGHLIGHT = '#fff176';
    const DARK_GOLD = '#d4ac0d';
    const BASE = '#7f8c8d';

    for (let x = -4; x <= 4; x++) p(xOffset + x, yOffset - 4, GOLD);
    for (let x = -3; x <= 3; x++) p(xOffset + x, yOffset - 3, HIGHLIGHT);
    for (let x = -3; x <= 3; x++) p(xOffset + x, yOffset - 2, GOLD);
    for (let x = -2; x <= 2; x++) p(xOffset + x, yOffset - 1, DARK_GOLD);
    for (let x = -1; x <= 1; x++) p(xOffset + x, yOffset, GOLD);

    p(xOffset - 5, yOffset - 3, GOLD);
    p(xOffset - 5, yOffset - 2, GOLD);
    p(xOffset + 5, yOffset - 3, GOLD);
    p(xOffset + 5, yOffset - 2, GOLD);

    p(xOffset, yOffset + 1, GOLD);
    p(xOffset, yOffset + 2, GOLD);
    for (let x = -3; x <= 3; x++) p(xOffset + x, yOffset + 3, BASE);
    for (let x = -4; x <= 4; x++) p(xOffset + x, yOffset + 4, '#2c3e50');

    if (step % 6 < 3) {
      p(xOffset - 6, yOffset - 5, '#ffffff');
      p(xOffset + 6, yOffset - 5, '#ffffff');
      p(xOffset, yOffset - 7, '#ffd700');
    }
  }

  // --- AVATAR 1: NEKODEV (GATITO DEV) ---
  function drawNeko(step, mood, walking, sitting) {
    const isDancing = mood === 'DANCE';
    const isWorking = mood === 'WORK';
    const isError = mood === 'ERROR';

    let bob = walking ? Math.floor(Math.sin(step * 0.3) * 1.5) : Math.floor(Math.sin(step * 0.12) * 1);
    let danceOffset = isDancing ? Math.sin(step * 0.35) * 3 : 0;
    let xOffset = Math.round(avatarX + danceOffset);
    let yOffset = Math.round(18 + jumpY + (sitting ? 1 : bob));
    currentAvatarOriginX = xOffset;

    const FUR = '#ffb347';
    const WHITE = '#ffffff';
    const PINK = '#ff80ab';
    const DARK = '#2d3436';

    // Orejas
    p(xOffset - 4, yOffset - 8, FUR);
    p(xOffset - 3, yOffset - 8, FUR);
    p(xOffset - 3, yOffset - 7, PINK);
    p(xOffset + 3, yOffset - 8, FUR);
    p(xOffset + 4, yOffset - 8, FUR);
    p(xOffset + 3, yOffset - 7, PINK);

    // Cabeza
    for (let x = -4; x <= 4; x++) {
      for (let y = -6; y <= -1; y++) {
        p(xOffset + x, yOffset + y, FUR);
      }
    }
    // Hocico blanco
    p(xOffset - 1, yOffset - 2, WHITE);
    p(xOffset, yOffset - 2, PINK);
    p(xOffset + 1, yOffset - 2, WHITE);

    // Ojos según el estado
    if (isError) {
      p(xOffset - 3, yOffset - 4, DARK);
      p(xOffset - 2, yOffset - 5, DARK);
      p(xOffset + 2, yOffset - 4, DARK);
      p(xOffset + 3, yOffset - 5, DARK);
      p(xOffset + 6, yOffset - 6 + (step % 4), '#00d2d3');
    } else if (isDancing) {
      // GAFAS DE SOL DE FIESTA 😎
      for (let g = -4; g <= 4; g++) p(xOffset + g, yOffset - 4, '#111111');
      p(xOffset - 3, yOffset - 3, '#111111');
      p(xOffset - 2, yOffset - 3, '#00e5ff');
      p(xOffset + 2, yOffset - 3, '#111111');
      p(xOffset + 3, yOffset - 3, '#00e5ff');
    } else {
      const isBlinking = step % 60 < 4;
      if (isBlinking) {
        p(xOffset - 3, yOffset - 4, DARK);
        p(xOffset - 2, yOffset - 4, DARK);
        p(xOffset + 2, yOffset - 4, DARK);
        p(xOffset + 3, yOffset - 4, DARK);
      } else {
        p(xOffset - 3, yOffset - 4, DARK);
        p(xOffset - 2, yOffset - 4, WHITE);
        p(xOffset + 2, yOffset - 4, DARK);
        p(xOffset + 3, yOffset - 4, WHITE);
      }
    }

    // Cuerpo
    for (let x = -3; x <= 3; x++) {
      for (let y = 0; y <= 5; y++) {
        p(xOffset + x, yOffset + y, FUR);
      }
    }
    // Pecho blanco
    for (let y = 0; y <= 3; y++) {
      p(xOffset - 1, yOffset + y, WHITE);
      p(xOffset, yOffset + y, WHITE);
    }

    // Cola con movimiento
    const tailWag = Math.sin(step * (isDancing ? 0.4 : 0.15)) * 2;
    p(xOffset - 4, yOffset + 3, FUR);
    p(xOffset - 5 + Math.round(tailWag), yOffset + 2, FUR);
    p(xOffset - 6 + Math.round(tailWag), yOffset + 1, FUR);

    // Patitas con ciclo de caminata alternada
    const stepBob = (walking && Math.sin(step * 0.3) > 0) ? 1 : 0;
    p(xOffset - 3, yOffset + 6 - stepBob, WHITE);
    p(xOffset - 2, yOffset + 6 - stepBob, WHITE);
    p(xOffset + 2, yOffset + 6 + stepBob, WHITE);
    p(xOffset + 3, yOffset + 6 + stepBob, WHITE);

    // Si está bailando: ¡Brazos arriba!
    if (isDancing) {
      const armWave = Math.sin(step * 0.3) > 0;
      if (armWave) {
        p(xOffset - 4, yOffset - 1, FUR);
        p(xOffset - 5, yOffset - 2, WHITE);
        p(xOffset + 4, yOffset + 2, FUR);
        p(xOffset + 5, yOffset + 3, WHITE);
      } else {
        p(xOffset - 4, yOffset + 2, FUR);
        p(xOffset - 5, yOffset + 3, WHITE);
        p(xOffset + 4, yOffset - 1, FUR);
        p(xOffset + 5, yOffset - 2, WHITE);
      }
    }

    // Si está sentado en la silla: ¡Tacita de café humeante en las patas!
    if (sitting) {
      p(xOffset + 1, yOffset + 2, '#ffffff');
      p(xOffset + 2, yOffset + 2, '#ffffff');
      p(xOffset + 1, yOffset + 1, '#795548');
      if (step % 8 < 4) p(xOffset + 1, yOffset - 1, 'rgba(255,255,255,0.7)');
    } else if (isWorking) {
      // Laptop tecleando
      p(xOffset - 4, yOffset + 4, '#576574');
      p(xOffset - 3, yOffset + 4, '#c8d6e5');
      p(xOffset - 2, yOffset + 4, '#c8d6e5');
      p(xOffset - 1, yOffset + 4, '#576574');
      p(xOffset - 4, yOffset + 3, '#00d2d3');
      p(xOffset - 3, yOffset + 3, '#00d2d3');
      const keyStep = step % 4 < 2;
      p(xOffset - 3, yOffset + (keyStep ? 4 : 5), WHITE);
      p(xOffset - 1, yOffset + (keyStep ? 5 : 4), WHITE);
    }
  }

  // --- AVATAR 2: CODEMAGE (MAGO 8-BIT) ---
  function drawWizard(step, mood, walking, sitting) {
    const isDancing = mood === 'DANCE';
    const isWorking = mood === 'WORK';
    const isError = mood === 'ERROR';

    let bob = walking ? Math.floor(Math.sin(step * 0.3) * 1.5) : Math.floor(Math.sin(step * 0.12) * 1);
    let danceOffset = isDancing ? Math.sin(step * 0.35) * 3 : 0;
    let xOffset = Math.round(avatarX + danceOffset);
    let yOffset = Math.round(17 + jumpY + (sitting ? 1 : bob));
    currentAvatarOriginX = xOffset;

    const ROBE = '#6c5ce7';
    const HAT = '#4834d4';
    const GOLD = '#f9ca24';
    const BEARD = '#dfe6e9';
    const SKIN = '#ffbe76';

    // Gorro puntiagudo
    p(xOffset, yOffset - 11, GOLD);
    p(xOffset, yOffset - 10, HAT);
    p(xOffset - 1, yOffset - 9, HAT);
    p(xOffset, yOffset - 9, HAT);
    p(xOffset + 1, yOffset - 9, HAT);
    for (let x = -3; x <= 3; x++) p(xOffset + x, yOffset - 8, HAT);
    for (let x = -4; x <= 4; x++) p(xOffset + x, yOffset - 7, GOLD);

    // Cara
    for (let x = -2; x <= 2; x++) {
      p(xOffset + x, yOffset - 6, SKIN);
      p(xOffset + x, yOffset - 5, SKIN);
    }
    // Ojos
    if (isError) {
      p(xOffset - 1, yOffset - 6, '#eb4d4b');
      p(xOffset + 1, yOffset - 6, '#eb4d4b');
    } else if (isDancing) {
      p(xOffset - 1, yOffset - 6, GOLD);
      p(xOffset + 1, yOffset - 6, GOLD);
    } else {
      p(xOffset - 1, yOffset - 6, '#130f40');
      p(xOffset + 1, yOffset - 6, '#130f40');
    }

    // Barba
    for (let x = -3; x <= 3; x++) p(xOffset + x, yOffset - 4, BEARD);
    for (let x = -2; x <= 2; x++) p(xOffset + x, yOffset - 3, BEARD);
    p(xOffset, yOffset - 2, BEARD);

    // Túnica
    for (let y = -2; y <= 6; y++) {
      for (let x = -3; x <= 3; x++) {
        p(xOffset + x, yOffset + y, ROBE);
      }
    }

    // Pies alternando al caminar
    const stepBob = (walking && Math.sin(step * 0.3) > 0) ? 1 : 0;
    p(xOffset - 2, yOffset + 7 - stepBob, '#2c3e50');
    p(xOffset + 2, yOffset + 7 + stepBob, '#2c3e50');

    // Báculo mágico con cristal
    const staffGlow = isDancing || isWorking;
    const crystalColor = staffGlow
      ? (step % 6 < 3 ? '#00e5ff' : '#ff007f')
      : '#00cec9';
    p(xOffset + 5, yOffset - 4, crystalColor);
    for (let sy = -3; sy <= 3; sy++) p(xOffset + 5, yOffset + sy, '#795548');

    if (staffGlow) {
      const sparkX = xOffset + 5 + Math.sin(step * 0.4) * 3;
      const sparkY = yOffset - 6 + Math.cos(step * 0.4) * 2;
      p(Math.round(sparkX), Math.round(sparkY), '#fffa65');
    }
  }

  // --- AVATAR 3: PIXELBOT (ROBOT 8-BIT) ---
  function drawRobot(step, mood, walking, sitting) {
    const isDancing = mood === 'DANCE';
    const isWorking = mood === 'WORK';
    const isError = mood === 'ERROR';

    let bob = walking ? Math.floor(Math.sin(step * 0.3) * 1.5) : Math.floor(Math.sin(step * 0.12) * 1);
    let danceOffset = isDancing ? Math.sin(step * 0.35) * 3 : 0;
    let xOffset = Math.round(avatarX + danceOffset);
    let yOffset = Math.round(18 + jumpY + (sitting ? 1 : bob));
    currentAvatarOriginX = xOffset;

    const METAL = '#b2bec3';
    const DARK_METAL = '#636e72';
    const SCREEN = '#2d3436';
    const BLUE_NEON = '#00d2d3';
    const RED_NEON = '#ff7675';
    const GOLD = '#ffeaa7';

    // Antena
    p(xOffset, yOffset - 8, isError ? RED_NEON : (step % 20 < 10 ? BLUE_NEON : GOLD));
    p(xOffset, yOffset - 7, DARK_METAL);

    // Cabeza
    for (let y = -6; y <= -1; y++) {
      for (let x = -4; x <= 4; x++) p(xOffset + x, yOffset + y, METAL);
    }
    // Pantalla
    for (let y = -5; y <= -2; y++) {
      for (let x = -3; x <= 3; x++) p(xOffset + x, yOffset + y, SCREEN);
    }

    // Ojos LED
    if (isError) {
      p(xOffset - 2, yOffset - 4, RED_NEON);
      p(xOffset - 2, yOffset - 3, RED_NEON);
      p(xOffset + 2, yOffset - 4, RED_NEON);
      p(xOffset + 2, yOffset - 3, RED_NEON);
    } else if (isDancing) {
      const eyeColor = step % 8 < 4 ? '#ff007f' : '#00e5ff';
      p(xOffset - 2, yOffset - 4, eyeColor);
      p(xOffset - 1, yOffset - 4, eyeColor);
      p(xOffset + 1, yOffset - 4, eyeColor);
      p(xOffset + 2, yOffset - 4, eyeColor);
    } else {
      p(xOffset - 2, yOffset - 4, BLUE_NEON);
      p(xOffset - 2, yOffset - 3, BLUE_NEON);
      p(xOffset + 2, yOffset - 4, BLUE_NEON);
      p(xOffset + 2, yOffset - 3, BLUE_NEON);
    }

    // Cuello y Torso
    p(xOffset, yOffset, DARK_METAL);
    for (let y = 1; y <= 6; y++) {
      for (let x = -4; x <= 4; x++) p(xOffset + x, yOffset + y, METAL);
    }

    // Medidor de energía
    p(xOffset - 2, yOffset + 3, isWorking ? RED_NEON : BLUE_NEON);
    p(xOffset, yOffset + 3, isWorking ? GOLD : BLUE_NEON);
    p(xOffset + 2, yOffset + 3, isWorking ? '#55efc4' : BLUE_NEON);

    // Pies con ciclo de pasos
    const stepBob = (walking && Math.sin(step * 0.3) > 0) ? 1 : 0;
    p(xOffset - 3, yOffset + 7 - stepBob, DARK_METAL);
    p(xOffset - 2, yOffset + 7 - stepBob, DARK_METAL);
    p(xOffset + 2, yOffset + 7 + stepBob, DARK_METAL);
    p(xOffset + 3, yOffset + 7 + stepBob, DARK_METAL);
  }

  // Bucle principal de renderizado gráfico
  // Bucle principal de renderizado gráfico y simulación física
  function renderLoop() {
    animTick++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Actualizar físicas de salto
    if (jumpY < 0 || jumpVy !== 0) {
      jumpY += jumpVy;
      jumpVy += 0.38; // Gravedad
      if (jumpY >= 0) {
        jumpY = 0;
        jumpVy = 0;
      }
    }

    // 2. Determinar estado de la sesión
    const isBreakTime = timerState.mode === 'SHORT_BREAK' || timerState.mode === 'LONG_BREAK';
    const chairPos = Math.round(V_WIDTH / 2);

    let activeMood = currentMood;
    if (activeMood === 'IDLE') {
      if (timerState.status === 'RUNNING') {
        activeMood = isBreakTime ? 'DANCE' : 'WORK';
      }
    }

    // 3. Simulación de movimiento
    if (isBreakTime && timerState.status === 'RUNNING') {
      // En descanso: alterna entre relajarse sentado en su sillita y pararse a bailar
      const cycle = animTick % 700;
      if (cycle < 420) {
        // Modo Sentarse en la silla
        if (Math.abs(avatarX - chairPos) > 0.6) {
          isSittingInChair = false;
          facingDir = avatarX < chairPos ? 1 : -1;
          avatarX += walkSpeed * facingDir;
          isWalking = true;
        } else {
          avatarX = chairPos;
          isWalking = false;
          isSittingInChair = true;
          facingDir = 1;
        }
      } else {
        // Modo levantarse a bailar y desplazarse con estilo
        isSittingInChair = false;
        isWalking = true;
        avatarX += Math.sin(animTick * 0.07) * 0.45;
        facingDir = Math.sin(animTick * 0.07) >= 0 ? 1 : -1;
      }
    } else {
      // Modo trabajo o pausa: patrullaje tranquilo de lado a lado
      isSittingInChair = false;
      if (walkPauseTimer > 0) {
        walkPauseTimer--;
        isWalking = false;
      } else {
        isWalking = true;
        avatarX += walkSpeed * facingDir;

        // En pantallas anchas (panel inferior), pausas orgánicas y naturales
        if (V_WIDTH > 70 && walkPauseTimer === 0 && Math.random() < 0.003) {
          walkPauseTimer = 30 + Math.floor(Math.random() * 40);
        }

        const minX = 6;
        const maxX = V_WIDTH - 6;
        if (avatarX <= minX) {
          avatarX = minX;
          facingDir = 1;
          walkPauseTimer = 35 + Math.floor(Math.random() * 50);
        } else if (avatarX >= maxX) {
          avatarX = maxX;
          facingDir = -1;
          walkPauseTimer = 35 + Math.floor(Math.random() * 50);
        }
      }
    }

    // 4. Dibujar escenario adicional: Sillita en descansos
    if (isBreakTime) {
      drawChair(chairPos, 22);
      // Globitos de sueño en descanso largo
      if (timerState.mode === 'LONG_BREAK' && isSittingInChair) {
        const zStep = animTick % 60;
        const zX = chairPos + 3 + Math.sin(zStep * 0.12) * 2;
        const zY = 13 - Math.floor(zStep * 0.14);
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(Math.round(zX) * PIXEL_SCALE, Math.round(zY) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
      }
    }

    // 4.5. Simulación y renderizado de la pelotita interactiva estilo pets
    if (toyBall && toyBall.active) {
      toyBall.x += toyBall.vx;
      toyBall.y += toyBall.vy;
      toyBall.vy += 0.28; // Gravedad
      toyBall.vx *= 0.982; // Fricción

      const floorY = 24;
      if (toyBall.y >= floorY) {
        toyBall.y = floorY;
        if (Math.abs(toyBall.vy) > 0.8) {
          toyBall.vy = -toyBall.vy * 0.65;
          toyBall.bounces++;
          playTone(450, 'triangle', 0.04, 0, 0.05);
        } else {
          toyBall.vy = 0;
        }
      }

      if (toyBall.x <= 4) {
        toyBall.x = 4;
        toyBall.vx = Math.abs(toyBall.vx) * 0.8;
      } else if (toyBall.x >= V_WIDTH - 4) {
        toyBall.x = V_WIDTH - 4;
        toyBall.vx = -Math.abs(toyBall.vx) * 0.8;
      }

      // Dibujar pelota pixel art (4x4)
      const bx = Math.round(toyBall.x);
      const by = Math.round(toyBall.y);
      ctx.fillStyle = toyBall.color || '#ff3838';
      ctx.fillRect(bx * PIXEL_SCALE, by * PIXEL_SCALE, PIXEL_SCALE * 2, PIXEL_SCALE * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx * PIXEL_SCALE, by * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);

      // Si el avatar está cerca, ¡le da una patadita a la pelota y salta!
      const distToBall = Math.abs(avatarX - toyBall.x);
      if (distToBall < 6 && Math.abs(20 - toyBall.y) < 10) {
        toyBall.vx = facingDir * (2.2 + Math.random() * 1.6);
        toyBall.vy = -2.8;
        jumpVy = -2.6;
        emitClickStars(avatarX, 16);
        playTone(1046.5, 'sine', 0.1, 0, 0.08); // C6
      } else if (!isSittingInChair && activeMood !== 'CYCLE') {
        // El avatar corre emocionado hacia la pelota
        facingDir = toyBall.x > avatarX ? 1 : -1;
        avatarX += (walkSpeed * 1.35) * facingDir;
        isWalking = true;
        walkPauseTimer = 0;
      }
    }

    // 5. Renderizar personaje o trofeo
    if (activeMood === 'CYCLE') {
      drawTrophy(animTick);
    } else {
      switch (currentAvatar) {
        case 'wizard':
          drawWizard(animTick, activeMood, isWalking, isSittingInChair);
          break;
        case 'robot':
          drawRobot(animTick, activeMood, isWalking, isSittingInChair);
          break;
        case 'neko':
        default:
          drawNeko(animTick, activeMood, isWalking, isSittingInChair);
          break;
      }
    }

    // 6. Dibujar partículas de interacción
    updateAndDrawParticles();

    // 7. El bocadillo de diálogo sigue suavemente la posición horizontal del avatar
    const avatarPx = Math.round(avatarX * PIXEL_SCALE);
    const stageWidth = stage.clientWidth || 280;
    const bubbleHalfWidth = (speechBubble.offsetWidth || 100) / 2;
    const minX = bubbleHalfWidth + 10;
    const maxX = Math.max(minX, stageWidth - bubbleHalfWidth - 10);
    const clampedPx = Math.max(minX, Math.min(maxX, avatarPx));
    speechBubble.style.left = `${clampedPx}px`;

    animationFrameId = requestAnimationFrame(renderLoop);
  }

  // ==========================================
  // 3. GESTIÓN DE DIÁLOGOS Y ESTILOS
  // ==========================================
  function setDialogue(text) {
    speechText.textContent = text;
    speechBubble.style.opacity = '1';
    speechBubble.style.transform = 'translateX(-50%) scale(1.05)';
    setTimeout(() => {
      speechBubble.style.transform = 'translateX(-50%) scale(1)';
    }, 200);
  }

  function triggerTemporaryMood(mood, dialogue, durationMs = 3500) {
    if (moodTimeout) clearTimeout(moodTimeout);
    currentMood = mood;
    if (dialogue) setDialogue(dialogue);

    moodTimeout = setTimeout(() => {
      currentMood = 'IDLE';
      stage.classList.remove('celebration');
      // Restaurar diálogo de contexto con la personalidad del avatar actual
      if (timerState.status === 'RUNNING') {
        if (timerState.mode === 'WORK') {
          setDialogue(getRandomQuote('work'));
        } else {
          setDialogue(getRandomQuote('dance'));
        }
      }
    }, durationMs);
  }

  function updateVisualMode(mode, status) {
    const isBreak = mode === 'SHORT_BREAK' || mode === 'LONG_BREAK';
    const isRunning = status === 'RUNNING';

    // Ajustar insignias en el HUD
    modeBadge.className = 'hud-badge';
    if (mode === 'WORK') {
      modeBadge.textContent = 'ENFOQUE';
      if (modeIcon) modeIcon.textContent = '🍅';
    } else if (mode === 'SHORT_BREAK') {
      modeBadge.textContent = 'DESCANSO';
      modeBadge.classList.add('break');
      if (modeIcon) modeIcon.textContent = '☕';
    } else {
      modeBadge.textContent = 'FIESTA';
      modeBadge.classList.add('long-break');
      if (modeIcon) modeIcon.textContent = '🌟';
    }

    // Activar o desactivar efectos de fiesta y baile
    if (isBreak && isRunning) {
      stage.classList.add('dancing');
      generateConfetti();
    } else {
      stage.classList.remove('dancing');
      clearConfetti();
    }

    // Actualizar botón de inicio/pausa
    if (isRunning) {
      startPauseIcon.textContent = '⏸';
      startPauseLabel.textContent = 'Pausar';
    } else {
      startPauseIcon.textContent = '▶';
      startPauseLabel.textContent = status === 'PAUSED' ? 'Reanudar' : 'Iniciar';
    }
  }

  function updateTimerUI(snapshot) {
    timerState = snapshot;

    const mins = Math.floor(snapshot.remainingSeconds / 60);
    const secs = snapshot.remainingSeconds % 60;
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;

    // Barra de progreso
    const percent =
      snapshot.totalSeconds > 0
        ? ((snapshot.totalSeconds - snapshot.remainingSeconds) /
            snapshot.totalSeconds) *
          100
        : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    progressBar.style.backgroundColor =
      snapshot.mode === 'WORK'
        ? 'var(--focus-color)'
        : snapshot.mode === 'SHORT_BREAK'
        ? 'var(--break-color)'
        : 'var(--long-break-color)';

    currentRoundEl.textContent = snapshot.currentRound;
    totalRoundsEl.textContent = snapshot.totalRounds;

    updateVisualMode(snapshot.mode, snapshot.status);
  }

  function generateConfetti() {
    clearConfetti();
    const colors = ['#ff007f', '#00e5ff', '#ffd600', '#00e676', '#ffffff'];
    for (let i = 0; i < 24; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${Math.random() * 1.5}s`;
      piece.style.animationDuration = `${1 + Math.random() * 1.5}s`;
      partyEffects.appendChild(piece);
    }
  }

  function clearConfetti() {
    partyEffects.innerHTML = '';
  }

  // ==========================================
  // 4. EVENTOS DE ENTRADA Y CONTROLES
  // ==========================================
  btnStartPause.addEventListener('click', () => {
    initAudio();
    playClick();
    if (timerState.status === 'RUNNING') {
      vscode.postMessage({ type: 'PAUSE' });
      setDialogue('Temporizador pausado. Tómate un segundo.');
    } else {
      vscode.postMessage({ type: 'START' });
      if (timerState.mode === 'WORK') {
        playWorkStartSound();
        setDialogue(getRandomQuote('work'));
      } else {
        playBreakDanceSound();
        setDialogue(getRandomQuote('dance'));
      }
    }
  });

  btnReset.addEventListener('click', () => {
    playClick();
    vscode.postMessage({ type: 'RESET' });
    setDialogue('Temporizador reiniciado.');
  });

  btnSkip.addEventListener('click', () => {
    playClick();
    vscode.postMessage({ type: 'SKIP' });
  });

  // Función para lanzar pelotita interactiva
  function throwBall(targetX, targetY) {
    initAudio();
    playClick();
    const vx = Math.max(-2.5, Math.min(2.5, (targetX - avatarX) * 0.12));
    toyBall = {
      x: avatarX,
      y: 10,
      vx: vx !== 0 ? vx : (facingDir * 2.2),
      vy: -3.5,
      bounces: 0,
      active: true,
      color: '#ff3838',
    };
    emitClickStars(avatarX, 12);
    playTone(700, 'square', 0.08, 0, 0.08);
  }

  // Interacción por clic sobre el escenario y el avatar
  canvas.addEventListener('click', (e) => {
    initAudio();
    const rect = canvas.getBoundingClientRect();
    const clickVx = (e.clientX - rect.left) / PIXEL_SCALE;

    // Detectar si el clic fue cerca del avatar
    const isClickOnAvatar = Math.abs(clickVx - avatarX) < 12;

    if (isClickOnAvatar) {
      playClick();
      jumpVy = -3.8;
      emitClickStars(avatarX, 16 + jumpY);
      playSaveChime();

      const petQuotes = {
        neko: [
          '¡Purr! ¡Me hiciste cosquillitas! 🐱❤️',
          '¡Miau! ¡Qué buen salto! ✨',
          '¡A seguir cazando bugs con todo! 🐾',
        ],
        wizard: [
          '¡Por las barbas de Merlín! ✨',
          '¡Levitación arcana activada! 🔮',
          '¡Salto mágico de concentración! 🧙‍♂️',
        ],
        robot: [
          'CIRCUITO DE FELICIDAD: 100% CARGADO ⚡',
          'SALTO_VERTICAL.EXE EJECUTADO CON ÉXITO 🤖',
          '¡BEEP BOOP! ❤️',
        ],
      };
      const quotes = petQuotes[currentAvatar] || petQuotes.neko;
      setDialogue(quotes[Math.floor(Math.random() * quotes.length)]);
    } else {
      // Clic en el suelo: lanzar pelotita hacia allí para que el compañero juegue
      throwBall(clickVx, 24);
      setDialogue('¡Mira la pelotita! 🎾');
    }
  });

  // Botón de Pelotita en el HUD
  btnBall?.addEventListener('click', () => {
    const targetX = Math.max(6, Math.min(V_WIDTH - 6, avatarX + facingDir * 25));
    throwBall(targetX, 20);
    setDialogue('¡Atrapa la pelotita! 🎾');
  });

  // Modal / Drawer de Ajustes
  btnSettings?.addEventListener('click', () => {
    playClick();
    settingsBackdrop?.classList.add('open');
  });

  btnCloseSettings?.addEventListener('click', () => {
    playClick();
    settingsBackdrop?.classList.remove('open');
  });

  settingsBackdrop?.addEventListener('click', (e) => {
    if (e.target === settingsBackdrop) {
      playClick();
      settingsBackdrop.classList.remove('open');
    }
  });

  // Botón para alternar entre Barra Lateral y Barra Inferior Panorámica
  const btnSwitchMode = document.getElementById('btnSwitchMode');
  const switchModeText = document.getElementById('switchModeText');

  function updateSwitchLabel() {
    const isWide = window.innerWidth >= 580;
    if (switchModeText) {
      switchModeText.textContent = isWide ? 'Cambiar a Barra Lateral' : 'Cambiar a Barra Inferior';
    }
  }
  window.addEventListener('resize', updateSwitchLabel);
  setTimeout(updateSwitchLabel, 80);

  btnSwitchMode?.addEventListener('click', () => {
    playClick();
    settingsBackdrop?.classList.remove('open');
    const isWide = window.innerWidth >= 580;
    if (isWide) {
      vscode.postMessage({ type: 'OPEN_SIDEBAR' });
    } else {
      vscode.postMessage({ type: 'OPEN_BOTTOM_PANEL' });
    }
  });

  // Presets Rápidos de Tiempo (25m / 50m)
  const preset25 = document.getElementById('preset25');
  const preset50 = document.getElementById('preset50');

  preset25?.addEventListener('click', () => {
    playClick();
    preset25.classList.add('active');
    preset50?.classList.remove('active');
    vscode.postMessage({
      type: 'SET_PRESET',
      payload: { workDuration: 25, breakDuration: 5 },
    });
    setDialogue('Modo Clásico activado: 25m enfoque / 5m descanso 🍅');
  });

  preset50?.addEventListener('click', () => {
    playClick();
    preset50.classList.add('active');
    preset25?.classList.remove('active');
    vscode.postMessage({
      type: 'SET_PRESET',
      payload: { workDuration: 50, breakDuration: 10 },
    });
    setDialogue('Modo Deep Work activado: 50m enfoque / 10m descanso 🚀');
  });

  avatarButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClick();
      const newAvatar = btn.getAttribute('data-avatar');
      if (newAvatar) {
        currentAvatar = newAvatar;
        avatarButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        vscode.postMessage({ type: 'CHANGE_AVATAR', payload: newAvatar });
        const nameLabel =
          newAvatar === 'neko'
            ? 'NekoDev 🐱'
            : newAvatar === 'wizard'
            ? 'CodeMage 🧙‍♂️'
            : 'PixelBot 🤖';
        setDialogue(`¡Hola! Ahora soy tu compañero ${nameLabel}! Listo para programar.`);
      }
    });
  });

  soundToggle.addEventListener('change', (e) => {
    soundEnabled = e.target.checked;
    if (soundEnabled) {
      initAudio();
      playTone(523.25, 'triangle', 0.1);
    }
    vscode.postMessage({ type: 'TOGGLE_SOUND', payload: soundEnabled });
  });

  // ==========================================
  // 5. RECEPCIÓN DE MENSAJES DE LA EXTENSIÓN
  // ==========================================
  window.addEventListener('message', (event) => {
    const message = event.data;
    switch (message.type) {
      case 'TICK':
        updateTimerUI(message.payload);
        break;

      case 'STATE_CHANGE':
        updateTimerUI(message.payload);
        break;

      case 'ROUND_FINISHED':
        if (message.payload.mode === 'WORK') {
          playBreakDanceSound();
          triggerTemporaryMood('DANCE', getRandomQuote('dance'), 5000);
        } else {
          playWorkStartSound();
          triggerTemporaryMood('WORK', getRandomQuote('work'), 4000);
        }
        break;

      case 'CYCLE_COMPLETED':
        // ¡Celebración épica de ciclo completo con trofeo y fanfarria triunfal!
        playCycleVictorySound();
        stage.classList.add('celebration');
        triggerTemporaryMood(
          'CYCLE',
          '🏆 ¡CICLO COMPLETO! ¡Eres una máquina de productividad! Disfruta tu descanso largo 🌟',
          8000
        );
        generateConfetti();
        break;

      case 'IDE_REACTION':
        const reaction = message.payload.reaction;
        if (reaction === 'ERROR') {
          playErrorBlip();
          triggerTemporaryMood(
            'ERROR',
            message.payload.message || getRandomQuote('error'),
            4000
          );
        } else if (reaction === 'FIXED') {
          playSaveChime();
          triggerTemporaryMood(
            'SAVED',
            message.payload.message || getRandomQuote('fixed'),
            3000
          );
        } else if (reaction === 'SAVED') {
          playSaveChime();
          triggerTemporaryMood(
            'SAVED',
            message.payload.message || getRandomQuote('saved'),
            2000
          );
        }
        break;

      case 'CONFIG_UPDATED':
        const cfg = message.payload;
        soundEnabled = cfg.soundEnabled;
        soundToggle.checked = soundEnabled;
        currentAvatar = cfg.avatar;
        avatarButtons.forEach((b) => {
          if (b.getAttribute('data-avatar') === currentAvatar) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });

        // Actualizar botón de preset activo
        if (cfg.workDuration === 50) {
          preset50?.classList.add('active');
          preset25?.classList.remove('active');
        } else {
          preset25?.classList.add('active');
          preset50?.classList.remove('active');
        }
        break;
    }
  });

  // Iniciar bucle de animación y avisar a la extensión
  renderLoop();
  vscode.postMessage({ type: 'WEBVIEW_READY' });
})();
