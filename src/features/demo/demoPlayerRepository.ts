import type { PlayerRepository } from '../players/playerRepository';
import { demoCurrentUser, demoPlayers } from './demoData';

const favourites = new Map<string, boolean>();
const entries = () =>
  demoPlayers.map((player) => ({
    ...player,
    favourite: favourites.get(player.id) ?? player.favourite,
  }));

export const demoPlayerRepository: PlayerRepository = {
  findById: (playerId) =>
    Promise.resolve(entries().find((player) => player.id === playerId) ?? null),
  findProfileById: (playerId) =>
    Promise.resolve(
      playerId === demoCurrentUser.id
        ? demoCurrentUser
        : (entries().find((player) => player.id === playerId) ?? null),
    ),
  list: () => Promise.resolve(entries()),
  setFavourite: async (id, favourite) => {
    favourites.set(id, favourite);
  },
};
