import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { demoGames } from '../src/features/demo/demoData';
import { type Game } from '../src/features/games/game';
import {
  createReminderReconciler,
  gameReminders,
  loadReminderPreference,
  saveReminderPreference,
  type GameReminder,
  type ReminderScheduler,
} from '../src/features/notifications/reminders';

const now = Date.parse('2030-01-01T12:00:00Z');
const base = demoGames[0];
const userId = base.participants[0].player.id;
const game: Game = {
  ...base,
  lifecycle: { status: 'scheduled' },
  schedule: {
    status: 'complete',
    date: '2030-01-01',
    time: '14:00',
    startsAt: '2030-01-01T14:00:00Z',
  },
};

describe('game reminders', () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
  });

  it('persists opt-in separately for each account and rejects malformed storage', () => {
    expect(loadReminderPreference(userId)).toBe(false);
    saveReminderPreference(userId, true);
    expect(loadReminderPreference(userId)).toBe(true);
    expect(loadReminderPreference('another-account')).toBe(false);
    localStorage.setItem(`padel-potato.reminders.v1.${userId}`, '{broken');
    expect(loadReminderPreference(userId)).toBe(false);
  });

  it('schedules only future joined scheduled games one hour before play', () => {
    const reminders = gameReminders(
      userId,
      [
        game,
        {
          ...game,
          id: 'cancelled',
          lifecycle: {
            status: 'cancelled',
            cancelledAt: new Date(now).toISOString(),
          },
        },
      ],
      now,
    );
    expect(reminders).toEqual([
      {
        id: `padel-potato.game-reminder.${userId}.${game.id}`,
        userId,
        gameId: game.id,
        title: 'Your padel game starts in an hour',
        body: `${game.name} at ${game.venue}`,
        at: now + 60 * 60_000,
      },
    ]);
    expect(gameReminders('not-a-participant', [game], now)).toEqual([]);
    expect(gameReminders(userId, [game], now + 60 * 60_000)).toEqual([]);
  });

  it('cancels stale account or game reminders, preserves unrelated notifications and does not duplicate unchanged reminders', async () => {
    const desired = gameReminders(userId, [game], now);
    const scheduler: ReminderScheduler = {
      list: jest.fn(async () => [
        { id: desired[0].id, at: desired[0].at },
        { id: 'padel-potato.game-reminder.other.old-game', at: now },
        { id: 'another-feature', at: now },
      ]),
      cancel: jest.fn(async () => undefined),
      schedule: jest.fn(async () => undefined),
    };
    await createReminderReconciler(scheduler)(desired);
    expect(scheduler.cancel).toHaveBeenCalledTimes(1);
    expect(scheduler.cancel).toHaveBeenCalledWith(
      'padel-potato.game-reminder.other.old-game',
    );
    expect(scheduler.schedule).not.toHaveBeenCalled();
  });

  it('reschedules a changed time and cancels everything owned when disabled', async () => {
    const desired = gameReminders(userId, [game], now);
    const scheduler: ReminderScheduler = {
      list: jest.fn(async () => [{ id: desired[0].id, at: now }]),
      cancel: jest.fn(async () => undefined),
      schedule: jest.fn(async (_reminder: GameReminder) => undefined),
    };
    const reconcile = createReminderReconciler(scheduler);
    await reconcile(desired);
    expect(scheduler.cancel).toHaveBeenCalledWith(desired[0].id);
    expect(scheduler.schedule).toHaveBeenCalledWith(desired[0]);
    jest.mocked(scheduler.cancel).mockClear();
    await reconcile([]);
    expect(scheduler.cancel).toHaveBeenCalledWith(desired[0].id);
  });

  it('supersedes an old account load before it can schedule and recovers after failure', async () => {
    let resolveList: (
      value: readonly { id: string; at: number | null }[],
    ) => void = () => undefined;
    const scheduler: ReminderScheduler = {
      list: jest.fn(
        () =>
          new Promise<readonly { id: string; at: number | null }[]>(
            (resolve) => {
              resolveList = resolve;
            },
          ),
      ),
      cancel: jest.fn(async () => undefined),
      schedule: jest.fn(async () => undefined),
    };
    const reconcile = createReminderReconciler(scheduler);
    const old = reconcile(gameReminders(userId, [game], now));
    await Promise.resolve();
    const signedOut = reconcile([]);
    resolveList([]);
    jest.mocked(scheduler.list).mockResolvedValue([]);
    await Promise.all([old, signedOut]);
    expect(scheduler.schedule).not.toHaveBeenCalled();
    jest
      .mocked(scheduler.list)
      .mockRejectedValueOnce(new Error('native unavailable'));
    await expect(reconcile([])).rejects.toThrow('native unavailable');
    await expect(reconcile([])).resolves.toBeUndefined();
  });
});
