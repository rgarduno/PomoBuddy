export type TimerMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export type AvatarId = 'neko' | 'wizard' | 'robot' | 'duck' | 'capy' | 'raccoon' | 'custom';

export type BackgroundTheme = 'winter' | 'forest' | 'cyberpunk' | 'lofi' | 'minimal';

export type SoundPack = 'arcade' | 'zen' | 'cyber';

export type ErrorPersonality = 'roast' | 'detective' | 'panic' | 'classic';

export interface PomodoroConfig {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  roundsBeforeLongBreak: number;
  soundEnabled: boolean;
  avatar: AvatarId;
  background: BackgroundTheme;
  soundPack: SoundPack;
  errorPersonality: ErrorPersonality;
  customAvatarData?: string;
}

export interface TimerSnapshot {
  mode: TimerMode;
  status: TimerStatus;
  remainingSeconds: number;
  totalSeconds: number;
  currentRound: number;
  totalRounds: number;
  completedRounds: number;
  avatar: AvatarId;
}

export interface DayStat {
  date: string; // 'YYYY-MM-DD'
  dayLabel: string; // 'Lun', 'Mar', etc.
  count: number;
}

export interface WeekStat {
  weekLabel: string; // 'Sem -3', 'Sem -2', 'Sem -1', 'Esta Sem'
  rangeLabel: string; // '01/09 - 07/09'
  count: number;
  minutes: number;
}

export interface ProductivityStats {
  todayCount: number;
  todayMinutes: number;
  streakDays: number;
  totalCompleted: number;
  last7Days: DayStat[];
  last4Weeks: WeekStat[];
}

export type IdeReactionType = 'ERROR' | 'FIXED' | 'SAVED' | 'NORMAL';

export type ExtensionToWebviewMessage =
  | { type: 'TICK'; payload: TimerSnapshot }
  | { type: 'STATE_CHANGE'; payload: TimerSnapshot }
  | { type: 'IDE_REACTION'; payload: { reaction: IdeReactionType; message?: string } }
  | { type: 'CONFIG_UPDATED'; payload: PomodoroConfig }
  | { type: 'STATS_UPDATED'; payload: ProductivityStats }
  | { type: 'CUSTOM_AVATAR_LOADED'; payload: string }
  | { type: 'ROUND_FINISHED'; payload: { mode: TimerMode; round: number } }
  | { type: 'CYCLE_COMPLETED'; payload: { totalRounds: number } };

export type WebviewToExtensionMessage =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SKIP' }
  | { type: 'CHANGE_AVATAR'; payload: AvatarId }
  | { type: 'CHANGE_BACKGROUND'; payload: BackgroundTheme }
  | { type: 'CHANGE_SOUND_PACK'; payload: SoundPack }
  | { type: 'CHANGE_ERROR_PERSONALITY'; payload: ErrorPersonality }
  | { type: 'PICK_CUSTOM_AVATAR' }
  | { type: 'SET_CUSTOM_AVATAR_DATA'; payload: string }
  | { type: 'REMOVE_CUSTOM_AVATAR' }
  | { type: 'TOGGLE_SOUND'; payload: boolean }
  | { type: 'SET_PRESET'; payload: { workDuration: number; breakDuration: number } }
  | { type: 'OPEN_BOTTOM_PANEL' }
  | { type: 'OPEN_SIDEBAR' }
  | { type: 'RESET_STATS' }
  | { type: 'WEBVIEW_READY' };
