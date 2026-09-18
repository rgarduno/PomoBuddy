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
  const soundToggle = document.getElementById('soundToggle');
  const avatarButtons = document.querySelectorAll('.avatar-btn');

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
  let currentMood = 'IDLE'; // 'IDLE', 'WORK', 'DANCE', 'ERROR', 'SAVED'
  let moodTimeout = null;

  // Frases de diálogo aleatorias
  const workQuotes = [
    '¡A picar código! Modo foco activado 💻',
    'Concéntrate, estás programando magia ✨',
    'Un bug a la vez, tú puedes 🚀',
    'Escribe código limpio y elegante ☕',
    '¡Avanzando a toda máquina! 🔥',
  ];

  const danceQuotes = [
    '¡Tiempo cumplido! ¡A bailar! 🕺',
    '¡Despega los ojos de la pantalla! 🎉',
    '¡Estira la espalda y baila! 💃',
    '¡Excelente bloque de trabajo! 🪩',
    '¡Toma agüita y festeja! 🥤',
  ];

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
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, startTime = 0, gainLevel = 0.1) {
    if (!soundEnabled || !audioCtx) return;
    try {
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
    } catch (e) {
      console.warn('Error reproduciendo sonido', e);
    }
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
  // 2. MOTOR DE RENDERIZADO PIXEL ART
  // ==========================================
  // Configuramos el Canvas con resolución virtual de 32x32 píxeles
  const V_WIDTH = 32;
  const V_HEIGHT = 32;
  const PIXEL_SCALE = 5; // 32 * 5 = 160px

  // Función para pintar un pixel en la cuadrícula virtual
  function p(vx, vy, color) {
    if (!color || color === '.') return;
    ctx.fillStyle = color;
    ctx.fillRect(vx * PIXEL_SCALE, vy * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
  }

  // --- AVATAR 1: NEKODEV (GATITO DEV) ---
  function drawNeko(step, mood) {
    const isDancing = mood === 'DANCE';
    const isWorking = mood === 'WORK';
    const isError = mood === 'ERROR';

    // Desplazamientos de animación
    let bob = Math.floor(Math.sin(step * 0.15) * 1.5);
    let danceOffset = isDancing ? Math.sin(step * 0.3) * 3 : 0;
    let xOffset = Math.round(16 + danceOffset);
    let yOffset = Math.round(18 + (isDancing ? Math.abs(Math.sin(step * 0.4) * 4) * -1 : bob));

    const FUR = '#ffb347'; // Naranja gato
    const WHITE = '#ffffff';
    const PINK = '#ff80ab';
    const DARK = '#2d3436';
    const SHADOW = '#e67e22';

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
    p(xOffset, yOffset - 2, PINK); // Naricita
    p(xOffset + 1, yOffset - 2, WHITE);

    // Ojos según el estado
    if (isError) {
      // Ojos en espiral / cruz por error
      p(xOffset - 3, yOffset - 4, DARK);
      p(xOffset - 2, yOffset - 5, DARK);
      p(xOffset + 2, yOffset - 4, DARK);
      p(xOffset + 3, yOffset - 5, DARK);
      // Gota de sudor
      p(xOffset + 6, yOffset - 6 + (step % 4), '#00d2d3');
    } else if (isDancing) {
      // GAFAS DE SOL DE FIESTA / BAILE 😎
      for (let g = -4; g <= 4; g++) {
        p(xOffset + g, yOffset - 4, '#111111');
      }
      p(xOffset - 3, yOffset - 3, '#111111');
      p(xOffset - 2, yOffset - 3, '#00e5ff'); // Destello en las gafas
      p(xOffset + 2, yOffset - 3, '#111111');
      p(xOffset + 3, yOffset - 3, '#00e5ff');
    } else {
      // Ojos normales parpadeantes
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

    // Cola moviéndose
    const tailWag = Math.sin(step * (isDancing ? 0.4 : 0.15)) * 2;
    p(xOffset - 4, yOffset + 3, FUR);
    p(xOffset - 5 + Math.round(tailWag), yOffset + 2, FUR);
    p(xOffset - 6 + Math.round(tailWag), yOffset + 1, FUR);

    // Patitas
    p(xOffset - 3, yOffset + 6, WHITE);
    p(xOffset - 2, yOffset + 6, WHITE);
    p(xOffset + 2, yOffset + 6, WHITE);
    p(xOffset + 3, yOffset + 6, WHITE);

    // Si está bailando: ¡Brazos arriba celebrando!
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

    // Si está trabajando: ¡Mini laptop tecleando!
    if (isWorking) {
      // Laptop
      p(xOffset - 4, yOffset + 4, '#576574');
      p(xOffset - 3, yOffset + 4, '#c8d6e5');
      p(xOffset - 2, yOffset + 4, '#c8d6e5');
      p(xOffset - 1, yOffset + 4, '#576574');
      p(xOffset - 4, yOffset + 3, '#00d2d3'); // Pantalla azul brillante
      p(xOffset - 3, yOffset + 3, '#00d2d3');
      // Patas tecleando rápido
      const keyStep = step % 4 < 2;
      p(xOffset - 3, yOffset + (keyStep ? 4 : 5), WHITE);
      p(xOffset - 1, yOffset + (keyStep ? 5 : 4), WHITE);

      // Tacita de café al lado con humo
      p(xOffset + 4, yOffset + 5, '#ffffff');
      p(xOffset + 5, yOffset + 5, '#ffffff');
      p(xOffset + 4, yOffset + 4, '#795548'); // café
      if (step % 8 < 4) {
        p(xOffset + 4, yOffset + 2, 'rgba(255,255,255,0.7)'); // humo
      }
    }
  }

  // --- AVATAR 2: CODEMAGE (MAGO 8-BIT) ---
  function drawWizard(step, mood) {
    const isDancing = mood === 'DANCE';
    const isWorking = mood === 'WORK';
    const isError = mood === 'ERROR';

    let bob = Math.floor(Math.sin(step * 0.15) * 1.5);
    let danceOffset = isDancing ? Math.sin(step * 0.3) * 3 : 0;
    let xOffset = Math.round(16 + danceOffset);
    let yOffset = Math.round(17 + (isDancing ? Math.abs(Math.sin(step * 0.4) * 4) * -1 : bob));

    const ROBE = '#6c5ce7';
    const HAT = '#4834d4';
    const GOLD = '#f9ca24';
    const BEARD = '#dfe6e9';
    const SKIN = '#ffbe76';

    // Gorro puntiagudo de mago
    p(xOffset, yOffset - 11, GOLD); // Estrella en la punta
    p(xOffset, yOffset - 10, HAT);
    p(xOffset - 1, yOffset - 9, HAT);
    p(xOffset, yOffset - 9, HAT);
    p(xOffset + 1, yOffset - 9, HAT);
    for (let x = -3; x <= 3; x++) p(xOffset + x, yOffset - 8, HAT);
    for (let x = -4; x <= 4; x++) p(xOffset + x, yOffset - 7, GOLD); // Ala dorada

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

    // Gran barba blanca
    for (let x = -3; x <= 3; x++) p(xOffset + x, yOffset - 4, BEARD);
    for (let x = -2; x <= 2; x++) p(xOffset + x, yOffset - 3, BEARD);
    p(xOffset, yOffset - 2, BEARD);

    // Túnica
    for (let y = -2; y <= 6; y++) {
      for (let x = -3; x <= 3; x++) {
        p(xOffset + x, yOffset + y, ROBE);
      }
    }

    // Báculo mágico con cristal reluciente
    const staffGlow = isDancing || isWorking;
    const crystalColor = staffGlow
      ? (step % 6 < 3 ? '#00e5ff' : '#ff007f')
      : '#00cec9';
    p(xOffset + 5, yOffset - 4, crystalColor);
    p(xOffset + 5, yOffset - 3, '#795548');
    p(xOffset + 5, yOffset - 2, '#795548');
    p(xOffset + 5, yOffset - 1, '#795548');
    p(xOffset + 5, yOffset, '#795548');
    p(xOffset + 5, yOffset + 1, '#795548');
    p(xOffset + 5, yOffset + 2, '#795548');
    p(xOffset + 5, yOffset + 3, '#795548');

    // Chispas mágicas al bailar o trabajar
    if (staffGlow) {
      const sparkX = xOffset + 5 + Math.sin(step * 0.4) * 3;
      const sparkY = yOffset - 6 + Math.cos(step * 0.4) * 2;
      p(Math.round(sparkX), Math.round(sparkY), '#fffa65');
    }
  }

  // --- AVATAR 3: PIXELBOT (ROBOT 8-BIT) ---
  function drawRobot(step, mood) {
    const isDancing = mood === 'DANCE';
    const isWorking = mood === 'WORK';
    const isError = mood === 'ERROR';

    let bob = Math.floor(Math.sin(step * 0.15) * 1.5);
    let danceOffset = isDancing ? Math.sin(step * 0.3) * 3 : 0;
    let xOffset = Math.round(16 + danceOffset);
    let yOffset = Math.round(18 + (isDancing ? Math.abs(Math.sin(step * 0.4) * 4) * -1 : bob));

    const METAL = '#b2bec3';
    const DARK_METAL = '#636e72';
    const SCREEN = '#2d3436';
    const BLUE_NEON = '#00d2d3';
    const RED_NEON = '#ff7675';
    const GOLD = '#ffeaa7';

    // Antena con bombillo parpadeante
    p(xOffset, yOffset - 8, isError ? RED_NEON : (step % 20 < 10 ? BLUE_NEON : GOLD));
    p(xOffset, yOffset - 7, DARK_METAL);

    // Cabeza cuadrada
    for (let y = -6; y <= -1; y++) {
      for (let x = -4; x <= 4; x++) {
        p(xOffset + x, yOffset + y, METAL);
      }
    }

    // Pantalla de ojos
    for (let y = -5; y <= -2; y++) {
      for (let x = -3; x <= 3; x++) {
        p(xOffset + x, yOffset + y, SCREEN);
      }
    }

    // Ojos LED
    if (isError) {
      p(xOffset - 2, yOffset - 4, RED_NEON);
      p(xOffset - 2, yOffset - 3, RED_NEON);
      p(xOffset + 2, yOffset - 4, RED_NEON);
      p(xOffset + 2, yOffset - 3, RED_NEON);
    } else if (isDancing) {
      // Ojos en corazón o luces disco
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

    // Cuello
    p(xOffset, yOffset, DARK_METAL);

    // Torso / Cuerpo
    for (let y = 1; y <= 6; y++) {
      for (let x = -4; x <= 4; x++) {
        p(xOffset + x, yOffset + y, METAL);
      }
    }

    // Medidor de energía en el pecho
    p(xOffset - 2, yOffset + 3, isWorking ? RED_NEON : BLUE_NEON);
    p(xOffset, yOffset + 3, isWorking ? GOLD : BLUE_NEON);
    p(xOffset + 2, yOffset + 3, isWorking ? '#55efc4' : BLUE_NEON);

    // Orugas o pies metálicos
    p(xOffset - 3, yOffset + 7, DARK_METAL);
    p(xOffset - 2, yOffset + 7, DARK_METAL);
    p(xOffset + 2, yOffset + 7, DARK_METAL);
    p(xOffset + 3, yOffset + 7, DARK_METAL);
  }

  // Bucle principal de renderizado gráfico
  function renderLoop() {
    animTick++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Determinar estado actual de animación del personaje
    let activeMood = currentMood;
    if (activeMood === 'IDLE') {
      if (timerState.status === 'RUNNING') {
        activeMood = timerState.mode === 'WORK' ? 'WORK' : 'DANCE';
      }
    }

    // Renderizar según el avatar seleccionado
    switch (currentAvatar) {
      case 'wizard':
        drawWizard(animTick, activeMood);
        break;
      case 'robot':
        drawRobot(animTick, activeMood);
        break;
      case 'neko':
      default:
        drawNeko(animTick, activeMood);
        break;
    }

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
      // Restaurar diálogo de contexto
      if (timerState.status === 'RUNNING') {
        if (timerState.mode === 'WORK') {
          setDialogue(workQuotes[Math.floor(Math.random() * workQuotes.length)]);
        } else {
          setDialogue(danceQuotes[Math.floor(Math.random() * danceQuotes.length)]);
        }
      }
    }, durationMs);
  }

  function updateVisualMode(mode, status) {
    const isBreak = mode === 'SHORT_BREAK' || mode === 'LONG_BREAK';
    const isRunning = status === 'RUNNING';

    // Ajustar insignias
    modeBadge.className = 'mode-badge';
    if (mode === 'WORK') {
      modeBadge.textContent = 'ENFOQUE / TRABAJO';
    } else if (mode === 'SHORT_BREAK') {
      modeBadge.textContent = 'DESCANSO CORTO 🕺';
      modeBadge.classList.add('break');
    } else {
      modeBadge.textContent = 'DESCANSO LARGO 🌟';
      modeBadge.classList.add('long-break');
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
      btnStartPause.classList.remove('btn-primary');
      btnStartPause.classList.add('btn-secondary');
    } else {
      startPauseIcon.textContent = '▶';
      startPauseLabel.textContent = status === 'PAUSED' ? 'Reanudar' : 'Iniciar';
      btnStartPause.classList.add('btn-primary');
      btnStartPause.classList.remove('btn-secondary');
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
      setDialogue('Temporizador pausado. Tomate un segundo.');
    } else {
      vscode.postMessage({ type: 'START' });
      if (timerState.mode === 'WORK') {
        playWorkStartSound();
        setDialogue(workQuotes[Math.floor(Math.random() * workQuotes.length)]);
      } else {
        playBreakDanceSound();
        setDialogue(danceQuotes[Math.floor(Math.random() * danceQuotes.length)]);
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

  avatarButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClick();
      const newAvatar = btn.getAttribute('data-avatar');
      if (newAvatar) {
        currentAvatar = newAvatar;
        avatarButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        vscode.postMessage({ type: 'CHANGE_AVATAR', payload: newAvatar });
        setDialogue(`¡Hola! Ahora soy tu compañero ${newAvatar} 🚀`);
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
          triggerTemporaryMood('DANCE', '¡TRABAJO TERMINADO! ¡A BAILAR! 🕺🎉', 5000);
        } else {
          playWorkStartSound();
          triggerTemporaryMood('WORK', '¡Descanso terminado! ¡A concentrarse! ⚡', 4000);
        }
        break;

      case 'IDE_REACTION':
        const reaction = message.payload.reaction;
        if (reaction === 'ERROR') {
          playErrorBlip();
          triggerTemporaryMood('ERROR', message.payload.message || '¡Hay un error en tu código! 😵‍💫', 4000);
        } else if (reaction === 'FIXED') {
          playSaveChime();
          triggerTemporaryMood('SAVED', message.payload.message || '¡Bugs resueltos! ✨', 3000);
        } else if (reaction === 'SAVED') {
          playSaveChime();
          triggerTemporaryMood('SAVED', message.payload.message || '¡Guardado con éxito! 👍', 2000);
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
        break;
    }
  });

  // Iniciar bucle de animación y avisar a la extensión
  renderLoop();
  vscode.postMessage({ type: 'WEBVIEW_READY' });
})();
