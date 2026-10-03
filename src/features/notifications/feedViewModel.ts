import type { ActivityKind, ActivityNotification } from './activity';

export const rowTypeByKind = {
  invitation: 'social',
  player_joined: 'social',
  game_confirmed: 'game',
  spot_remaining: 'warning',
  game_updated: 'game',
  result_added: 'game',
  cancelled: 'warning',
} as const satisfies Record<ActivityKind, 'social' | 'game' | 'warning'>;

export function notificationGroups(
  items: readonly ActivityNotification[],
  now: Date,
) {
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const sorted = [...items].sort(
    (a, b) =>
      Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
      b.id.localeCompare(a.id),
  );
  return [
    {
      title: 'Today',
      items: sorted.filter(
        (item) => new Date(item.createdAt).getTime() >= today,
      ),
    },
    {
      title: 'Earlier',
      items: sorted.filter(
        (item) => new Date(item.createdAt).getTime() < today,
      ),
    },
  ].filter((group) => group.items.length > 0);
}

export function notificationTimestamp(createdAt: string, now: Date) {
  const date = new Date(createdAt);
  const minutes = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 60000),
  );
  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m`;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date >= today) return `${Math.floor(minutes / 60)}h`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
