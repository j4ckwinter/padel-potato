import { gameDraftName, type GameDraft } from '../game-creation/gameDraft';
import { demoGames } from '../demo/demoData';
import {
  addPlayerToGame,
  applyGameLifecycleCommand,
  gameHasPlayer,
  isScheduledGame,
  type Game,
  type GameLifecycleCommand,
  type GameParticipants,
  type GamePlayer,
  type ScheduledGame,
} from './game';

export type JoinGameResult =
  | Readonly<{ game: Game; status: 'joined' }>
  | Readonly<{ game: Game; status: 'alreadyJoined' }>
  | Readonly<{ game: Game; status: 'full' }>
  | Readonly<{ game: Game; status: 'unavailable' }>
  | Readonly<{ status: 'notFound' }>;

export type TransitionGameLifecycleResult =
  | Readonly<{ game: Game; status: 'transitioned' }>
  | Readonly<{ game: Game; status: 'invalidTransition' }>
  | Readonly<{ status: 'notFound' }>;

const games = new Map<string, Game>(demoGames.map((game) => [game.id, game]));
let nextGameId = 1;

export function createGame({
  draft,
  participants,
}: Readonly<{
  draft: GameDraft;
  participants: GameParticipants;
}>): Promise<ScheduledGame> {
  const venue = draft.venueQuery.trim();
  if (draft.schedule.status !== 'complete' || venue.length === 0) {
    return Promise.reject(
      new Error('A game requires a venue, day, and start time.'),
    );
  }
  if (draft.setup.currentPlayerCount !== participants.length) {
    return Promise.reject(
      new Error('The selected players must match the game setup.'),
    );
  }

  const game: ScheduledGame = {
    id: `game-${nextGameId++}`,
    lifecycle: { status: 'scheduled' },
    name: gameDraftName(draft),
    participants,
    schedule: { ...draft.schedule },
    setup: {
      durationMinutes: draft.setup.durationMinutes,
      format: draft.setup.format,
    },
    venue,
  };
  games.set(game.id, game);

  return Promise.resolve(game);
}

export function findGameById(id: string): Promise<Game | null> {
  return Promise.resolve(games.get(id) ?? null);
}

export function listGames(): Promise<readonly Game[]> {
  return Promise.resolve([...games.values()]);
}

export function joinGame(
  gameId: string,
  player: GamePlayer,
): Promise<JoinGameResult> {
  const game = games.get(gameId);
  if (!game) return Promise.resolve({ status: 'notFound' });
  if (!isScheduledGame(game)) {
    return Promise.resolve({ game, status: 'unavailable' });
  }
  if (gameHasPlayer(game, player.id)) {
    return Promise.resolve({ game, status: 'alreadyJoined' });
  }

  const participants = addPlayerToGame(game, player);
  if (!participants) return Promise.resolve({ game, status: 'full' });

  const joinedGame = { ...game, participants };
  games.set(game.id, joinedGame);
  return Promise.resolve({ game: joinedGame, status: 'joined' });
}

export function transitionGameLifecycle(
  gameId: string,
  command: GameLifecycleCommand,
): Promise<TransitionGameLifecycleResult> {
  const game = games.get(gameId);
  if (!game) return Promise.resolve({ status: 'notFound' });

  const transitionedGame = applyGameLifecycleCommand(game, command);
  if (!transitionedGame) {
    return Promise.resolve({ game, status: 'invalidTransition' });
  }

  games.set(game.id, transitionedGame);
  return Promise.resolve({ game: transitionedGame, status: 'transitioned' });
}
