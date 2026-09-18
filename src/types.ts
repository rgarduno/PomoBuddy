export type TimerMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export type AvatarId = 'neko' | 'wizard' | 'robot';

export interface PomodoroConfig {
  workDuration: number;        // in minutes
  shortBreakDuration: number;   // in minutes
  longBreakDuration: number;    // in minutes
  roundsBeforeLongBreak: number;
  soundEnabled: boolean;
  avatar: AvatarId;
}

export interface TimerSnapshot {
  mode: TimerMode;
  status: TimerStatus;
  remainingSeconds: number;
  totalSeconds: number;
  currentRound: number;
  totalRounds: number;
  completedRounds: number;
}

export type IdeReactionType = 'ERROR' | 'FIXED' | 'SAVED' | 'NORMAL';

export type ExtensionToWebviewMessage =
  | { type: 'TICK'; payload: TimerSnapshot }
  | { type: 'STATE_CHANGE'; payload: TimerSnapshot }
  | { type: 'IDE_REACTION'; payload: { reaction: IdeReactionType; message?: string } }
  | { type: 'CONFIG_UPDATED'; payload: PomodoroConfig }
  | { type: 'ROUND_FINISHED'; payload: { mode: TimerMode; round: number } };

export type WebviewToExtensionMessage =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SKIP' }
  | { type: 'CHANGE_AVATAR'; payload: AvatarId }
  | { type: 'TOGGLE_SOUND'; payload: boolean }
  | { type: 'WEBVIEW_READY' };
