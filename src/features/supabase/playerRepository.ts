import type { PlayerRepository } from '../players/playerRepository';
import type { PadelSupabaseClient } from './client';
import { playerProfileFromRow } from './playerProfile';

export function createSupabasePlayerRepository(
  client: PadelSupabaseClient,
  userId: string,
): PlayerRepository {
  async function list() {
    const [profiles, favourites, games, participants] = await Promise.all([
      client
        .from('profiles')
        .select('*')
        .not('onboarding_completed_at', 'is', null)
        .neq('id', userId),
      client
        .from('player_favourites')
        .select('player_id')
        .eq('user_id', userId),
      client.from('games').select('id').eq('status', 'completed'),
      client.from('game_participants').select('game_id, player_id'),
    ]);
    for (const result of [profiles, favourites, games, participants])
      if (result.error) throw result.error;
    const completed = new Set((games.data ?? []).map((game) => game.id));
    const played = new Set(
      (participants.data ?? [])
        .filter((row) => row.player_id === userId && completed.has(row.game_id))
        .map((row) => row.game_id),
    );
    const recent = new Set(
      (participants.data ?? [])
        .filter((row) => played.has(row.game_id))
        .map((row) => row.player_id),
    );
    const favouriteIds = new Set(
      (favourites.data ?? []).map((row) => row.player_id),
    );
    return (profiles.data ?? []).map((row) => ({
      ...playerProfileFromRow(row),
      favourite: favouriteIds.has(row.id),
      recentlyPlayedWith: recent.has(row.id),
    }));
  }
  return {
    list,
    findById: async (id) =>
      (await list()).find((player) => player.id === id) ?? null,
    findProfileById: async (id) => {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data && (id === userId || data.onboarding_completed_at)
        ? playerProfileFromRow(data)
        : null;
    },
    setFavourite: async (playerId, favourite) => {
      const { data, error } = await client.rpc('set_player_favourite', {
        player_id: playerId,
        should_favourite: favourite,
      });
      if (error) throw error;
      if (data !== 'updated')
        throw new Error('This player is no longer available.');
    },
  };
}
