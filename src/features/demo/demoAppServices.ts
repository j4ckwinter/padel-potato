import type { AppServices } from '../services/AppServicesContext';
import { createDemoGameRepository } from './demoGameRepository';
import { demoCurrentGamePlayer, demoCurrentUser } from './demoData';
import { demoPlayerRepository } from './demoPlayerRepository';

export const demoAppServices: AppServices = {
  currentPlayer: demoCurrentGamePlayer,
  currentUser: demoCurrentUser,
  games: createDemoGameRepository(demoCurrentGamePlayer),
  players: demoPlayerRepository,
};

export function loadDemoAppServices(userId: string) {
  return Promise.resolve(
    userId === demoCurrentUser.id ? demoAppServices : null,
  );
}
