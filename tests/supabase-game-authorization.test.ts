import { describe, expect, it, jest } from '@jest/globals';
import { createSupabaseGameRepository } from '../src/features/supabase/gameRepository';
import type { PadelSupabaseClient } from '../src/features/supabase/client';
import {
  initialGameDraft,
  selectGameDay,
  selectGameTime,
  updateGameVenue,
} from '../src/features/game-creation/gameDraft';
import type { GameRepository } from '../src/features/games/gameRepository';
const draft = updateGameVenue(
  selectGameTime(selectGameDay(initialGameDraft, '2099-10-07'), '18:30'),
  'Club',
);
const schedule = draft.schedule;
if (schedule.status !== 'complete') throw new Error('Invalid fixture');
const completeSchedule = schedule;
const mutations: readonly [
  string,
  (repository: GameRepository) => Promise<unknown>,
][] = [
  ['create', (repository) => repository.create(draft)],
  ['join', (repository) => repository.join('game')],
  ['leave', (repository) => repository.leave('game')],
  [
    'reschedule',
    (repository) => repository.reschedule('game', completeSchedule),
  ],
  [
    'cancel',
    (repository) =>
      repository.transitionLifecycle('game', {
        type: 'cancel',
        at: new Date().toISOString(),
      }),
  ],
];

describe('game mutation account ownership', () => {
  it.each(mutations)(
    'rejects retained %s repositories after the account switches',
    async (_name, mutate) => {
      let resolveSession: (value: unknown) => void = () => undefined;
      const getSession = jest.fn(
        () =>
          new Promise((resolve) => {
            resolveSession = resolve;
          }),
      );
      const rpc = jest.fn();
      const repository = createSupabaseGameRepository(
        { auth: { getSession }, rpc } as unknown as PadelSupabaseClient,
        'owner',
      );
      const pending = mutate(repository);
      resolveSession({
        data: {
          session: { user: { id: 'other' }, access_token: 'other-token' },
        },
        error: null,
      });
      await expect(pending).rejects.toThrow();
      expect(rpc).not.toHaveBeenCalled();
    },
  );
  it.each(mutations)(
    'pins the original actor token for %s even if fetch later sees another account',
    async (_name, mutate) => {
      let current = { user: { id: 'owner' }, access_token: 'owner-token' };
      const headers = new Map<string, string>();
      const dispatched = new Error('Dispatch observed');
      const builder = {
        setHeader: jest.fn((name: string, value: string) => {
          headers.set(name, value);
          return builder;
        }),
        then: (resolve: (value: unknown) => unknown) => {
          current = { user: { id: 'other' }, access_token: 'other-token' };
          return Promise.resolve({ data: null, error: dispatched }).then(
            resolve,
          );
        },
      };
      const getSession = jest.fn(async () => ({
        data: { session: current },
        error: null,
      }));
      const rpc = jest.fn(() => builder);
      const repository = createSupabaseGameRepository(
        { auth: { getSession }, rpc } as unknown as PadelSupabaseClient,
        'owner',
      );
      await expect(mutate(repository)).rejects.toThrow('Dispatch observed');
      expect(headers.get('Authorization')).toBe('Bearer owner-token');
      expect(current.user.id).toBe('other');
    },
  );
});
