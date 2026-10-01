import { describe, expect, it } from '@jest/globals';
import { act, render, userEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SignInScreen from '../src/app/sign-in';
import {
  SessionProvider,
  useSession,
} from '../src/features/authentication/SessionContext';
import { createAuthGateway } from './helpers/authGateway';
import type { AuthMutationResult } from '../src/features/authentication/authGateway';

function SessionStatus() {
  const { state } = useSession();
  return state.status === 'signedIn' ? null : <SignInScreen />;
}

function appScreen(children: React.ReactNode) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 34, left: 0, right: 0, top: 47 },
      }}
    >
      {children}
    </SafeAreaProvider>
  );
}

describe('sign-in screen', () => {
  it('welcomes players and explains account access', async () => {
    const screen = await render(
      appScreen(
        <SessionProvider gateway={createAuthGateway(null)}>
          <SignInScreen />
        </SessionProvider>,
      ),
    );

    expect(
      screen.getByRole('header', { name: 'Find your next padel game' }),
    ).toBeVisible();
    expect(screen.getByText('Ready for your next match?')).toBeVisible();
    expect(
      screen.getByText(/Sign in or create your profile with Apple or Google/u),
    ).toBeVisible();
  });

  it('disables both providers while pending and restores them after cancellation', async () => {
    let complete: (result: AuthMutationResult) => void = () => undefined;
    const gateway = {
      ...createAuthGateway(null),
      signIn: () =>
        new Promise<AuthMutationResult>((resolve) => {
          complete = resolve;
        }),
    };
    const user = userEvent.setup();
    const screen = await render(
      appScreen(
        <SessionProvider gateway={gateway}>
          <SignInScreen />
        </SessionProvider>,
      ),
    );

    await user.press(
      screen.getByRole('button', { name: 'Continue with Google' }),
    );
    expect(
      screen.getByRole('button', { name: 'Continue with Google' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Continue with Apple' }),
    ).toBeDisabled();

    await act(async () => complete({ status: 'cancelled' }));
    expect(
      screen.getByRole('button', { name: 'Continue with Google' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Continue with Apple' }),
    ).toBeEnabled();
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('starts Apple sign-in', async () => {
    const gateway = createAuthGateway(null);
    const user = userEvent.setup();
    const screen = await render(
      appScreen(
        <SessionProvider gateway={gateway}>
          <SessionStatus />
        </SessionProvider>,
      ),
    );

    await user.press(
      await screen.findByRole('button', { name: 'Continue with Apple' }),
    );

    expect(gateway.signIn).toHaveBeenCalledWith('apple');
    expect(
      screen.queryByRole('header', { name: 'Find your next padel game' }),
    ).toBeNull();
  });

  it('starts Google sign-in', async () => {
    const gateway = createAuthGateway(null);
    const user = userEvent.setup();
    const screen = await render(
      appScreen(
        <SessionProvider gateway={gateway}>
          <SessionStatus />
        </SessionProvider>,
      ),
    );

    await user.press(
      await screen.findByRole('button', { name: 'Continue with Google' }),
    );

    expect(gateway.signIn).toHaveBeenCalledWith('google');
  });

  it('reports an identity-provider failure', async () => {
    const gateway = createAuthGateway(null, {
      message: 'Provider unavailable',
      status: 'error',
    });
    const user = userEvent.setup();
    const screen = await render(
      appScreen(
        <SessionProvider gateway={gateway}>
          <SessionStatus />
        </SessionProvider>,
      ),
    );

    await user.press(
      await screen.findByRole('button', { name: 'Continue with Apple' }),
    );

    expect(
      await screen.findByRole('alert', { name: /Could not sign in/u }),
    ).toBeVisible();
  });
});
