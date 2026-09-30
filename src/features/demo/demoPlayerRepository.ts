import type { PlayerRepository } from '../players/playerRepository';
import { demoCurrentUser, demoPlayers } from './demoData';

export const demoPlayerRepository: PlayerRepository = {
  findById: (playerId) =>
    Promise.resolve(
      demoPlayers.find((player) => player.id === playerId) ?? null,
    ),
  findProfileById: (playerId) =>
    Promise.resolve(
      playerId === demoCurrentUser.id
        ? demoCurrentUser
        : (demoPlayers.find((player) => player.id === playerId) ?? null),
    ),
  list: () => Promise.resolve(demoPlayers),
};
