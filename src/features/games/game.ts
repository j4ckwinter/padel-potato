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

type ScheduledGameLifecycle = Readonly<{
  status: 'scheduled';
}>;

type AwaitingResultGameLifecycle = Readonly<{
  endedAt: string;
  status: 'awaitingResult';
}>;

type CompletedGameLifecycle = Readonly<{
  completedAt: string;
  status: 'completed';
}>;

type CancelledGameLifecycle = Readonly<{
  cancelledAt: string;
  status: 'cancelled';
}>;

export type GameLifecycle =
  | ScheduledGameLifecycle
  | AwaitingResultGameLifecycle
  | CompletedGameLifecycle
  | CancelledGameLifecycle;

type GameRecord = Readonly<{
  id: string;
  lifecycle: GameLifecycle;
  name: string;
  participants: GameParticipants;
  schedule: CompleteGameSchedule;
  setup: Readonly<{
    durationMinutes: GameDraft['setup']['durationMinutes'];
    format: GameDraft['setup']['format'];
  }>;
  venue: string;
}>;

export type Game = GameRecord;
export type ScheduledGame = Omit<GameRecord, 'lifecycle'> &
  Readonly<{ lifecycle: ScheduledGameLifecycle }>;

export type GameLifecycleCommand =
  | Readonly<{ at: string; type: 'cancel' }>
  | Readonly<{ at: string; type: 'finish' }>
  | Readonly<{ at: string; type: 'complete' }>;

export const gamePlayerCapacity = 4;

export function isScheduledGame(game: Game): game is ScheduledGame {
  return game.lifecycle.status === 'scheduled';
}

export function applyGameLifecycleCommand(
  game: Game,
  command: GameLifecycleCommand,
): Game | null {
  switch (game.lifecycle.status) {
    case 'scheduled':
      switch (command.type) {
        case 'cancel':
          return {
            ...game,
            lifecycle: { cancelledAt: command.at, status: 'cancelled' },
          };
        case 'finish':
          return {
            ...game,
            lifecycle: { endedAt: command.at, status: 'awaitingResult' },
          };
        case 'complete':
          return null;
      }
    case 'awaitingResult':
      return command.type === 'complete'
        ? {
            ...game,
            lifecycle: { completedAt: command.at, status: 'completed' },
          }
        : null;
    case 'completed':
    case 'cancelled':
      return null;
  }
}

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
