import * as vscode from 'vscode';
import {
  AvatarId,
  ExtensionToWebviewMessage,
  IdeReactionType,
  PomodoroConfig,
  TimerMode,
  TimerSnapshot,
  WebviewToExtensionMessage,
} from './types';
import { TimerManager } from './timerManager';

export class PomoWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly sidebarViewType = 'pomobuddy.companionView';
  public static readonly bottomViewType = 'pomobuddy.bottomView';
  private views: Set<vscode.WebviewView> = new Set();

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly timerManager: TimerManager
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.views.add(webviewView);
    webviewView.onDidDispose(() => {
      this.views.delete(webviewView);
    });

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message: WebviewToExtensionMessage) => {
      switch (message.type) {
        case 'START':
          this.timerManager.start();
          break;
        case 'PAUSE':
          this.timerManager.pause();
          break;
        case 'RESET':
          this.timerManager.reset();
          break;
        case 'SKIP':
          this.timerManager.skip();
          break;
        case 'CHANGE_AVATAR':
          this.handleAvatarChange(message.payload);
          break;
        case 'TOGGLE_SOUND':
          this.handleSoundToggle(message.payload);
          break;
        case 'SET_PRESET':
          this.timerManager.setPreset(
            message.payload.workDuration,
            message.payload.breakDuration
          );
          this.sendConfig(this.timerManager.getConfig());
          this.sendStateChange(this.timerManager.getSnapshot());
          break;
        case 'OPEN_BOTTOM_PANEL':
          vscode.commands.executeCommand('pomobuddy.bottomView.focus');
          break;
        case 'OPEN_SIDEBAR':
          vscode.commands.executeCommand('pomobuddy.companionView.focus');
          break;
        case 'WEBVIEW_READY':
          this.postMessage({
            type: 'CONFIG_UPDATED',
            payload: this.timerManager.getConfig(),
          });
          this.postMessage({
            type: 'STATE_CHANGE',
            payload: this.timerManager.getSnapshot(),
          });
          break;
      }
    });
  }

  public sendTick(snapshot: TimerSnapshot) {
    this.postMessage({ type: 'TICK', payload: snapshot });
  }

  public sendStateChange(snapshot: TimerSnapshot) {
    this.postMessage({ type: 'STATE_CHANGE', payload: snapshot });
  }

  public sendIdeReaction(reaction: IdeReactionType, message?: string) {
    this.postMessage({
      type: 'IDE_REACTION',
      payload: { reaction, message },
    });
  }

  public sendRoundFinished(mode: TimerMode, round: number) {
    this.postMessage({
      type: 'ROUND_FINISHED',
      payload: { mode, round },
    });
  }

  public sendCycleCompleted(totalRounds: number) {
    this.postMessage({
      type: 'CYCLE_COMPLETED',
      payload: { totalRounds },
    });
  }

  public sendConfig(config: PomodoroConfig) {
    this.postMessage({
      type: 'CONFIG_UPDATED',
      payload: config,
    });
  }

  private handleAvatarChange(avatar: AvatarId) {
    const config = vscode.workspace.getConfiguration('pomobuddy');
    config.update('avatar', avatar, vscode.ConfigurationTarget.Global);
    const updated = { ...this.timerManager.getConfig(), avatar };
    this.timerManager.updateConfig(updated);
    this.sendConfig(updated);
  }

  private handleSoundToggle(soundEnabled: boolean) {
    const config = vscode.workspace.getConfiguration('pomobuddy');
    config.update('soundEnabled', soundEnabled, vscode.ConfigurationTarget.Global);
    const updated = { ...this.timerManager.getConfig(), soundEnabled };
    this.timerManager.updateConfig(updated);
    this.sendConfig(updated);
  }

  private postMessage(message: ExtensionToWebviewMessage) {
    for (const view of this.views) {
      view.webview.postMessage(message);
    }
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'main.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'style.css')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: data:;">
  <link rel="stylesheet" href="${styleUri}">
  <title>PomoBuddy Companion</title>
</head>
<body>
  <div class="pomo-app">
    
    <!-- Minimal Frosted HUD Flotante (Limpio y Discreto) -->
    <header class="hud-bar">
      <div class="hud-pill timer-pill">
        <span class="hud-icon" id="modeIcon">🍅</span>
        <span class="hud-badge" id="modeBadge">POMODORO</span>
        <span class="hud-time" id="timerDisplay">25:00</span>
        <div class="hud-progress-wrap">
          <div class="hud-progress-bar" id="progressBar"></div>
        </div>
        <span class="hud-round" id="roundTracker"><span id="currentRound">1</span>/<span id="totalRounds">4</span></span>
      </div>

      <div class="hud-pill controls-pill">
        <button class="hud-btn hud-btn-main" id="btnStartPause" title="Iniciar o pausar">
          <span id="startPauseIcon">▶</span>
          <span id="startPauseLabel" class="hud-btn-text">Iniciar</span>
        </button>
        <button class="hud-btn" id="btnReset" title="Reiniciar ronda actual">
          <span>↺</span>
        </button>
        <button class="hud-btn" id="btnSkip" title="Saltar al siguiente intervalo">
          <span>⏭</span>
        </button>
      </div>

      <div class="hud-pill actions-pill">
        <button class="hud-btn hud-btn-icon" id="btnBall" title="Lanzar pelotita para jugar 🎾">
          <span>🎾</span>
        </button>
        <button class="hud-btn hud-btn-icon" id="btnSettings" title="Ajustes de Avatar y Pomodoro ⚙️">
          <span>⚙️</span>
        </button>
      </div>
    </header>

    <!-- Escenario Pixel Art (Toma el 100% del espacio visual disponible) -->
    <main class="stage-container" id="stage">
      <div class="speech-bubble" id="speechBubble">
        <span id="speechText">¡Hola! Listo para enfocarnos. 💻</span>
      </div>
      
      <!-- Efectos visuales de fondo (confeti / luces de baile) -->
      <div class="party-effects" id="partyEffects"></div>
      
      <div class="canvas-wrapper">
        <canvas id="pixelCanvas" width="320" height="160"></canvas>
      </div>

      <div class="stage-floor"></div>
    </main>

    <!-- Modal / Drawer de Ajustes Elegante -->
    <div class="settings-modal-backdrop" id="settingsBackdrop">
      <div class="settings-modal" id="settingsModal">
        <div class="settings-header">
          <span class="settings-title">⚙️ Ajustes de PomoBuddy</span>
          <button class="settings-close-btn" id="btnCloseSettings" title="Cerrar ajustes">✕</button>
        </div>

        <div class="settings-body">
          <div class="settings-group">
            <label class="settings-label">ELIGE TU COMPAÑERO</label>
            <div class="avatar-selector">
              <button class="avatar-btn active" data-avatar="neko" title="NekoDev (Gatito programador)">
                <span class="avatar-emoji">🐱</span>
                <span class="avatar-name">NekoDev</span>
              </button>
              <button class="avatar-btn" data-avatar="wizard" title="CodeMage (Mago 8-bit)">
                <span class="avatar-emoji">🧙‍♂️</span>
                <span class="avatar-name">CodeMage</span>
              </button>
              <button class="avatar-btn" data-avatar="robot" title="PixelBot (Robot inteligente)">
                <span class="avatar-emoji">🤖</span>
                <span class="avatar-name">PixelBot</span>
              </button>
            </div>
          </div>

          <div class="settings-group">
            <label class="settings-label">PRESETS DE TIEMPO</label>
            <div class="presets-row">
              <button class="preset-pill active" id="preset25" data-work="25" data-break="5">
                🍅 25 / 5m (Clásico)
              </button>
              <button class="preset-pill" id="preset50" data-work="50" data-break="10">
                🚀 50 / 10m (Deep Work)
              </button>
            </div>
          </div>

          <div class="settings-group settings-row-group">
            <label class="toggle-container" title="Activar/desactivar sintetizador retro">
              <input type="checkbox" id="soundToggle" checked>
              <span class="toggle-label">🔊 Efectos de sonido 8-bit</span>
            </label>
          </div>

          <div class="settings-group settings-row-group">
            <button class="btn-switch-mode" id="btnSwitchMode">
              🖥️ <span id="switchModeText">Cambiar a Barra Inferior</span>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
