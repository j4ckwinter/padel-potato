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
  const password = `${crypto.randomUUID()}Aa1!`;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error || !data.session || !data.user) {
    throw error ?? new Error(`Could not sign in ${name}.`);
  }
  return { client, email, password, userId: data.user.id };
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

const thirdPlayer = await signedInClient('Sam Kim');
const fourthPlayer = await signedInClient('Riley Brown');
for (const joiningPlayer of [thirdPlayer, fourthPlayer]) {
  const join = await joiningPlayer.client.rpc('join_game', { game_id: gameId });
  if (join.error || join.data !== 'joined') {
    throw join.error ?? new Error(`Expected joined, received ${join.data}.`);
  }
}

const forbiddenTransition = await player.client.rpc(
  'transition_game_lifecycle',
  {
    game_id: gameId,
    lifecycle_command: 'finish',
    occurred_at: '2026-10-07T20:00:00.000Z',
  },
);
if (forbiddenTransition.error || forbiddenTransition.data !== 'forbidden') {
  throw (
    forbiddenTransition.error ??
    new Error(`Expected forbidden, received ${forbiddenTransition.data}.`)
  );
}

const finish = await organiser.client.rpc('transition_game_lifecycle', {
  game_id: gameId,
  lifecycle_command: 'finish',
  occurred_at: '2026-10-07T20:00:00.000Z',
});
if (finish.error || finish.data !== 'transitioned') {
  throw (
    finish.error ?? new Error(`Expected transitioned, received ${finish.data}.`)
  );
}

const invalidResult = await organiser.client.rpc('transition_game_lifecycle', {
  game_id: gameId,
  lifecycle_command: 'record_result',
  occurred_at: '2026-10-07T20:04:00.000Z',
  result_data: {
    sets: [
      [6, 6],
      [6, 4],
    ],
    teams: [
      [organiser.userId, player.userId],
      [thirdPlayer.userId, fourthPlayer.userId],
    ],
  },
});
if (invalidResult.error || invalidResult.data !== 'invalid_transition') {
  throw (
    invalidResult.error ??
    new Error(`Expected invalid_transition, received ${invalidResult.data}.`)
  );
}

const recordResult = await organiser.client.rpc('transition_game_lifecycle', {
  game_id: gameId,
  lifecycle_command: 'record_result',
  occurred_at: '2026-10-07T20:05:00.000Z',
  result_data: {
    sets: [
      [6, 4],
      [7, 5],
    ],
    teams: [
      [organiser.userId, player.userId],
      [thirdPlayer.userId, fourthPlayer.userId],
    ],
  },
});
if (recordResult.error || recordResult.data !== 'transitioned') {
  throw (
    recordResult.error ??
    new Error(`Expected transitioned, received ${recordResult.data}.`)
  );
}

const { count, error: participantError } = await organiser.client
  .from('game_participants')
  .select('*', { count: 'exact', head: true })
  .eq('game_id', gameId);
if (participantError || count !== 4) {
  throw (
    participantError ?? new Error(`Expected 4 participants, received ${count}.`)
  );
}

const { data: completedGame, error: completedGameError } =
  await organiser.client
    .from('games')
    .select('status, ended_at, completed_at')
    .eq('id', gameId)
    .single();
if (
  completedGameError ||
  completedGame.status !== 'completed' ||
  !completedGame.ended_at ||
  !completedGame.completed_at
) {
  throw (
    completedGameError ?? new Error('The completed game was not persisted.')
  );
}

const { count: setCount, error: setError } = await organiser.client
  .from('game_result_sets')
  .select('*', { count: 'exact', head: true })
  .eq('game_id', gameId);
if (setError || setCount !== 2) {
  throw setError ?? new Error(`Expected 2 result sets, received ${setCount}.`);
}

const restoredClient = createClient(url, publishableKey, {
  auth: { persistSession: false },
});
const restoredSession = await restoredClient.auth.signInWithPassword({
  email: organiser.email,
  password: organiser.password,
});
if (restoredSession.error) throw restoredSession.error;
const restoredGame = await restoredClient
  .from('games')
  .select('id, status')
  .eq('id', gameId)
  .single();
if (restoredGame.error || restoredGame.data.status !== 'completed') {
  throw (
    restoredGame.error ??
    new Error('A restored session could not load its game.')
  );
}

const { data: cancelledGameId, error: cancelledGameCreateError } =
  await organiser.client.rpc('create_game', {
    duration_minutes: 60,
    format: 'Social game',
    game_name: 'Cancelled game',
    starts_at: '2026-10-08T18:30:00.000Z',
    venue_name: 'Potato Padel Club',
  });
if (cancelledGameCreateError || !cancelledGameId) {
  throw (
    cancelledGameCreateError ??
    new Error('Could not create cancellation fixture.')
  );
}
const cancellation = await organiser.client.rpc('transition_game_lifecycle', {
  game_id: cancelledGameId,
  lifecycle_command: 'cancel',
  occurred_at: '2026-10-01T12:00:00.000Z',
});
if (cancellation.error || cancellation.data !== 'transitioned') {
  throw (
    cancellation.error ??
    new Error(`Expected transitioned, received ${cancellation.data}.`)
  );
}
const cancelledGame = await organiser.client
  .from('games')
  .select('status, cancelled_at')
  .eq('id', cancelledGameId)
  .single();
if (
  cancelledGame.error ||
  cancelledGame.data.status !== 'cancelled' ||
  !cancelledGame.data.cancelled_at
) {
  throw cancelledGame.error ?? new Error('The cancellation was not persisted.');
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
  'Supabase verification passed: profile trigger, RLS, game creation, joining, lifecycle, results, and session restoration.\n',
);
