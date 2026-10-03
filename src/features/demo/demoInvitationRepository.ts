import { publishGameChange } from '../games/gameChanges';
import type { GameRepository } from '../games/gameRepository';
import type {
  GameInvitation,
  InvitationRepository,
} from '../invitations/invitation';
import type { PlayerRepository } from '../players/playerRepository';

export function createDemoInvitationRepository(
  games: GameRepository,
  players: PlayerRepository,
  userId: string,
): InvitationRepository {
  const invitations = new Map<string, GameInvitation>();
  return {
    findIncomingById: async (id) => {
      const invitation = invitations.get(id);
      return invitation?.inviteeId === userId ? invitation : null;
    },
    listIncoming: async () =>
      [...invitations.values()].filter((row) => row.inviteeId === userId),
    listSent: async (id) =>
      [...invitations.values()].filter(
        (row) => row.game.id === id && row.inviterId === userId,
      ),
    send: async (gameId, playerId) => {
      const game = await games.findById(gameId);
      const player = await players.findById(playerId);
      if (!game || !player || playerId === userId)
        throw new Error('This player or game is no longer available.');
      if (
        game.participants[0].player.id !== userId ||
        game.lifecycle.status !== 'scheduled' ||
        game.participants.length >= 4
      )
        throw new Error('This game is not available for invitations.');
      if (
        game.participants.some(
          (participant) => participant.player.id === playerId,
        )
      )
        throw new Error('This player has already joined.');
      const id = `${gameId}:${playerId}`;
      if (invitations.get(id)?.status === 'pending') return;
      invitations.set(id, {
        id,
        game,
        inviterId: userId,
        inviteeId: playerId,
        inviterName: game.participants[0].player.name,
        inviteeName: player.identity.name,
        status: 'pending',
      });
    },
    respond: async (id, response) => {
      const invitation = invitations.get(id);
      if (
        !invitation ||
        invitation.inviteeId !== userId ||
        invitation.status !== 'pending'
      )
        throw new Error('This invitation is no longer available.');
      if (response === 'accept') {
        const result = await games.join(invitation.game.id);
        if (result.status !== 'joined' && result.status !== 'alreadyJoined')
          throw new Error('This game is no longer available.');
        publishGameChange();
        invitations.set(id, {
          ...invitation,
          game: result.game,
          status: 'accepted',
        });
      } else invitations.set(id, { ...invitation, status: 'declined' });
    },
  };
}
