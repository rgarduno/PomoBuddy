import { StatusBarManager } from '../src/statusBarManager';
import { TimerSnapshot } from '../src/types';
import { window, StatusBarAlignment } from './__mocks__/vscode';

describe('StatusBarManager', () => {
  let statusBarManager: StatusBarManager;
  let mockItem: any;

  beforeEach(() => {
    jest.clearAllMocks();
    statusBarManager = new StatusBarManager();
    // Get the mock item created in constructor
    mockItem = (window.createStatusBarItem as jest.Mock).mock.results[0].value;
  });

  afterEach(() => {
    statusBarManager.dispose();
  });

  it('should initialize status bar item with correct alignment and command', () => {
    expect(window.createStatusBarItem).toHaveBeenCalledWith(StatusBarAlignment.Right, 100);
    expect(mockItem.command).toBe('pomobuddy.openCompanion');
    expect(mockItem.show).toHaveBeenCalled();
  });

  it('should display idle state formatted time with avatar emoji', () => {
    const snapshot: TimerSnapshot = {
      mode: 'WORK',
      status: 'IDLE',
      remainingSeconds: 25 * 60,
      totalSeconds: 25 * 60,
      currentRound: 1,
      totalRounds: 4,
      completedRounds: 0,
      avatar: 'neko',
    };

    statusBarManager.update(snapshot);
    expect(mockItem.text).toContain('PomoBuddy: 🐱 Pomodoro listo (25:00)');
  });

  it('should display active focus state with flame icon, avatar, and round count', () => {
    const snapshot: TimerSnapshot = {
      mode: 'WORK',
      status: 'RUNNING',
      remainingSeconds: 24 * 60 + 45,
      totalSeconds: 25 * 60,
      currentRound: 2,
      totalRounds: 4,
      completedRounds: 1,
      avatar: 'robot',
    };

    statusBarManager.update(snapshot);
    expect(mockItem.text).toContain('$(flame) 🤖 24:45 (2/4)');
  });

  it('should display paused state with pause icon and avatar', () => {
    const snapshot: TimerSnapshot = {
      mode: 'WORK',
      status: 'PAUSED',
      remainingSeconds: 20 * 60,
      totalSeconds: 25 * 60,
      currentRound: 1,
      totalRounds: 4,
      completedRounds: 0,
      avatar: 'wizard',
    };

    statusBarManager.update(snapshot);
    expect(mockItem.text).toContain('$(debug-pause) 🧙‍♂️ 20:00 [Pausado]');
  });

  it('should display short break with coffee icon and avatar', () => {
    const snapshot: TimerSnapshot = {
      mode: 'SHORT_BREAK',
      status: 'RUNNING',
      remainingSeconds: 4 * 60 + 30,
      totalSeconds: 5 * 60,
      currentRound: 1,
      totalRounds: 4,
      completedRounds: 1,
      avatar: 'duck',
    };

    statusBarManager.update(snapshot);
    expect(mockItem.text).toContain('$(coffee) 🦆 04:30 [Descanso 🕺]');
  });

  it('should display long break with star icon and avatar', () => {
    const snapshot: TimerSnapshot = {
      mode: 'LONG_BREAK',
      status: 'RUNNING',
      remainingSeconds: 14 * 60 + 10,
      totalSeconds: 15 * 60,
      currentRound: 4,
      totalRounds: 4,
      completedRounds: 4,
      avatar: 'capy',
    };

    statusBarManager.update(snapshot);
    expect(mockItem.text).toContain('$(star-full) ☕ 14:10 [Descanso Largo 🌟]');
  });

  it('should display custom avatar with palette emoji', () => {
    const snapshot: TimerSnapshot = {
      mode: 'WORK',
      status: 'IDLE',
      remainingSeconds: 25 * 60,
      totalSeconds: 25 * 60,
      currentRound: 1,
      totalRounds: 4,
      completedRounds: 0,
      avatar: 'custom',
    };

    statusBarManager.update(snapshot);
    expect(mockItem.text).toContain('PomoBuddy: 🎨 Pomodoro listo (25:00)');
  });

  it('should call dispose on the underlying status bar item', () => {
    statusBarManager.dispose();
    expect(mockItem.dispose).toHaveBeenCalled();
  });
});
