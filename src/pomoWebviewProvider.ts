import * as vscode from 'vscode';
import {
  AvatarId,
  BackgroundTheme,
  ExtensionToWebviewMessage,
  IdeReactionType,
  PomodoroConfig,
  ProductivityStats,
  SoundPack,
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
    private readonly timerManager: TimerManager,
    private readonly context: vscode.ExtensionContext
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

    webviewView.onDidChangeVisibility(async () => {
      if (webviewView.visible) {
        if (webviewView.viewType === PomoWebviewProvider.sidebarViewType) {
          const bottomView = Array.from(this.views).find(
            (v) => v.viewType === PomoWebviewProvider.bottomViewType && v.visible
          );
          if (bottomView) {
            await vscode.commands.executeCommand('workbench.action.closePanel');
          }
        } else if (webviewView.viewType === PomoWebviewProvider.bottomViewType) {
          const sidebarView = Array.from(this.views).find(
            (v) => v.viewType === PomoWebviewProvider.sidebarViewType && v.visible
          );
          if (sidebarView) {
            await vscode.commands.executeCommand('workbench.action.closeSidebar');
          }
        }
      }
    });

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview, webviewView.viewType);

    webviewView.webview.onDidReceiveMessage(async (message: WebviewToExtensionMessage) => {
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
        case 'CHANGE_BACKGROUND':
          this.handleBackgroundChange(message.payload);
          break;
        case 'CHANGE_SOUND_PACK':
          this.timerManager.setSoundPack(message.payload);
          break;
        case 'CHANGE_ERROR_PERSONALITY':
          this.timerManager.setErrorPersonality(message.payload);
          this.sendConfig(this.timerManager.getConfig());
          break;
        case 'PICK_CUSTOM_AVATAR':
          await this.handlePickCustomAvatar();
          break;
        case 'SET_CUSTOM_AVATAR_DATA':
          await this.handleSetCustomAvatarData(message.payload);
          break;
        case 'REMOVE_CUSTOM_AVATAR':
          await this.handleRemoveCustomAvatar();
          break;
        case 'TOGGLE_SOUND':
          this.handleSoundToggle(message.payload);
          break;
        case 'RESET_STATS':
          this.timerManager.resetStats();
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
          await vscode.commands.executeCommand('workbench.action.closeSidebar');
          await vscode.commands.executeCommand('pomobuddy.bottomView.focus');
          break;
        case 'OPEN_SIDEBAR':
          await vscode.commands.executeCommand('workbench.action.closePanel');
          await vscode.commands.executeCommand('pomobuddy.companionView.focus');
          break;
        case 'WEBVIEW_READY':
          this.postMessage({
            type: 'CONFIG_UPDATED',
            payload: this.timerManager.getConfig(),
          });
          const customData = this.context.globalState.get<string>('pomobuddy_custom_avatar');
          if (customData) {
            this.postMessage({
              type: 'CUSTOM_AVATAR_LOADED',
              payload: customData,
            });
          }
          this.postMessage({
            type: 'STATE_CHANGE',
            payload: this.timerManager.getSnapshot(),
          });
          this.postMessage({
            type: 'STATS_UPDATED',
            payload: this.timerManager.getStats(),
          });
          break;
      }
    });
  }

  public sendStats(stats: ProductivityStats) {
    this.postMessage({ type: 'STATS_UPDATED', payload: stats });
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
    this.sendStateChange(this.timerManager.getSnapshot());
  }

  private async handlePickCustomAvatar() {
    const uris = await vscode.window.showOpenDialog({
      canSelectMany: false,
      openLabel: 'Usar como Avatar',
      filters: {
        'Imágenes (PNG, GIF, JPG, WebP)': ['png', 'gif', 'jpg', 'jpeg', 'webp'],
      },
    });

    if (!uris || uris.length === 0) return;

    const fileUri = uris[0];
    try {
      const stat = await vscode.workspace.fs.stat(fileUri);
      // Límite de seguridad de 2 MB (2 * 1024 * 1024 bytes)
      if (stat.size > 2 * 1024 * 1024) {
        vscode.window.showErrorMessage(
          'PomoBuddy: La imagen seleccionada supera el límite máximo de 2 MB. Por favor elige una imagen más ligera.'
        );
        return;
      }

      const fileBytes = await vscode.workspace.fs.readFile(fileUri);
      const ext = fileUri.path.split('.').pop()?.toLowerCase() || 'png';
      const mime =
        ext === 'gif'
          ? 'image/gif'
          : ext === 'jpg' || ext === 'jpeg'
          ? 'image/jpeg'
          : ext === 'webp'
          ? 'image/webp'
          : 'image/png';
      const base64 = Buffer.from(fileBytes).toString('base64');
      const dataUri = `data:${mime};base64,${base64}`;

      await this.context.globalState.update('pomobuddy_custom_avatar', dataUri);
      this.handleAvatarChange('custom');
      this.postMessage({ type: 'CUSTOM_AVATAR_LOADED', payload: dataUri });
      vscode.window.showInformationMessage('PomoBuddy: ¡Avatar personalizado cargado con éxito! 🎨');
    } catch (err: any) {
      vscode.window.showErrorMessage(`PomoBuddy: Error al leer la imagen: ${err?.message || err}`);
    }
  }

  private async handleSetCustomAvatarData(dataOrUrl: string) {
    if (!dataOrUrl || typeof dataOrUrl !== 'string') return;
    const trimmed = dataOrUrl.trim();
    if (
      !trimmed.startsWith('data:image/') &&
      !trimmed.startsWith('https://') &&
      !trimmed.startsWith('http://')
    ) {
      vscode.window.showErrorMessage('PomoBuddy: Formato de imagen o URL no válido.');
      return;
    }

    await this.context.globalState.update('pomobuddy_custom_avatar', trimmed);
    this.handleAvatarChange('custom');
    this.postMessage({ type: 'CUSTOM_AVATAR_LOADED', payload: trimmed });
    vscode.window.showInformationMessage('PomoBuddy: ¡Avatar personalizado actualizado! 🎨');
  }

  private async handleRemoveCustomAvatar() {
    await this.context.globalState.update('pomobuddy_custom_avatar', undefined);
    this.handleAvatarChange('neko');
    this.postMessage({ type: 'CUSTOM_AVATAR_LOADED', payload: '' });
    vscode.window.showInformationMessage('PomoBuddy: Avatar personalizado eliminado. Regresando a NekoDev.');
  }

  private handleBackgroundChange(background: BackgroundTheme) {
    const config = vscode.workspace.getConfiguration('pomobuddy');
    config.update('background', background, vscode.ConfigurationTarget.Global);
    const updated = { ...this.timerManager.getConfig(), background };
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

  private getHtmlForWebview(webview: vscode.Webview, viewType?: string): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'main.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'media', 'style.css')
    );

    const nonce = getNonce();
    const viewMode = viewType === PomoWebviewProvider.bottomViewType ? 'bottom' : 'sidebar';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: data:;">
  <link rel="stylesheet" href="${styleUri}">
  <title>PomoBuddy Companion</title>
</head>
<body data-view="${viewMode}">
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
              <button class="avatar-btn" data-avatar="duck" title="Sir Ducky (Patito Rubber Duck Debugger)">
                <span class="avatar-emoji">🦆</span>
                <span class="avatar-name">Sir Ducky</span>
              </button>
              <button class="avatar-btn" data-avatar="capy" title="CapyDev (Capibara Zen anti-estrés)">
                <span class="avatar-emoji">☕</span>
                <span class="avatar-name">CapyDev</span>
              </button>
              <button class="avatar-btn" data-avatar="raccoon" title="Byte (Mapache Hacker astuto)">
                <span class="avatar-emoji">🦝</span>
                <span class="avatar-name">Byte</span>
              </button>
              <button class="avatar-btn" data-avatar="custom" title="Custom Avatar Studio (Carga tu propio PNG o GIF)">
                <span class="avatar-emoji">🎨</span>
                <span class="avatar-name">Custom</span>
              </button>
            </div>
          </div>

          <!-- Custom Avatar Studio -->
          <div class="settings-group custom-studio-card" id="customAvatarStudio">
            <div class="custom-studio-header">
              <span class="settings-label">🎨 CUSTOM AVATAR STUDIO</span>
              <span class="custom-studio-tag">Retro Scaler</span>
            </div>
            <div class="custom-studio-content">
              <div class="custom-preview-row">
                <div class="custom-preview-box" id="customAvatarPreview">
                  <span id="customPreviewPlaceholder">Sin avatar</span>
                </div>
                <div class="custom-buttons-col">
                  <button class="custom-action-btn primary" id="btnPickAvatarFile" title="Seleccionar archivo PNG o GIF (Máx 2 MB)">
                    📁 Cargar archivo (PNG/GIF)
                  </button>
                  <button class="custom-action-btn danger" id="btnRemoveCustomAvatar" title="Quitar avatar y volver a NekoDev">
                    🗑️ Quitar avatar
                  </button>
                </div>
              </div>
              <div class="custom-url-row">
                <input type="text" id="inputCustomAvatarUrl" class="custom-url-input" placeholder="https://.../avatar.png o GIF" />
                <button class="custom-action-btn secondary" id="btnApplyCustomUrl">Cargar URL</button>
              </div>
              <div class="custom-studio-note">
                Soporta PNG y GIF animado (máx. 2 MB). Se escala y procesa automáticamente con suavizado retro pixel art.
              </div>
            </div>
          </div>

          <!-- Personalidad ante Errores -->
          <div class="settings-group">
            <label class="settings-label">PERSONALIDAD ANTE ERRORES (LINTER/BUGS)</label>
            <div class="personality-selector">
              <button class="personality-btn active" data-personality="roast" title="Roast My Code: Comentarios sarcásticos y cómicos ante errores">
                <span class="personality-emoji">🔥</span>
                <span class="personality-name">Roast</span>
              </button>
              <button class="personality-btn" data-personality="detective" title="Detective: Inspección minuciosa con lupa pixel art y deducción">
                <span class="personality-emoji">🔍</span>
                <span class="personality-name">Detective</span>
              </button>
              <button class="personality-btn" data-personality="panic" title="Pánico: ¡Alarma de incendio! Extintor retro rociando espuma">
                <span class="personality-emoji">🧯</span>
                <span class="personality-name">Pánico</span>
              </button>
              <button class="personality-btn" data-personality="classic" title="Clásica: Diálogos originales del personaje">
                <span class="personality-emoji">🐱</span>
                <span class="personality-name">Clásica</span>
              </button>
            </div>
          </div>

          <div class="settings-group">
            <label class="settings-label">FONDO DE ESCENARIO</label>
            <div class="theme-selector">
              <button class="theme-btn active" data-theme="winter" title="Invierno nevado (Estilo vscode-pets)">
                <span class="theme-emoji">❄️</span>
                <span class="theme-name">Invierno</span>
              </button>
              <button class="theme-btn" data-theme="forest" title="Bosque verde natural">
                <span class="theme-emoji">🌲</span>
                <span class="theme-name">Bosque</span>
              </button>
              <button class="theme-btn" data-theme="cyberpunk" title="Ciudad nocturna cyberpunk neón">
                <span class="theme-emoji">🌆</span>
                <span class="theme-name">Cyberpunk</span>
              </button>
              <button class="theme-btn" data-theme="lofi" title="Habitación y café Lo-Fi">
                <span class="theme-emoji">☕</span>
                <span class="theme-name">Lo-Fi</span>
              </button>
              <button class="theme-btn" data-theme="minimal" title="Fondo transparente minimalista de VS Code">
                <span class="theme-emoji">⬛</span>
                <span class="theme-name">Minimal</span>
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

          <!-- Estadísticas & Racha Diaria -->
          <div class="settings-group stats-group">
            <div class="stats-header-row">
              <label class="settings-label">ESTADÍSTICAS &amp; RACHA DE ENFOQUE</label>
              <button class="stats-reset-btn" id="btnResetStats" title="Reiniciar historial">↺ Reset</button>
            </div>
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-value" id="statTodayCount">0</span>
                <span class="stat-label">🍅 Hoy</span>
              </div>
              <div class="stat-card">
                <span class="stat-value" id="statTodayTime">0m</span>
                <span class="stat-label">⏱️ Deep Work</span>
              </div>
              <div class="stat-card">
                <span class="stat-value" id="statStreak">0</span>
                <span class="stat-label">🔥 Racha</span>
              </div>
              <div class="stat-card">
                <span class="stat-value" id="statTotal">0</span>
                <span class="stat-label">🏆 Total</span>
              </div>
            </div>
            <div class="stats-chart-wrap">
              <span class="stats-chart-title">ÚLTIMOS 7 DÍAS</span>
              <div class="stats-bars" id="statsBars"></div>
            </div>
          </div>

          <!-- Paquete de Sonido -->
          <div class="settings-group">
            <label class="settings-label">PAQUETE DE SONIDO (AUDIO PACK)</label>
            <div class="sound-selector">
              <button class="sound-pack-btn active" data-sound="arcade" title="Arcade 16-bit: Clásicos pitidos retro y arpegios chiptune">
                <span class="sound-emoji">👾</span>
                <span class="sound-name">Arcade 16-bit</span>
              </button>
              <button class="sound-pack-btn" data-sound="zen" title="Lo-Fi Chill: Campana tibia armónica y acordes suaves estilo cuenco tibetano">
                <span class="sound-emoji">☕</span>
                <span class="sound-name">Lo-Fi Chill</span>
              </button>
              <button class="sound-pack-btn" data-sound="cyber" title="Synthwave / Cyberpunk: Sintetizador analógico con modulación FM">
                <span class="sound-emoji">🌆</span>
                <span class="sound-name">Cyberpunk</span>
              </button>
            </div>
          </div>

          <div class="settings-group settings-row-group">
            <label class="toggle-container" title="Activar/desactivar sintetizador retro">
              <input type="checkbox" id="soundToggle" checked>
              <span class="toggle-label">🔊 Sonido activado</span>
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
