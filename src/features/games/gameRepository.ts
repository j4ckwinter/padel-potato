import { gameDraftName, type GameDraft } from '../game-creation/gameDraft';
import { demoGames } from '../demo/demoData';
import {
  addPlayerToGame,
  gameHasPlayer,
  type Game,
  type GameParticipants,
  type GamePlayer,
} from './game';

export type JoinGameResult =
  | Readonly<{ game: Game; status: 'joined' }>
  | Readonly<{ game: Game; status: 'alreadyJoined' }>
  | Readonly<{ game: Game; status: 'full' }>
  | Readonly<{ status: 'notFound' }>;

const games = new Map<string, Game>(demoGames.map((game) => [game.id, game]));
let nextGameId = 1;

export function createGame({
  draft,
  participants,
}: Readonly<{
  draft: GameDraft;
  participants: GameParticipants;
}>): Promise<Game> {
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

  const game: Game = {
    id: `game-${nextGameId++}`,
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
  if (gameHasPlayer(game, player.id)) {
    return Promise.resolve({ game, status: 'alreadyJoined' });
  }

  const participants = addPlayerToGame(game, player);
  if (!participants) return Promise.resolve({ game, status: 'full' });

  const joinedGame = { ...game, participants };
  games.set(game.id, joinedGame);
  return Promise.resolve({ game: joinedGame, status: 'joined' });
}
