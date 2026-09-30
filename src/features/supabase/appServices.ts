import { createDemoGameRepository } from '../demo/demoGameRepository';
import { demoPlayers } from '../demo/demoData';
import { gamePlayerFromProfile, type PlayerProfile } from '../players/player';
import type { PlayerRepository } from '../players/playerRepository';
import type { AppServices } from '../services/AppServicesContext';
import { getSupabaseClient, type PadelSupabaseClient } from './client';
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

function playerRepositoryFor(currentUser: PlayerProfile): PlayerRepository {
  return {
    findById: async (playerId) => {
      if (playerId === currentUser.id) {
        return {
          ...currentUser,
          favourite: false,
          recentlyPlayedWith: false,
        };
      }
      return demoPlayers.find((player) => player.id === playerId) ?? null;
    },
    findProfileById: async (playerId) =>
      playerId === currentUser.id
        ? currentUser
        : (demoPlayers.find((player) => player.id === playerId) ?? null),
    list: async () => demoPlayers,
  };
}

export async function loadSupabaseAppServices(
  userId: string,
  client: PadelSupabaseClient = getSupabaseClient(),
): Promise<AppServices | null> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const currentUser = playerProfileFromRow(data);
  const currentPlayer = gamePlayerFromProfile(currentUser);
  return {
    currentPlayer,
    currentUser,
    games: createDemoGameRepository(currentPlayer),
    players: playerRepositoryFor(currentUser),
  };
}
