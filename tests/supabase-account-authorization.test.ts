import { describe, it, expect, jest } from '@jest/globals';
import { createClient, type Session } from '@supabase/supabase-js';
import type { Database } from '../src/features/supabase/database.types';
import { createSupabasePlayerRepository } from '../src/features/supabase/playerRepository';
import { createSupabaseInvitationRepository } from '../src/features/supabase/invitationRepository';

function setup() {
  const requests: string[] = [];
  const fetcher = jest.fn(
    async (_input: RequestInfo | URL, init?: RequestInit) => {
      requests.push(new Headers(init?.headers).get('Authorization') ?? '');
      return new Response(JSON.stringify('updated'), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  );
  const client = createClient<Database>('https://example.test', 'public-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetcher },
  });
  const getSession = jest.spyOn(client.auth, 'getSession');
  const session = (id: string, token: string) => ({
    data: { session: { user: { id }, access_token: token } as Session },
    error: null,
  });
  return { client, getSession, session, requests, fetcher };
}
describe('account-bound Supabase commands', () => {
  it('rejects retained old repositories before sending any social mutation', async () => {
    const { client, getSession, session, fetcher } = setup();
    const players = createSupabasePlayerRepository(client, 'old');
    const invitations = createSupabaseInvitationRepository(client, 'old');
    getSession.mockResolvedValue(session('new', 'new-token'));
    await expect(players.setFavourite('friend', true)).rejects.toThrow(
      'account changed',
    );
    await expect(invitations.send('game', 'friend')).rejects.toThrow(
      'account changed',
    );
    await expect(invitations.respond('invite', 'accept')).rejects.toThrow(
      'account changed',
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('pins the old actor when the auth session changes during RPC transport', async () => {
    const { client, getSession, session, requests } = setup();
    getSession
      .mockResolvedValueOnce(session('old', 'old-token'))
      .mockResolvedValue(session('new', 'new-token'));
    await createSupabasePlayerRepository(client, 'old').setFavourite(
      'friend',
      true,
    );
    expect(requests).toEqual(['Bearer old-token']);
    expect(getSession).toHaveBeenCalledTimes(2);
  });
  it('rejects a delayed session lookup that resolves with a different actor', async () => {
    const { client, getSession, session, fetcher } = setup();
    let resolve!: (value: ReturnType<typeof session>) => void;
    getSession.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const pending = createSupabaseInvitationRepository(client, 'old').send(
      'game',
      'friend',
    );
    resolve(session('new', 'new-token'));
    await expect(pending).rejects.toThrow('account changed');
    expect(fetcher).not.toHaveBeenCalled();
  });
});
