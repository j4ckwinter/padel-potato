import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
const status = execFileSync('npx', ['supabase', 'status', '-o', 'env'], {
  encoding: 'utf8',
});
const value = (name) => {
  const match = new RegExp(`^${name}="([^"]+)"$`, 'mu').exec(status);
  assert(match, `Missing ${name}`);
  return match[1];
};
const url = value('API_URL');
assert(
  new URL(url).hostname === '127.0.0.1' ||
    new URL(url).hostname === 'localhost',
  'Local database only',
);
const key = value('PUBLISHABLE_KEY');
async function user() {
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signUp({
    email: `${crypto.randomUUID()}@example.com`,
    password: `${crypto.randomUUID()}Aa1!`,
  });
  assert.ifError(error);
  assert(data.session);
  return { client, id: data.user.id };
}
async function rpc(client, name, args) {
  const { data, error } = await client.rpc(name, args);
  assert.ifError(error);
  return data;
}
const owner = await user();
const first = await user();
const second = await user();
const third = await user();
const future = (days) => new Date(Date.now() + days * 86400000).toISOString();
const gameId = await rpc(owner.client, 'create_game', {
  duration_minutes: 60,
  format: 'Social game',
  game_name: 'Management proof',
  starts_at: future(7),
  venue_name: 'Club',
});
assert.equal(
  await rpc(owner.client, 'leave_game', { game_id: gameId }),
  'organiser',
);
assert.equal(
  await rpc(first.client, 'reschedule_game', {
    game_id: gameId,
    starts_at: future(8),
  }),
  'forbidden',
);
assert.equal(
  await rpc(owner.client, 'send_game_invitation', {
    game_id: gameId,
    player_id: first.id,
  }),
  'invited',
);
assert.equal(
  await rpc(owner.client, 'reschedule_game', {
    game_id: gameId,
    starts_at: future(8),
  }),
  'rescheduled',
);
const invitations = await first.client
  .from('game_invitations')
  .select('status')
  .eq('game_id', gameId);
assert.ifError(invitations.error);
assert.equal(invitations.data[0].status, 'closed');
for (const player of [first, second, third])
  assert.equal(
    await rpc(player.client, 'join_game', { game_id: gameId }),
    'joined',
  );
assert.equal(
  await rpc(owner.client, 'reschedule_game', {
    game_id: gameId,
    starts_at: future(9),
  }),
  'players_joined',
);
const leaves = await Promise.all(
  [first, second].map((player) =>
    rpc(player.client, 'leave_game', { game_id: gameId }),
  ),
);
assert.deepEqual(leaves, ['left', 'left']);
const remaining = await owner.client
  .from('game_participants')
  .select('player_id, position')
  .eq('game_id', gameId)
  .order('position');
assert.ifError(remaining.error);
assert.deepEqual(remaining.data, [
  { player_id: owner.id, position: 1 },
  { player_id: third.id, position: 2 },
]);
assert.equal(
  await rpc(first.client, 'leave_game', { game_id: gameId }),
  'already_left',
);
assert.equal(
  await rpc(owner.client, 'transition_game_lifecycle', {
    game_id: gameId,
    lifecycle_command: 'cancel',
    occurred_at: new Date().toISOString(),
  }),
  'transitioned',
);
assert.equal(
  await rpc(third.client, 'leave_game', { game_id: gameId }),
  'unavailable',
);
assert.equal(
  await rpc(owner.client, 'reschedule_game', {
    game_id: gameId,
    starts_at: future(9),
  }),
  'unavailable',
);
console.log(
  'Game management verified. Ordered concurrent departures, idempotent leave, organiser authority, reschedule consent and invitation closure passed.',
);
