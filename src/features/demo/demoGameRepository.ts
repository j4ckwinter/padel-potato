import { publishGameChange } from '../games/gameChanges';
import { gameDraftName } from '../game-creation/gameDraft';
import {
  addPlayerToGame,
  applyGameLifecycleCommand,
  gameHasPlayer,
  isScheduledGame,
  playerOrganisesGame,
  type GameParticipants,
  type Game,
  type GamePlayer,
  type ScheduledGame,
} from '../games/game';
import type { GameRepository } from '../games/gameRepository';
import { demoGames } from './demoData';

const games = new Map<string, Game>(demoGames.map((game) => [game.id, game]));
let nextGameId = 1;

export function createDemoGameRepository(
  currentPlayer: GamePlayer,
): GameRepository {
  return {
    create: (draft) => {
      const venue = draft.venueQuery.trim();
      if (draft.schedule.status !== 'complete' || venue.length === 0) {
        return Promise.reject(
          new Error('A game requires a venue, day, and start time.'),
        );
      }

      const game: ScheduledGame = {
        id: `game-${nextGameId++}`,
        lifecycle: { status: 'scheduled' },
        name: gameDraftName(draft),
        participants: [{ player: currentPlayer, role: 'organiser' }],
        schedule: { ...draft.schedule },
        setup: {
          durationMinutes: draft.setup.durationMinutes,
          format: draft.setup.format,
        },
        venue,
      };
      games.set(game.id, game);
      publishGameChange();
      return Promise.resolve(game);
    },
    findById: (gameId) => Promise.resolve(games.get(gameId) ?? null),
    join: (gameId) => {
      const game = games.get(gameId);
      if (!game) return Promise.resolve({ status: 'notFound' });
      if (!isScheduledGame(game)) {
        return Promise.resolve({ game, status: 'unavailable' });
      }
      if (gameHasPlayer(game, currentPlayer.id)) {
        return Promise.resolve({ game, status: 'alreadyJoined' });
      }

      const participants = addPlayerToGame(game, currentPlayer);
      if (!participants) return Promise.resolve({ game, status: 'full' });

      const joinedGame = { ...game, participants };
      games.set(game.id, joinedGame);
      publishGameChange();
      return Promise.resolve({ game: joinedGame, status: 'joined' });
    },
    leave: async (gameId) => {
      const game = games.get(gameId);
      if (!game) return { status: 'notFound' };
      if (playerOrganisesGame(game, currentPlayer.id))
        return { game, status: 'organiser' };
      if (!gameHasPlayer(game, currentPlayer.id))
        return { game, status: 'alreadyLeft' };
      if (
        !isScheduledGame(game) ||
        Date.parse(game.schedule.startsAt) <= Date.now()
      )
        return { game, status: 'unavailable' };
      const remaining = game.participants.filter(
        ({ player }) => player.id !== currentPlayer.id,
      );
      const [organiser, first, second] = remaining;
      if (!organiser || organiser.role !== 'organiser')
        throw new Error('Invalid organiser');
      const participants: GameParticipants =
        second && second.role === 'player' && first && first.role === 'player'
          ? [organiser, first, second]
          : first && first.role === 'player'
            ? [organiser, first]
            : [organiser];
      const updated = { ...game, participants };
      games.set(gameId, updated);
      publishGameChange();
      return { game: updated, status: 'left' };
    },
    reschedule: async (gameId, schedule) => {
      const game = games.get(gameId);
      if (!game) return { status: 'notFound' };
      if (!playerOrganisesGame(game, currentPlayer.id))
        return { game, status: 'forbidden' };
      if (
        !isScheduledGame(game) ||
        Date.parse(game.schedule.startsAt) <= Date.now() ||
        !Number.isFinite(Date.parse(schedule.startsAt)) ||
        Date.parse(schedule.startsAt) <= Date.now()
      )
        return { game, status: 'unavailable' };
      if (game.participants.length !== 1)
        return { game, status: 'playersJoined' };
      const updated = { ...game, schedule };
      games.set(gameId, updated);
      publishGameChange();
      return { game: updated, status: 'rescheduled' };
    },
    list: () => Promise.resolve([...games.values()]),
    transitionLifecycle: (gameId, command) => {
      const game = games.get(gameId);
      if (!game) return Promise.resolve({ status: 'notFound' });

      const transitionedGame = applyGameLifecycleCommand(game, command);
      if (!transitionedGame) {
        return Promise.resolve({ game, status: 'invalidTransition' });
      }

      games.set(game.id, transitionedGame);
      publishGameChange();
      return Promise.resolve({
        game: transitionedGame,
        status: 'transitioned',
      });
    },
  };
}
