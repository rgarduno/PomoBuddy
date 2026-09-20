# PomoBuddy - Registro y Matriz de Características (Free vs. Pro)

Este documento es la **fuente de la verdad** del proyecto. Se actualizará constantemente conforme desarrollemos e incorporemos nuevas funcionalidades a la extensión, clasificándolas entre la **Capa Gratuita** y la **Capa de Pago (Pro)**.

---

## 📊 Matriz General de Características

| Característica | Capa Gratuita (Free / Open Source) | Capa de Pago (Pro / Premium) | Estado |
| :--- | :---: | :---: | :---: |
| **Temporizador Pomodoro Clásico** | ✅ Incluido (25m / 5m / 15m) | ✅ Incluido | 🟢 Completado (v0.1.0) |
| **Panel Lateral Dedicado (Sidebar)** | ✅ Escenario pixel art con controles | ✅ Escenario pixel art con controles | 🟢 Completado (v0.1.0) |
| **Panel Inferior Horizontal (Bottom Panel)** | ✅ Avatar recorre toda la barra (100% ancho) | ✅ Vista panorámica ampliada | 🟢 Completado (v0.1.0) |
| **Escenario Libre Sin Jaula (Seamless)** | ✅ Integrado transparente sin caja/marco | ✅ Fondos de escenario temáticos | 🟢 Completado (v0.1.0) |
| **Fondos Temáticos de Escenario (Pixel Art)** | ✅ 5 fondos: Invierno, Bosque, Cyberpunk, Lo-Fi, Minimal con partículas de clima | ✅ Fondos temáticos animados ampliados | 🟢 Completado (v0.1.0) |
| **Físicas de Caminata & Orientación** | ✅ Camina y patrulla el suelo de lado a lado | ✅ Bailes y trucos ampliados | 🟢 Completado (v0.1.0) |
| **Llamar al Avatar con un Clic** | ✅ Camina hacia donde hagas clic en el suelo | ✅ Interacciones avanzadas | 🟢 Completado (v0.1.0) |
| **Sillita de Descanso Retro** | ✅ Sillita pixel art para descansos | ✅ Sillitas/muebles temáticos | 🟢 Completado (v0.1.0) |
| **Interacción Tamagotchi (Petting)** | ✅ Clic para salto acrobático + estrellas | ✅ Más caricias e interacciones | 🟢 Completado (v0.1.0) |
| **Contador en Barra de Estado** | ✅ `🍅 24:50 [1/4]` interactivo | ✅ Interactivo con personalizaciones | 🟢 Completado (v0.1.0) |
| **Animación de Baile en Descansos** | ✅ Baile retro festivo (disco/confeti) | ✅ Bailes exclusivos por personaje | 🟢 Completado (v0.1.0) |
| **Celebración Fin de Ciclo (4/4)** | ✅ Trofeo dorado y fanfarria triunfal | ✅ Animaciones de victoria pro | 🟢 Completado (v0.1.0) |
| **Efectos de Sonido 8-bit** | ✅ Sintetizador Web Audio retro básico | ✅ Múltiples Sound Packs (Lo-Fi, Synthwave) | 🟢 Completado (v0.1.0) |
| **Reacción Básica a Errores / Linter** | ✅ Avatar preocupado ante líneas rojas | ✅ Reacciones personalizadas / Modos | 🟢 Completado (v0.1.0) |
| **Reacción al Guardar Código (Cmd+S)** | ✅ Gesto rápido de pulgar arriba 👍 | ✅ Animación especial configurable | 🟢 Completado (v0.1.0) |
| **Catálogo Base de Avatares** | ✅ 3 personajes (NekoDev, CodeMage, Robot) | ✅ Todos los base + catálogo VIP | 🟢 Completado (v0.1.0) |
| **Mascota Flotante de Escritorio (Desktop Overlay)** | ❌ No disponible | 💎 **Exclusivo Pro** (Camina físicamente sobre el código) | ⚪ Planificado (Fase 4) |
| **Subida de Avatar Propio** | ❌ No disponible | 💎 **Exclusivo Pro** (GIF/PNG o Spritesheet) | ⚪ Planificado (Fase 4) |
| **Personalidades Roast / Sarcástico** | ❌ No disponible | 💎 **Exclusivo Pro** (Frases picantes ante bugs) | ⚪ Planificado (Fase 4) |
| **Modo Extintor / Pánico en Errores** | ❌ No disponible | 💎 **Exclusivo Pro** (Apaga fuegos en pantalla) | ⚪ Planificado (Fase 4) |
| **Integración Git & Unit Tests** | ❌ No disponible | 💎 **Exclusivo Pro** (Fiesta en push / tests pass) | ⚪ Planificado (Fase 4) |
| **Modos de Vista Avanzados** | ❌ Barra lateral y panel inferior | 💎 **Exclusivo Pro** (Pestaña dedicada / Flotante) | ⚪ Planificado (Fase 4) |
| **Estadísticas de Productividad** | ❌ Contador de sesión actual | 💎 **Exclusivo Pro** (Historial diario/semanal) | ⚪ Planificado (Fase 4) |

---

## 🟢 Capa Gratuita (Detalle de Funcionalidades)

1. **Temporizador Pomodoro Completo:**
   - Modo Trabajo (Focus).
   - Descanso Corto (Short Break).
   - Descanso Largo (Long Break).
   - Contador de ciclos y rondas.
   - Acciones: Iniciar, Pausar, Reiniciar, Saltar al siguiente intervalo.

2. **Mini-Escenario Pixel Art:**
   - Panel nativo integrado en el Activity Bar de Visual Studio Code.
   - Gráficos renderizados en pixel art con escalado nítido (`pixelated`).
   - Bocadillos de diálogo con frases motivacionales dinámicas.

3. **Animación de Baile y Celebración:**
   - El avatar se activa automáticamente al entrar en tiempo de descanso.
   - Baile festivo con gafas de sol, destellos o confeti retro.

4. **Gancho Viral (Reacciones con el IDE en tiempo real):**
   - **Detección de errores:** Al aparecer errores de linter/sintaxis en el archivo activo, el avatar cambia a estado de alerta/mareo.
   - **Guardado de archivo:** Al guardar (`Cmd+S` / `Ctrl+S`), el avatar celebra brevemente con un pulgar arriba.

5. **Audio Sintetizado Retro 8-bit:**
   - Fanfarria de descanso y pitidos de inicio creados con Web Audio API (0 peso en MB, funciona sin conexión).

6. **Empaquetado `.vsix` Open Source:**
   - Descarga directa e instalación con 1 clic en Visual Studio Code.

---

## 💎 Capa de Pago (Pro / Premium)

1. **Custom Avatar Studio (Sube tu propio avatar):**
   - Carga cualquier imagen GIF animada o PNG desde tu computadora o URL.
   - Soporte para spritesheets personalizados de la comunidad.

2. **Personalidades Dinámicas ante Errores:**
   - **Modo Roast My Code:** Comentarios divertidos y sarcásticos ante errores.
   - **Modo Detective:** El avatar analiza el código con lupa.
   - **Modo Extintor:** Animación apagando fuegos en el escenario cuando hay errores críticos.

3. **Eventos Avanzados de Desarrollo:**
   - **Git Commit / Push:** Animación triunfal al hacer commit o push exitoso.
   - **Test Runner:** Animación festiva cuando todos los tests unitarios pasan verde.

4. **Sound Packs Temáticos & Personalizados:**
   - Packs de sonido Lo-Fi Chill, Arcade 16-bit, Cyberpunk o subida de tus propios archivos MP3/WAV.

5. **Visualización y Ubicación Flexible:**
   - Vista en pestaña completa de editor (ideal para segundo monitor o modo ambiente).
   - Modo barra de estado animado (mini avatar caminando en la barra inferior).

6. **Estadísticas y Métricas:**
   - Registro de pomodoros completados por día, semana y mes, con cálculo de tiempo enfocado.

7. **Sistema de Activación:**
   - Activación vía **License Key** mediante integración con LemonSqueezy o Gumroad.

---

## 🛡️ Matriz de Edge Cases Identificados y Mitigaciones

| Categoría | Edge Case / Situación Límite | Riesgo / Impacto | Estrategia de Mitigación |
| :--- | :--- | :--- | :--- |
| **Tiempo** | **MacBook / Laptop entra en modo reposo (Sleep):** El usuario baja la tapa con 20 min restantes y regresa 2 horas después. | `setInterval` se congela en Electron/macOS; al despertar el timer seguiría mostrando 20 min en vez de haber terminado. | Guardar timestamp objetivo (`endTime = Date.now() + remaining`) y comparar contra el reloj real del sistema al despertar. |
| **Tiempo** | **Reinicio o recarga del editor (`Cmd+R` / Reload Window):** Actualización de plugins o cierre de ventana. | El temporizador se reinicia a 25:00 perdiendo la ronda en curso. | Persistir el estado y la ronda en `context.globalState`. Al abrir, reanudar transparentemente. |
| **Tiempo** | **Múltiples ventanas de VS Code abiertas al mismo tiempo:** El usuario programa en 2 o 3 repositorios a la vez. | 3 timers desincronizados sonando al mismo tiempo en estéreo. | Usar `globalState` con listener de sincronización entre ventanas o designar una instancia maestra. |
| **IDE** | **Archivos gigantescos o autogenerados:** `bundle.js`, `package-lock.json`, minificados de 50k líneas. | Miles de advertencias de linter colapsan el avatar en pánico infinito. | Ignorar archivos dentro de `.gitignore`, `node_modules/`, `dist/` o archivos mayores a 500 KB. |
| **IDE** | **Escritura rápida (Tipeo continuo):** Sintaxis temporalmente rota mientras se cierra una llave `{}`. | El avatar parpadea histérico entre error y normal a cada pulsación. | Aplicar **Debounce** de 1 a 1.5 segundos tras la última pulsación antes de activar la reacción de error. |
| **Audio** | **Llamadas de Zoom/Meet o Modo Silencioso:** La alarma o música disco suena durante una reunión. | Momento incómodo o distracción auditiva. | Atajo de teclado rápido para silenciar (`Mute`), toggle visual claro y opción de alertas 100% silenciosas/visuales. |
| **Audio** | **Políticas de Autoplay de Audio en Electron:** El navegador bloquea sonido no solicitado. | El sonido no suena si el usuario no ha hecho clic dentro del webview. | Despertar el `AudioContext` en el primer clic o manejar alertas vía sistema de notificación nativo. |
| **UI** | **Pestaña de la barra lateral oculta o minimizada:** El usuario cambia a la pestaña del Explorador de archivos. | Chromium congela `requestAnimationFrame` para ahorrar batería. | El motor del tiempo reside en el proceso Node (`timerManager.ts`), no en el webview. El webview solo dibuja lo que el motor le dicte. |
| **UI** | **Temas claros y Alto Contraste:** Temas como Light+, Solarized Light o High Contrast. | Elementos oscuros no se leen o quedan invisibles. | Uso estricto de variables semánticas de VS Code (`var(--vscode-editor-background)`, etc.). |
| **Monetización** | **Trabajo Offline (Avión, viajes, sin WiFi):** El usuario Pro no tiene conexión a internet. | La validación de licencia falla y le bloquea sus avatares pagados. | Validación con firma criptográfica offline (JWT o clave firmada) con gracia de hasta 30 días sin revalidar. |
| **Monetización** | **Subida de Avatares Pro pesados o maliciosos:** El usuario sube un GIF de 100MB o un SVG con scripts XSS. | Bloqueo de memoria de VS Code o problemas de seguridad. | Estricta Content Security Policy (CSP), sanitización de SVG, límite de peso a 2MB y reescalado automático a 32x32 / 64x64. |
| **Open Source** | **Bypass de la clave en forks de GitHub:** Alguien descarga el código y cambia `isPro = true`. | Pérdida de ventas de usuarios técnicos curiosos. | Los assets VIP (spritesheets de avatares Pro) no se guardan en el repo público; se descargan vía API autenticada al activar la clave. |

---

*Última actualización: 2026-09-18 - Versión 0.1.0-alpha (Iniciando desarrollo del MVP).*

