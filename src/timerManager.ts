import * as vscode from 'vscode';
import {
  AvatarId,
  ErrorPersonality,
  DayStat,
  IdeReactionType,
  PomodoroConfig,
  ProductivityStats,
  SoundPack,
  TimerMode,
  TimerSnapshot,
  TimerStatus,
  WeekStat,
} from './types';

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
  public onStatsUpdated: ((stats: ProductivityStats) => void) | null = null;

  constructor(config: PomodoroConfig, globalState?: vscode.Memento) {
    this.config = config;
    this.globalState = globalState;
    this.remainingSeconds = this.config.workDuration * 60;
    this.restorePersistedState();
  }

  public setPreset(workDuration: number, breakDuration: number) {
    const validWork = Math.max(1, Math.min(240, Math.round(Number(workDuration)) || 25));
    const validBreak = Math.max(1, Math.min(240, Math.round(Number(breakDuration)) || 5));
    this.config.workDuration = validWork;
    this.config.shortBreakDuration = validBreak;

    // Actualizar configuración en VS Code
    const wsConfig = vscode.workspace.getConfiguration('pomobuddy');
    wsConfig.update('workDuration', validWork, vscode.ConfigurationTarget.Global);
    wsConfig.update('shortBreakDuration', validBreak, vscode.ConfigurationTarget.Global);

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
      avatar: this.config.avatar,
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

  public toggle() {
    if (this.status === 'RUNNING') {
      this.pause();
    } else {
      this.start();
    }
  }

  public getStatus(): TimerStatus {
    return this.status;
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
      this.recordCompletedPomodoro();
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

  public setSoundPack(soundPack: SoundPack) {
    this.config.soundPack = soundPack;
    const wsConfig = vscode.workspace.getConfiguration('pomobuddy');
    wsConfig.update('soundPack', soundPack, vscode.ConfigurationTarget.Global);
  }

  public setErrorPersonality(personality: ErrorPersonality) {
    this.config.errorPersonality = personality;
    const wsConfig = vscode.workspace.getConfiguration('pomobuddy');
    wsConfig.update('errorPersonality', personality, vscode.ConfigurationTarget.Global);
  }

  public recordCompletedPomodoro() {
    if (!this.globalState) return;
    const history = this.globalState.get<Record<string, number>>('pomobuddy_history_stats', {}) || {};
    const todayStr = this.getLocalDateString();
    history[todayStr] = (history[todayStr] || 0) + 1;
    this.globalState.update('pomobuddy_history_stats', history);
    this.notifyStatsUpdated();
  }

  public getStats(): ProductivityStats {
    const history: Record<string, number> =
      (this.globalState && this.globalState.get<Record<string, number>>('pomobuddy_history_stats', {})) || {};

    const todayStr = this.getLocalDateString();
    const todayCount = history[todayStr] || 0;
    const todayMinutes = todayCount * this.config.workDuration;

    let totalCompleted = 0;
    for (const d in history) {
      totalCompleted += history[d] || 0;
    }

    // Cálculo de racha de días consecutivos
    let streakDays = 0;
    const checkDate = new Date();
    const todayKey = this.getLocalDateString(checkDate);

    if ((history[todayKey] || 0) > 0) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Si hoy no ha hecho pomodoros todavía, verificar si ayer sí para mantener racha activa
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = this.getLocalDateString(yesterday);
      if ((history[yesterdayKey] || 0) > 0) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    while (true) {
      const dateKey = this.getLocalDateString(checkDate);
      if ((history[dateKey] || 0) > 0) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Últimos 7 días con etiquetas breves
    const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const last7Days: DayStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = this.getLocalDateString(d);
      last7Days.push({
        date: dStr,
        dayLabel: dayLabels[d.getDay()],
        count: history[dStr] || 0,
      });
    }

    // Últimas 4 semanas (bloques móviles de 7 días)
    const weekLabels = ['Sem -3', 'Sem -2', 'Sem -1', 'Esta Sem'];
    const last4Weeks: WeekStat[] = [];
    for (let w = 3; w >= 0; w--) {
      const endOffset = w * 7;
      const startOffset = endOffset + 6;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - startOffset);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - endOffset);

      let weekPomodoros = 0;
      for (let dayOffset = startOffset; dayOffset >= endOffset; dayOffset--) {
        const curDate = new Date();
        curDate.setDate(curDate.getDate() - dayOffset);
        const curDateStr = this.getLocalDateString(curDate);
        weekPomodoros += history[curDateStr] || 0;
      }

      const formatShortDate = (d: Date) => {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
      };

      last4Weeks.push({
        weekLabel: weekLabels[3 - w],
        rangeLabel: `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`,
        count: weekPomodoros,
        minutes: weekPomodoros * this.config.workDuration,
      });
    }

    return {
      todayCount,
      todayMinutes,
      streakDays,
      totalCompleted,
      last7Days,
      last4Weeks,
    };
  }

  public resetStats() {
    if (this.globalState) {
      this.globalState.update('pomobuddy_history_stats', {});
      this.notifyStatsUpdated();
    }
  }

  private notifyStatsUpdated() {
    if (this.onStatsUpdated) {
      this.onStatsUpdated(this.getStats());
    }
  }

  private getLocalDateString(d: Date = new Date()): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public dispose() {
    this.clearTimer();
  }
}
