import {
  gameDraftName,
  type GameDraft,
  type GameScheduleDraft,
} from '../game-creation/gameDraft';

type CompleteGameSchedule = Extract<
  GameScheduleDraft,
  Readonly<{ status: 'complete' }>
>;

export type CreatedGame = Readonly<{
  id: string;
  name: string;
  schedule: CompleteGameSchedule;
  setup: GameDraft['setup'];
  venue: string;
}>;

const games = new Map<string, CreatedGame>();
let nextGameId = 1;

export function createGame(draft: GameDraft): Promise<CreatedGame> {
  const venue = draft.venueQuery.trim();
  if (draft.schedule.status !== 'complete' || venue.length === 0) {
    return Promise.reject(
      new Error('A game requires a venue, day, and start time.'),
    );
  }

  const game = Object.freeze({
    id: `game-${nextGameId++}`,
    name: gameDraftName(draft),
    schedule: Object.freeze({ ...draft.schedule }),
    setup: Object.freeze({ ...draft.setup }),
    venue,
  });
  games.set(game.id, game);

  return Promise.resolve(game);
}

export function findGameById(id: string): Promise<CreatedGame | null> {
  return Promise.resolve(games.get(id) ?? null);
}
