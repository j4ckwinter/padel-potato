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
export type GameResultSets =
  | readonly [GameSetScore, GameSetScore]
  | readonly [GameSetScore, GameSetScore, GameSetScore];
export type GameResultTeam = readonly [string, string];
export type GameResultTeams = readonly [GameResultTeam, GameResultTeam];

export type GameResult = Readonly<{
  sets: GameResultSets;
  teams: GameResultTeams;
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
type FourPlayerGameParticipants = Extract<
  GameParticipants,
  Readonly<{ length: 4 }>
>;
export type CompletedGame = Omit<GameRecord, 'lifecycle' | 'participants'> &
  Readonly<{
    lifecycle: CompletedGameLifecycle;
    participants: FourPlayerGameParticipants;
  }>;

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

export function isCompletedGame(game: Game): game is CompletedGame {
  return (
    game.lifecycle.status === 'completed' && game.participants.length === 4
  );
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
      const teams = gameResultTeams(game, command.result);
      const result =
        teams === null
          ? null
          : createGameResult({ game, sets: command.result.sets, teams });
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

export function gameTeamsForPartner(
  game: Game,
  partnerId: string,
): GameTeams | null {
  if (game.participants.length !== 4) return null;

  const organiser = game.participants[0].player;
  const firstPlayer = game.participants[1].player;
  const secondPlayer = game.participants[2].player;
  const thirdPlayer = game.participants[3].player;
  if (partnerId === firstPlayer.id) {
    return [
      [organiser, firstPlayer],
      [secondPlayer, thirdPlayer],
    ];
  }
  if (partnerId === secondPlayer.id) {
    return [
      [organiser, secondPlayer],
      [firstPlayer, thirdPlayer],
    ];
  }
  if (partnerId === thirdPlayer.id) {
    return [
      [organiser, thirdPlayer],
      [firstPlayer, secondPlayer],
    ];
  }
  return null;
}

export function gameResultTeams(
  game: Game,
  result: GameResult,
): GameTeams | null {
  if (game.participants.length !== 4) return null;
  const playerById = new Map(
    game.participants.map(({ player }) => [player.id, player]),
  );
  const firstTeamFirstPlayer = playerById.get(result.teams[0][0]);
  const firstTeamSecondPlayer = playerById.get(result.teams[0][1]);
  const secondTeamFirstPlayer = playerById.get(result.teams[1][0]);
  const secondTeamSecondPlayer = playerById.get(result.teams[1][1]);
  const uniquePlayerIds = new Set(result.teams.flat());
  if (
    !firstTeamFirstPlayer ||
    !firstTeamSecondPlayer ||
    !secondTeamFirstPlayer ||
    !secondTeamSecondPlayer ||
    uniquePlayerIds.size !== 4
  ) {
    return null;
  }

  return [
    [firstTeamFirstPlayer, firstTeamSecondPlayer],
    [secondTeamFirstPlayer, secondTeamSecondPlayer],
  ];
}

export function createGameResult({
  game,
  sets,
  teams,
}: Readonly<{
  game: Game;
  sets: GameResultSets;
  teams: GameTeams;
}>): GameResult | null {
  const winners = sets.map(setWinner);
  const teamOneWins = winners.filter((winner) => winner === 0).length;
  const teamTwoWins = winners.filter((winner) => winner === 1).length;
  if (
    gameResultTeams(game, {
      sets,
      teams: [
        [teams[0][0].id, teams[0][1].id],
        [teams[1][0].id, teams[1][1].id],
      ],
    }) === null ||
    winners.some((winner) => winner === null) ||
    Math.max(teamOneWins, teamTwoWins) < 2 ||
    teamOneWins === teamTwoWins
  ) {
    return null;
  }

  const normalizedSets: GameResultSets =
    sets.length === 2
      ? [
          [sets[0][0], sets[0][1]],
          [sets[1][0], sets[1][1]],
        ]
      : [
          [sets[0][0], sets[0][1]],
          [sets[1][0], sets[1][1]],
          [sets[2][0], sets[2][1]],
        ];

  return {
    sets: normalizedSets,
    teams: [
      [teams[0][0].id, teams[0][1].id],
      [teams[1][0].id, teams[1][1].id],
    ],
  };
}

export function gameResultWinner(result: GameResult): 0 | 1 {
  const teamOneWins = result.sets.filter(
    ([teamOne, teamTwo]) => teamOne > teamTwo,
  ).length;
  return teamOneWins >= 2 ? 0 : 1;
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
