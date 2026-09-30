import { describe, expect, it } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SignInScreen from '../src/app/sign-in';
import {
  SessionProvider,
  useSession,
} from '../src/features/authentication/SessionContext';
import { createAuthGateway } from './helpers/authGateway';

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
    expect(screen.queryByText('Welcome to Padel Potato')).toBeNull();
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
