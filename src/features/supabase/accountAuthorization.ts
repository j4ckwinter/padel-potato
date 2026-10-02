import type { PadelSupabaseClient } from './client';

export async function accountAuthorization(
  client: PadelSupabaseClient,
  expectedUserId: string,
): Promise<string> {
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  const session = data.session;
  if (!session || session.user.id !== expectedUserId || !session.access_token)
    throw new Error(
      'Your signed-in account changed. Please reopen this screen.',
    );
  return `Bearer ${session.access_token}`;
}
