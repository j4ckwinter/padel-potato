import { describe, it, expect, jest } from '@jest/globals';
import type { PadelSupabaseClient } from '../src/features/supabase/client';
import { createSupabaseInvitationRepository } from '../src/features/supabase/invitationRepository';

describe('Supabase invitation commands', () => {
  it('sends an invitation and accepts a duplicate pending invite as success', async () => {
    const rpc = jest.fn(async () => ({ data: 'already_invited', error: null }));
    const repo = createSupabaseInvitationRepository(
      { rpc } as unknown as PadelSupabaseClient,
      'me',
    );
    await repo.send('game', 'friend');
    expect(rpc).toHaveBeenCalledWith('send_game_invitation', {
      game_id: 'game',
      player_id: 'friend',
    });
  });
  it('submits an explicit accept or decline and surfaces capacity failures', async () => {
    const rpc = jest.fn(async () => ({ data: 'full', error: null }));
    const repo = createSupabaseInvitationRepository(
      { rpc } as unknown as PadelSupabaseClient,
      'me',
    );
    await expect(repo.respond('invite', 'accept')).rejects.toThrow(
      'game is full',
    );
    expect(rpc).toHaveBeenCalledWith('respond_to_game_invitation', {
      invitation_id: 'invite',
      response: 'accept',
    });
    rpc.mockResolvedValue({ data: 'declined', error: null });
    await expect(repo.respond('invite', 'decline')).resolves.toBeUndefined();
  });
});
