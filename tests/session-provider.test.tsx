import { describe, expect, it, jest } from '@jest/globals';
import { act, render, userEvent, waitFor } from '@testing-library/react-native';
import { Linking, Pressable, Text, View } from 'react-native';

import {
  SessionProvider,
  useSession,
} from '../src/features/authentication/SessionContext';
import type { Session } from '../src/features/authentication/session';
import { createAuthGateway, testSession } from './helpers/authGateway';

function SessionProbe() {
  const { signIn, signOut, state } = useSession();
  return (
    <View>
      <Text>{state.status}</Text>
      {'session' in state ? <Text>{state.session.userId}</Text> : null}
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
  it('opens a cold-start recovery link without entering a signed-in product state', async () => {
    const link =
      'padel-potato://auth-callback?flow=recovery#access_token=a&refresh_token=r&type=recovery';
    const initial = jest
      .spyOn(Linking, 'getInitialURL')
      .mockResolvedValueOnce(link);
    const gateway = createAuthGateway(null);
    gateway.restoreSession
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...testSession, recovery: true });
    const screen = await render(
      <SessionProvider gateway={gateway}>
        <SessionProbe />
      </SessionProvider>,
    );
    expect(await screen.findByText('passwordRecovery')).toBeVisible();
    expect(screen.queryByText('signedIn')).toBeNull();
    expect(gateway.handleEmailCallback).toHaveBeenCalledWith(link);
    initial.mockResolvedValue(null);
  });

  it('restores an unfinished recovery session and allows cancellation', async () => {
    const gateway = createAuthGateway({ ...testSession, recovery: true });
    const user = userEvent.setup();
    const screen = await render(
      <SessionProvider gateway={gateway}>
        <SessionProbe />
      </SessionProvider>,
    );
    expect(await screen.findByText('passwordRecovery')).toBeVisible();
    await user.press(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByText('signedOut')).toBeVisible();
  });
  it('does not overwrite a later account event with a delayed callback restore', async () => {
    const link =
      'padel-potato://auth-callback?flow=recovery#access_token=a&refresh_token=r';
    const initial = jest
      .spyOn(Linking, 'getInitialURL')
      .mockResolvedValueOnce(link);
    let emit: (session: Session | null) => void = () => undefined;
    let completeRestore: (session: Session | null) => void = () => undefined;
    const gateway = {
      ...createAuthGateway(null),
      restoreSession: jest
        .fn<() => Promise<Session | null>>()
        .mockResolvedValueOnce(null)
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              completeRestore = resolve;
            }),
        ),
      subscribe: (listener: (session: Session | null) => void) => {
        emit = listener;
        return () => undefined;
      },
    };
    const screen = await render(
      <SessionProvider gateway={gateway}>
        <SessionProbe />
      </SessionProvider>,
    );
    await waitFor(() =>
      expect(gateway.restoreSession).toHaveBeenCalledTimes(2),
    );
    await act(async () => {
      emit({ kind: 'supabase', userId: 'new-account' });
      completeRestore({ ...testSession, recovery: true });
    });
    expect(screen.getByText('new-account')).toBeVisible();
    expect(screen.getByText('signedIn')).toBeVisible();
    expect(screen.queryByText('passwordRecovery')).toBeNull();
    initial.mockResolvedValue(null);
  });
});
