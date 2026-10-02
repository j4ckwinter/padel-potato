import type { PlayerProfile } from '../players/player';
import type { Database } from './database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function playerProfileFromRow(row: ProfileRow): PlayerProfile {
  const rating = row.rating.toFixed(1);
  const identityBase = {
    name: row.display_name,
    presence:
      row.presence === 'offline' ? ('offline' as const) : ('away' as const),
    supportingText: `${row.level} · Rating ${rating}`,
  };
  const identity = row.avatar_url
    ? { ...identityBase, source: { uri: row.avatar_url } }
    : { ...identityBase, initials: row.initials };

  return {
    bio: row.bio,
    id: row.id,
    identity,
    level: row.level,
    preferences: {
      days: row.preferred_days,
      side: row.preferred_side,
      timeOfDay: row.preferred_time_of_day,
    },
    stats: {
      gamesPlayed: String(row.games_played),
      rating,
      winRate: `${row.games_played === 0 ? 0 : Math.round((row.games_won / row.games_played) * 100)}%`,
    },
  };
}
