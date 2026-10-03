import {
  gameReminderMinutesBefore,
  isReminderPreference,
  maximumScheduledGameReminders,
} from '../../design-system/configuration/reminders';
import { gameHasPlayer, type Game } from '../games/game';

export type GameReminder = Readonly<{
  id: string;
  userId: string;
  gameId: string;
  title: string;
  body: string;
  at: number;
}>;

export type ReminderIdentity = Readonly<{ id: string; at: number }>;
export type ReminderPlan = Readonly<{
  schedule: readonly GameReminder[];
  retain: readonly ReminderIdentity[];
}>;
export const emptyReminderPlan: ReminderPlan = Object.freeze({
  schedule: Object.freeze([]),
  retain: Object.freeze([]),
});

export type ReminderScheduler = Readonly<{
  list: () => Promise<readonly Readonly<{ id: string; at: number | null }>[]>;
  cancel: (id: string) => Promise<void>;
  schedule: (reminder: GameReminder) => Promise<void>;
}>;

const prefix = 'padel-potato.game-reminder.';

function preferenceKey(userId: string) {
  if (!userId.trim()) throw new Error('A signed-in account is required.');
  return `padel-potato.reminders.v1.${encodeURIComponent(userId)}`;
}

export function loadReminderPreference(userId: string) {
  try {
    const stored = localStorage.getItem(preferenceKey(userId));
    const value: unknown = stored === null ? null : JSON.parse(stored);
    return isReminderPreference(value) ? value.enabled : false;
  } catch {
    return false;
  }
}

export function saveReminderPreference(userId: string, enabled: boolean) {
  localStorage.setItem(
    preferenceKey(userId),
    JSON.stringify({ version: 1, enabled }),
  );
}

export function gameReminderPlan(
  userId: string,
  games: readonly Game[],
  now = Date.now(),
): ReminderPlan {
  const candidates = games
    .filter(
      (game) =>
        game.lifecycle.status === 'scheduled' &&
        gameHasPlayer(game, userId) &&
        Date.parse(game.schedule.startsAt) > now,
    )
    .map((game) => ({
      id: `${prefix}${encodeURIComponent(userId)}.${encodeURIComponent(game.id)}`,
      userId,
      gameId: game.id,
      title: 'Your padel game starts in an hour',
      body: `${game.name} at ${game.venue}`,
      at:
        Date.parse(game.schedule.startsAt) - gameReminderMinutesBefore * 60_000,
    }))
    .filter((reminder) => Number.isFinite(reminder.at))
    .sort((first, second) => first.at - second.at);
  return {
    schedule: candidates
      .filter((reminder) => reminder.at > now)
      .slice(0, maximumScheduledGameReminders),
    retain: candidates
      .filter((reminder) => reminder.at <= now)
      .map(({ id, at }) => ({ id, at })),
  };
}

export function createReminderReconciler(
  scheduler: ReminderScheduler,
  now: () => number = Date.now,
) {
  let generation = 0;
  let queue = Promise.resolve();
  return (plan: ReminderPlan) => {
    const request = ++generation;
    const reconcile = async () => {
      if (request !== generation) return;
      const scheduled = await scheduler.list();
      if (request !== generation) return;
      const retain = new Map(
        plan.retain.map((reminder) => [reminder.id, reminder.at]),
      );
      const retained = scheduled.flatMap((notification) =>
        notification.at !== null &&
        retain.get(notification.id) === notification.at
          ? [{ id: notification.id, at: notification.at }]
          : [],
      );
      const retainedCount = new Set(
        retained.map((notification) => notification.id),
      ).size;
      const desired = plan.schedule.slice(
        0,
        Math.max(0, maximumScheduledGameReminders - retainedCount),
      );
      const wanted = new Map<string, number>([
        ...retained.map(
          (notification) => [notification.id, notification.at] as const,
        ),
        ...desired.map((reminder) => [reminder.id, reminder.at] as const),
      ]);
      const kept = new Set<string>();
      for (const notification of scheduled) {
        if (!notification.id.startsWith(prefix)) continue;
        const at = wanted.get(notification.id);
        if (at !== undefined && at === notification.at)
          kept.add(notification.id);
        else await scheduler.cancel(notification.id);
        if (request !== generation) return;
      }
      for (const reminder of desired) {
        if (request !== generation) return;
        if (!kept.has(reminder.id) && reminder.at > now())
          await scheduler.schedule(reminder);
      }
    };
    const result = queue.then(reconcile, reconcile);
    queue = result.catch(() => undefined);
    return result;
  };
}
