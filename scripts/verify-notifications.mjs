import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const status = JSON.parse(
  execFileSync('npx', ['supabase', 'status', '-o', 'json'], {
    encoding: 'utf8',
  }),
);
assert(
  ['localhost', '127.0.0.1'].includes(new URL(status.API_URL).hostname),
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
  return { client, id: data.user.id };
}
async function rpc(player, name, args) {
  const { data, error } = await player.client.rpc(name, args);
  assert.ifError(error);
  return data;
}
async function feed(player, gameId) {
  const { data, error } = await player.client
    .from('activity_notifications')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  assert.ifError(error);
  return data;
}
const [owner, first, second, third, outsider] = await Promise.all(
  Array.from({ length: 5 }, player),
);
async function game() {
  return rpc(owner, 'create_game', {
    duration_minutes: 60,
    format: 'Social game',
    game_name: 'Notification proof',
    starts_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    venue_name: 'Club',
  });
}
const id = await game();
assert.deepEqual(
  await feed(owner, id),
  [],
  'Organiser creation has no join event',
);
assert.equal(
  await rpc(owner, 'send_game_invitation', {
    game_id: id,
    player_id: first.id,
  }),
  'invited',
);
assert.equal(
  await rpc(owner, 'send_game_invitation', {
    game_id: id,
    player_id: first.id,
  }),
  'already_invited',
);
const [invitation] = await feed(first, id);
const foreignInvitation = await outsider.client
  .from('game_invitations')
  .select('*')
  .eq('invitee_id', outsider.id)
  .eq('id', invitation.invitation_id)
  .maybeSingle();
assert.ifError(foreignInvitation.error);
assert.equal(
  foreignInvitation.data,
  null,
  'Foreign exact invitation lookup is unavailable',
);
assert.equal(invitation.kind, 'invitation');
assert.equal(invitation.read_at, null);
assert.equal(
  (await feed(first, id)).length,
  1,
  'Invitation retry emits one event',
);
assert.deepEqual(await feed(outsider, id), [], 'Recipient-only RLS');
const anonymous = createClient(status.API_URL, status.PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});
assert(
  (await anonymous.from('activity_notifications').select('*')).error,
  'Anonymous access denied',
);
assert(
  (
    await first.client.from('activity_notifications').insert({
      recipient_id: outsider.id,
      kind: 'cancelled',
      game_id: id,
      title: 'Fake',
      message: 'Fake',
    })
  ).error,
  'Direct spoofed writes denied',
);
assert(
  (
    await first.client
      .from('activity_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', invitation.id)
  ).error,
  'Direct updates denied',
);
assert.equal(
  await rpc(outsider, 'mark_activity_notification_read', {
    notification_id: invitation.id,
  }),
  false,
);
assert.equal(
  await rpc(first, 'mark_activity_notification_read', {
    notification_id: invitation.id,
  }),
  true,
);
const readAt = (await feed(first, id))[0].read_at;
assert(readAt);
assert.equal(
  await rpc(first, 'mark_activity_notification_read', {
    notification_id: invitation.id,
  }),
  true,
);
assert.equal(
  (await feed(first, id))[0].read_at,
  readAt,
  'Read retries preserve first read time',
);
assert.equal(
  await rpc(first, 'respond_to_game_invitation', {
    invitation_id: invitation.invitation_id,
    response: 'accept',
  }),
  'accepted',
);
assert.equal(
  (await feed(first, id))[0].read_at,
  readAt,
  'Responding does not rewrite read state',
);
assert.equal((await feed(owner, id))[0].kind, 'player_joined');
assert.equal(await rpc(second, 'join_game', { game_id: id }), 'joined');
assert((await feed(owner, id)).some((item) => item.kind === 'spot_remaining'));
assert.equal(await rpc(third, 'join_game', { game_id: id }), 'joined');
for (const player of [owner, first, second, third])
  assert.equal(
    (await feed(player, id)).filter((item) => item.kind === 'game_confirmed')
      .length,
    1,
  );
const before = (await feed(owner, id)).length;
assert.equal(await rpc(third, 'join_game', { game_id: id }), 'already_joined');
assert.equal(
  (await feed(owner, id)).length,
  before,
  'Join retry produces no duplicate',
);
assert.equal(await rpc(first, 'leave_game', { game_id: id }), 'left');
assert.equal(
  (await feed(owner, id)).length,
  before,
  'Leave reordering produces no join event',
);

const moved = await game();
await rpc(owner, 'send_game_invitation', {
  game_id: moved,
  player_id: first.id,
});
await rpc(owner, 'reschedule_game', {
  game_id: moved,
  starts_at: new Date(Date.now() + 8 * 86400000).toISOString(),
});
assert(
  (await feed(first, moved)).some((item) => item.kind === 'game_updated'),
  'Pending invitee receives update before invitation closes',
);
const closed = await first.client
  .from('game_invitations')
  .select('status')
  .eq('game_id', moved)
  .single();
assert.equal(closed.data.status, 'closed');
assert.deepEqual(await feed(owner, moved), [], 'Updating actor excluded');
const cancelled = await game();
await rpc(owner, 'send_game_invitation', {
  game_id: cancelled,
  player_id: first.id,
});
assert.equal(
  await rpc(owner, 'transition_game_lifecycle', {
    game_id: cancelled,
    lifecycle_command: 'cancel',
    occurred_at: new Date().toISOString(),
    result_data: null,
  }),
  'transitioned',
);
assert(
  (await feed(first, cancelled)).some((item) => item.kind === 'cancelled'),
  'Pending invitee receives cancellation before closure',
);
assert.deepEqual(await feed(owner, cancelled), [], 'Cancelling actor excluded');
assert(
  !(await feed(first, cancelled)).some((item) => item.kind === 'booking'),
  'No invented booking event',
);

const resultGame = await game();
for (const player of [first, second, third])
  await rpc(player, 'join_game', { game_id: resultGame });
assert.equal(
  await rpc(owner, 'transition_game_lifecycle', {
    game_id: resultGame,
    lifecycle_command: 'finish',
    occurred_at: new Date().toISOString(),
    result_data: null,
  }),
  'transitioned',
);
const teams = [
  [owner.id, first.id],
  [second.id, third.id],
];
assert.equal(
  await rpc(owner, 'transition_game_lifecycle', {
    game_id: resultGame,
    lifecycle_command: 'record_result',
    occurred_at: new Date().toISOString(),
    result_data: {
      sets: [
        [6, 6],
        [6, 4],
      ],
      teams,
    },
  }),
  'invalid_transition',
);
assert(
  !(await feed(first, resultGame)).some((item) => item.kind === 'result_added'),
  'Invalid result has no activity',
);
assert.equal(
  await rpc(owner, 'transition_game_lifecycle', {
    game_id: resultGame,
    lifecycle_command: 'record_result',
    occurred_at: new Date().toISOString(),
    result_data: {
      sets: [
        [6, 4],
        [7, 5],
      ],
      teams,
    },
  }),
  'transitioned',
);
for (const player of [first, second, third])
  assert.equal(
    (await feed(player, resultGame)).filter(
      (item) => item.kind === 'result_added',
    ).length,
    1,
  );
assert(
  !(await feed(owner, resultGame)).some((item) => item.kind === 'result_added'),
  'Result submitting actor excluded',
);

const sql = (query) =>
  execFileSync(
    'docker',
    [
      'exec',
      '-i',
      'supabase_db_padel',
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      '-Atc',
      query,
    ],
    { encoding: 'utf8' },
  ).trim();
const invariantGame = await game();
assert.equal(
  sql(
    `select count(*) from public.activity_notifications where game_id = '${invariantGame}'`,
  ),
  '0',
);
sql(
  `update public.games set starts_at = starts_at where id = '${invariantGame}'`,
);
assert.deepEqual(
  await feed(owner, invariantGame),
  [],
  'Identical schedule update produces no event',
);
const backfillSql = `
insert into public.activity_notifications(recipient_id, kind, game_id, invitation_id, title, message, created_at)
  select i.invitee_id, 'invitation', i.game_id, i.id, 'Game invitation', p.display_name || ' invited you to ' || g.name || ' at ' || g.venue_name || '.', i.created_at
  from public.game_invitations i join public.games g on g.id = i.game_id join public.profiles p on p.id = i.inviter_id
  on conflict do nothing;`;
sql(`begin; alter table public.game_invitations disable trigger invitations_activity;
  insert into public.game_invitations(game_id, inviter_id, invitee_id, status, created_at, responded_at)
  values('${invariantGame}', '${owner.id}', '${first.id}', 'declined', '2026-01-02T03:04:05Z', '2026-01-03T03:04:05Z');
  ${backfillSql} ${backfillSql} alter table public.game_invitations enable trigger invitations_activity; commit;`);
const historical = await feed(first, invariantGame);
assert.equal(historical.length, 1, 'Backfill retry preserves unique event');
assert.equal(
  new Date(historical[0].created_at).toISOString(),
  '2026-01-02T03:04:05.000Z',
);
assert.equal(
  historical[0].read_at,
  null,
  'An answered invitation is not evidence it was read',
);
console.log(
  'Notifications verified. Recipient security, atomic lifecycle events, backfill timestamps, unread semantics, read persistence and mutation retries passed.',
);
