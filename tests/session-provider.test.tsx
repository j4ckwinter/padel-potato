import { describe, expect, it } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import {
  SessionProvider,
  useSession,
} from '../src/features/authentication/SessionContext';
import { createAuthGateway, testSession } from './helpers/authGateway';

function SessionProbe() {
  const { signIn, signOut, state } = useSession();
  return (
    <View>
      <Text>{state.status}</Text>
      <Pressable
        accessibilityLabel="Sign in with Google"
        accessibilityRole="button"
        onPress={() => void signIn('google')}
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
  it('restores a Supabase session and reacts to sign out', async () => {
    const gateway = createAuthGateway(testSession);
    const user = userEvent.setup();
    const screen = await render(
      <SessionProvider gateway={gateway}>
        <SessionProbe />
      </SessionProvider>,
    );

    expect(await screen.findByText('signedIn')).toBeVisible();
    await user.press(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByText('signedOut')).toBeVisible();
    expect(gateway.signOut).toHaveBeenCalledTimes(1);
  });

  it('signs in through the selected identity provider', async () => {
    const gateway = createAuthGateway(null);
    const user = userEvent.setup();
    const screen = await render(
      <SessionProvider gateway={gateway}>
        <SessionProbe />
      </SessionProvider>,
    );

    expect(await screen.findByText('signedOut')).toBeVisible();
    await user.press(
      screen.getByRole('button', { name: 'Sign in with Google' }),
    );

    expect(await screen.findByText('signedIn')).toBeVisible();
    expect(gateway.signIn).toHaveBeenCalledWith('google');
  });
});
