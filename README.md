# 🍅 PomoBuddy

> **Tu compañero de productividad y concentración en pixel art para Visual Studio Code.**  
> Temporizador Pomodoro interactivo con físicas en tiempo real, escenarios animados con clima procedural, animaciones festivas en descansos y reacciones a diagnósticos de tu código.

---

## 🌟 Características Principales

* 🐾 **Compañeros en Pixel Art con Personalidad:**  
  Elige entre **NekoDev** (Gatito desarrollador), **CodeMage** (Mago 8-bit) o **PixelBot** (Robot de alta eficiencia), cada uno con animaciones y banco de frases contextuales únicas.
* 🌄 **5 Escenarios Temáticos con Clima Animado:**
  * ❄️ **Invierno:** Montañas púrpuras, pinos nevados y ventisca suave de copos de nieve.
  * 🌲 **Bosque:** Colinas esmeralda, árboles frondosos y luciérnagas doradas titilantes.
  * 🌆 **Cyberpunk:** Skyline neón, lluvia digital diagonal y reflejos en asfalto húmedo.
  * ☕ **Café Lo-Fi:** Ventana al atardecer, guirnalda de luces, librería y motas de polvo dorado suspendidas en la luz.
  * ⬛ **Minimal:** Escenario transparente integrado limpiamente con tu tema activo de VS Code.
* 🎾 **Físicas Interactivas & Juego:**  
  Lanza una pelotita con gravedad y fricción (`🎾` o clic en el suelo). Tu avatar corre hacia ella, la patea en el aire, salta y celebra.
* 🖥️ **Diseño Dual Inteligente (Barra Lateral + Panel Inferior Panorámico):**  
  Disfruta de una vista compacta en la barra lateral o una experiencia panorámica en la barra inferior (junto a la Terminal) donde el compañero camina por todo el ancho de tu pantalla. Cambia entre ambos paneles con un solo clic y cierre automático del panel opuesto.
* ⏱️ **Minimal Frosted HUD Flotante:**  
  Barra superior en cristal translúcido (*frosted glass*) que nunca colisiona, adaptándose fluidamente a cualquier ancho de ventana.
* 😵‍💫 **Reacción a Diagnósticos en Tiempo Real:**  
  Si el linter o compilador detecta errores en tu archivo activo, tu avatar reacciona con preocupación. Al resolverlos o guardar (`Cmd+S` / `Ctrl+S`), celebra con un pulgar arriba.
* 🔊 **Audio Sintetizado Retro 8-bit:**  
  Efectos de sonido arcade generados proceduralmente con la Web Audio API nativa (**0 KB de archivos MP3/WAV externos**, 100% offline y sin latencia).
* 🛡️ **Motor de Tiempo Resiliente:**  
  Cálculo basado en deltas contra marcas de tiempo del reloj del sistema (`Date.now()`), garantizando precisión absoluta incluso cuando la laptop entra en modo reposo (*Sleep Mode*).

---

## 🏛️ Arquitectura y Stack Técnico

PomoBuddy fue diseñado siguiendo patrones de arquitectura limpia, desacoplamiento y mínimo consumo de recursos del sistema:

* **Lenguaje & Entorno:** TypeScript estricto, compilado con `esbuild` para tiempos de carga instantáneos.
* **Motor Gráfico (Frontend):** Canvas 2D nativo con escalado entero de píxeles (`image-rendering: pixelated`), bucle de animación a 60 FPS y renderizado procedural.
* **Comunicación Bi-direccional:** Protocolo de mensajería tipado entre la API de Extensiones de VS Code (Node.js runtime) y los contextos de Webview.
* **Persistencia:** Almacenamiento seguro de estado en `vscode.Memento` (`globalState`) y configuración workspace en `vscode.workspace.getConfiguration`.
* **Peso Total del Paquete:** Menor a **60 KB** (sin dependencias pesadas en tiempo de ejecución).

---

## 📦 Instalación y Desarrollo Local

### Prerrequisitos
* **Node.js** (v18 o superior)
* **VS Code** (v1.85.0 o superior)

### Compilación y Empaquetado
```bash
# 1. Clonar el repositorio
git clone https://github.com/rgarduno/PomoBuddy.git
cd PomoBuddy

# 2. Instalar dependencias de desarrollo
npm install

# 3. Compilar TypeScript y empaquetar en archivo .vsix
npm run package
```
Esto generará el instalable listo para producción: `pomobuddy-0.1.0.vsix`.

### Instalar la Extensión en VS Code
* **Desde la interfaz:**  
  Abre la pestaña de Extensiones (`Cmd+Shift+X` / `Ctrl+Shift+X`) -> Menú de tres puntos (`...`) -> **Install from VSIX...** -> Selecciona `pomobuddy-0.1.0.vsix`.
* **Desde la terminal:**
  ```bash
  code --install-extension pomobuddy-0.1.0.vsix
  ```

---

## ⚙️ Configuración Personalizada

Puedes personalizar PomoBuddy desde la interfaz de Ajustes (`⚙️`) o directamente en tu `settings.json`:

```json
{
  "pomobuddy.workDuration": 25,
  "pomobuddy.shortBreakDuration": 5,
  "pomobuddy.longBreakDuration": 15,
  "pomobuddy.roundsBeforeLongBreak": 4,
  "pomobuddy.soundEnabled": true,
  "pomobuddy.avatar": "neko",
  "pomobuddy.background": "winter"
}
```

---

## ⌨️ Atajos y Comandos Disponibles

| Comando | Acción |
| :--- | :--- |
| `pomobuddy.start` | Iniciar o reanudar el temporizador |
| `pomobuddy.pause` | Pausar la sesión activa |
| `pomobuddy.reset` | Reiniciar el intervalo actual |
| `pomobuddy.skip` | Saltar al siguiente bloque (Trabajo / Descanso) |
| `pomobuddy.toggleMute` | Silenciar o activar efectos de sonido retro |
| `pomobuddy.openCompanion` | Abrir y enfocar PomoBuddy en la barra lateral |
| `pomobuddy.openBottomPanel` | Abrir y enfocar PomoBuddy en la barra inferior |

---

## 🗺️ Hoja de Ruta (Roadmap)

Consulta [FEATURES.md](./FEATURES.md) para conocer el desglose detallado de características implementadas y la evolución hacia la capa premium (soporte para sprites personalizados, métricas avanzadas y modo overlay de escritorio).

---

## 🤝 Contribución y Licencia

¡Las contribuciones y sugerencias son bienvenidas! Siéntete libre de abrir un *Issue* o enviar un *Pull Request* para proponer nuevos personajes, accesorios o fondos.

Distribuido bajo la **Licencia MIT**. Consulta [LICENSE](./LICENSE) para más información.
