import type { Game } from '../games/game';
export type GameInvitation = Readonly<{
  id: string;
  game: Game;
  inviterId: string;
  inviteeId: string;
  inviterName: string;
  inviteeName: string;
  status: 'pending' | 'accepted' | 'declined' | 'closed';
}>;
export type InvitationRepository = Readonly<{
  findIncomingById: (id: string) => Promise<GameInvitation | null>;
  listIncoming: () => Promise<readonly GameInvitation[]>;
  listSent: (gameId: string) => Promise<readonly GameInvitation[]>;
  send: (gameId: string, playerId: string) => Promise<void>;
  respond: (
    invitationId: string,
    response: 'accept' | 'decline',
  ) => Promise<void>;
}>;
