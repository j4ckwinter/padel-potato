import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import {
  SessionProvider,
  useSession,
} from '../src/features/authentication/SessionContext';
import { createDemoSession } from '../src/features/authentication/session';
import type { SessionStorage } from '../src/features/authentication/sessionStorage';

function SessionProbe() {
  const { signInDemo, signOut, state } = useSession();
  return (
    <View>
      <Text>{state.status}</Text>
      <Pressable
        accessibilityLabel="Sign in demo"
        accessibilityRole="button"
        onPress={() => void signInDemo()}
      />
      <Pressable
        accessibilityLabel="Sign out"
        accessibilityRole="button"
        onPress={() => void signOut()}
      />
    </View>
  );
}

describe('session provider', () => {
  it('restores a saved session and clears it on sign out', async () => {
    const session = createDemoSession(new Date('2026-09-30T12:00:00.000Z'));
    const storage: SessionStorage = {
      clear: jest.fn(() => Promise.resolve()),
      read: jest.fn(() => Promise.resolve(session)),
      write: jest.fn(() => Promise.resolve()),
    };
    const user = userEvent.setup();
    const screen = await render(
      <SessionProvider storage={storage}>
        <SessionProbe />
      </SessionProvider>,
    );

    expect(await screen.findByText('signedIn')).toBeVisible();
    await user.press(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByText('signedOut')).toBeVisible();
    expect(storage.clear).toHaveBeenCalledTimes(1);
  });

  it('persists a new demo session before signing in', async () => {
    const storage: SessionStorage = {
      clear: jest.fn(() => Promise.resolve()),
      read: jest.fn(() => Promise.resolve(null)),
      write: jest.fn(() => Promise.resolve()),
    };
    const user = userEvent.setup();
    const screen = await render(
      <SessionProvider storage={storage}>
        <SessionProbe />
      </SessionProvider>,
    );

    expect(await screen.findByText('signedOut')).toBeVisible();
    await user.press(screen.getByRole('button', { name: 'Sign in demo' }));

    expect(await screen.findByText('signedIn')).toBeVisible();
    expect(storage.write).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'demo',
        userId: 'alex-morgan',
        version: 1,
      }),
    );
  });
});
