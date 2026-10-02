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
const client = () =>
  createClient(status.API_URL, status.PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
const email = `recovery-${crypto.randomUUID()}@example.com`;
const originalPassword = `${crypto.randomUUID()}Aa1!`;
const replacementPassword = `${crypto.randomUUID()}Aa1!`;
const original = client();
const registration = await original.auth.signUp({
  email,
  password: originalPassword,
});
assert.ifError(registration.error);
assert(registration.data.session, 'Local signup establishes a session');
const profile = await original
  .from('profiles')
  .select('id')
  .eq('id', registration.data.user.id)
  .single();
assert.ifError(profile.error);
assert.equal(profile.data.id, registration.data.user.id);
assert.ifError((await original.auth.signOut()).error);
const reset = await original.auth.resetPasswordForEmail(email, {
  redirectTo: 'padel-potato://auth-callback?flow=recovery',
});
assert.ifError(reset.error);

const mailbox = new URL(status.MAILPIT_URL ?? status.INBUCKET_URL);
assert(
  ['127.0.0.1', 'localhost'].includes(mailbox.hostname),
  'Local mail only',
);
let message;
for (let attempt = 0; attempt < 20; attempt++) {
  const list = await (await fetch(new URL('/api/v1/messages', mailbox))).json();
  const found = list.messages.find((entry) =>
    entry.To.some((recipient) => recipient.Address === email),
  );
  if (found) {
    message = await (
      await fetch(new URL(`/api/v1/message/${found.ID}`, mailbox))
    ).json();
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
}
assert(message, 'Reset request delivers a recovery email to local Mailpit');
const match = /href="([^"]+)"/u.exec(message.HTML);
assert(match, 'Recovery email contains verification link');
const verificationUrl = new URL(match[1].replaceAll('&amp;', '&'));
assert.equal(verificationUrl.origin, new URL(status.API_URL).origin);
const verified = await fetch(verificationUrl, { redirect: 'manual' });
assert.equal(verified.status, 303);
const callback = new URL(verified.headers.get('location'));
assert.equal(callback.protocol, 'padel-potato:');
assert.equal(callback.hostname, 'auth-callback');
assert.equal(callback.searchParams.get('flow'), 'recovery');
const tokens = new URLSearchParams(callback.hash.slice(1));
assert.equal(tokens.get('type'), 'recovery');
assert(
  tokens.get('access_token') && tokens.get('refresh_token'),
  'Recovery callback has session tokens',
);
const recovered = client();
assert.ifError(
  (
    await recovered.auth.setSession({
      access_token: tokens.get('access_token'),
      refresh_token: tokens.get('refresh_token'),
    })
  ).error,
);
assert.ifError(
  (await recovered.auth.updateUser({ password: replacementPassword })).error,
);
assert.ifError((await recovered.auth.signOut()).error);
assert(
  (
    await client().auth.signInWithPassword({
      email,
      password: originalPassword,
    })
  ).error,
  'Old password no longer signs in',
);
const changed = await client().auth.signInWithPassword({
  email,
  password: replacementPassword,
});
assert.ifError(changed.error);
assert.equal(changed.data.user.id, registration.data.user.id);
console.log(
  'Auth recovery verified. Signup profile, real reset email, native redirect, recovery session and changed password passed.',
);
