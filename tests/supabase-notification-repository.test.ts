import { describe, it, expect, jest } from '@jest/globals';
import { createSupabaseNotificationRepository } from '../src/features/supabase/notificationRepository';
import type { PadelSupabaseClient } from '../src/features/supabase/client';

const row = {
  id: 'note',
  kind: 'invitation',
  invitation_id: 'invite',
  game_id: 'game',
  title: 'Invitation',
  message: 'Sam invited you.',
  created_at: '2026-10-03T00:00:00Z',
  read_at: null,
};
describe('notification repository', () => {
  it('loads every backend page so unread totals are not truncated at 1000', async () => {
    const range = jest.fn(async (from: number) => ({
      data:
        from === 0
          ? Array.from({ length: 1000 }, (_, id) => ({ ...row, id: `${id}` }))
          : [{ ...row, id: 'last' }],
      error: null,
    }));
    const query = {
      select: () => query,
      eq: () => query,
      order: () => query,
      range,
    };
    const repo = createSupabaseNotificationRepository(
      { from: () => query } as unknown as PadelSupabaseClient,
      'me',
    );
    const rows = await repo.list();
    expect(rows).toHaveLength(1001);
    expect(rows[1000]?.target).toEqual({
      type: 'invitation',
      invitationId: 'invite',
      gameId: 'game',
    });
    expect(range.mock.calls).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
  });
  it('pins read writes to their initiating account and surfaces unavailable notifications', async () => {
    let userId = 'me';
    let outcome = true;
    const setHeader = jest.fn(async () => ({ data: outcome, error: null }));
    const rpc = jest.fn(() => ({ setHeader }));
    const repo = createSupabaseNotificationRepository(
      {
        rpc,
        auth: {
          getSession: async () => ({
            data: {
              session: { user: { id: userId }, access_token: 'me-token' },
            },
            error: null,
          }),
        },
      } as unknown as PadelSupabaseClient,
      'me',
    );
    await repo.markRead('note');
    expect(setHeader).toHaveBeenCalledWith('Authorization', 'Bearer me-token');
    outcome = false;
    await expect(repo.markRead('missing')).rejects.toThrow(
      'no longer available',
    );
    userId = 'other';
    await expect(repo.markRead('note')).rejects.toThrow();
    expect(rpc).toHaveBeenCalledTimes(2);
  });
});
