# 📋 PomoBuddy - Lista de Tareas Pendientes (TODO List)

Este archivo registra el avance en tiempo real del proyecto. Las tareas se irán marcando como completadas (`[x]`) conforme se implementen.

---

## 🟢 Fase 1: Estabilización y Blindaje de Edge Cases (Completada)
- [x] **Motor de tiempo a prueba de Sleep Mode:** Cálculo basado en marcas de tiempo reales (`targetEndTime = Date.now() + delta`) para no congelarse al suspender la laptop.
- [x] **Persistencia de sesión:** Guardado automático en `context.globalState` para no perder la ronda al recargar el editor (`Cmd+R` / `Reload Window`).
- [x] **Filtrado de archivos pesados y vendors:** Ignorar `node_modules`, `dist/`, `.git/`, `.min.js` y archivos `lock`.
- [x] **Debounce de tipeo (1.2s):** Evitar falsas alarmas de linter mientras el usuario está escribiendo código activamente.
- [x] **Comando rápido de Silencio (Mute Toggle):** Comando `PomoPixel: Silenciar / Activar Sonidos` (`pomopixel.toggleMute`) para silenciar rápidamente en llamadas de Zoom/Meet.
- [x] **Límite de tamaño de archivo (> 500 KB):** Proteger el linter para ignorar archivos gigantes (> 10k líneas o > 500 KB).
- [x] **Soporte de Temas VS Code (Light, Dark, High Contrast):** Adaptación visual del escenario y textos para temas claros (`.vscode-light`) y alto contraste (`.vscode-high-contrast`).
- [x] **Manejo resiliente de AudioContext:** Desbloqueo proactivo ante cualquier primer gesto en el panel y manejo seguro de promesas suspendidas.

---

## 🟡 Fase 2: Experiencia de Usuario y Ajustes del Temporizador (Capa Gratuita)
- [ ] **Ajuste rápido de tiempos desde el panel:** Botones rápidos para cambiar a Pomodoro de 25m o 50m sin tener que ir a `settings.json`.
- [ ] **Celebración de Fin de Ciclo (Ronda 4/4):** Animación y fanfarria especial al completar las 4 rondas de trabajo antes del descanso largo.
- [ ] **Ampliación del banco de frases:** Más frases motivacionales y divertidas para cada personaje.
- [ ] **Acción de Notificación "+5 min extra":** Conexión directa desde la notificación emergente al temporizador del webview.

---

## 🔵 Fase 3: Preparación Open Source, Marca y GitHub
- [x] **Renombrar el proyecto oficialmente a `PomoBuddy`:** Actualizar identificadores, `package.json`, comandos, configuración y documentación.
- [ ] **GitHub Actions Workflow (`.github/workflows/build.yml`):** Compilación automática y generación del archivo `.vsix` en cada release.
- [ ] **Capturas y GIF animado de demostración:** Crear un GIF de vista previa del muñeco bailando para el `README.md`.
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
  - [ ] Modo pestaña completa del editor (Full Editor View para segundo monitor).
  - [ ] Modo mini-avatar caminando en la barra de estado.
- [ ] **Métricas y Estadísticas de Productividad:**
  - [ ] Gráfico de pomodoros completados por día y semana.

---

*Archivo de seguimiento activo - Actualizado automáticamente tras cada implementación.*
