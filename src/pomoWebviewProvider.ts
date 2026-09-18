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
  public static readonly viewType = 'pomobuddy.companionView';
  private view?: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly timerManager: TimerManager
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.view = webviewView;

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
    if (this.view) {
      this.view.webview.postMessage(message);
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
  <title>PomoPixel Companion</title>
</head>
<body>
  <div class="pomo-container">
    
    <!-- Escenario Pixel Art -->
    <div class="stage-container" id="stage">
      <div class="speech-bubble" id="speechBubble">
        <span id="speechText">¡Hola! Listo para enfocarnos. 💻</span>
      </div>
      
      <!-- Efectos visuales de fondo (confeti / luces de baile) -->
      <div class="party-effects" id="partyEffects"></div>
      
      <div class="canvas-wrapper">
        <canvas id="pixelCanvas" width="160" height="160"></canvas>
      </div>

      <div class="stage-floor"></div>
    </div>

    <!-- Indicador de Estado y Tiempo -->
    <div class="timer-section">
      <div class="mode-badge" id="modeBadge">POMODORO</div>
      <div class="timer-display" id="timerDisplay">25:00</div>
      <div class="progress-bar-container">
        <div class="progress-bar" id="progressBar"></div>
      </div>
      <div class="round-tracker" id="roundTracker">
        Ronda <span id="currentRound">1</span> de <span id="totalRounds">4</span>
      </div>
      <!-- Presets Rápidos de Tiempo -->
      <div class="presets-row">
        <button class="preset-pill active" id="preset25" data-work="25" data-break="5" title="Pomodoro Clásico: 25m trabajo / 5m descanso">
          25 / 5m
        </button>
        <button class="preset-pill" id="preset50" data-work="50" data-break="10" title="Deep Work: 50m trabajo / 10m descanso">
          50 / 10m
        </button>
      </div>
    </div>

    <!-- Controles Principales -->
    <div class="controls-row">
      <button class="btn btn-primary" id="btnStartPause" title="Iniciar o pausar">
        <span class="btn-icon" id="startPauseIcon">▶</span>
        <span id="startPauseLabel">Iniciar</span>
      </button>
      <button class="btn btn-secondary" id="btnReset" title="Reiniciar tiempo actual">
        <span class="btn-icon">↺</span>
      </button>
      <button class="btn btn-secondary" id="btnSkip" title="Saltar al siguiente intervalo">
        <span class="btn-icon">⏭</span>
      </button>
    </div>

    <!-- Selector de Avatar y Sonido -->
    <div class="customization-section">
      <div class="section-title">TU COMPAÑERO</div>
      <div class="avatar-selector">
        <button class="avatar-btn active" data-avatar="neko" title="NekoDev (Gatito)">
          🐱 <span>Neko</span>
        </button>
        <button class="avatar-btn" data-avatar="wizard" title="CodeMage (Mago 8-bit)">
          🧙‍♂️ <span>Mago</span>
        </button>
        <button class="avatar-btn" data-avatar="robot" title="PixelBot (Robot)">
          🤖 <span>Robot</span>
        </button>
      </div>
      
      <div class="audio-toggle-row">
        <label class="toggle-container" title="Activar/desactivar sonidos retro">
          <input type="checkbox" id="soundToggle" checked>
          <span class="toggle-label">🔊 Sonidos Retro 8-bit</span>
        </label>
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
