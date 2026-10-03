import { describe, it, expect, jest } from '@jest/globals';
import type { PadelSupabaseClient } from '../src/features/supabase/client';
import { createSupabaseInvitationRepository } from '../src/features/supabase/invitationRepository';

describe('Supabase invitation commands', () => {
  it.each(['old-invitation', ''])(
    'scopes an incoming lookup to its exact ID %j and recipient before hydration',
    async (id) => {
      const eq = jest.fn(() => query);
      const query = {
        select: () => query,
        eq,
        order: () => query,
        then: (resolve: (result: { data: never[]; error: null }) => void) =>
          resolve({ data: [], error: null }),
      };
      const repository = createSupabaseInvitationRepository(
        { from: () => query } as unknown as PadelSupabaseClient,
        'me',
      );
      expect(await repository.findIncomingById(id)).toBeNull();
      expect(eq.mock.calls).toEqual([
        ['invitee_id', 'me'],
        ['id', id],
      ]);
    },
  );
  it('sends an invitation and accepts a duplicate pending invite as success', async () => {
    const rpc = jest.fn(() => ({
      setHeader: () =>
        Promise.resolve({ data: 'already_invited', error: null }),
    }));
    const repo = createSupabaseInvitationRepository(
      {
        rpc,
        auth: {
          getSession: async () => ({
            data: { session: { user: { id: 'me' }, access_token: 'me-token' } },
            error: null,
          }),
        },
      } as unknown as PadelSupabaseClient,
      'me',
    );
    await repo.send('game', 'friend');
    expect(rpc).toHaveBeenCalledWith('send_game_invitation', {
      game_id: 'game',
      player_id: 'friend',
    });
  });
  it('submits an explicit accept or decline and surfaces capacity failures', async () => {
    let outcome = 'full';
    const rpc = jest.fn(() => ({
      setHeader: () => Promise.resolve({ data: outcome, error: null }),
    }));
    const repo = createSupabaseInvitationRepository(
      {
        rpc,
        auth: {
          getSession: async () => ({
            data: { session: { user: { id: 'me' }, access_token: 'me-token' } },
            error: null,
          }),
        },
      } as unknown as PadelSupabaseClient,
      'me',
    );
    await expect(repo.respond('invite', 'accept')).rejects.toThrow(
      'game is full',
    );
    expect(rpc).toHaveBeenCalledWith('respond_to_game_invitation', {
      invitation_id: 'invite',
      response: 'accept',
    });
    outcome = 'declined';
    await expect(repo.respond('invite', 'decline')).resolves.toBeUndefined();
  });
});
