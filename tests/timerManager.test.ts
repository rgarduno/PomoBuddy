import { TimerManager } from '../src/timerManager';
import { PomodoroConfig } from '../src/types';
import { MockMemento } from './__mocks__/vscode';

describe('TimerManager', () => {
  let config: PomodoroConfig;
  let mockMemento: MockMemento;
  let timerManager: TimerManager;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    config = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      roundsBeforeLongBreak: 4,
      soundEnabled: true,
      soundPack: 'arcade',
      avatar: 'neko',
      background: 'winter',
      errorPersonality: 'roast',
    };

    mockMemento = new MockMemento();
    timerManager = new TimerManager(config, mockMemento);
  });

  afterEach(() => {
    timerManager.dispose();
    jest.useRealTimers();
  });

  describe('Initial State & Configuration', () => {
    it('should initialize with correct default values in IDLE status', () => {
      const snapshot = timerManager.getSnapshot();
      expect(snapshot.status).toBe('IDLE');
      expect(snapshot.mode).toBe('WORK');
      expect(snapshot.remainingSeconds).toBe(25 * 60);
      expect(snapshot.totalSeconds).toBe(25 * 60);
      expect(snapshot.currentRound).toBe(1);
      expect(snapshot.totalRounds).toBe(4);
      expect(snapshot.completedRounds).toBe(0);
      expect(snapshot.avatar).toBe('neko');
    });

    it('should return the current configuration', () => {
      expect(timerManager.getConfig()).toEqual(config);
    });

    it('should update sound pack via setSoundPack', () => {
      timerManager.setSoundPack('zen');
      expect(timerManager.getConfig().soundPack).toBe('zen');
    });

    it('should update error personality via setErrorPersonality', () => {
      timerManager.setErrorPersonality('detective');
      expect(timerManager.getConfig().errorPersonality).toBe('detective');
    });

    it('should support setting custom avatar via updateConfig', () => {
      timerManager.updateConfig({ ...config, avatar: 'custom' });
      expect(timerManager.getSnapshot().avatar).toBe('custom');
    });
  });

  describe('Lifecycle: Start, Pause, Resume, Reset', () => {
    it('should start running and update targetEndTime and status', () => {
      const stateChangeSpy = jest.fn();
      timerManager.onStateChange = stateChangeSpy;

      timerManager.start();

      const snapshot = timerManager.getSnapshot();
      expect(snapshot.status).toBe('RUNNING');
      expect(stateChangeSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'RUNNING' }));
    });

    it('should pause a running timer without losing remaining time', () => {
      timerManager.start();

      // Advance 10 seconds
      jest.advanceTimersByTime(10000);
      expect(timerManager.getSnapshot().remainingSeconds).toBe(25 * 60 - 10);

      timerManager.pause();
      expect(timerManager.getSnapshot().status).toBe('PAUSED');

      // Advance another 10 seconds while paused
      jest.advanceTimersByTime(10000);
      // Time should NOT have decreased
      expect(timerManager.getSnapshot().remainingSeconds).toBe(25 * 60 - 10);
    });

    it('should resume from paused state and continue decrementing', () => {
      timerManager.start();
      jest.advanceTimersByTime(15000);
      timerManager.pause();

      timerManager.start();
      expect(timerManager.getSnapshot().status).toBe('RUNNING');

      jest.advanceTimersByTime(5000);
      expect(timerManager.getSnapshot().remainingSeconds).toBe(25 * 60 - 20);
    });

    it('should reset to IDLE and restore full duration', () => {
      timerManager.start();
      jest.advanceTimersByTime(30000);

      timerManager.reset();
      const snapshot = timerManager.getSnapshot();
      expect(snapshot.status).toBe('IDLE');
      expect(snapshot.remainingSeconds).toBe(25 * 60);
    });

    it('should toggle between running and paused states', () => {
      expect(timerManager.getStatus()).toBe('IDLE');

      // Toggle from IDLE -> RUNNING
      timerManager.toggle();
      expect(timerManager.getStatus()).toBe('RUNNING');

      // Toggle from RUNNING -> PAUSED
      timerManager.toggle();
      expect(timerManager.getStatus()).toBe('PAUSED');

      // Toggle from PAUSED -> RUNNING
      timerManager.toggle();
      expect(timerManager.getStatus()).toBe('RUNNING');
    });
  });

  describe('Delta Timing & Sleep Mode Resiliency', () => {
    it('should accurately calculate remaining time via Date.now delta jump', () => {
      timerManager.start();

      // Simulate normal 5 seconds advance
      jest.advanceTimersByTime(5000);
      expect(timerManager.getSnapshot().remainingSeconds).toBe(25 * 60 - 5);

      // Simulate laptop closing and waking up 10 minutes (600s) later
      jest.advanceTimersByTime(600000);

      // Exact elapsed time should be reflected
      expect(timerManager.getSnapshot().remainingSeconds).toBe(25 * 60 - 605);
    });
  });

  describe('Transitions between Work and Breaks', () => {
    it('should transition from WORK to SHORT_BREAK when work timer reaches 0', () => {
      const roundFinishedSpy = jest.fn();
      timerManager.onRoundFinished = roundFinishedSpy;

      timerManager.start();

      // Fast-forward the full 25 minutes
      jest.advanceTimersByTime(25 * 60 * 1000);

      expect(roundFinishedSpy).toHaveBeenCalledWith('WORK', 1);
      const snapshot = timerManager.getSnapshot();
      expect(snapshot.mode).toBe('SHORT_BREAK');
      expect(snapshot.remainingSeconds).toBe(5 * 60);
      expect(snapshot.status).toBe('IDLE');
      expect(snapshot.currentRound).toBe(1);
    });

    it('should transition from SHORT_BREAK to WORK (round 2) when break finishes', () => {
      timerManager.start();

      // Complete work round 1
      jest.advanceTimersByTime(25 * 60 * 1000);
      expect(timerManager.getSnapshot().mode).toBe('SHORT_BREAK');

      // Start and complete short break (5 mins)
      timerManager.start();
      jest.advanceTimersByTime(5 * 60 * 1000);

      const snapshot = timerManager.getSnapshot();
      expect(snapshot.mode).toBe('WORK');
      expect(snapshot.currentRound).toBe(2);
      expect(snapshot.remainingSeconds).toBe(25 * 60);
    });

    it('should trigger onCycleCompleted and transition to LONG_BREAK after 4 rounds', () => {
      const cycleCompletedSpy = jest.fn();
      timerManager.onCycleCompleted = cycleCompletedSpy;

      timerManager.start();

      // Round 1 (Work 25m + Break 5m)
      jest.advanceTimersByTime(25 * 60 * 1000);
      timerManager.start();
      jest.advanceTimersByTime(5 * 60 * 1000);
      expect(timerManager.getSnapshot().currentRound).toBe(2);

      // Round 2 (Work 25m + Break 5m)
      timerManager.start();
      jest.advanceTimersByTime(25 * 60 * 1000);
      timerManager.start();
      jest.advanceTimersByTime(5 * 60 * 1000);
      expect(timerManager.getSnapshot().currentRound).toBe(3);

      // Round 3 (Work 25m + Break 5m)
      timerManager.start();
      jest.advanceTimersByTime(25 * 60 * 1000);
      timerManager.start();
      jest.advanceTimersByTime(5 * 60 * 1000);
      expect(timerManager.getSnapshot().currentRound).toBe(4);

      // Round 4 (Work 25m) -> Triggers cycle completion
      timerManager.start();
      jest.advanceTimersByTime(25 * 60 * 1000);

      expect(cycleCompletedSpy).toHaveBeenCalledWith(4);
      const snapshot = timerManager.getSnapshot();
      expect(snapshot.mode).toBe('LONG_BREAK');
      expect(snapshot.remainingSeconds).toBe(15 * 60); // 15 mins long break
    });
  });

  describe('Skip Command', () => {
    it('should skip from WORK directly to SHORT_BREAK', () => {
      timerManager.start();
      timerManager.skip();

      const snapshot = timerManager.getSnapshot();
      expect(snapshot.mode).toBe('SHORT_BREAK');
      expect(snapshot.remainingSeconds).toBe(5 * 60);
    });

    it('should skip from SHORT_BREAK directly to WORK with next round', () => {
      timerManager.start();
      timerManager.skip(); // now in short break
      timerManager.skip(); // skip break

      const snapshot = timerManager.getSnapshot();
      expect(snapshot.mode).toBe('WORK');
      expect(snapshot.currentRound).toBe(2);
      expect(snapshot.remainingSeconds).toBe(25 * 60);
    });
  });

  describe('Presets & Extra Time', () => {
    it('should update duration dynamically when setPreset is called in IDLE', () => {
      timerManager.setPreset(50, 10);

      const snapshot = timerManager.getSnapshot();
      expect(snapshot.remainingSeconds).toBe(50 * 60);
      expect(snapshot.totalSeconds).toBe(50 * 60);
      expect(timerManager.getConfig().workDuration).toBe(50);
      expect(timerManager.getConfig().shortBreakDuration).toBe(10);
    });

    it('should add extra minutes to the current session', () => {
      timerManager.start();
      jest.advanceTimersByTime(10000); // 10s elapsed

      timerManager.addExtraMinutes(5);

      // Expected: (25 * 60 - 10) + (5 * 60) = 1490 + 300 = 1790
      expect(timerManager.getSnapshot().remainingSeconds).toBe(1790);
    });
  });

  describe('State Persistence via GlobalState / Memento', () => {
    it('should persist state when running and restore state on new instance', () => {
      timerManager.start();
      jest.advanceTimersByTime(60000); // 1 min passed

      // Create a second manager instance simulating VS Code window reload
      const restoredManager = new TimerManager(config, mockMemento);
      const snapshot = restoredManager.getSnapshot();

      expect(snapshot.mode).toBe('WORK');
      expect(snapshot.currentRound).toBe(1);
      // Should restore remaining time near 24 mins
      expect(snapshot.remainingSeconds).toBeLessThanOrEqual(24 * 60);
      restoredManager.dispose();
    });
  });

  describe('Productivity Stats & Streaks', () => {
    it('should initialize with 0 stats and 7 days and 4 weeks in history chart', () => {
      const stats = timerManager.getStats();
      expect(stats.todayCount).toBe(0);
      expect(stats.todayMinutes).toBe(0);
      expect(stats.totalCompleted).toBe(0);
      expect(stats.streakDays).toBe(0);
      expect(stats.last7Days).toHaveLength(7);
      expect(stats.last7Days[stats.last7Days.length - 1].count).toBe(0);
      expect(stats.last4Weeks).toHaveLength(4);
      expect(stats.last4Weeks[3].weekLabel).toBe('Esta Sem');
      expect(stats.last4Weeks[3].count).toBe(0);
    });

    it('should record completed pomodoros and emit onStatsUpdated', () => {
      const statsSpy = jest.fn();
      timerManager.onStatsUpdated = statsSpy;

      timerManager.start();
      // Complete full 25 min work session
      jest.advanceTimersByTime(25 * 60 * 1000);

      const stats = timerManager.getStats();
      expect(stats.todayCount).toBe(1);
      expect(stats.todayMinutes).toBe(25);
      expect(stats.totalCompleted).toBe(1);
      expect(stats.streakDays).toBe(1);
      expect(stats.last4Weeks[3].count).toBe(1);
      expect(stats.last4Weeks[3].minutes).toBe(25);
      expect(statsSpy).toHaveBeenCalledWith(expect.objectContaining({ todayCount: 1, todayMinutes: 25 }));
    });

    it('should reset stats via resetStats()', () => {
      timerManager.start();
      jest.advanceTimersByTime(25 * 60 * 1000);
      expect(timerManager.getStats().todayCount).toBe(1);

      timerManager.resetStats();
      const stats = timerManager.getStats();
      expect(stats.todayCount).toBe(0);
      expect(stats.todayMinutes).toBe(0);
      expect(stats.totalCompleted).toBe(0);
      expect(stats.streakDays).toBe(0);
    });
  });
});

