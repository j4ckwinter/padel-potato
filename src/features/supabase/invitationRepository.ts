import { publishGameChange } from '../games/gameChanges';
import type {
  InvitationRepository,
  GameInvitation,
} from '../invitations/invitation';
import type { PadelSupabaseClient } from './client';
import { createSupabaseGameRepository } from './gameRepository';

const failureMessages: Readonly<Record<string, string>> = {
  full: 'This game is full.',
  unavailable: 'This game is no longer accepting players.',
  forbidden: 'You do not have permission for this invitation.',
  already_joined: 'This player has already joined.',
  already_responded: 'This invitation has already been answered.',
  invalid_player: 'This player cannot be invited.',
  not_found: 'This invitation or game is no longer available.',
};
export function createSupabaseInvitationRepository(
  client: PadelSupabaseClient,
  userId: string,
): InvitationRepository {
  const games = createSupabaseGameRepository(client);
  async function list(
    direction: 'incoming' | 'sent',
    gameId?: string,
  ): Promise<readonly GameInvitation[]> {
    let query = client
      .from('game_invitations')
      .select('*')
      .eq(direction === 'incoming' ? 'invitee_id' : 'inviter_id', userId)
      .order('created_at', { ascending: false });
    if (gameId) query = query.eq('game_id', gameId);
    const { data, error } = await query;
    if (error) throw error;
    const rows = data ?? [];
    if (rows.length === 0) return [];
    const ids = [
      ...new Set(rows.flatMap((row) => [row.inviter_id, row.invitee_id])),
    ];
    const profiles = await client
      .from('profiles')
      .select('id, display_name')
      .in('id', ids);
    if (profiles.error) throw profiles.error;
    const names = new Map(
      (profiles.data ?? []).map((row) => [row.id, row.display_name]),
    );
    const gameIds = [...new Set(rows.map((row) => row.game_id))];
    const loaded = await Promise.all(gameIds.map((id) => games.findById(id)));
    const byId = new Map(
      loaded.flatMap((game) => (game ? [[game.id, game] as const] : [])),
    );
    return rows.flatMap((row) => {
      const game = byId.get(row.game_id);
      return game
        ? [
            {
              id: row.id,
              game,
              inviterId: row.inviter_id,
              inviteeId: row.invitee_id,
              inviterName: names.get(row.inviter_id) ?? 'Player',
              inviteeName: names.get(row.invitee_id) ?? 'Player',
              status: row.status,
            },
          ]
        : [];
    });
  }
  return {
    listIncoming: () => list('incoming'),
    listSent: (gameId) => list('sent', gameId),
    send: async (gameId, playerId) => {
      const { data, error } = await client.rpc('send_game_invitation', {
        game_id: gameId,
        player_id: playerId,
      });
      if (error) throw error;
      if (data !== 'invited' && data !== 'already_invited')
        throw new Error(
          failureMessages[data ?? ''] ?? 'Could not send this invitation.',
        );
    },
    respond: async (id, response) => {
      const { data, error } = await client.rpc('respond_to_game_invitation', {
        invitation_id: id,
        response,
      });
      if (error) throw error;
      if (data === 'accepted') publishGameChange();
      if (data !== 'accepted' && data !== 'declined')
        throw new Error(
          failureMessages[data ?? ''] ??
            'Could not respond to this invitation.',
        );
    },
  };
}
