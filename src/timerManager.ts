import * as vscode from 'vscode';
import { PomodoroConfig, TimerMode, TimerSnapshot, TimerStatus } from './types';

export class TimerManager {
  private config: PomodoroConfig;
  private mode: TimerMode = 'WORK';
  private status: TimerStatus = 'IDLE';
  private remainingSeconds: number;
  private targetEndTime: number | null = null;
  private currentRound: number = 1;
  private completedRounds: number = 0;
  private intervalTimer: NodeJS.Timeout | null = null;
  private globalState?: vscode.Memento;

  public onTick: ((snapshot: TimerSnapshot) => void) | null = null;
  public onStateChange: ((snapshot: TimerSnapshot) => void) | null = null;
  public onRoundFinished: ((mode: TimerMode, round: number) => void) | null = null;
  public onCycleCompleted: ((totalRounds: number) => void) | null = null;

  constructor(config: PomodoroConfig, globalState?: vscode.Memento) {
    this.config = config;
    this.globalState = globalState;
    this.remainingSeconds = this.config.workDuration * 60;
    this.restorePersistedState();
  }

  public setPreset(workDuration: number, breakDuration: number) {
    this.config.workDuration = workDuration;
    this.config.shortBreakDuration = breakDuration;

    // Actualizar configuración en VS Code
    const wsConfig = vscode.workspace.getConfiguration('pomobuddy');
    wsConfig.update('workDuration', workDuration, vscode.ConfigurationTarget.Global);
    wsConfig.update('shortBreakDuration', breakDuration, vscode.ConfigurationTarget.Global);

    if (this.status === 'IDLE') {
      this.remainingSeconds = this.getTotalSecondsForCurrentMode();
      this.notifyTick();
      this.notifyStateChange();
    } else if (this.status === 'RUNNING') {
      // Re-sincronizar tiempo restante con el nuevo preset
      this.remainingSeconds = Math.min(this.remainingSeconds, workDuration * 60);
      this.targetEndTime = Date.now() + this.remainingSeconds * 1000;
      this.persistState();
      this.notifyTick();
    }
  }

  private restorePersistedState() {
    if (!this.globalState) return;
    const saved = this.globalState.get<any>('pomobuddy_saved_state');
    if (saved) {
      this.mode = saved.mode || 'WORK';
      this.currentRound = saved.currentRound || 1;
      this.completedRounds = saved.completedRounds || 0;
      // Si estaba corriendo cuando se cerró el editor, calcular si ya expiró
      if (saved.status === 'RUNNING' && saved.targetEndTime) {
        const diffSecs = Math.round((saved.targetEndTime - Date.now()) / 1000);
        if (diffSecs > 0) {
          this.remainingSeconds = diffSecs;
          this.targetEndTime = saved.targetEndTime;
          this.status = 'PAUSED'; // Lo dejamos en pausa para que el usuario decida reanudarlo
        } else {
          // El tiempo expiró mientras el editor estaba cerrado
          this.status = 'IDLE';
          this.advanceToNextPhase();
          return;
        }
      } else {
        this.status = 'IDLE';
        this.remainingSeconds = this.getTotalSecondsForCurrentMode();
      }
    }
  }

  private persistState() {
    if (!this.globalState) return;
    this.globalState.update('pomobuddy_saved_state', {
      mode: this.mode,
      status: this.status,
      targetEndTime: this.targetEndTime,
      currentRound: this.currentRound,
      completedRounds: this.completedRounds,
      remainingSeconds: this.remainingSeconds,
    });
  }

  public updateConfig(newConfig: PomodoroConfig) {
    const prevConfig = this.config;
    this.config = newConfig;

    // Si está inactivo o en pausa al inicio, reajustar los segundos restantes
    if (this.status === 'IDLE') {
      this.remainingSeconds = this.getTotalSecondsForCurrentMode();
      this.notifyTick();
    } else if (prevConfig.workDuration !== newConfig.workDuration && this.mode === 'WORK') {
      // Ajuste proporcional o directo si el usuario cambia el tiempo mientras corre
      const diff = (newConfig.workDuration - prevConfig.workDuration) * 60;
      this.remainingSeconds = Math.max(1, this.remainingSeconds + diff);
      this.notifyTick();
    }
  }

  public getConfig(): PomodoroConfig {
    return this.config;
  }

  public getSnapshot(): TimerSnapshot {
    return {
      mode: this.mode,
      status: this.status,
      remainingSeconds: this.remainingSeconds,
      totalSeconds: this.getTotalSecondsForCurrentMode(),
      currentRound: this.currentRound,
      totalRounds: this.config.roundsBeforeLongBreak,
      completedRounds: this.completedRounds,
    };
  }

  public start() {
    if (this.status === 'RUNNING') {
      return;
    }

    if (this.status === 'IDLE' || this.remainingSeconds <= 0) {
      this.remainingSeconds = this.getTotalSecondsForCurrentMode();
    }

    this.status = 'RUNNING';
    this.targetEndTime = Date.now() + this.remainingSeconds * 1000;
    this.persistState();
    this.notifyStateChange();

    this.intervalTimer = setInterval(() => {
      this.tick();
    }, 1000);
  }

  public pause() {
    if (this.status !== 'RUNNING') {
      return;
    }

    this.clearTimer();
    this.status = 'PAUSED';
    this.targetEndTime = null;
    this.persistState();
    this.notifyStateChange();
  }

  public reset() {
    this.clearTimer();
    this.status = 'IDLE';
    this.mode = 'WORK';
    this.targetEndTime = null;
    this.remainingSeconds = this.getTotalSecondsForCurrentMode();
    this.persistState();
    this.notifyStateChange();
  }

  public skip() {
    this.advanceToNextPhase();
  }

  public addExtraMinutes(minutes: number) {
    this.remainingSeconds += minutes * 60;
    if (this.status === 'RUNNING') {
      this.targetEndTime = Date.now() + this.remainingSeconds * 1000;
    }
    this.persistState();
    this.notifyTick();
  }

  private tick() {
    if (this.targetEndTime) {
      // Cálculo preciso contra reloj real (a prueba de laptop en modo reposo)
      const diffSecs = Math.max(0, Math.round((this.targetEndTime - Date.now()) / 1000));
      this.remainingSeconds = diffSecs;
    } else if (this.remainingSeconds > 0) {
      this.remainingSeconds--;
    }

    this.notifyTick();

    if (this.remainingSeconds <= 0) {
      this.handlePhaseCompletion();
    }
  }

  private handlePhaseCompletion() {
    this.clearTimer();
    const completedMode = this.mode;
    const completedRound = this.currentRound;

    if (completedMode === 'WORK') {
      this.completedRounds++;
      // ¿Se completó el ciclo completo de 4 rondas?
      if (completedRound >= this.config.roundsBeforeLongBreak) {
        if (this.onCycleCompleted) {
          this.onCycleCompleted(this.config.roundsBeforeLongBreak);
        }
      }
    }

    if (this.onRoundFinished) {
      this.onRoundFinished(completedMode, completedRound);
    }

    this.showCompletionNotification(completedMode);
    this.advanceToNextPhase();
  }

  private advanceToNextPhase() {
    this.clearTimer();

    if (this.mode === 'WORK') {
      // ¿Toca descanso largo o corto?
      if (this.currentRound >= this.config.roundsBeforeLongBreak) {
        this.mode = 'LONG_BREAK';
      } else {
        this.mode = 'SHORT_BREAK';
      }
    } else {
      // Terminó un descanso (corto o largo)
      if (this.mode === 'LONG_BREAK') {
        this.currentRound = 1;
      } else {
        this.currentRound++;
      }
      this.mode = 'WORK';
    }

    this.status = 'IDLE';
    this.remainingSeconds = this.getTotalSecondsForCurrentMode();
    this.notifyStateChange();
  }

  private showCompletionNotification(completedMode: TimerMode) {
    if (completedMode === 'WORK') {
      const isLong = this.currentRound >= this.config.roundsBeforeLongBreak;
      const breakType = isLong ? 'Descanso Largo 🌟' : 'Descanso Corto ☕';
      vscode.window
        .showInformationMessage(
          `🍅 ¡Excelente trabajo! Ronda ${this.currentRound}/${this.config.roundsBeforeLongBreak} completada. ¡Hora de tu ${breakType}!`,
          'Iniciar Descanso 🕺',
          '+5 Minutos Trabajo'
        )
        .then((selection) => {
          if (selection === 'Iniciar Descanso 🕺') {
            this.start();
          } else if (selection === '+5 Minutos Trabajo') {
            this.mode = 'WORK';
            this.addExtraMinutes(5);
            this.start();
          }
        });
    } else {
      vscode.window
        .showInformationMessage(
          '⚡ ¡Descanso terminado! Es hora de volver a concentrarse.',
          'Iniciar Pomodoro 🍅',
          '+5 Minutos Descanso'
        )
        .then((selection) => {
          if (selection === 'Iniciar Pomodoro 🍅') {
            this.start();
          } else if (selection === '+5 Minutos Descanso') {
            this.mode = completedMode;
            this.addExtraMinutes(5);
            this.start();
          }
        });
    }
  }

  private getTotalSecondsForCurrentMode(): number {
    switch (this.mode) {
      case 'WORK':
        return this.config.workDuration * 60;
      case 'SHORT_BREAK':
        return this.config.shortBreakDuration * 60;
      case 'LONG_BREAK':
        return this.config.longBreakDuration * 60;
    }
  }

  private clearTimer() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  private notifyTick() {
    if (this.onTick) {
      this.onTick(this.getSnapshot());
    }
  }

  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.getSnapshot());
    }
  }

  public dispose() {
    this.clearTimer();
  }
}
