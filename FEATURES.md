# PomoBuddy - Registro y Matriz de Características (100% Free & Open Source)

Este documento es la **fuente de la verdad** del proyecto. PomoBuddy es una extensión **100% gratuita y de código abierto (Licencia MIT)** para toda la comunidad de desarrolladores, sin muros de pago ni suscripciones.

---

## 📊 Matriz General de Características

| Característica | Disponibilidad | Estado |
| :--- | :---: | :---: |
| **Temporizador Pomodoro Clásico** | ✅ 100% Incluido (25m / 5m / 15m) | 🟢 Completado (v0.1.0) |
| **Panel Lateral Dedicado (Sidebar)** | ✅ Escenario pixel art con controles | 🟢 Completado (v0.1.0) |
| **Panel Inferior Horizontal (Bottom Panel)** | ✅ Avatar recorre toda la barra (100% ancho) | 🟢 Completado (v0.1.0) |
| **Escenario Libre Sin Jaula (Seamless)** | ✅ Integrado transparente sin caja/marco | 🟢 Completado (v0.1.0) |
| **Fondos Temáticos de Escenario (Pixel Art)** | ✅ 5 fondos: Invierno, Bosque, Cyberpunk, Lo-Fi, Minimal con partículas de clima | 🟢 Completado (v0.1.0) |
| **Físicas de Caminata & Orientación** | ✅ Camina y patrulla el suelo de lado a lado | 🟢 Completado (v0.1.0) |
| **Llamar al Avatar con un Clic** | ✅ Camina hacia donde hagas clic en el suelo | 🟢 Completado (v0.1.0) |
| **Juguete Pelotita de Tenis Rebotable (🎾)** | ✅ Simulación de gravedad, fricción, patada y salto acrobático | 🟢 Completado (v0.1.0) |
| **Sillita de Descanso Retro** | ✅ Sillita pixel art para descansos | 🟢 Completado (v0.1.0) |
| **Interacción Tamagotchi (Petting)** | ✅ Clic para salto acrobático + estrellas | 🟢 Completado (v0.1.0) |
| **Contador y Avatar en Barra de Estado** | ✅ Emojis dinámicos (`🐱`, `🧙‍♂️`, `🤖`, `🦆`, `☕`, `🦝`, `🎨`) + reloj interactivo | 🟢 Completado (v0.1.0) |
| **Animación de Baile en Descansos** | ✅ Baile retro festivo (disco/confeti) | 🟢 Completado (v0.1.0) |
| **Celebración Fin de Ciclo (4/4)** | ✅ Trofeo dorado y fanfarria triunfal | 🟢 Completado (v0.1.0) |
| **Paquetes de Sonido 8-bit (Sound Packs)** | ✅ 3 packs: Arcade 16-bit 👾, Lo-Fi Chill ☕ y Synthwave/Cyberpunk 🌆 | 🟢 Completado (v0.1.0) |
| **Reacción Básica a Errores / Linter** | ✅ Avatar preocupado/mareado ante líneas rojas | 🟢 Completado (v0.1.0) |
| **Reacción al Guardar Código (Cmd+S)** | ✅ Gesto rápido de pulgar arriba 👍 con destellos | 🟢 Completado (v0.1.0) |
| **Catálogo Base de Avatares (6 personajes)** | ✅ NekoDev, CodeMage, Robot, Sir Ducky, CapyDev, Byte | 🟢 Completado (v0.1.0) |
| **Custom Avatar Studio (Sube tu propio avatar)** | ✅ Carga GIF animado o PNG desde disco local o URL (límite 2 MB) | 🟢 Completado (v0.1.0) |
| **Personalidades del Avatar ante Errores** | ✅ 4 modos: Roast My Code 🔥, Detective 🔍, Pánico con Extintor 🧯, Clásica 🐱 | 🟢 Completado (v0.1.0) |
| **Estadísticas de Productividad & Rachas** | ✅ Conteo diario, minutos Deep Work, racha consecutiva y gráfico 7 días | 🟢 Completado (v0.1.0) |
| **Motor de Tiempo Anti-Sleep Mode** | ✅ Deltas matemáticos contra reloj del sistema | 🟢 Completado (v0.1.0) |

---

## 🌟 Detalle de Funcionalidades Principales

### 1. Temporizador Pomodoro Completo & Presets Rápidos
- Modo Trabajo / Enfoque (Focus).
- Descanso Corto (Short Break).
- Descanso Largo (Long Break).
- Botones de cambio rápido de ciclo: `25 / 5m` (Clásico) y `50 / 10m` (Deep Work).
- Acciones de control: Iniciar, Pausar, Reiniciar, Saltar al siguiente intervalo.
- Notificación al terminar con opción de "+5 Minutos Descanso".

### 2. Custom Avatar Studio (Sube tu propio Avatar)
- **Carga Local Segura:** Selección nativa de archivos PNG o GIF animados vía el selector de archivos del sistema operativo.
- **Carga por URL:** Pega cualquier URL de imagen web directa.
- **Sanitización & Rendimiento:** Límite estricto de 2 MB para evitar desbordamiento de memoria, y redimensionamiento automático a escala retro con `imageSmoothingEnabled = false`.
- **Físicas Integradas:** El avatar personalizado camina por el suelo, persigue y patea la pelota de tenis 🎾, salta acrobáticamente y se sienta en la sillita durante los descansos.

### 3. Personalidades del Avatar ante Errores de Código
- **Modo Roast My Code (Sarcástico) 🔥:** Frases mordaces e hilarantes cuando el linter detecta errores, acompañado de calavera ardiente y llamas pixel art.
- **Modo Detective 🔍:** Lupa pixel art animada que escanea el código en busca de pistas con frases deductivas.
- **Modo Pánico con Extintor 🧯:** El avatar saca un extintor rojo, apaga fuegos en el suelo y rocía un chorro continuo de partículas de espuma física.
- **Modo Clásico 🐱:** Reacciones estándar y frases tiernas de cada uno de los 6 compañeros procedurales.

### 4. Sonidos Sintetizados Retro (Web Audio API)
- **Arcade 16-bit 👾:** Chiptune nostálgico con pitidos tipo GameBoy/NES.
- **Lo-Fi Chill ☕:** Armónicos suaves y relajantes con caída exponencial estilo cuenco tibetano.
- **Synthwave / Cyberpunk 🌆:** Tonos analógicos con modulación envolvente.
- **0 KB de archivos de audio:** Todo sintetizado en código, sin peticiones de red ni latencia.
- **Comando Mute Rápido:** `PomoBuddy: Silenciar / Activar Sonidos` (`pomobuddy.toggleMute`).

### 5. Tablero de Estadísticas y Racha de Productividad
- Contador de pomodoros completados en el día.
- Minutos acumulados de Deep Work.
- Medidor de racha de días continuos de concentración.
- Gráfico mini de barras de los últimos 7 días con botón de reinicio.
- Datos 100% locales en `globalState`.

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
| **Seguridad** | **Subida de Avatares pesados o corruptos:** El usuario intenta subir un GIF de 50MB o un archivo no gráfico. | Bloqueo de memoria de VS Code o congelamiento del webview. | Validación en host nativo con límite estricto de 2 MB (`stat.size`), diálogo filtrado y reescalado nítido con `imageSmoothingEnabled = false`. |
| **Resiliencia** | **Trabajo Offline (Avión, viajes, sin WiFi):** El usuario programa sin conexión a internet. | Fallo al cargar assets o sonidos. | Arquitectura 100% autónoma con síntesis Web Audio en tiempo real y almacenamiento local `globalState`. |

---

*Última actualización: Versión 0.1.0 (Lanzamiento 100% Open Source).*

