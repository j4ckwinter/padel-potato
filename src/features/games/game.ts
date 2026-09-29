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

export type GameSetScore = readonly [number, number];

export type GameResult = Readonly<{
  sets: readonly [GameSetScore, GameSetScore];
}>;

type CompletedGameLifecycle = Readonly<{
  completedAt: string;
  result: GameResult;
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

export type GameTeams = readonly [
  readonly [GamePlayer, GamePlayer],
  readonly [GamePlayer, GamePlayer],
];

export type GameLifecycleCommand =
  | Readonly<{ at: string; type: 'cancel' }>
  | Readonly<{ at: string; type: 'finish' }>
  | Readonly<{ at: string; result: GameResult; type: 'recordResult' }>;

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
        case 'recordResult':
          return null;
      }
    case 'awaitingResult':
      if (command.type !== 'recordResult') return null;
      const result = createGameResult(game, command.result.sets);
      return result === null
        ? null
        : {
            ...game,
            lifecycle: {
              completedAt: command.at,
              result,
              status: 'completed',
            },
          };
    case 'completed':
    case 'cancelled':
      return null;
  }
}

function setWinner([teamOne, teamTwo]: GameSetScore): 0 | 1 | null {
  if (
    !Number.isInteger(teamOne) ||
    !Number.isInteger(teamTwo) ||
    teamOne < 0 ||
    teamTwo < 0 ||
    teamOne > 7 ||
    teamTwo > 7
  ) {
    return null;
  }
  if (teamOne === 6 && teamTwo <= 4) return 0;
  if (teamTwo === 6 && teamOne <= 4) return 1;
  if (teamOne === 7 && (teamTwo === 5 || teamTwo === 6)) return 0;
  if (teamTwo === 7 && (teamOne === 5 || teamOne === 6)) return 1;
  return null;
}

export function gameTeams(game: Game): GameTeams | null {
  if (game.participants.length !== 4) return null;

  return [
    [game.participants[0].player, game.participants[1].player],
    [game.participants[2].player, game.participants[3].player],
  ];
}

export function createGameResult(
  game: Game,
  sets: readonly [GameSetScore, GameSetScore],
): GameResult | null {
  const firstWinner = setWinner(sets[0]);
  const secondWinner = setWinner(sets[1]);
  if (
    gameTeams(game) === null ||
    firstWinner === null ||
    secondWinner !== firstWinner
  ) {
    return null;
  }

  return {
    sets: [
      [sets[0][0], sets[0][1]],
      [sets[1][0], sets[1][1]],
    ],
  };
}

export function gameResultWinner(result: GameResult): 0 | 1 {
  return result.sets[0][0] > result.sets[0][1] ? 0 : 1;
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
