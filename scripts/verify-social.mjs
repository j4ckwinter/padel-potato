import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const status = JSON.parse(
  execFileSync('npx', ['supabase', 'status', '-o', 'json'], {
    encoding: 'utf8',
  }),
);
assert(
  ['127.0.0.1', 'localhost'].includes(new URL(status.API_URL).hostname),
  'Local database only',
);
async function player() {
  const client = createClient(status.API_URL, status.PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await client.auth.signUp({
    email: `${crypto.randomUUID()}@example.com`,
    password: `${crypto.randomUUID()}Aa1!`,
  });
  assert.ifError(error);
  assert(data.session);
  const saved = await client
    .from('profiles')
    .update({
      display_name: 'Social proof',
      initials: 'SP',
      home_location: 'London',
      level: 'Improver',
      preferred_side: 'Either',
      play_vibe: 'social',
      weekly_frequency: 'one-or-two',
      availability_days: ['weekdays'],
      availability_times: ['evening'],
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', data.user.id);
  assert.ifError(saved.error);
  return { client, id: data.user.id };
}
async function rpc(client, name, args) {
  const { data, error } = await client.rpc(name, args);
  assert.ifError(error);
  return data;
}
const [owner, first, second, third, fourth, outsider] = await Promise.all(
  Array.from({ length: 6 }, player),
);
const directory = await owner.client
  .from('profiles')
  .select('id')
  .not('onboarding_completed_at', 'is', null);
assert.ifError(directory.error);
assert(
  directory.data.some((row) => row.id === first.id),
  'Other real completed profiles are discoverable',
);
await rpc(owner.client, 'set_player_favourite', {
  player_id: first.id,
  should_favourite: true,
});
await rpc(owner.client, 'set_player_favourite', {
  player_id: first.id,
  should_favourite: true,
});
const favourites = await owner.client.from('player_favourites').select('*');
assert.ifError(favourites.error);
assert.equal(
  favourites.data.filter((row) => row.player_id === first.id).length,
  1,
  'Favourite retry is idempotent',
);
const hiddenFavourites = await outsider.client
  .from('player_favourites')
  .select('*')
  .eq('user_id', owner.id);
assert.ifError(hiddenFavourites.error);
assert.equal(
  hiddenFavourites.data.length,
  0,
  'Another account cannot read favourites',
);
await rpc(owner.client, 'set_player_favourite', {
  player_id: first.id,
  should_favourite: false,
});
assert.equal(
  (await owner.client.from('player_favourites').select('*')).data.length,
  0,
);

const gameId = await rpc(owner.client, 'create_game', {
  duration_minutes: 60,
  format: 'Social game',
  game_name: 'Social proof',
  starts_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  venue_name: 'Club',
});
assert.equal(
  await rpc(outsider.client, 'send_game_invitation', {
    game_id: gameId,
    player_id: first.id,
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
  await rpc(owner.client, 'send_game_invitation', {
    game_id: gameId,
    player_id: first.id,
  }),
  'already_invited',
);
const inbox = await first.client
  .from('game_invitations')
  .select('*')
  .eq('game_id', gameId)
  .single();
assert.ifError(inbox.error);
assert.equal(inbox.data.inviter_id, owner.id);
assert.equal(
  (
    await outsider.client
      .from('game_invitations')
      .select('*')
      .eq('game_id', gameId)
  ).data.length,
  0,
);
assert.equal(
  await rpc(outsider.client, 'respond_to_game_invitation', {
    invitation_id: inbox.data.id,
    response: 'accept',
  }),
  'forbidden',
);
assert.equal(
  await rpc(first.client, 'respond_to_game_invitation', {
    invitation_id: inbox.data.id,
    response: 'accept',
  }),
  'accepted',
);
assert.equal(
  await rpc(first.client, 'respond_to_game_invitation', {
    invitation_id: inbox.data.id,
    response: 'accept',
  }),
  'already_responded',
);
assert.equal(
  await rpc(second.client, 'join_game', { game_id: gameId }),
  'joined',
);
for (const recipient of [third, fourth])
  assert.equal(
    await rpc(owner.client, 'send_game_invitation', {
      game_id: gameId,
      player_id: recipient.id,
    }),
    'invited',
  );
const ids = await Promise.all(
  [third, fourth].map(async ({ client }) => {
    const result = await client
      .from('game_invitations')
      .select('id')
      .eq('game_id', gameId)
      .eq('status', 'pending')
      .single();
    assert.ifError(result.error);
    return result.data.id;
  }),
);
const outcomes = await Promise.all(
  [third, fourth].map(({ client }, index) =>
    rpc(client, 'respond_to_game_invitation', {
      invitation_id: ids[index],
      response: 'accept',
    }),
  ),
);
assert.equal(
  outcomes.filter((outcome) => outcome === 'accepted').length,
  1,
  'Only one concurrent invitation claims final place',
);
const participants = await owner.client
  .from('game_participants')
  .select('player_id')
  .eq('game_id', gameId);
assert.ifError(participants.error);
assert.equal(participants.data.length, 4);
const pending = await owner.client
  .from('game_invitations')
  .select('id')
  .eq('game_id', gameId)
  .eq('status', 'pending');
assert.ifError(pending.error);
assert.equal(pending.data.length, 0, 'Full game closes remaining invitations');
console.log(
  'Social verified. Real profiles, private persistent favourites, invitation permissions, retries and concurrent final-place acceptance passed.',
);
