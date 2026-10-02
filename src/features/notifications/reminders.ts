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

export function gameReminders(
  userId: string,
  games: readonly Game[],
  now = Date.now(),
): readonly GameReminder[] {
  return games
    .filter(
      (game) =>
        game.lifecycle.status === 'scheduled' && gameHasPlayer(game, userId),
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
    .filter((reminder) => Number.isFinite(reminder.at) && reminder.at > now)
    .sort((first, second) => first.at - second.at)
    .slice(0, maximumScheduledGameReminders);
}

export function createReminderReconciler(scheduler: ReminderScheduler) {
  let generation = 0;
  let queue = Promise.resolve();
  return (desired: readonly GameReminder[]) => {
    const request = ++generation;
    const reconcile = async () => {
      if (request !== generation) return;
      const scheduled = await scheduler.list();
      if (request !== generation) return;
      const wanted = new Map(
        desired.map((reminder) => [reminder.id, reminder]),
      );
      const kept = new Set<string>();
      for (const notification of scheduled) {
        if (!notification.id.startsWith(prefix)) continue;
        const reminder = wanted.get(notification.id);
        if (reminder && reminder.at === notification.at)
          kept.add(notification.id);
        else await scheduler.cancel(notification.id);
        if (request !== generation) return;
      }
      for (const reminder of desired) {
        if (request !== generation) return;
        if (!kept.has(reminder.id)) await scheduler.schedule(reminder);
      }
    };
    const result = queue.then(reconcile, reconcile);
    queue = result.catch(() => undefined);
    return result;
  };
}
