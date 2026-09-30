import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SignInScreen from '../src/app/sign-in';
import {
  SessionProvider,
  useSession,
} from '../src/features/authentication/SessionContext';
import type { SessionStorage } from '../src/features/authentication/sessionStorage';

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
  it('creates a persisted demo session', async () => {
    const storage: SessionStorage = {
      clear: jest.fn(() => Promise.resolve()),
      read: jest.fn(() => Promise.resolve(null)),
      write: jest.fn(() => Promise.resolve()),
    };
    const user = userEvent.setup();
    const screen = await render(
      appScreen(
        <SessionProvider storage={storage}>
          <SessionStatus />
        </SessionProvider>,
      ),
    );

    expect(
      await screen.findByRole('header', { name: 'Welcome to Padel Potato' }),
    ).toBeVisible();
    await user.press(
      screen.getByRole('button', { name: 'Continue with demo account' }),
    );

    expect(screen.queryByText('Welcome to Padel Potato')).toBeNull();
    expect(storage.write).toHaveBeenCalledTimes(1);
  });

  it('reports a session storage failure', async () => {
    const storage: SessionStorage = {
      clear: jest.fn(() => Promise.resolve()),
      read: jest.fn(() => Promise.resolve(null)),
      write: jest.fn(() => Promise.reject(new Error('storage unavailable'))),
    };
    const user = userEvent.setup();
    const screen = await render(
      appScreen(
        <SessionProvider storage={storage}>
          <SessionStatus />
        </SessionProvider>,
      ),
    );

    await user.press(
      await screen.findByRole('button', {
        name: 'Continue with demo account',
      }),
    );

    expect(
      await screen.findByRole('alert', { name: /Could not sign in/u }),
    ).toBeVisible();
  });
});
