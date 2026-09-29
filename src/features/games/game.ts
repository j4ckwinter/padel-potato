import type { GameDraft, GameScheduleDraft } from '../game-creation/gameDraft';

type CompleteGameSchedule = Extract<
  GameScheduleDraft,
  Readonly<{ status: 'complete' }>
>;

export type GamePlayer = Readonly<{
  id: string;
  initials: string;
  name: string;
  rating: string;
}>;

type Organiser = Readonly<{
  player: GamePlayer;
  role: 'organiser';
}>;

type Participant = Readonly<{
  player: GamePlayer;
  role: 'player';
}>;

export type GameParticipants =
  | readonly [Organiser]
  | readonly [Organiser, Participant]
  | readonly [Organiser, Participant, Participant]
  | readonly [Organiser, Participant, Participant, Participant];

export type Game = Readonly<{
  id: string;
  name: string;
  participants: GameParticipants;
  schedule: CompleteGameSchedule;
  setup: Readonly<{
    durationMinutes: GameDraft['setup']['durationMinutes'];
    format: GameDraft['setup']['format'];
  }>;
  venue: string;
}>;

export const gamePlayerCapacity = 4;

export function availableGameSpots(game: Game) {
  return gamePlayerCapacity - game.participants.length;
}

export function gameHasPlayer(game: Game, playerId: string) {
  return game.participants.some(({ player }) => player.id === playerId);
}

export function playerOrganisesGame(game: Game, playerId: string) {
  return game.participants[0].player.id === playerId;
}

export function addPlayerToGame(
  game: Game,
  player: GamePlayer,
): GameParticipants | null {
  const participant = { player, role: 'player' } as const;

  switch (game.participants.length) {
    case 1:
      return [game.participants[0], participant];
    case 2:
      return [game.participants[0], game.participants[1], participant];
    case 3:
      return [
        game.participants[0],
        game.participants[1],
        game.participants[2],
        participant,
      ];
    case 4:
      return null;
  }
}
