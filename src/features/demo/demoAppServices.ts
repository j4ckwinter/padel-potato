import type { AppServices } from '../services/AppServicesContext';
import { createDemoGameRepository } from './demoGameRepository';
import { demoCurrentGamePlayer, demoCurrentUser } from './demoData';
import { createDemoInvitationRepository } from './demoInvitationRepository';
import { demoPlayerRepository } from './demoPlayerRepository';

const games = createDemoGameRepository(demoCurrentGamePlayer);

export const demoAppServices: AppServices = {
  onboarding: { completed: true, draft: null },
  currentPlayer: demoCurrentGamePlayer,
  currentUser: demoCurrentUser,
  games,
  notifications: { list: async () => [], markRead: async () => {} },
  players: demoPlayerRepository,
  invitations: createDemoInvitationRepository(
    games,
    demoPlayerRepository,
    demoCurrentUser.id,
  ),
};

export function loadDemoAppServices(userId: string) {
  return Promise.resolve(
    userId === demoCurrentUser.id ? demoAppServices : null,
  );
}
