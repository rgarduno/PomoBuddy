# 🍅 PomoPixel

> **Tu compañero de concentración en pixel art para Visual Studio Code y Antigravity.**  
> Temporizador Pomodoro con personajes animados en pixel art que te acompañan mientras programas, reaccionan a tus errores en tiempo real y **¡se ponen a bailar en tus descansos!** 🕺✨

---

## 🌟 Características Principales

* 🐱 **Compañeros en Pixel Art:** Elige entre **NekoDev** (Gatito dev), **CodeMage** (Mago 8-bit) o **PixelBot** (Robot).
* 💃 **Animaciones de Baile en Descansos:** Cuando suena la campana de descanso, tu avatar saca gafas de sol, activa las luces disco y baila con confeti para motivarte a despegarte de la pantalla.
* 😵‍💫 **Reacción a Errores en Vivo:** Si cometes un error de sintaxis o linter en tu archivo activo, tu avatar se preocupa o se marea. ¡Al arreglarlo, celebra el código limpio!
* 💾 **Reacción al Guardar (`Cmd+S`):** Gesto de aprobación inmediato cada vez que guardas tus cambios.
* 🔊 **Audio Sintetizado Retro 8-bit:** Fanfarrias de descanso y pitidos de arcade usando la Web Audio API nativa (sin archivos pesados, funciona sin internet).
* 🍅 **Temporizador Pomodoro Completo:** 
  * Tiempos de trabajo, descansos cortos y descansos largos.
  * Contador de rondas y ciclos.
  * Controles completos: Iniciar, Pausar, Reiniciar y Saltar.
* 📊 **Barra de Estado Discreta:** Indicador en tiempo real `🍅 24:59 (1/4)` en la barra inferior con acceso rápido a un clic.

---

## 📦 Instalación Rápida (Archivo `.vsix`)

Puedes empaquetar e instalar la extensión en tu entorno local en 1 minuto:

### 1. Compilar y empaquetar
```bash
# Instalar dependencias
npm install

# Compilar y generar el paquete .vsix
npm run package
```
Esto creará un archivo `pomopixel-0.1.0.vsix` en la raíz del proyecto.

### 2. Instalar en VS Code o Antigravity
* **Opción A (Desde el editor):**
  1. Abre la pestaña de **Extensiones** (`Cmd+Shift+X`).
  2. Haz clic en el menú de tres puntos (`...`) en la esquina superior de la pestaña.
  3. Selecciona **Install from VSIX...** y elige el archivo `pomopixel-0.1.0.vsix`.
* **Opción B (Desde la terminal):**
  ```bash
  code --install-extension pomopixel-0.1.0.vsix
  ```

---

## 🚀 Uso

1. Haz clic en el icono del **Tomatito Pixel** en la barra de actividad izquierda.
2. Selecciona tu avatar favorito (**Neko**, **Mago**, **Robot**).
3. Pulsa **Iniciar ▶** para comenzar tu sesión de enfoque.
4. ¡Cuando termine el bloque de trabajo, relájate y disfruta del baile de tu compañero!

---

## ⚙️ Configuración Personalizada

Puedes modificar la duración de los intervalos en tu `settings.json` o desde la configuración de VS Code / Antigravity:

```json
{
  "pomopixel.workDuration": 25,
  "pomopixel.shortBreakDuration": 5,
  "pomopixel.longBreakDuration": 15,
  "pomopixel.roundsBeforeLongBreak": 4,
  "pomopixel.soundEnabled": true,
  "pomopixel.avatar": "neko"
}
```

---

## 🗺️ Hoja de Ruta (Free vs. Pro)

Consulta nuestro documento [FEATURES.md](./FEATURES.md) para ver la matriz completa de características actuales y las funcionalidades premium planificadas (subida de avatar propio, modo roast sarcástico, packs de sonidos y estadísticas avanzadas).

---

## 🤝 Contribuir y Licencia

¡Las contribuciones son bienvenidas! Siéntete libre de abrir un *Issue* o enviar un *Pull Request* para proponer nuevos personajes en pixel art o mejoras en las animaciones.

Distribuido bajo la Licencia MIT. Consulta [LICENSE](./LICENSE) para más información.
