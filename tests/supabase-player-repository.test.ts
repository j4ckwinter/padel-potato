import { describe, it, expect, jest } from '@jest/globals';
import { createSupabasePlayerRepository } from '../src/features/supabase/playerRepository';
import type { PadelSupabaseClient } from '../src/features/supabase/client';

function clientFor(
  tables: Record<string, { data: unknown; error: unknown }>,
  rpcResult = { data: 'updated', error: null as unknown },
) {
  const rpc = jest.fn(async () => rpcResult);
  const filters: unknown[] = [];
  const from = (table: string) => {
    const result = tables[table];
    const query = {
      select: () => query,
      eq: (key: string, value: unknown) => {
        filters.push([table, key, value]);
        return query;
      },
      not: (key: string, op: string, value: unknown) => {
        filters.push([table, key, op, value]);
        return query;
      },
      neq: (key: string, value: unknown) => {
        filters.push([table, key, value]);
        return query;
      },
      then: (resolve: (result: unknown) => unknown) =>
        Promise.resolve(result).then(resolve),
    };
    return query;
  };
  return {
    client: { from, rpc } as unknown as PadelSupabaseClient,
    rpc,
    filters,
  };
}
const profile = {
  id: 'friend',
  display_name: 'Sam',
  presence: 'offline',
  level: 'Improver',
  rating: 3,
  initials: 'S',
  avatar_url: null,
  bio: 'Hello',
  preferred_days: 'Weekends',
  preferred_side: 'Both',
  preferred_time_of_day: 'Evening',
  games_played: 2,
  games_won: 1,
};
describe('Supabase player directory', () => {
  it('maps saved profiles, account favourites and completed shared games', async () => {
    const { client, filters } = clientFor({
      profiles: { data: [profile], error: null },
      player_favourites: { data: [{ player_id: 'friend' }], error: null },
      games: { data: [{ id: 'completed' }], error: null },
      game_participants: {
        data: [
          { game_id: 'completed', player_id: 'me' },
          { game_id: 'completed', player_id: 'friend' },
          { game_id: 'other', player_id: 'stranger' },
        ],
        error: null,
      },
    });
    const rows = await createSupabasePlayerRepository(client, 'me').list();
    expect(rows).toEqual([
      expect.objectContaining({
        id: 'friend',
        favourite: true,
        recentlyPlayedWith: true,
        identity: expect.objectContaining({ name: 'Sam' }),
        stats: { gamesPlayed: '2', rating: '3.0', winRate: '50%' },
      }),
    ]);
    expect(filters).toContainEqual([
      'profiles',
      'onboarding_completed_at',
      'is',
      null,
    ]);
    expect(filters).toContainEqual(['profiles', 'id', 'me']);
    expect(filters).toContainEqual(['player_favourites', 'user_id', 'me']);
  });
  it('persists the requested favourite and surfaces RPC rejection', async () => {
    const { client, rpc } = clientFor({});
    await createSupabasePlayerRepository(client, 'me').setFavourite(
      'friend',
      false,
    );
    expect(rpc).toHaveBeenCalledWith('set_player_favourite', {
      player_id: 'friend',
      should_favourite: false,
    });
    const rejected = clientFor({}, { data: 'invalid_player', error: null });
    await expect(
      createSupabasePlayerRepository(rejected.client, 'me').setFavourite(
        'me',
        true,
      ),
    ).rejects.toThrow('no longer available');
  });
  it('fails the directory load rather than hiding a database failure', async () => {
    const failure = new Error('network');
    const { client } = clientFor({
      profiles: { data: null, error: failure },
      player_favourites: { data: [], error: null },
      games: { data: [], error: null },
      game_participants: { data: [], error: null },
    });
    await expect(
      createSupabasePlayerRepository(client, 'me').list(),
    ).rejects.toBe(failure);
  });
});
