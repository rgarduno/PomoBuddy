import * as vscode from 'vscode';
import { TimerSnapshot } from './types';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'pomobuddy.openCompanion';
    this.statusBarItem.tooltip = 'PomoBuddy: Haz clic para abrir tu compañero en la barra lateral';
    this.renderDefault();
    this.statusBarItem.show();
  }

  public update(snapshot: TimerSnapshot) {
    const minutes = Math.floor(snapshot.remainingSeconds / 60);
    const seconds = snapshot.remainingSeconds % 60;
    const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;

    if (snapshot.status === 'IDLE') {
      const modeLabel = snapshot.mode === 'WORK' ? 'Pomodoro' : 'Descanso';
      this.statusBarItem.text = `$(watch) PomoBuddy: ${modeLabel} listo (${timeFormatted})`;
      this.statusBarItem.tooltip = `PomoBuddy [Inactivo] - Ronda ${snapshot.currentRound}/${snapshot.totalRounds}. Clic para abrir.`;
      return;
    }

    if (snapshot.status === 'PAUSED') {
      this.statusBarItem.text = `$(debug-pause) ${timeFormatted} [Pausado]`;
      this.statusBarItem.tooltip = `PomoBuddy en pausa. Clic para abrir el panel y reanudar.`;
      return;
    }

    if (snapshot.mode === 'WORK') {
      this.statusBarItem.text = `$(flame) ${timeFormatted} (${snapshot.currentRound}/${snapshot.totalRounds})`;
      this.statusBarItem.tooltip = `PomoBuddy: Modo Enfoque - Ronda ${snapshot.currentRound}/${snapshot.totalRounds}. Clic para abrir el panel.`;
    } else {
      const icon = snapshot.mode === 'LONG_BREAK' ? '$(star-full)' : '$(coffee)';
      const label = snapshot.mode === 'LONG_BREAK' ? 'Descanso Largo 🌟' : 'Descanso 🕺';
      this.statusBarItem.text = `${icon} ${timeFormatted} [${label}]`;
      this.statusBarItem.tooltip = `PomoBuddy: ¡Tiempo de descansar y despejarse! Clic para ver a tu avatar bailar.`;
    }
  }

  private renderDefault() {
    this.statusBarItem.text = '$(watch) PomoBuddy';
  }

  public dispose() {
    this.statusBarItem.dispose();
  }
}
