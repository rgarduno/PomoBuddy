<p align="center">
  <img src="media/banner.png" alt="PomoBuddy: Pixel Art Pomodoro & Companions for VS Code" width="100%" />
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/"><img src="https://img.shields.io/badge/VS%20Code-%5E1.85.0-007ACC.svg?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="VS Code Version" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.3.3-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://github.com/rgarduno/PomoBuddy/releases"><img src="https://img.shields.io/badge/version-0.1.0-2ecc71.svg?style=for-the-badge" alt="Version 0.1.0" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-f1c40f.svg?style=for-the-badge" alt="License MIT" /></a>
  <a href="https://github.com/rgarduno/PomoBuddy/pulls"><img src="https://img.shields.io/badge/PRs-welcome-blueviolet.svg?style=for-the-badge" alt="PRs Welcome" /></a>
  <a href="https://github.com/rgarduno/PomoBuddy"><img src="https://img.shields.io/badge/tests-22%20passed-brightgreen.svg?style=for-the-badge&logo=jest&logoColor=white" alt="Tests" /></a>
  <a href="https://github.com/rgarduno/PomoBuddy"><img src="https://img.shields.io/badge/size-%3C60KB-success.svg?style=for-the-badge" alt="Package Size" /></a>
</p>

<h1 align="center">🍅 PomoBuddy</h1>

<p align="center">
  <b>Tu compañero de productividad y concentración en pixel art para Visual Studio Code.</b><br>
  Temporizador Pomodoro interactivo con físicas en tiempo real, compañeros con personalidad propia, escenarios temáticos con clima procedural, animaciones festivas en descansos y reacciones a diagnósticos de tu código.
</p>

---

## 🌟 ¿Qué es PomoBuddy?

**PomoBuddy** transforma la técnica Pomodoro tradicional en una experiencia viva, entretenida y visualmente gratificante dentro de tu editor de código. 

En lugar de simples números estáticos en una pestaña o alarmas invasivas, PomoBuddy te brinda **compañeros dev animados en pixel art** que caminan libremente por tu entorno de trabajo, juegan contigo con físicas interactivas, reaccionan cuando tienes errores de sintaxis en el archivo activo y celebran cada ciclo de concentración completado.

---

## 🐾 Catálogo de Compañeros Dev (6 Avatares)

Elige a tu compañero favorito desde el menú de **`⚙️ Ajustes`**. Cada uno cuenta con diseño procedural único, animaciones de pasos, físicas de salto y diálogos contextuales:

| Compañero | Rol Dev | Visual & Animación | Cita Representativa |
| :--- | :---: | :--- | :--- |
| **NekoDev** 🐱 | *El Gatito Programador* | Pelaje anaranjado, bufanda roja, orejitas expresivas y colita rítmica que se mece al andar o descansar. | *"¡Miau! Menos scrolling, más coding. 🐾"* |
| **CodeMage** 🧙‍♂️ | *El Archimago del Código* | Túnica azul medianoche, sombrero cónico puntiagudo, barba blanca y báculo arcano con gema brillante. | *"¡Por las barbas de Merlín! ¡Levitación arcana activada! 🔮"* |
| **PixelBot** 🤖 | *La IA Retro de Terminal* | Chasis metálico, antena con indicador RGB, visor cibernético verde neón y brazos articulados. | *"COMPILACIÓN_EXITOSA: Nivel de dopamina al 100% ⚡"* |
| **Sir Ducky** 🦆 | *Rubber Duck Debugger* | Plumaje amarillo, pico anaranjado, **sombrero de copa negro**, gafas oscuras y moño de gala. Bamboleo simpático al andar. | *"¡QUACK! Cuéntame tu bug línea por línea y lo resolvemos. 🦆✨"* |
| **CapyDev** ☕ | *Capibara Zen Anti-Burnout* | Marrón cálido, ojos relajados entrecerrados, **naranjita con hoja verde en la cabeza** (*onsen style*) y taza de café. | *"Ok I pull up... Respira hondo. Todo se compila a su tiempo. ☕"* |
| **Byte** 🦝 | *El Mapache Hacker* | Pelaje gris, **antifaz negro de bandido**, sudadera con capucha cian, cola rayada y **rebanada de pizza** 🍕 en descansos. | *"¡Salto ninja por más snacks de medianoche! Hacking the mainframe... 🦝"* |

---

## 🌄 5 Escenarios Temáticos con Clima Animado

Personaliza el mundo donde habita tu compañero con iluminación y partículas climáticas dinámicas:

* ❄️ **Invierno Nevado (Winter):** Cielos nocturnos estrellados, montañas púrpuras con cumbres blancas, pinos nevados y una ventisca suave de copos de nieve flotantes.
* 🌲 **Bosque Mágico (Forest):** Colinas en verde esmeralda bajo la luz de la luna, frondosos robles y enjambres de luciérnagas doradas titilantes.
* 🌆 **Cyberpunk Synthwave:** Skyline de rascacielos con antenas parpadeantes, asfalto mojado con reflejos de luz y lluvia digital diagonal.
* ☕ **Café Lo-Fi:** Vista cálida al atardecer por la ventana, guirnalda de luces colgantes, librería con suculentas y motas de polvo dorado suspendidas en la luz.
* ⬛ **Minimalista Zen:** Escenario 100% transparente integrado de forma nativa con cualquier tema claro o de alto contraste de VS Code.

---

## 🚀 Características Principales de UX e Ingeniería

### 1. 🎾 Juguete Interactivo con Físicas Reales
Haz clic en el botón **`🎾`** del HUD o pulsa en cualquier lugar del suelo para lanzar una pelotita de tenis pixel art con simulación de **gravedad, fricción y rebote**. Tu compañero correrá emocionado hacia ella, **la pateará en el aire, dará un salto acrobático y celebrará**.

### 2. 🖥️ Experiencia Dual Inteligente (Barra Lateral + Panel Inferior)
* **Barra Lateral (Sidebar):** Vista compacta para acompañarte discretamente mientras programas.
* **Barra Inferior Panorámica (Bottom Panel):** Ubicado junto a la Terminal/Output, tu compañero recorre **el 100% del ancho de tu monitor** en un escenario extendido.
* **Alternancia en 1 Clic:** Cambia de barra con un botón en Ajustes y PomoBuddy cerrará automáticamente el panel anterior para evitar duplicaciones.

### 3. ⏱️ Minimal Frosted HUD Flotante
Una barra superior en cristal translúcido (*frosted glass* con `backdrop-filter: blur(10px)`) que flota sobre el escenario sin recortes ni colisiones:
`[ 🍅 ENFOQUE 24:50  1/4 ] [ ▶ Iniciar ] [ ↺ ] [ ⏭ ] [ 🎾 ] [ ⚙️ ]`

### 4. 😵‍💫 Reacción a Diagnósticos del Editor en Tiempo Real
Conectado a la API de diagnósticos (`vscode.languages.onDidChangeDiagnostics`):
* Si introduces errores de sintaxis o linter en tu archivo activo, tu compañero se preocupa o se marea.
* Al solucionar los problemas o guardar con éxito (`Cmd+S` / `Ctrl+S`), celebra con estrellas y un pulgar arriba.

### 5. 🔊 Audio Sintetizado Retro 8-bit
Generado en tiempo real con la **Web Audio API nativa**:
* **0 KB de archivos de audio pesados** (cero dependencias MP3 o WAV externas).
* Totalmente libre de latencia y conmutador rápido de silencio (`pomobuddy.toggleMute`) para llamadas de Zoom/Meet.

### 6. 🛡️ Motor de Tiempo Blindado contra Modo Reposo (*Sleep Mode*)
A diferencia de temporizadores basados en simples contadores `setInterval`, PomoBuddy calcula cada segundo evaluando **deltas contra marcas de tiempo del sistema** (`targetEndTime = Date.now() + delta`). Si cierras la tapa de tu laptop o entra en suspensión, el tiempo se sincroniza con exactitud matemática al despertar.

---

## 🏛️ Arquitectura Técnica

```
┌────────────────────────────────────────────────────────┐
│             VS Code Extension Host (Node.js)           │
│                                                        │
│   extension.ts ──► timerManager.ts (Delta Clock)       │
│        ▲                   │                           │
│        │                   ▼                           │
│   ideEvents.ts     pomoWebviewProvider.ts              │
│  (Diagnostics/IO)          │                           │
└────────────────────────────┼───────────────────────────┘
                             ▼ Typed PostMessage Protocol
┌────────────────────────────────────────────────────────┐
│             Webview Context (HTML5 / Canvas 2D)        │
│                                                        │
│   • Procedural Pixel Renderer (60 FPS Game Loop)       │
│   • Physics Engine (Gravity, Bounces, Collision)       │
│   • Weather Particle System (Snow, Fireflies, Rain)    │
│   • Web Audio API Synthesizer (Oscillators/Filters)    │
│   • Frosted Glass Responsive HUD                       │
└────────────────────────────────────────────────────────┘
```

* **Lenguaje:** TypeScript 5.3+ estricto, compilado con `esbuild` ultra-rápido.
* **Peso Total del Paquete:** Menor a **60 KB** (arquitectura ultra-liviana sin dependencias en runtime).
* **Persistencia:** Almacenamiento seguro mediante `vscode.Memento` (`globalState`).

---

## 📦 Instalación y Uso

### Desde archivo VSIX

1. Descarga el archivo de lanzamiento [`pomobuddy-0.1.0.vsix`](https://github.com/rgarduno/PomoBuddy/releases).
2. En VS Code, abre la paleta de comandos (`Cmd+Shift+P` en Mac / `Ctrl+Shift+P` en Windows/Linux).
3. Escribe y selecciona: **`Extensions: Install from VSIX...`**
4. Elige el archivo `pomobuddy-0.1.0.vsix`.
5. ¡Listo! Haz clic en el ícono del tomatito 🍅 en la barra de actividad izquierda o en la pestaña inferior.

### Desarrollo y Compilación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/rgarduno/PomoBuddy.git
cd PomoBuddy

# 2. Instalar dependencias de compilación
npm install

# 3. Compilar TypeScript
npm run compile

# 4. Ejecutar la suite de pruebas unitarias (Jest)
npm test

# 5. Generar reporte de cobertura de código
npm run test:coverage

# 6. Generar paquete instalable .vsix
npm run package
```

---

## ⚙️ Configuración Personalizada

Puedes ajustar tus preferencias desde el modal `⚙️ Ajustes` en la extensión o directamente en tu `settings.json`:

```json
{
  "pomobuddy.workDuration": 25,
  "pomobuddy.shortBreakDuration": 5,
  "pomobuddy.longBreakDuration": 15,
  "pomobuddy.roundsBeforeLongBreak": 4,
  "pomobuddy.soundEnabled": true,
  "pomobuddy.avatar": "duck",
  "pomobuddy.background": "winter"
}
```

---

## ⌨️ Comandos Disponibles

| Comando | ID de Comando | Descripción |
| :--- | :--- | :--- |
| **Iniciar Temporizador** | `pomobuddy.start` | Comienza o reanuda la cuenta regresiva |
| **Pausar Temporizador** | `pomobuddy.pause` | Pausa el tiempo activo |
| **Reiniciar Intervalo** | `pomobuddy.reset` | Reinicia la ronda actual |
| **Saltar Intervalo** | `pomobuddy.skip` | Avanza de inmediato al siguiente bloque |
| **Silenciar / Activar Sonido** | `pomobuddy.toggleMute` | Alterna los efectos de audio retro |
| **Abrir en Barra Lateral** | `pomobuddy.openCompanion` | Abre la vista en el panel izquierdo |
| **Abrir en Barra Inferior** | `pomobuddy.openBottomPanel` | Abre la vista panorámica inferior |

---

## 🤝 Contribuciones

Las contribuciones, sugerencias y pull requests son bienvenidas. Si tienes ideas para nuevos avatares en pixel art, fondos de escenario o efectos de sonido, ¡no dudes en abrir un Issue o Pull Request!

1. Haz un Fork del proyecto.
2. Crea tu rama de características (`git checkout -b feature/NuevoAvatar`).
3. Haz Commit de tus cambios (`git commit -m 'feat: agregar nuevo avatar'`).
4. Haz Push a la rama (`git push origin feature/NuevoAvatar`).
5. Abre un Pull Request.

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

**Desarrollado con dedicación por [Rafael Alejandro](https://github.com/rgarduno)** 🚀
