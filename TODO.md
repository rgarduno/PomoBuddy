# 📋 PomoBuddy - Lista de Tareas Pendientes (TODO List)

Este archivo registra el avance en tiempo real del proyecto. Las tareas se irán marcando como completadas (`[x]`) conforme se implementen.

---

## 🟢 Fase 1: Estabilización y Blindaje de Edge Cases (Completada)
- [x] **Motor de tiempo a prueba de Sleep Mode:** Cálculo basado en marcas de tiempo reales (`targetEndTime = Date.now() + delta`) para no congelarse al suspender la laptop.
- [x] **Persistencia de sesión:** Guardado automático en `context.globalState` para no perder la ronda al recargar el editor (`Cmd+R` / `Reload Window`).
- [x] **Filtrado de archivos pesados y vendors:** Ignorar `node_modules`, `dist/`, `.git/`, `.min.js` y archivos `lock`.
- [x] **Debounce de tipeo (1.2s):** Evitar falsas alarmas de linter mientras el usuario está escribiendo código activamente.
- [x] **Comando rápido de Silencio (Mute Toggle):** Comando `PomoBuddy: Silenciar / Activar Sonidos` (`pomobuddy.toggleMute`) para silenciar rápidamente en llamadas de Zoom/Meet.
- [x] **Límite de tamaño de archivo (> 500 KB):** Proteger el linter para ignorar archivos gigantes (> 10k líneas o > 500 KB).
- [x] **Soporte de Temas VS Code (Light, Dark, High Contrast):** Adaptación visual del escenario y textos para temas claros (`.vscode-light`) y alto contraste (`.vscode-high-contrast`).
- [x] **Manejo resiliente de AudioContext:** Desbloqueo proactivo ante cualquier primer gesto en el panel y manejo seguro de promesas suspendidas.

---

## 🟡 Fase 2: Experiencia de Usuario y Ajustes del Temporizador (Completada)
- [x] **Ajuste rápido de tiempos desde el panel:** Botones interactivos de cambio rápido `25 / 5m` (Clásico) y `50 / 10m` (Deep Work).
- [x] **Celebración de Fin de Ciclo (Ronda 4/4):** Trofeo pixel art animado, escenario dorado y fanfarria triunfal 8-bit al completar 4 pomodoros antes del descanso largo.
- [x] **Ampliación del banco de frases con personalidad propia:** Diálogos únicos y contextuales para los 6 compañeros (**NekoDev** 🐱, **CodeMage** 🧙‍♂️, **PixelBot** 🤖, **Sir Ducky** 🦆, **CapyDev** ☕, y **Byte** 🦝).
- [x] **Título de pestaña pulido:** Título simplificado a `PomoBuddy: Compañero` para evitar repeticiones en la barra lateral.
- [x] **Acción de Notificación "+5 min extra":** Conexión directa desde la notificación emergente al temporizador activo.
- [x] **Físicas de Movimiento & Caminata:** El avatar camina de izquierda a derecha por el suelo, se voltea al llegar a los bordes y alterna patitas/pasos.
- [x] **La Sillita de Descanso:** En tiempo de descanso, el avatar camina a su sillita pixel art retro, se sienta y se relaja con su café o siesta con burbujas de Zzz.
- [x] **Soporte para el Panel Inferior (Bottom Panel):** Contenedor registrado en la barra inferior (junto a Terminal/Output) con diseño responsivo horizontal para que el avatar camine por todo el ancho de la pantalla.
- [x] **Interacción por Clic (Tamagotchi Petting):** Al hacer clic sobre el escenario, el avatar pega un salto acrobático con destellos/estrellas y dice una frase cariñosa.
- [x] **Catálogo Extendido de 6 Compañeros:** NekoDev, CodeMage, PixelBot, Sir Ducky, CapyDev y Byte.

---

## 🔵 Fase 3: Preparación Open Source, Marca y GitHub
- [x] **Renombrar el proyecto oficialmente a `PomoBuddy`:** Actualizar identificadores, `package.json`, comandos, configuración y documentación.
- [x] **Banner e Identidad Visual (`media/banner.svg`):** Banner vectorial pixel art con los 6 compañeros, HUD flotante y escenario nevado para el README.
- [x] **README Profesional de Alto Impacto:** Badges de Shields.io, matriz de compañeros, arquitectura técnica y comandos.
- [ ] **Guía de Contribución (`CONTRIBUTING.md`):** Explicar cómo la comunidad de GitHub puede dibujar y proponer nuevos avatares en pixel art.

---

## 💎 Fase 4: Capa de Pago (Pro / Premium)
- [ ] **Módulo de Licencias (License Manager):** Validación de License Keys conectadas a Gumroad / LemonSqueezy con soporte offline (firma criptográfica o caché con 30 días de gracia).
- [ ] **Custom Avatar Studio (Sube tu avatar):**
  - [ ] Cargar archivo GIF animado o PNG desde disco local o URL.
  - [ ] Sanitización y validación de seguridad (límite de peso 2 MB, redimensionamiento automático a resolución retro).
- [ ] **Personalidades del Avatar ante Errores:**
  - [ ] Modo Roast My Code / Sarcástico (comentarios mordaces ante bugs).
  - [ ] Modo Detective (inspección con lupa).
  - [ ] Modo Pánico con Extintor de Incendios.
- [ ] **Sound Packs Temáticos:**
  - [ ] Pack Lo-Fi Chill.
  - [ ] Pack Synthwave / Cyberpunk.
  - [ ] Pack Arcade 16-bit.
- [ ] **Modos de Visualización Flexibles:**
  - [ ] **Mascota Flotante de Escritorio (Desktop Overlay):** Mini ventana transparente Always-On-Top que camina libremente por encima de cualquier ventana y de tu código.
  - [ ] Modo pestaña completa del editor (Full Editor View para segundo monitor).
  - [ ] Modo mini-avatar caminando en la barra de estado.
- [ ] **Métricas y Estadísticas de Productividad:**
  - [ ] Gráfico de pomodoros completados por día y semana.

---

*Archivo de seguimiento y roadmap técnico del proyecto.*
