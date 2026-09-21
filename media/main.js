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
  const themeButtons = document.querySelectorAll('.theme-btn');

  // Pelotita interactiva estilo pets
  let toyBall = null;

  // Estado local
  let currentAvatar = 'neko';
  let currentBackground = 'winter';
  let currentSoundPack = 'arcade';
  let soundEnabled = true;
  let weatherParticles = [];
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
  let currentErrorPersonality = 'roast'; // 'roast', 'detective', 'panic', 'classic'
  let customAvatarData = null;
  let customAvatarImg = null;
  let foamParticles = [];

  // Frases especiales según la personalidad ante errores
  const errorQuotesByPersonality = {
    roast: [
      '¿Escribiste esto con los ojos cerrados o qué? 💀',
      'Ese bug tiene más años que el legado de COBOL... 🤦‍♂️',
      'El compilador está llorando en una esquina por esa línea 😭',
      'Premio al código espagueti del año 🍝',
      '¿Quién te hizo tanto daño para escribir ese null pointer? 🙃',
      'No es un feature, es un crimen de guerra digital 💥',
      'Hasta un mono aporreando teclas tendría menos warnings 🐒',
    ],
    detective: [
      '¡Elemental! Detecto una irregularidad en esta línea 🔍',
      'Siguiendo el rastro del stack trace sospechoso... 🕵️‍♂️',
      'El mayordomo fue el linter, caso casi resuelto 🔎',
      'Inspeccionando huellas dactilares del bug... 🧐',
      'Pista clave: falta un paréntesis o punto y coma 📜',
      'Un crimen de sintaxis no queda impune en mi guardia 🔦',
    ],
    panic: [
      '¡FUEGO EN PRODUCCIÓN! ¡TRAIGAN EL EXTINTOR! 🧯🔥',
      '¡CÓDIGO EN LLAMAS! ¡SÁLVESE QUIEN PUEDA! 🚨🚒',
      '¡TODO ESTÁ ARDIENDO! ¡ROCÍA ESPUMA POR TODAS PARTES! 💨',
      '¡EMERGENCIA NIVEL 5! ¡COMPILACIÓN EXPLOSIVA! 💥',
      '¡ALERTA ROJA! ¡EL SERVIDOR VA A COLAPSAR! 🌋',
      '¡EVACUEN EL ARCHIVO! ¡LOS BUGS NOS RODEAN! 🧯',
    ],
  };

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
    duck: {
      work: [
        '¡Cuac! Cuéntame tu bug línea por línea 🦆',
        'Flotando plácidamente en código limpio ✨',
        'Explicarle al patito siempre resuelve el problema 💡',
        '¡Cuac! Cero bugs a la vista en este lago 🌊',
        'Menos sobrepensar, más depurar con tu patito 🐥',
      ],
      dance: [
        '¡Cuac cuac! ¡Aletitas arriba y a chapotear! 🕺',
        '¡Fiesta en el estanque! Cero errores hoy 🎉',
        'Bailando con flotador de patito puesto 😎',
        '¡Cuac! Hora de descansar las plumas 🦆',
      ],
      error: '¡Cuac! ¿Qué es este TypeError monstruoso? 😵‍💫',
      fixed: '¡Cuac! ¡El Rubber Duck Debugging nunca falla! ✨',
      saved: '¡Cuac! Guardado fresco en el disco 👍',
    },
    capy: {
      work: [
        'Tranquilo, un commit a la vez ☕',
        'Modo zen activado: sin estrés ni prisas 🌿',
        'La calma es el mejor depurador del mundo 🧘‍♂️',
        'Fluyendo con el código como en aguas termales ♨️',
        'Cero estrés, 100% enfoque productivo ✨',
      ],
      dance: [
        'Hora de un buen baño caliente y relajación ♨️',
        'Bailando a paso suave y elegante 🕺',
        'Descanso sagrado: la mente clara piensa mejor ☕',
        'Un sorbito de café y a disfrutar la vida 🍊',
      ],
      error: 'Respira hondo... todo bug tiene solución 🧘‍♂️',
      fixed: 'Paz restablecida en el código ✨',
      saved: 'Archivo guardado en armonía perfecta 👍',
    },
    raccoon: {
      work: [
        '¡Infiltrado en la base de datos! 🦝💻',
        'Rebuscando bugs como si fueran tesoros 🍕',
        '0% rastros, 100% código furtivo y limpio ⚡',
        'Hackeando la matriz a la medianoche 🌙',
        'Si compila a la primera, sospecha del sistema 🐾',
      ],
      dance: [
        '¡FIESTA NOCTURNA! ¡A mover la colita anillada! 🕺',
        '¡Robando snacks del refrigerador para festejar! 🍕',
        'Modo party activado: ¡luces y rave! 🎉',
        '¡Misión cumplida! Descanso bien merecido 🦝',
      ],
      error: '¡Alarma! ¡Una trampa en el código! 😵‍💫',
      fixed: '¡Bug neutralizado como un profesional! ✨',
      saved: '¡Datos asegurados en la bóveda secreta! 👍',
    },
    custom: {
      work: [
        '¡Tu compañero personalizado dándolo todo! 🎨💻',
        'Enfocado al 100% en este bloque Pomodoro 🚀',
        'Cero distracciones, puro código limpio ✨',
        'Avanzando juntos hacia el próximo commit ☕',
      ],
      dance: [
        '¡A mover el esqueleto! ¡Descanso merecido! 🕺',
        '¡Fiesta retro con tu avatar custom! 🎉',
        '¡Pausa para estirarse y respirar hondo! 🧘‍♂️',
      ],
      error: '¡Ups! Algo se rompió en el archivo activo 😵‍💫',
      fixed: '¡Bug aniquilado con estilo! ✨',
      saved: '¡Archivo guardado a salvo! 👍',
    },
  };

  function getRandomQuote(category) {
    if (category === 'error' && currentErrorPersonality !== 'classic') {
      const list = errorQuotesByPersonality[currentErrorPersonality];
      if (list && list.length > 0) {
        return list[Math.floor(Math.random() * list.length)];
      }
    }
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

  function playZenChime(baseFreq = 432, duration = 1.6) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const t = audioCtx.currentTime;
      [1, 2.76, 5.4].forEach((ratio, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * ratio, t);
        const lvl = 0.09 / (i + 1);
        gain.gain.setValueAtTime(lvl, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + duration);
      });
    } catch (e) {}
  }

  function playCyberChime(freq = 880, duration = 0.35) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + duration * 0.4);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, t + duration);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {}
  }

  function playWorkStartSound() {
    initAudio();
    if (currentSoundPack === 'zen') {
      playZenChime(432, 1.8);
    } else if (currentSoundPack === 'cyber') {
      playCyberChime(523.25, 0.2);
      setTimeout(() => playCyberChime(1046.5, 0.35), 100);
    } else {
      // Arcade Chiptune
      playTone(330, 'square', 0.1, 0);     // E4
      playTone(392, 'square', 0.1, 0.1);   // G4
      playTone(523.25, 'square', 0.18, 0.2); // C5
    }
  }

  function playBreakDanceSound() {
    initAudio();
    if (currentSoundPack === 'zen') {
      playZenChime(528, 2.2); // Frecuencia Solfeggio relajante
    } else if (currentSoundPack === 'cyber') {
      playCyberChime(659.25, 0.15);
      setTimeout(() => playCyberChime(783.99, 0.15), 120);
      setTimeout(() => playCyberChime(1046.5, 0.35), 240);
    } else {
      // Fanfarria festiva de baile 8-bit
      playTone(523.25, 'triangle', 0.12, 0);       // C5
      playTone(659.25, 'square', 0.12, 0.12);     // E5
      playTone(783.99, 'square', 0.14, 0.24);     // G5
      playTone(1046.50, 'triangle', 0.35, 0.38);  // C6
      playTone(880, 'square', 0.15, 0.75);        // A5
      playTone(1046.50, 'square', 0.4, 0.9);      // C6 final
    }
  }

  function playCycleVictorySound() {
    initAudio();
    if (currentSoundPack === 'zen') {
      playZenChime(396, 2.5);
      setTimeout(() => playZenChime(528, 2.5), 500);
      setTimeout(() => playZenChime(639, 3.0), 1000);
    } else {
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
      notes.forEach((n) => playTone(n.f, currentSoundPack === 'cyber' ? 'sawtooth' : 'square', n.d, n.t, 0.12));
    }
  }

  function playErrorBlip() {
    initAudio();
    if (currentSoundPack === 'zen') {
      playTone(216, 'sine', 0.35, 0, 0.08);
    } else {
      playTone(300, 'sawtooth', 0.15, 0, 0.15);
      playTone(200, 'sawtooth', 0.2, 0.12, 0.12);
    }
  }

  function playSaveChime() {
    initAudio();
    if (currentSoundPack === 'zen') {
      playZenChime(864, 1.2);
    } else if (currentSoundPack === 'cyber') {
      playCyberChime(1318.5, 0.2);
    } else {
      playTone(987.77, 'sine', 0.1, 0, 0.08); // B5
      playTone(1318.5, 'sine', 0.2, 0.08, 0.1); // E6
    }
  }

  function playClick() {
    initAudio();
    if (currentSoundPack === 'zen') {
      playTone(800, 'sine', 0.02, 0, 0.03);
    } else if (currentSoundPack === 'cyber') {
      playTone(1200, 'triangle', 0.03, 0, 0.04);
    } else {
      playTone(600, 'square', 0.04, 0, 0.04);
    }
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
    if (weatherParticles.length === 0) {
      initWeatherParticles();
    }
  }
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 50);

  // Helper para pintar un pixel de fondo/escenario (sin efecto espejo)
  function bgPixel(vx, vy, color) {
    if (!color || color === '.' || vx < 0 || vx >= V_WIDTH || vy < 0 || vy >= V_HEIGHT) return;
    ctx.fillStyle = color;
    ctx.fillRect(vx * PIXEL_SCALE, vy * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
  }

  // Helper para pintar un bloque rectangular de fondo/escenario
  function bgRect(vx, vy, w, h, color) {
    if (!color || color === '.') return;
    const startX = Math.max(0, vx);
    const endX = Math.min(V_WIDTH, vx + w);
    const startY = Math.max(0, vy);
    const endY = Math.min(V_HEIGHT, vy + h);
    if (endX <= startX || endY <= startY) return;
    ctx.fillStyle = color;
    ctx.fillRect(
      startX * PIXEL_SCALE,
      startY * PIXEL_SCALE,
      (endX - startX) * PIXEL_SCALE,
      (endY - startY) * PIXEL_SCALE
    );
  }

  // --- SISTEMA DE PARTÍCULAS METEOROLÓGICAS (NIEVE, HOJAS, LLUVIA DIGITAL, POLVO CÁLIDO) ---
  function initWeatherParticles() {
    weatherParticles = [];
    const count = 42;
    for (let i = 0; i < count; i++) {
      weatherParticles.push({
        x: Math.random() * (V_WIDTH || 64),
        y: Math.random() * 25,
        speed: 0.12 + Math.random() * 0.28,
        driftSeed: Math.random() * 100,
        size: Math.random() > 0.8 ? 2 : 1,
        colorVariant: Math.random(),
      });
    }
  }

  function updateAndDrawWeatherParticles(theme, tick) {
    if (theme === 'minimal') return;

    for (let i = 0; i < weatherParticles.length; i++) {
      const pt = weatherParticles[i];

      if (theme === 'winter') {
        // Copos de nieve flotando y oscilando suavemente
        pt.y += pt.speed;
        pt.x += Math.sin(tick * 0.03 + pt.driftSeed) * 0.22;
        if (pt.y >= 25) {
          pt.y = -1;
          pt.x = Math.random() * V_WIDTH;
        }
        if (pt.x < 0) pt.x = V_WIDTH - 1;
        if (pt.x >= V_WIDTH) pt.x = 0;

        const px = Math.round(pt.x);
        const py = Math.round(pt.y);
        if (pt.size === 2) {
          bgRect(px, py, 2, 2, '#ffffff');
        } else {
          bgPixel(px, py, pt.colorVariant > 0.35 ? '#ffffff' : '#cbd5e1');
        }
      } else if (theme === 'forest') {
        // Hojas verdes y luciérnagas titilantes
        pt.y += pt.speed * 0.55;
        pt.x += Math.sin(tick * 0.04 + pt.driftSeed) * 0.35 + 0.1;
        if (pt.y >= 25) {
          pt.y = -1;
          pt.x = Math.random() * V_WIDTH;
        }
        if (pt.x < 0) pt.x = V_WIDTH - 1;
        if (pt.x >= V_WIDTH) pt.x = 0;

        const px = Math.round(pt.x);
        const py = Math.round(pt.y);
        if (pt.colorVariant > 0.55) {
          const glow = Math.sin(tick * 0.08 + pt.driftSeed);
          if (glow > -0.2) {
            bgPixel(px, py, glow > 0.5 ? '#fef08a' : '#86efac');
          }
        } else {
          bgPixel(px, py, '#48bb78');
        }
      } else if (theme === 'cyberpunk') {
        // Lluvia digital diagonal y destellos neón
        pt.y += pt.speed * 1.6;
        pt.x -= 0.28;
        if (pt.y >= 25) {
          pt.y = -1;
          pt.x = Math.random() * V_WIDTH;
        }
        if (pt.x < 0) pt.x = V_WIDTH - 1;

        const px = Math.round(pt.x);
        const py = Math.round(pt.y);
        const neonColor = pt.colorVariant > 0.5 ? '#00f5d4' : '#f72585';
        bgPixel(px, py, neonColor);
      } else if (theme === 'lofi') {
        // Motas de polvo dorado suspendidas en la luz cálida
        pt.y -= 0.03 + Math.sin(tick * 0.02 + pt.driftSeed) * 0.05;
        pt.x += Math.cos(tick * 0.02 + pt.driftSeed) * 0.12;
        if (pt.y < 3) {
          pt.y = 24;
          pt.x = Math.random() * V_WIDTH;
        }
        if (pt.x < 0) pt.x = V_WIDTH - 1;
        if (pt.x >= V_WIDTH) pt.x = 0;

        const px = Math.round(pt.x);
        const py = Math.round(pt.y);
        const alphaGlow = Math.sin(tick * 0.06 + pt.driftSeed);
        if (alphaGlow > -0.2) {
          bgPixel(px, py, alphaGlow > 0.4 ? '#fef08a' : '#fbd38d');
        }
      }
    }
  }

  // --- RENDERIZADO DEL FONDO Y TERRENO PIXEL ART ---
  function drawBackground(theme, tick) {
    if (theme === 'minimal') {
      // Suelo sutil minimalista
      for (let x = 0; x < V_WIDTH; x += 2) {
        bgPixel(x, 25, 'rgba(255, 255, 255, 0.18)');
      }
      return;
    }

    if (theme === 'winter') {
      // 1. Estrellas titilantes en el cielo profundo
      for (let x = 4; x < V_WIDTH; x += 16) {
        const starY = 2 + ((x * 7) % 8);
        const twinkle = (tick + x * 4) % 60 < 30;
        bgPixel(x, starY, twinkle ? '#ffffff' : '#94a3b8');
      }

      // 2. Montañas púrpuras lejanas con picos nevados (cada 28px)
      for (let peakX = 14; peakX < V_WIDTH + 28; peakX += 28) {
        const peakY = 8;
        for (let dx = -14; dx <= 14; dx++) {
          const vx = peakX + dx;
          if (vx < 0 || vx >= V_WIDTH) continue;
          const my = peakY + Math.floor(Math.abs(dx) * 1.15);
          for (let y = my; y < 25; y++) {
            if (y <= peakY + 3) {
              bgPixel(vx, y, '#ffffff'); // Nieve en la cima
            } else if (y === peakY + 4) {
              bgPixel(vx, y, '#cbd5e1'); // Sombra de nieve
            } else {
              bgPixel(vx, y, dx > 0 ? '#2c2748' : '#3d3663'); // Cresta y sombra
            }
          }
        }
      }

      // 3. Pinos nevados en plano medio (cada 16px)
      for (let px = 6; px < V_WIDTH + 16; px += 16) {
        // Tronco
        bgPixel(px, 23, '#3d2817');
        bgPixel(px, 24, '#3d2817');

        // Nivel inferior del pino
        for (let x = -3; x <= 3; x++) bgPixel(px + x, 22, '#14291f');
        bgPixel(px - 3, 21, '#ffffff');
        bgPixel(px - 2, 21, '#ffffff');
        bgPixel(px + 2, 21, '#ffffff');
        bgPixel(px + 3, 21, '#ffffff');

        // Nivel medio
        for (let x = -2; x <= 2; x++) bgPixel(px + x, 20, '#1a382b');
        bgPixel(px - 2, 19, '#ffffff');
        bgPixel(px + 2, 19, '#ffffff');

        // Cima del pino nevado
        bgPixel(px, 17, '#ffffff');
        bgPixel(px - 1, 18, '#ffffff');
        bgPixel(px, 18, '#ffffff');
        bgPixel(px + 1, 18, '#ffffff');
      }

      // 4. Manto de suelo nevado (y = 25 a 31)
      bgRect(0, 25, V_WIDTH, 1, '#ffffff'); // Nieve blanca radiante
      bgRect(0, 26, V_WIDTH, 1, '#cbd5e1'); // Capa intermedia azulada
      bgRect(0, 27, V_WIDTH, 1, '#334155'); // Escarcha helada
      bgRect(0, 28, V_WIDTH, 4, '#1e293b'); // Roca profunda fría
      return;
    }

    if (theme === 'forest') {
      // 1. Luna suave y serena
      const moonX = Math.min(V_WIDTH - 6, 70);
      bgRect(moonX, 3, 3, 3, '#fef08a');

      // 2. Colinas ondulantes en tonos esmeralda
      for (let x = 0; x < V_WIDTH; x++) {
        const hill1Y = 15 + Math.floor(Math.sin(x * 0.08) * 3);
        bgRect(x, hill1Y, 1, 25 - hill1Y, '#19432f');
        const hill2Y = 18 + Math.floor(Math.sin(x * 0.12 + 1.2) * 2.5);
        bgRect(x, hill2Y, 1, 25 - hill2Y, '#22573d');
      }

      // 3. Árboles frondosos (cada 18px)
      for (let tx = 8; tx < V_WIDTH + 18; tx += 18) {
        // Tronco
        bgRect(tx, 22, 1, 3, '#5c3d28');

        // Copa del árbol
        for (let cy = 15; cy <= 21; cy++) {
          const r = cy <= 18 ? cy - 14 : 21 - cy + 1;
          for (let cx = -r; cx <= r; cx++) {
            bgPixel(tx + cx, cy, (cx === -r || cy === 15) ? '#48bb78' : '#276749');
          }
        }
      }

      // 4. Suelo de hierba fresca con florecitas (y = 25 a 31)
      bgRect(0, 25, V_WIDTH, 1, '#38a169'); // Hierba viva
      for (let x = 0; x < V_WIDTH; x++) {
        if (x % 3 === 0) bgPixel(x, 24, '#48bb78'); // Brotes de hierba
        if (x % 11 === 2) bgPixel(x, 24, '#ecc94b'); // Flores amarillas
        if (x % 17 === 5) bgPixel(x, 24, '#ed64a6'); // Flores rosas
      }
      bgRect(0, 26, V_WIDTH, 1, '#22543d'); // Raíces oscuras
      bgRect(0, 27, V_WIDTH, 1, '#4a3020'); // Tierra fértil
      bgRect(0, 28, V_WIDTH, 4, '#2d1d13'); // Tierra profunda
      return;
    }

    if (theme === 'cyberpunk') {
      // 1. Rascacielos skyline con ventanas neón
      const bWidths = [8, 10, 7, 9, 11, 8];
      let curX = 0;
      let bIdx = 0;
      while (curX < V_WIDTH) {
        const bw = bWidths[bIdx % bWidths.length];
        const bHeight = 11 + ((bIdx * 3) % 7);
        const topY = 24 - bHeight;
        const bColor = bIdx % 2 === 0 ? '#121326' : '#191a35';

        // Cuerpo del edificio
        bgRect(curX, topY, bw - 1, bHeight, bColor);

        // Antena en la azotea con luz parpadeante roja
        const antX = curX + Math.floor(bw / 2);
        bgPixel(antX, topY - 1, '#333552');
        bgPixel(antX, topY - 2, '#333552');
        bgPixel(antX, topY - 3, tick % 40 < 20 ? '#ff0055' : '#440018');

        // Ventanas neón (cian, magenta, amarillo)
        for (let wy = topY + 2; wy < 23; wy += 2) {
          for (let wx = curX + 1; wx < curX + bw - 2; wx += 2) {
            const s = (wx * 11 + wy * 7 + bIdx * 3);
            if (s % 3 === 0) bgPixel(wx, wy, '#00f5d4');
            else if (s % 5 === 0) bgPixel(wx, wy, '#f72585');
            else if (s % 7 === 0) bgPixel(wx, wy, '#fee440');
          }
        }

        curX += bw;
        bIdx++;
      }

      // 2. Línea láser horizonte magenta neón
      bgRect(0, 24, V_WIDTH, 1, '#f72585');

      // 3. Suelo de asfalto mojado con reflejos neón (y = 25 a 31)
      bgRect(0, 25, V_WIDTH, 1, '#00f5d4'); // Bordillo cian neón
      bgRect(0, 26, V_WIDTH, 6, '#0d0f17'); // Asfalto húmedo
      // Reflejos luminosos en el pavimento
      for (let x = 0; x < V_WIDTH; x += 6) {
        bgPixel(x, 27, '#f72585');
        bgPixel(x + 1, 27, '#f72585');
        bgPixel(x + 3, 29, '#00f5d4');
        bgPixel(x + 4, 29, '#00f5d4');
      }
      return;
    }

    if (theme === 'lofi') {
      // 1. Ventana al atardecer en el centro
      const winW = 16;
      const winX = Math.round(V_WIDTH / 2) - 8;
      // Atardecer exterior
      bgRect(winX, 5, winW, 19, '#4a1d34');
      bgRect(winX + 1, 6, winW - 2, 4, '#80344c');
      bgRect(winX + 1, 10, winW - 2, 5, '#b04a55');
      bgRect(winX + 1, 15, winW - 2, 8, '#e07a5f');
      // Nube cálida en la ventana
      bgRect(winX + 3, 11, 7, 2, '#ffd1b3');
      // Marco de madera de la ventana
      bgRect(winX, 5, winW, 1, '#381605');
      bgRect(winX, 23, winW, 1, '#381605');
      bgRect(winX, 5, 1, 19, '#381605');
      bgRect(winX + winW - 1, 5, 1, 19, '#381605');
      bgRect(winX + Math.floor(winW / 2), 5, 1, 19, '#381605'); // Cruceta vertical
      bgRect(winX, 14, winW, 1, '#381605'); // Cruceta horizontal

      // 2. Luces colgantes en la parte superior (guirnalda)
      for (let x = 2; x < V_WIDTH - 2; x += 8) {
        const wireY = 2 + (x % 16 === 8 ? 1 : 0);
        bgPixel(x, wireY, '#4a2810');
        bgPixel(x, wireY + 1, (tick + x) % 50 < 25 ? '#fef08a' : '#fbd38d');
      }

      // 3. Librería en el lateral izquierdo
      if (V_WIDTH > 36) {
        bgRect(2, 12, 6, 13, '#542710');
        bgRect(3, 13, 4, 3, '#3182ce');
        bgPixel(4, 13, '#ef4444');
        bgRect(3, 17, 4, 3, '#10b981');
        bgPixel(5, 17, '#f59e0b');
        bgRect(3, 21, 4, 3, '#e53e3e');
      }

      // 4. Plantita suculenta en el lateral derecho
      if (V_WIDTH > 44) {
        const plX = V_WIDTH - 6;
        bgRect(plX, 22, 4, 3, '#b45309');
        bgPixel(plX - 1, 21, '#10b981');
        bgPixel(plX, 20, '#10b981');
        bgPixel(plX + 1, 19, '#34d399');
        bgPixel(plX + 2, 20, '#10b981');
        bgPixel(plX + 3, 21, '#10b981');
      }

      // 5. Suelo de parquet de madera cálido (y = 25 a 31)
      bgRect(0, 25, V_WIDTH, 3, '#9c6644');
      bgRect(0, 28, V_WIDTH, 1, '#542e15');
      bgRect(0, 29, V_WIDTH, 3, '#854d27');
      for (let x = 0; x < V_WIDTH; x += 10) {
        bgPixel(x, 25, '#542e15');
        bgPixel(x, 26, '#542e15');
        bgPixel(x + 5, 29, '#542e15');
        bgPixel(x + 5, 30, '#542e15');
      }
      return;
    }
  }

  function applyBackgroundTheme(theme) {
    currentBackground = theme || 'winter';
    if (stage) {
      stage.setAttribute('data-theme', currentBackground);
    }
  }

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

  // --- AVATAR 4: SIR DUCKY (EL PATITO DE GOMA DEBUGGER) 🦆 ---
  function drawDuck(step, mood, walking, sitting) {
    const isDancing = mood === 'DANCE';
    const isWorking = mood === 'WORK';
    const isError = mood === 'ERROR';

    let waddle = walking ? Math.floor(Math.sin(step * 0.35) * 1.5) : Math.floor(Math.sin(step * 0.1) * 1);
    let danceOffset = isDancing ? Math.sin(step * 0.4) * 3 : 0;
    let xOffset = Math.round(avatarX + danceOffset);
    let yOffset = Math.round(18 + jumpY + (sitting ? 1 : waddle));
    currentAvatarOriginX = xOffset;

    const YELLOW = '#facc15';
    const YELLOW_DARK = '#eab308';
    const ORANGE = '#f97316';
    const ORANGE_DARK = '#ea580c';
    const HAT = '#1e293b';
    const HAT_BAND = '#ef4444';
    const EYE = '#111827';
    const WHITE = '#ffffff';

    // Sombrerito de copa elegante
    for (let x = -2; x <= 1; x++) {
      p(xOffset + x, yOffset - 9, HAT);
      p(xOffset + x, yOffset - 8, HAT);
      p(xOffset + x, yOffset - 7, HAT_BAND);
    }
    for (let x = -3; x <= 2; x++) {
      p(xOffset + x, yOffset - 6, HAT);
    }

    // Cabeza del patito
    for (let x = -2; x <= 2; x++) {
      for (let y = -5; y <= -2; y++) {
        p(xOffset + x, yOffset + y, YELLOW);
      }
    }

    // Pico naranja que sobresale adelante
    p(xOffset + 3, yOffset - 3, ORANGE);
    p(xOffset + 4, yOffset - 3, ORANGE);
    p(xOffset + 3, yOffset - 2, ORANGE_DARK);

    // Ojo con expresiones
    if (isError) {
      p(xOffset + 1, yOffset - 4, EYE);
      p(xOffset, yOffset - 5, EYE);
      p(xOffset + 2, yOffset - 5, EYE);
      p(xOffset + 4, yOffset - 6 + (step % 4), '#00e5ff');
    } else if (isDancing) {
      // Gafas de sol de fiesta 😎
      p(xOffset - 1, yOffset - 4, '#111111');
      p(xOffset, yOffset - 4, '#111111');
      p(xOffset + 1, yOffset - 4, '#111111');
      p(xOffset + 2, yOffset - 4, '#00e5ff');
      p(xOffset, yOffset - 3, '#111111');
    } else {
      const isBlinking = step % 60 < 4;
      if (isBlinking) {
        p(xOffset + 1, yOffset - 4, EYE);
      } else {
        p(xOffset + 1, yOffset - 4, EYE);
        p(xOffset + 1, yOffset - 5, WHITE);
      }
    }

    // Corbatín elegante rojo en el cuello
    p(xOffset, yOffset - 1, HAT_BAND);
    p(xOffset + 1, yOffset - 1, HAT_BAND);

    // Cuerpo esponjoso del pato
    for (let x = -3; x <= 2; x++) {
      for (let y = 0; y <= 4; y++) {
        p(xOffset + x, yOffset + y, YELLOW);
      }
    }
    for (let x = -2; x <= 1; x++) p(xOffset + x, yOffset + 5, YELLOW_DARK);

    // Colita levantada detrás
    p(xOffset - 4, yOffset + 1, YELLOW);
    p(xOffset - 5, yOffset, YELLOW);
    p(xOffset - 4, yOffset, YELLOW);

    // Alita
    const wingFlap = (walking || isDancing) && (step % 6 < 3);
    if (wingFlap) {
      p(xOffset - 1, yOffset + 1, YELLOW_DARK);
      p(xOffset, yOffset + 1, YELLOW_DARK);
      p(xOffset - 2, yOffset + 2, YELLOW_DARK);
    } else {
      p(xOffset - 1, yOffset + 2, YELLOW_DARK);
      p(xOffset, yOffset + 2, YELLOW_DARK);
      p(xOffset - 1, yOffset + 3, YELLOW_DARK);
    }

    // Patitas palmeadas naranjas
    if (sitting) {
      p(xOffset - 1, yOffset + 6, ORANGE);
      p(xOffset + 1, yOffset + 6, ORANGE);
    } else if (walking) {
      const stepPhase = Math.floor((step * 0.35) % 4);
      if (stepPhase === 0 || stepPhase === 1) {
        p(xOffset - 1, yOffset + 6, ORANGE);
        p(xOffset + 1, yOffset + 5, ORANGE);
      } else {
        p(xOffset - 1, yOffset + 5, ORANGE);
        p(xOffset + 1, yOffset + 6, ORANGE);
      }
    } else {
      p(xOffset - 2, yOffset + 6, ORANGE);
      p(xOffset - 1, yOffset + 6, ORANGE);
      p(xOffset + 1, yOffset + 6, ORANGE);
      p(xOffset + 2, yOffset + 6, ORANGE);
    }
  }

  // --- AVATAR 5: CAPYDEV (LA CAPIBARA ZEN) ☕ ---
  function drawCapy(step, mood, walking, sitting) {
    const isDancing = mood === 'DANCE';
    const isWorking = mood === 'WORK';
    const isError = mood === 'ERROR';

    let bob = walking ? Math.floor(Math.sin(step * 0.25) * 1) : Math.floor(Math.sin(step * 0.08) * 1);
    let danceOffset = isDancing ? Math.sin(step * 0.3) * 2.5 : 0;
    let xOffset = Math.round(avatarX + danceOffset);
    let yOffset = Math.round(18 + jumpY + (sitting ? 1 : bob));
    currentAvatarOriginX = xOffset;

    const FUR = '#8c5a3c';
    const FUR_DARK = '#684128';
    const FUR_LIGHT = '#a56f4d';
    const NOSE = '#2b170c';
    const ORANGE = '#f97316';
    const LEAF = '#22c55e';

    // Naranjita / Mandarina en la cabeza (icónica de las capibaras zen)
    p(xOffset - 1, yOffset - 7, ORANGE);
    p(xOffset, yOffset - 7, ORANGE);
    p(xOffset - 1, yOffset - 8, ORANGE);
    p(xOffset, yOffset - 8, ORANGE);
    p(xOffset, yOffset - 9, LEAF);

    // Orejita redonda pequeña
    p(xOffset - 4, yOffset - 6, FUR_DARK);
    p(xOffset - 3, yOffset - 6, FUR_DARK);

    // Cabeza rectangular característica de la capibara
    for (let x = -4; x <= 4; x++) {
      for (let y = -5; y <= -1; y++) {
        p(xOffset + x, yOffset + y, FUR);
      }
    }
    // Hocico plano delantero
    for (let y = -4; y <= -1; y++) {
      p(xOffset + 4, yOffset + y, FUR_DARK);
      p(xOffset + 5, yOffset + y, FUR_DARK);
    }
    // Naricita negra
    p(xOffset + 5, yOffset - 3, NOSE);

    // Ojos zen entrecerrados ( - )
    if (isError) {
      p(xOffset + 1, yOffset - 4, NOSE);
      p(xOffset + 1, yOffset - 3, NOSE);
      p(xOffset + 3, yOffset - 6 + (step % 4), '#00e5ff');
    } else if (isDancing) {
      // Gafas de fiesta 😎
      for (let g = 0; g <= 3; g++) p(xOffset + g, yOffset - 4, '#111111');
      p(xOffset + 1, yOffset - 3, '#00e5ff');
      p(xOffset + 3, yOffset - 3, '#111111');
    } else {
      // Ojito cerrado sereno y pacífico
      p(xOffset, yOffset - 3, NOSE);
      p(xOffset + 1, yOffset - 4, NOSE);
      p(xOffset + 2, yOffset - 3, NOSE);
    }

    // Cuerpo robusto y tierno
    for (let x = -5; x <= 3; x++) {
      for (let y = 0; y <= 5; y++) {
        p(xOffset + x, yOffset + y, FUR);
      }
    }
    // Lomo superior claro y panza oscura
    for (let x = -4; x <= 2; x++) p(xOffset + x, yOffset, FUR_LIGHT);
    for (let x = -4; x <= 2; x++) p(xOffset + x, yOffset + 5, FUR_DARK);

    // Patitas cortas
    if (sitting) {
      p(xOffset - 4, yOffset + 6, FUR_DARK);
      p(xOffset - 3, yOffset + 6, FUR_DARK);
      p(xOffset + 2, yOffset + 6, FUR_DARK);
      p(xOffset + 3, yOffset + 6, FUR_DARK);
    } else if (walking) {
      const stepPhase = Math.floor((step * 0.25) % 4);
      const stepOffset = stepPhase < 2 ? 1 : 0;
      p(xOffset - 4, yOffset + 6 - stepOffset, FUR_DARK);
      p(xOffset - 3, yOffset + 6 - stepOffset, FUR_DARK);
      p(xOffset + 2, yOffset + 6 + stepOffset - 1, FUR_DARK);
      p(xOffset + 3, yOffset + 6 + stepOffset - 1, FUR_DARK);
    } else {
      p(xOffset - 4, yOffset + 6, FUR_DARK);
      p(xOffset - 3, yOffset + 6, FUR_DARK);
      p(xOffset + 2, yOffset + 6, FUR_DARK);
      p(xOffset + 3, yOffset + 6, FUR_DARK);
    }
  }

  // --- AVATAR 6: BYTE (EL MAPACHE HACKER) 🦝 ---
  function drawRaccoon(step, mood, walking, sitting) {
    const isDancing = mood === 'DANCE';
    const isWorking = mood === 'WORK';
    const isError = mood === 'ERROR';

    let bob = walking ? Math.floor(Math.sin(step * 0.35) * 1.5) : Math.floor(Math.sin(step * 0.12) * 1);
    let danceOffset = isDancing ? Math.sin(step * 0.38) * 3 : 0;
    let xOffset = Math.round(avatarX + danceOffset);
    let yOffset = Math.round(18 + jumpY + (sitting ? 1 : bob));
    currentAvatarOriginX = xOffset;

    const GRAY = '#94a3b8';
    const MASK = '#1e293b';
    const WHITE = '#f8fafc';
    const HOODIE = '#06b6d4';
    const PIZZA_CRUST = '#f59e0b';
    const PIZZA_CHEESE = '#fbbf24';
    const PIZZA_RED = '#ef4444';

    // Orejas puntiagudas con borde negro y centro blanco
    p(xOffset - 4, yOffset - 8, MASK);
    p(xOffset - 3, yOffset - 8, MASK);
    p(xOffset - 3, yOffset - 7, WHITE);
    p(xOffset + 3, yOffset - 8, MASK);
    p(xOffset + 4, yOffset - 8, MASK);
    p(xOffset + 3, yOffset - 7, WHITE);

    // Cabeza gris
    for (let x = -4; x <= 4; x++) {
      for (let y = -6; y <= -1; y++) {
        p(xOffset + x, yOffset + y, GRAY);
      }
    }

    // Antifaz negro característico del mapache
    for (let x = -4; x <= 4; x++) {
      p(xOffset + x, yOffset - 4, MASK);
    }
    p(xOffset - 3, yOffset - 3, MASK);
    p(xOffset - 2, yOffset - 3, MASK);
    p(xOffset + 2, yOffset - 3, MASK);
    p(xOffset + 3, yOffset - 3, MASK);

    // Ojos astutos dentro del antifaz
    if (isError) {
      p(xOffset - 2, yOffset - 4, '#ef4444');
      p(xOffset + 2, yOffset - 4, '#ef4444');
      p(xOffset + 5, yOffset - 5 + (step % 4), '#00e5ff');
    } else if (isDancing) {
      // Visor cyberpunk de hacker 😎
      for (let v = -3; v <= 3; v++) p(xOffset + v, yOffset - 4, '#f72585');
      p(xOffset - 2, yOffset - 4, '#00f5d4');
      p(xOffset + 2, yOffset - 4, '#00f5d4');
    } else {
      const isBlinking = step % 60 < 4;
      if (isBlinking) {
        p(xOffset - 2, yOffset - 4, GRAY);
        p(xOffset + 2, yOffset - 4, GRAY);
      } else {
        p(xOffset - 2, yOffset - 4, WHITE);
        p(xOffset + 2, yOffset - 4, WHITE);
      }
    }

    // Hocico blanco y naricita
    p(xOffset - 1, yOffset - 2, WHITE);
    p(xOffset, yOffset - 2, MASK);
    p(xOffset + 1, yOffset - 2, WHITE);
    p(xOffset, yOffset - 1, WHITE);

    // Cuello con hoodie/bandana de hacker cyan
    for (let x = -3; x <= 3; x++) p(xOffset + x, yOffset, HOODIE);

    // Cuerpo
    for (let x = -3; x <= 3; x++) {
      for (let y = 1; y <= 5; y++) {
        p(xOffset + x, yOffset + y, GRAY);
      }
    }
    // Pecho más claro
    for (let y = 1; y <= 3; y++) {
      p(xOffset, yOffset + y, WHITE);
    }

    // Cola anillada a rayas
    const tailY = yOffset + 2;
    p(xOffset - 4, tailY + 1, MASK);
    p(xOffset - 5, tailY, GRAY);
    p(xOffset - 6, tailY, MASK);
    p(xOffset - 7, tailY - 1, GRAY);
    p(xOffset - 7, tailY - 2, MASK);

    // En descansos o sentado: sostiene una rebanada de pizza pixel art 🍕
    if (isDancing || sitting) {
      p(xOffset + 3, yOffset + 2, PIZZA_CRUST);
      p(xOffset + 4, yOffset + 2, PIZZA_CRUST);
      p(xOffset + 3, yOffset + 1, PIZZA_CHEESE);
      p(xOffset + 2, yOffset + 1, PIZZA_RED);
      p(xOffset + 2, yOffset, PIZZA_CHEESE);
    }

    // Patitas negras
    if (sitting) {
      p(xOffset - 2, yOffset + 6, MASK);
      p(xOffset + 2, yOffset + 6, MASK);
    } else if (walking) {
      const stepPhase = Math.floor((step * 0.35) % 4);
      if (stepPhase === 0 || stepPhase === 1) {
        p(xOffset - 2, yOffset + 6, MASK);
        p(xOffset + 2, yOffset + 5, MASK);
      } else {
        p(xOffset - 2, yOffset + 5, MASK);
        p(xOffset + 2, yOffset + 6, MASK);
      }
    } else {
      p(xOffset - 2, yOffset + 6, MASK);
      p(xOffset + 2, yOffset + 6, MASK);
    }
  }

  // --- RENDERIZADO DE AVATAR PERSONALIZADO (CUSTOM AVATAR STUDIO) ---
  function drawCustomAvatar(step, mood, walking, sitting) {
    const isDancing = mood === 'DANCE';
    let bob = walking ? Math.floor(Math.sin(step * 0.3) * 1.5) : Math.floor(Math.sin(step * 0.12));
    let danceOffset = isDancing ? Math.sin(step * 0.35) * 3 : 0;
    let xOffset = Math.round(avatarX + danceOffset);
    let yOffset = Math.round(18 + jumpY + (sitting ? 1 : bob));
    currentAvatarOriginX = xOffset;

    if (!customAvatarImg || !customAvatarImg.complete || customAvatarImg.naturalWidth === 0) {
      // Fallback a Neko si no hay imagen personalizada activa
      drawNeko(step, mood, walking, sitting);
      return;
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Escalar la imagen respetando proporciones a resolución retro pixelada (~22x22 px virtuales)
    const maxDimension = 22 * PIXEL_SCALE;
    const aspect = customAvatarImg.naturalWidth / customAvatarImg.naturalHeight;
    let drawW, drawH;
    if (aspect >= 1) {
      drawW = maxDimension;
      drawH = maxDimension / aspect;
    } else {
      drawH = maxDimension;
      drawW = maxDimension * aspect;
    }

    const centerX = xOffset * PIXEL_SCALE;
    const baseY = (yOffset + 6) * PIXEL_SCALE; // alineado al suelo/patas
    const drawX = centerX - drawW / 2;
    const drawY = baseY - drawH;

    if (facingDir === -1) {
      ctx.translate(centerX, 0);
      ctx.scale(-1, 1);
      ctx.translate(-centerX, 0);
    }

    ctx.drawImage(customAvatarImg, drawX, drawY, drawW, drawH);

    // Si está bailando en descanso, añadir gafas retro de fiesta
    if (isDancing) {
      const eyeY = yOffset - 3;
      for (let g = -3; g <= 3; g++) p(xOffset + g, eyeY, '#111111');
      p(xOffset - 2, eyeY + 1, '#00e5ff');
      p(xOffset + 2, eyeY + 1, '#00e5ff');
    }

    ctx.restore();
  }

  // --- EFECTOS VISUALES DE PERSONALIDAD ANTE ERRORES ---
  function drawMagnifyingGlass(vx, vy, step) {
    const glassX = vx + (facingDir === 1 ? 7 : -7);
    const glassY = vy - 1 + Math.floor(Math.sin(step * 0.2) * 1.5);
    const WOOD = '#795548';
    const GOLD = '#ffd700';
    const CYAN = '#00e5ff';
    const WHITE = '#ffffff';

    // Mango de madera
    p(glassX + (facingDir === 1 ? 3 : -3), glassY + 3, WOOD);
    p(glassX + (facingDir === 1 ? 2 : -2), glassY + 2, WOOD);
    p(glassX + (facingDir === 1 ? 1 : -1), glassY + 1, GOLD);

    // Marco circular de la lupa
    p(glassX - 1, glassY - 2, GOLD);
    p(glassX, glassY - 2, GOLD);
    p(glassX + 1, glassY - 2, GOLD);
    p(glassX - 2, glassY - 1, GOLD);
    p(glassX + 2, glassY - 1, GOLD);
    p(glassX - 2, glassY, GOLD);
    p(glassX + 2, glassY, GOLD);
    p(glassX - 1, glassY + 1, GOLD);
    p(glassX, glassY + 1, GOLD);
    p(glassX + 1, glassY + 1, GOLD);

    // Cristal y destello reflectivo
    p(glassX - 1, glassY - 1, WHITE);
    p(glassX, glassY - 1, CYAN);
    p(glassX + 1, glassY - 1, CYAN);
    p(glassX - 1, glassY, CYAN);
    p(glassX, glassY, CYAN);
    p(glassX + 1, glassY, CYAN);
  }

  function drawFireExtinguisherAndFoam(vx, vy, step) {
    const extX = vx + (facingDir === 1 ? 5 : -5);
    const extY = vy + 1;
    const RED = '#d63031';
    const DARK = '#2d3436';
    const GOLD = '#ffd700';
    const GRAY = '#b2bec3';

    // Cilindro rojo del extintor
    for (let x = -1; x <= 1; x++) {
      for (let y = 0; y <= 3; y++) {
        p(extX + x, extY + y, RED);
      }
    }
    // Válvula, manómetro y manguera
    p(extX, extY - 1, DARK);
    p(extX - (facingDir === 1 ? 1 : -1), extY - 1, GOLD);
    p(extX + (facingDir === 1 ? 2 : -2), extY - 1, GRAY);
    p(extX + (facingDir === 1 ? 3 : -3), extY, GRAY);

    // Fuego en el suelo
    const fireX = vx + (facingDir === 1 ? 14 : -14);
    const fireY = 22;
    const flicker = step % 4;
    p(fireX, fireY, '#ff4757');
    p(fireX - 1, fireY, '#ff4757');
    p(fireX + 1, fireY, '#ff4757');
    p(fireX, fireY - 1 - (flicker % 2), '#ffa502');
    p(fireX + (flicker > 1 ? 1 : -1), fireY - 1, '#fffa65');
    if (flicker === 2) p(fireX, fireY - 2, '#fffa65');

    // Chorro de partículas de espuma blanca
    if (step % 2 === 0) {
      foamParticles.push({
        x: extX + (facingDir === 1 ? 4 : -4),
        y: extY,
        vx: (facingDir === 1 ? 1.4 : -1.4) + (Math.random() - 0.5) * 0.4,
        vy: -0.4 + (Math.random() - 0.5) * 0.3,
        size: Math.random() > 0.4 ? 2 : 1,
        life: 18 + Math.floor(Math.random() * 8),
        color: Math.random() > 0.25 ? '#ffffff' : '#70a1ff',
      });
    }
  }

  function updateAndDrawFoamParticles() {
    for (let i = foamParticles.length - 1; i >= 0; i--) {
      const fp = foamParticles[i];
      fp.x += fp.vx;
      fp.y += fp.vy;
      fp.vy += 0.05; // gravedad suave
      fp.life--;
      ctx.fillStyle = fp.color;
      ctx.fillRect(
        Math.round(fp.x) * PIXEL_SCALE,
        Math.round(fp.y) * PIXEL_SCALE,
        fp.size * PIXEL_SCALE,
        fp.size * PIXEL_SCALE
      );
      if (fp.life <= 0) {
        foamParticles.splice(i, 1);
      }
    }
  }

  function drawRoastSkull(vx, vy, step) {
    const skullX = vx;
    const skullY = vy - 10 + Math.floor(Math.sin(step * 0.25) * 1.5);
    const WHITE = '#ffffff';
    const DARK = '#111111';
    const FLAME = step % 2 === 0 ? '#ff4757' : '#ffa502';

    // Llamita de roast sobre la cabeza
    p(skullX, skullY - 3, FLAME);
    p(skullX - 1, skullY - 2, FLAME);
    p(skullX + 1, skullY - 2, FLAME);

    // Calaverita pixel art
    for (let x = -2; x <= 2; x++) {
      for (let y = -1; y <= 1; y++) {
        p(skullX + x, skullY + y, WHITE);
      }
    }
    p(skullX - 1, skullY, DARK);
    p(skullX + 1, skullY, DARK);
    p(skullX - 1, skullY + 2, WHITE);
    p(skullX, skullY + 2, DARK);
    p(skullX + 1, skullY + 2, WHITE);
  }

  function loadCustomAvatarFromDataUri(dataUri) {
    if (!dataUri) return;
    customAvatarData = dataUri;
    customAvatarImg = new Image();
    customAvatarImg.onload = () => {
      const preview = document.getElementById('customAvatarPreview');
      if (preview) {
        preview.innerHTML = `<img src="${dataUri}" alt="Custom Avatar" />`;
      }
    };
    customAvatarImg.onerror = () => {
      setDialogue('Error al procesar la imagen del avatar.');
    };
    customAvatarImg.src = dataUri;
  }

  function clearCustomAvatar() {
    customAvatarData = null;
    customAvatarImg = null;
    const preview = document.getElementById('customAvatarPreview');
    if (preview) {
      preview.innerHTML = `<span id="customPreviewPlaceholder">Sin avatar</span>`;
    }
  }

  // Bucle principal de renderizado gráfico y simulación física
  function renderLoop() {
    animTick++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 0. Renderizar fondo temático pixel art y partículas climáticas
    drawBackground(currentBackground, animTick);
    updateAndDrawWeatherParticles(currentBackground, animTick);

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
        case 'duck':
          drawDuck(animTick, activeMood, isWalking, isSittingInChair);
          break;
        case 'capy':
          drawCapy(animTick, activeMood, isWalking, isSittingInChair);
          break;
        case 'raccoon':
          drawRaccoon(animTick, activeMood, isWalking, isSittingInChair);
          break;
        case 'custom':
          drawCustomAvatar(animTick, activeMood, isWalking, isSittingInChair);
          break;
        case 'neko':
        default:
          drawNeko(animTick, activeMood, isWalking, isSittingInChair);
          break;
      }
    }

    // 5.1 Reacciones visuales de personalidades ante errores
    if (activeMood === 'ERROR') {
      const originX = avatarX;
      const originY = Math.round(
        18 + jumpY + (isSittingInChair ? 1 : isWalking ? Math.floor(Math.sin(animTick * 0.3) * 1.5) : Math.floor(Math.sin(animTick * 0.12)))
      );
      if (currentErrorPersonality === 'detective') {
        drawMagnifyingGlass(originX, originY, animTick);
      } else if (currentErrorPersonality === 'panic') {
        drawFireExtinguisherAndFoam(originX, originY, animTick);
      } else if (currentErrorPersonality === 'roast') {
        drawRoastSkull(originX, originY, animTick);
      }
    }

    // 5.2 Actualizar y dibujar partículas de espuma de extintor
    updateAndDrawFoamParticles();

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
        duck: [
          '¡QUACK! ¡Resolviste la duda con el patito! 🦆✨',
          '¡Flotando alto como en la bañera! 🦆🧼',
          '¡Quack elegante con sombrero de copa! 🎩',
        ],
        capy: [
          'Ok I pull up... ¡Salto chill! ☕✨',
          'Tranqui, todo se compila a su tiempo 🍊',
          'Zen mode: máximo nivel de paz 🧘‍♂️',
        ],
        raccoon: [
          '¡Salto ninja por más snacks de medianoche! 🦝🍕',
          '¡Hacking the mainframe en el aire! ⚡',
          '¡Misión sigilosa completada con éxito! 🐾',
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
  const isSidebar = document.body.getAttribute('data-view') === 'sidebar';

  if (switchModeText) {
    switchModeText.textContent = isSidebar ? 'Cambiar a Barra Inferior' : 'Cambiar a Barra Lateral';
  }

  btnSwitchMode?.addEventListener('click', () => {
    playClick();
    settingsBackdrop?.classList.remove('open');
    if (isSidebar) {
      vscode.postMessage({ type: 'OPEN_BOTTOM_PANEL' });
    } else {
      vscode.postMessage({ type: 'OPEN_SIDEBAR' });
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
            : newAvatar === 'robot'
            ? 'PixelBot 🤖'
            : newAvatar === 'duck'
            ? 'Sir Ducky 🦆'
            : newAvatar === 'capy'
            ? 'CapyDev ☕'
            : newAvatar === 'raccoon'
            ? 'Byte 🦝'
            : 'Custom Avatar 🎨';
        setDialogue(`¡Hola! Ahora soy tu compañero ${nameLabel}! Listo para programar.`);
      }
    });
  });

  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClick();
      const newTheme = btn.getAttribute('data-theme');
      if (newTheme) {
        currentBackground = newTheme;
        themeButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        applyBackgroundTheme(currentBackground);
        vscode.postMessage({ type: 'CHANGE_BACKGROUND', payload: newTheme });
        const themeNames = {
          winter: 'Invierno nevado ❄️',
          forest: 'Bosque natural 🌲',
          cyberpunk: 'Cyberpunk Neón 🌆',
          lofi: 'Café Lo-Fi ☕',
          minimal: 'Minimalista ⬛',
        };
        setDialogue(`Fondo cambiado: ${themeNames[newTheme] || newTheme}!`);
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

  // Selector de Paquetes de Sonido
  const soundPackButtons = document.querySelectorAll('.sound-pack-btn');
  soundPackButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClick();
      const pack = btn.getAttribute('data-sound');
      if (pack) {
        currentSoundPack = pack;
        soundPackButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        vscode.postMessage({ type: 'CHANGE_SOUND_PACK', payload: pack });
        if (pack === 'zen') {
          playZenChime(528, 1.8);
          setDialogue('Modo Zen activado: cuenco tibetano armónico 🧘‍♂️');
        } else if (pack === 'cyber') {
          playCyberChime(1046.5, 0.4);
          setDialogue('Modo Cyber activado: sintetizador analógico 🌆');
        } else {
          playWorkStartSound();
          setDialogue('Modo Arcade activado: clásicos pitidos chiptune 👾');
        }
      }
    });
  });

  // Tablero de Estadísticas & Rachas de Enfoque
  const btnResetStats = document.getElementById('btnResetStats');
  btnResetStats?.addEventListener('click', () => {
    playClick();
    vscode.postMessage({ type: 'RESET_STATS' });
    setDialogue('Historial de estadísticas reiniciado.');
  });

  function updateStatsUI(stats) {
    if (!stats) return;
    const elToday = document.getElementById('statTodayCount');
    const elTime = document.getElementById('statTodayTime');
    const elStreak = document.getElementById('statStreak');
    const elTotal = document.getElementById('statTotal');
    const elBars = document.getElementById('statsBars');

    if (elToday) elToday.textContent = stats.todayCount || 0;
    if (elTime) {
      const mins = stats.todayMinutes || 0;
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      elTime.textContent = hrs > 0 ? `${hrs}h ${rem}m` : `${rem}m`;
    }
    if (elStreak) elStreak.textContent = `${stats.streakDays || 0}d`;
    if (elTotal) elTotal.textContent = stats.totalCompleted || 0;

    if (elBars && stats.last7Days) {
      const maxVal = Math.max(1, ...stats.last7Days.map((d) => d.count));
      elBars.innerHTML = stats.last7Days
        .map((d) => {
          const pct = Math.round((d.count / maxVal) * 100);
          const isEmpty = d.count === 0;
          return `
            <div class="stat-bar-col" title="${d.date}: ${d.count} pomodoros">
              <div class="stat-bar-track">
                <div class="stat-bar-fill ${isEmpty ? 'empty' : ''}" style="height: ${isEmpty ? '0%' : pct + '%'}"></div>
              </div>
              <span class="stat-bar-day">${d.dayLabel}</span>
            </div>
          `;
        })
        .join('');
    }
  }

  // --- CUSTOM AVATAR STUDIO LISTENERS ---
  const btnPickAvatarFile = document.getElementById('btnPickAvatarFile');
  btnPickAvatarFile?.addEventListener('click', () => {
    playClick();
    vscode.postMessage({ type: 'PICK_CUSTOM_AVATAR' });
  });

  const btnRemoveCustomAvatar = document.getElementById('btnRemoveCustomAvatar');
  btnRemoveCustomAvatar?.addEventListener('click', () => {
    playClick();
    clearCustomAvatar();
    vscode.postMessage({ type: 'REMOVE_CUSTOM_AVATAR' });
    setDialogue('Avatar personalizado eliminado. ¡Hola de nuevo, NekoDev! 🐱');
  });

  const btnApplyCustomUrl = document.getElementById('btnApplyCustomUrl');
  const inputCustomAvatarUrl = document.getElementById('inputCustomAvatarUrl');
  btnApplyCustomUrl?.addEventListener('click', () => {
    playClick();
    const url = inputCustomAvatarUrl?.value?.trim();
    if (url) {
      vscode.postMessage({ type: 'SET_CUSTOM_AVATAR_DATA', payload: url });
      setDialogue('Cargando avatar desde URL... 🎨');
    }
  });

  // --- SELECTOR DE PERSONALIDAD ANTE ERRORES ---
  const personalityButtons = document.querySelectorAll('.personality-btn');
  personalityButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClick();
      const p = btn.getAttribute('data-personality');
      if (p) {
        currentErrorPersonality = p;
        personalityButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        vscode.postMessage({ type: 'CHANGE_ERROR_PERSONALITY', payload: p });
        const labels = {
          roast: 'Modo Roast My Code: ¡humor sarcástico ante bugs! 🔥💀',
          detective: 'Modo Detective: lupa de aumento pixel art 🔍🕵️‍♂️',
          panic: 'Modo Pánico: extintores y alarma de incendios 🧯🚨',
          classic: 'Modo Clásico: reacciones estándar del compañero 🐱',
        };
        setDialogue(labels[p] || 'Personalidad actualizada');
      }
    });
  });

  // ==========================================
  // 5. RECEPCIÓN DE MENSAJES DE LA EXTENSIÓN
  // ==========================================
  window.addEventListener('message', (event) => {
    const message = event.data;
    switch (message.type) {
      case 'STATS_UPDATED':
        updateStatsUI(message.payload);
        break;

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
      case 'CUSTOM_AVATAR_LOADED':
        if (message.payload) {
          loadCustomAvatarFromDataUri(message.payload);
        } else {
          clearCustomAvatar();
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

        // Actualizar fondo temático
        if (cfg.background) {
          currentBackground = cfg.background;
          applyBackgroundTheme(currentBackground);
          themeButtons.forEach((b) => {
            if (b.getAttribute('data-theme') === currentBackground) {
              b.classList.add('active');
            } else {
              b.classList.remove('active');
            }
          });
        }

        // Actualizar botón de preset activo
        if (cfg.workDuration === 50) {
          preset50?.classList.add('active');
          preset25?.classList.remove('active');
        } else {
          preset25?.classList.add('active');
          preset50?.classList.remove('active');
        }

        // Actualizar paquete de sonido activo
        if (cfg.soundPack) {
          currentSoundPack = cfg.soundPack;
          soundPackButtons.forEach((b) => {
            if (b.getAttribute('data-sound') === currentSoundPack) {
              b.classList.add('active');
            } else {
              b.classList.remove('active');
            }
          });
        }

        // Actualizar personalidad ante errores
        if (cfg.errorPersonality) {
          currentErrorPersonality = cfg.errorPersonality;
          personalityButtons.forEach((b) => {
            if (b.getAttribute('data-personality') === currentErrorPersonality) {
              b.classList.add('active');
            } else {
              b.classList.remove('active');
            }
          });
        }

        // Cargar avatar custom si viene en la configuración
        if (cfg.customAvatarData && !customAvatarImg) {
          loadCustomAvatarFromDataUri(cfg.customAvatarData);
        }
        break;
    }
  });

  // Inicializar estado del fondo y partículas
  applyBackgroundTheme(currentBackground);
  initWeatherParticles();

  // Iniciar bucle de animación y avisar a la extensión
  renderLoop();
  vscode.postMessage({ type: 'WEBVIEW_READY' });
})();
