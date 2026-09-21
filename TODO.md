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
- [x] **Suite de Pruebas Unitarias con Jest:** 26 pruebas automatizadas para `TimerManager` (deltas `Date.now()`, sleep mode, transiciones de rondas, presets, persistencia, estadísticas) y `StatusBarManager` (emojis dinámicos).
- [x] **Guía de Contribución (`CONTRIBUTING.md`):** Explicar cómo la comunidad de GitHub puede dibujar y proponer nuevos avatares en pixel art.

---

## 🚀 Fase 4: Custom Avatar Studio, Personalidades de Error y 100% Open Source (Completada)
- [x] **100% Free & Open Source (Licencia MIT):** Eliminación total de capas de pago y licencias comerciales; todas las características son libres y gratuitas para la comunidad.
- [x] **Custom Avatar Studio (Sube tu propio avatar):**
  - [x] Cargar archivo GIF animado o PNG desde disco local vía diálogo nativo de archivos.
  - [x] Cargar imagen desde URL directa.
  - [x] Sanitización y validación de seguridad (límite estricto de 2 MB, redimensionamiento automático a resolución retro, prevención de desbordamiento de memoria).
  - [x] Integración total con físicas: caminata, persecución de pelota 🎾, salto acrobático y sillita de descanso.
- [x] **Personalidades del Avatar ante Errores de Código:**
  - [x] **Modo Roast My Code / Sarcástico:** Comentarios mordaces ante bugs con calavera pixel art y aura de fuego.
  - [x] **Modo Detective:** Inspección deductiva con lupa pixel art animada buscando la causa raíz del error.
  - [x] **Modo Pánico con Extintor:** Extintor pixel art con chorro animado de partículas de espuma física y fuego en el suelo.
  - [x] **Modo Clásico:** Expresiones y frases características de cada compañero.
- [x] **Paquetes de Sonido Temáticos Sintetizados (Web Audio API):**
  - [x] **Arcade 16-bit 👾:** Chiptune nostálgico con pitidos y fanfarrias retro.
  - [x] **Lo-Fi Chill ☕:** Tonos armónicos relajantes con decaimiento suave estilo cuenco zen.
  - [x] **Synthwave / Cyberpunk 🌆:** Tonos analógicos con ataque rápido y modulación envolvente.
- [x] **Métricas y Estadísticas de Productividad:**
  - [x] Pomodoros completados hoy y minutos acumulados de trabajo profundo.
  - [x] Contador de racha de días consecutivos de productividad.
  - [x] Gráfico interactivo con selector de período: vista por día (últimos 7 días) y por semana (últimas 4 semanas) con botón de reinicio.
- [x] **Modos de Visualización Flexibles:**
  - [x] Barra lateral clásica (Sidebar).
  - [x] Barra inferior panorámica (Bottom Panel) de ancho completo.
  - [x] Mini-avatar dinámico en la barra de estado (`🐱`, `🧙‍♂️`, `🤖`, `🦆`, `☕`, `🦝`, `🎨`).

---

## 🔒 Fase 5: Auditoría y Blindaje de Seguridad Integral (Completada)
- [x] **Eliminación Total de `innerHTML` en el Webview:**
  - Migración a APIs seguras del DOM (`document.createElement`, `textContent`, `appendChild`).
  - Blindaje contra inyección de HTML / XSS en previsualización de avatares personalizados.
  - Generación de barras estadísticas de productividad usando nodos DOM nativos.
- [x] **Validación Estricta de Payloads en WebviewProvider:**
  - Validación con listas blancas para `CHANGE_AVATAR`, `CHANGE_BACKGROUND`, `CHANGE_SOUND_PACK`, `CHANGE_ERROR_PERSONALITY`.
  - Validación de tipos booleanos para `TOGGLE_SOUND`.
  - Validación de enteros y rangos acotados (1 a 240 minutos) para `SET_PRESET`.
- [x] **Blindaje y Sanitización de Imágenes Personalizadas:**
  - Límite estricto de tamaño de payload de 3 MB para prevenir DoS / Memory Bloat en `globalState`.
  - Filtro estricto de extensiones en selector nativo (`png`, `gif`, `jpg`, `jpeg`, `webp`).
  - Restricción estricta de URLs a `https://` (máx. 2048 caracteres, sin caracteres de inyección).
  - Data URIs restringidos exclusivamente a imágenes rasterizadas base64 (`image/png`, `image/jpeg`, `image/gif`, `image/webp`), descartando XML/SVG para eliminar cualquier vector de ejecución de scripts.
- [x] **Endurecimiento de Content Security Policy (CSP):**
  - Adición de `base-uri 'none'` y `form-action 'none'`.
- [x] **Sanitización de Límites en TimerManager:**
  - Clamping estricto de duraciones (`Math.max(1, Math.min(240, ...))`) en `setPreset`.

---

*Archivo de seguimiento y roadmap técnico del proyecto.*
