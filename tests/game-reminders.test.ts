import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { demoGames } from '../src/features/demo/demoData';
import { type Game } from '../src/features/games/game';
import {
  createReminderReconciler,
  gameReminderPlan,
  emptyReminderPlan,
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
    const plan = gameReminderPlan(
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
    expect(plan.schedule).toEqual([
      {
        id: `padel-potato.game-reminder.${userId}.${game.id}`,
        userId,
        gameId: game.id,
        title: 'Your padel game starts in an hour',
        body: `${game.name} at ${game.venue}`,
        at: now + 60 * 60_000,
      },
    ]);
    expect(gameReminderPlan('not-a-participant', [game], now).schedule).toEqual(
      [],
    );
    expect(
      gameReminderPlan(userId, [game], now + 60 * 60_000).schedule,
    ).toEqual([]);
  });

  it('cancels stale account or game reminders, preserves unrelated notifications and does not duplicate unchanged reminders', async () => {
    const plan = gameReminderPlan(userId, [game], now);
    const desired = plan.schedule;
    const scheduler: ReminderScheduler = {
      list: jest.fn(async () => [
        { id: desired[0].id, at: desired[0].at },
        { id: 'padel-potato.game-reminder.other.old-game', at: now },
        { id: 'another-feature', at: now },
      ]),
      cancel: jest.fn(async () => undefined),
      schedule: jest.fn(async () => undefined),
    };
    await createReminderReconciler(scheduler)(plan);
    expect(scheduler.cancel).toHaveBeenCalledTimes(1);
    expect(scheduler.cancel).toHaveBeenCalledWith(
      'padel-potato.game-reminder.other.old-game',
    );
    expect(scheduler.schedule).not.toHaveBeenCalled();
  });

  it('reschedules a changed time and cancels everything owned when disabled', async () => {
    const plan = gameReminderPlan(userId, [game], now);
    const desired = plan.schedule;
    const scheduler: ReminderScheduler = {
      list: jest.fn(async () => [{ id: desired[0].id, at: now }]),
      cancel: jest.fn(async () => undefined),
      schedule: jest.fn(async (_reminder: GameReminder) => undefined),
    };
    const reconcile = createReminderReconciler(scheduler);
    await reconcile(plan);
    expect(scheduler.cancel).toHaveBeenCalledWith(desired[0].id);
    expect(scheduler.schedule).toHaveBeenCalledWith(desired[0]);
    jest.mocked(scheduler.cancel).mockClear();
    await reconcile(emptyReminderPlan);
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
    const old = reconcile(gameReminderPlan(userId, [game], now));
    await Promise.resolve();
    const signedOut = reconcile(emptyReminderPlan);
    resolveList([]);
    jest.mocked(scheduler.list).mockResolvedValue([]);
    await Promise.all([old, signedOut]);
    expect(scheduler.schedule).not.toHaveBeenCalled();
    jest
      .mocked(scheduler.list)
      .mockRejectedValueOnce(new Error('native unavailable'));
    await expect(reconcile(emptyReminderPlan)).rejects.toThrow(
      'native unavailable',
    );
    await expect(reconcile(emptyReminderPlan)).resolves.toBeUndefined();
  });
  it('retains a queued valid reminder after its nominal time while the OS delays delivery', async () => {
    const queued = gameReminderPlan(userId, [game], now).schedule[0];
    const scheduler: ReminderScheduler = {
      list: jest.fn(async () => [{ id: queued.id, at: queued.at }]),
      cancel: jest.fn(async () => undefined),
      schedule: jest.fn(async () => undefined),
    };
    await createReminderReconciler(scheduler)(
      gameReminderPlan(userId, [game], queued.at + 78_000),
    );
    expect(scheduler.cancel).not.toHaveBeenCalled();
    expect(scheduler.schedule).not.toHaveBeenCalled();
  });
  it('does not create a late reminder when none was already queued', async () => {
    const scheduler: ReminderScheduler = {
      list: jest.fn(async () => []),
      cancel: jest.fn(async () => undefined),
      schedule: jest.fn(async () => undefined),
    };
    const due = Date.parse(game.schedule.startsAt) - 60 * 60_000;
    await createReminderReconciler(scheduler)(
      gameReminderPlan(userId, [game], due + 78_000),
    );
    expect(scheduler.schedule).not.toHaveBeenCalled();
    expect(scheduler.cancel).not.toHaveBeenCalled();
    await createReminderReconciler(
      scheduler,
      () => due + 1,
    )(gameReminderPlan(userId, [game], now));
    expect(scheduler.schedule).not.toHaveBeenCalled();
  });

  it('cancels delayed reminders after leaving, cancellation, rescheduling or the game starts', async () => {
    const queued = gameReminderPlan(userId, [game], now).schedule[0];
    const scheduler: ReminderScheduler = {
      list: jest.fn(async () => [{ id: queued.id, at: queued.at }]),
      cancel: jest.fn(async () => undefined),
      schedule: jest.fn(async () => undefined),
    };
    const reconcile = createReminderReconciler(scheduler);
    await reconcile(
      gameReminderPlan('different-account', [game], queued.at + 78_000),
    );
    await reconcile(
      gameReminderPlan(
        userId,
        [
          {
            ...game,
            lifecycle: {
              status: 'cancelled',
              cancelledAt: new Date(now).toISOString(),
            },
          },
        ],
        queued.at + 78_000,
      ),
    );
    await reconcile(
      gameReminderPlan(
        userId,
        [
          {
            ...game,
            schedule: { ...game.schedule, startsAt: '2030-01-01T13:30:00Z' },
          },
        ],
        queued.at + 78_000,
      ),
    );
    await reconcile(
      gameReminderPlan(userId, [game], Date.parse(game.schedule.startsAt)),
    );
    await reconcile(gameReminderPlan(userId, [], queued.at + 78_000));
    await reconcile(
      gameReminderPlan(
        userId,
        [
          {
            ...game,
            participants: [
              {
                role: 'organiser',
                player: {
                  ...game.participants[0].player,
                  id: 'remaining-organiser',
                },
              },
            ],
          },
        ],
        queued.at + 78_000,
      ),
    );
    await reconcile(emptyReminderPlan);
    expect(scheduler.cancel).toHaveBeenCalledTimes(7);
    expect(scheduler.cancel).toHaveBeenLastCalledWith(queued.id);
    expect(scheduler.schedule).not.toHaveBeenCalled();
  });

  it('counts only actual retained queued reminders against the fifty reminder cap', async () => {
    const queuedGames = Array.from({ length: 49 }, (_, index) => ({
      ...game,
      id: `queued-${index}`,
    }));
    const futureGames = Array.from({ length: 10 }, (_, index) => ({
      ...game,
      id: `future-${index}`,
      schedule: { ...game.schedule, startsAt: '2030-01-01T15:00:00Z' },
    }));
    const queued = gameReminderPlan(userId, queuedGames, now).schedule;
    const due = queued[0].at;
    const plan = gameReminderPlan(
      userId,
      [...queuedGames, { ...game, id: 'never-queued' }, ...futureGames],
      due + 78_000,
    );
    const scheduler: ReminderScheduler = {
      list: jest.fn(async () => queued.map(({ id, at }) => ({ id, at }))),
      cancel: jest.fn(async () => undefined),
      schedule: jest.fn(async () => undefined),
    };
    await createReminderReconciler(scheduler)(plan);
    expect(scheduler.cancel).not.toHaveBeenCalled();
    expect(scheduler.schedule).toHaveBeenCalledTimes(1);
    expect(scheduler.schedule).toHaveBeenCalledWith(
      expect.objectContaining({ gameId: 'future-0' }),
    );
  });
});
