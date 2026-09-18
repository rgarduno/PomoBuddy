import * as vscode from 'vscode';
import { TimerManager } from './timerManager';
import { StatusBarManager } from './statusBarManager';
import { IdeEventsListener } from './ideEvents';
import { PomoWebviewProvider } from './pomoWebviewProvider';
import { AvatarId, PomodoroConfig } from './types';

export function activate(context: vscode.ExtensionContext) {
  const config = getExtensionConfig();
  const timerManager = new TimerManager(config, context.globalState);
  const statusBarManager = new StatusBarManager();
  const ideEventsListener = new IdeEventsListener();
  const webviewProvider = new PomoWebviewProvider(context.extensionUri, timerManager);

  // Registrar Webview Provider para la barra lateral y el panel inferior
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PomoWebviewProvider.sidebarViewType,
      webviewProvider
    ),
    vscode.window.registerWebviewViewProvider(
      PomoWebviewProvider.bottomViewType,
      webviewProvider
    )
  );

  // Conectar eventos del temporizador con la barra de estado y el webview
  timerManager.onTick = (snapshot) => {
    statusBarManager.update(snapshot);
    webviewProvider.sendTick(snapshot);
  };

  timerManager.onStateChange = (snapshot) => {
    statusBarManager.update(snapshot);
    webviewProvider.sendStateChange(snapshot);
  };

  timerManager.onRoundFinished = (mode, round) => {
    webviewProvider.sendRoundFinished(mode, round);
  };

  timerManager.onCycleCompleted = (totalRounds) => {
    webviewProvider.sendCycleCompleted(totalRounds);
  };

  // Conectar reacciones del editor (linter/guardado) con el webview
  ideEventsListener.onReaction = (reaction, message) => {
    webviewProvider.sendIdeReaction(reaction, message);
  };

  // Registrar comandos de la paleta y atajos
  context.subscriptions.push(
    vscode.commands.registerCommand('pomobuddy.start', () => {
      timerManager.start();
    }),
    vscode.commands.registerCommand('pomobuddy.pause', () => {
      timerManager.pause();
    }),
    vscode.commands.registerCommand('pomobuddy.reset', () => {
      timerManager.reset();
    }),
    vscode.commands.registerCommand('pomobuddy.skip', () => {
      timerManager.skip();
    }),
    vscode.commands.registerCommand('pomobuddy.toggleMute', () => {
      const wsConfig = vscode.workspace.getConfiguration('pomobuddy');
      const current = wsConfig.get<boolean>('soundEnabled', true);
      const updated = !current;
      wsConfig.update('soundEnabled', updated, vscode.ConfigurationTarget.Global);
      const newConfig = { ...timerManager.getConfig(), soundEnabled: updated };
      timerManager.updateConfig(newConfig);
      webviewProvider.sendConfig(newConfig);
      const msg = updated ? '🔊 PomoBuddy: Sonidos activados' : '🔇 PomoBuddy: Modo silencioso activado';
      vscode.window.setStatusBarMessage(msg, 3000);
    }),
    vscode.commands.registerCommand('pomobuddy.openCompanion', () => {
      vscode.commands.executeCommand('pomobuddy.companionView.focus');
    })
  );

  // Escuchar cambios en la configuración del usuario
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('pomobuddy')) {
        const updatedConfig = getExtensionConfig();
        timerManager.updateConfig(updatedConfig);
        webviewProvider.sendConfig(updatedConfig);
      }
    })
  );

  // Registrar elementos descartables
  context.subscriptions.push(timerManager, statusBarManager, ideEventsListener);

  // Actualizar estado inicial en la barra
  statusBarManager.update(timerManager.getSnapshot());
}

function getExtensionConfig(): PomodoroConfig {
  const wsConfig = vscode.workspace.getConfiguration('pomobuddy');
  return {
    workDuration: wsConfig.get<number>('workDuration', 25),
    shortBreakDuration: wsConfig.get<number>('shortBreakDuration', 5),
    longBreakDuration: wsConfig.get<number>('longBreakDuration', 15),
    roundsBeforeLongBreak: wsConfig.get<number>('roundsBeforeLongBreak', 4),
    soundEnabled: wsConfig.get<boolean>('soundEnabled', true),
    avatar: wsConfig.get<AvatarId>('avatar', 'neko'),
  };
}

export function deactivate() {}
