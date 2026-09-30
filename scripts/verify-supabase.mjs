import { execFileSync } from 'node:child_process';

import { createClient } from '@supabase/supabase-js';

const status =
  process.platform === 'win32'
    ? execFileSync(
        'cmd.exe',
        ['/d', '/s', '/c', 'npx supabase status -o env'],
        { encoding: 'utf8' },
      )
    : execFileSync('npx', ['supabase', 'status', '-o', 'env'], {
        encoding: 'utf8',
      });

function statusValue(name) {
  const match = new RegExp(`^${name}="([^"]+)"$`, 'mu').exec(status);
  if (!match) throw new Error(`Supabase status did not return ${name}.`);
  return match[1];
}

const url = statusValue('API_URL');
const publishableKey = statusValue('PUBLISHABLE_KEY');
const anonymous = createClient(url, publishableKey, {
  auth: { persistSession: false },
});

const anonymousGames = await anonymous.from('games').select('id');
if (anonymousGames.error === null) {
  throw new Error('Anonymous users can read games.');
}

async function signedInClient(name) {
  const client = createClient(url, publishableKey, {
    auth: { persistSession: false },
  });
  const email = `${crypto.randomUUID()}@example.com`;
  const { data, error } = await client.auth.signUp({
    email,
    password: `${crypto.randomUUID()}Aa1!`,
    options: { data: { full_name: name } },
  });
  if (error || !data.session || !data.user) {
    throw error ?? new Error(`Could not sign in ${name}.`);
  }
  return { client, userId: data.user.id };
}

const organiser = await signedInClient('Alex Morgan');
const { data: organiserProfile, error: profileError } = await organiser.client
  .from('profiles')
  .select('display_name, initials')
  .eq('id', organiser.userId)
  .single();
if (profileError || organiserProfile?.display_name !== 'Alex Morgan') {
  throw profileError ?? new Error('The auth trigger did not create a profile.');
}
if (organiserProfile.initials !== 'AM') {
  throw new Error(
    `Expected initials AM, received ${organiserProfile.initials}.`,
  );
}

const { data: gameId, error: createError } = await organiser.client.rpc(
  'create_game',
  {
    duration_minutes: 90,
    format: 'Social game',
    game_name: 'Wednesday Evening Padel',
    starts_at: '2026-10-07T18:30:00.000Z',
    venue_name: 'Potato Padel Club',
  },
);
if (createError || !gameId) {
  throw createError ?? new Error('create_game returned no game ID.');
}

const directGameInsert = await organiser.client.from('games').insert({
  duration_minutes: 60,
  format: 'Social game',
  name: 'Untrusted direct insert',
  organiser_id: organiser.userId,
  starts_at: '2026-10-07T19:00:00.000Z',
  venue_name: 'Potato Padel Club',
});
if (directGameInsert.error === null) {
  throw new Error('Authenticated users can bypass the create_game function.');
}

const player = await signedInClient('Jamie Taylor');
const firstJoin = await player.client.rpc('join_game', { game_id: gameId });
if (firstJoin.error || firstJoin.data !== 'joined') {
  throw (
    firstJoin.error ?? new Error(`Expected joined, received ${firstJoin.data}.`)
  );
}
const secondJoin = await player.client.rpc('join_game', { game_id: gameId });
if (secondJoin.error || secondJoin.data !== 'already_joined') {
  throw (
    secondJoin.error ??
    new Error(`Expected already_joined, received ${secondJoin.data}.`)
  );
}

const { count, error: participantError } = await organiser.client
  .from('game_participants')
  .select('*', { count: 'exact', head: true })
  .eq('game_id', gameId);
if (participantError || count !== 2) {
  throw (
    participantError ?? new Error(`Expected 2 participants, received ${count}.`)
  );
}

const attemptedUpdate = await organiser.client
  .from('profiles')
  .update({ bio: 'Changed by another user' })
  .eq('id', player.userId)
  .select('id');
if (attemptedUpdate.error || attemptedUpdate.data.length !== 0) {
  throw (
    attemptedUpdate.error ?? new Error('A user updated another player profile.')
  );
}

process.stdout.write(
  'Supabase verification passed: profile trigger, RLS, game creation, and atomic joining.\n',
);
