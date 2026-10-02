import { describe, expect, it, jest } from '@jest/globals';
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
      screen.getByText(
        /Sign in or create an account with email, Apple or Google/u,
      ),
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
  it('submits trimmed email and preserves password whitespace', async () => {
    const gateway = createAuthGateway(null);
    const user = userEvent.setup();
    const screen = await render(
      appScreen(
        <SessionProvider gateway={gateway}>
          <SignInScreen />
        </SessionProvider>,
      ),
    );
    const submit = screen.getByRole('button', { name: 'Sign in with email' });
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText('Email'), ' player@example.com ');
    await user.type(screen.getByLabelText('Password'), ' password ');
    expect(submit).toBeEnabled();
    await user.press(submit);
    expect(gateway.signIn).toHaveBeenCalledWith({
      method: 'email',
      email: 'player@example.com',
      password: ' password ',
    });
  });

  it('keeps all sign-in actions and credentials disabled while email is pending', async () => {
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
    await user.type(screen.getByLabelText('Email'), 'player@example.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.press(
      screen.getByRole('button', { name: 'Sign in with email' }),
    );
    for (const name of [
      'Continue with Google',
      'Continue with Apple',
      'Sign in with email',
    ]) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
    expect(
      screen.getByRole('button', { name: 'Sign in with email', busy: true }),
    ).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    await act(async () =>
      complete({ status: 'error', message: 'private backend detail' }),
    );
    expect(
      screen.getByRole('alert', {
        name: 'Could not sign in. Check your email and password and try again.',
      }),
    ).toBeVisible();
    expect(screen.queryByText('private backend detail')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Sign in with email' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Continue with Apple' }),
    ).toBeEnabled();
  });

  it('clears pending and allows retry after a thrown credential failure', async () => {
    const signIn = jest
      .fn<() => Promise<AuthMutationResult>>()
      .mockRejectedValueOnce(new Error('private backend detail'))
      .mockResolvedValueOnce({ status: 'success' });
    const gateway = { ...createAuthGateway(null), signIn };
    const user = userEvent.setup();
    const screen = await render(
      appScreen(
        <SessionProvider gateway={gateway}>
          <SignInScreen />
        </SessionProvider>,
      ),
    );
    await user.type(screen.getByLabelText('Email'), 'player@example.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.press(
      screen.getByRole('button', { name: 'Sign in with email' }),
    );
    expect(
      await screen.findByRole('alert', { name: /Could not sign in/u }),
    ).toBeVisible();
    expect(screen.queryByText('private backend detail')).toBeNull();
    await user.press(
      screen.getByRole('button', { name: 'Sign in with email' }),
    );
    expect(signIn).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('registers an email account and explains confirmation without signing in', async () => {
    const gateway = createAuthGateway(null);
    const user = userEvent.setup();
    const screen = await render(
      appScreen(
        <SessionProvider gateway={gateway}>
          <SignInScreen />
        </SessionProvider>,
      ),
    );
    await user.press(screen.getByRole('button', { name: 'Create an account' }));
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'new-password');
    await user.press(screen.getByRole('button', { name: 'Create account' }));
    expect(gateway.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'new-password',
    });
    expect(
      await screen.findByText(/check your inbox to confirm it/u),
    ).toBeVisible();
    expect(gateway.signIn).not.toHaveBeenCalled();
  });

  it('requests a reset and gives the same inbox guidance without exposing account existence', async () => {
    const gateway = createAuthGateway(null);
    const user = userEvent.setup();
    const screen = await render(
      appScreen(
        <SessionProvider gateway={gateway}>
          <SignInScreen />
        </SessionProvider>,
      ),
    );
    await user.press(screen.getByRole('button', { name: 'Forgot password?' }));
    expect(screen.queryByLabelText('Password')).toBeNull();
    await user.type(screen.getByLabelText('Email'), 'player@example.com');
    await user.press(
      screen.getByRole('button', { name: 'Send password reset link' }),
    );
    expect(gateway.requestPasswordReset).toHaveBeenCalledWith(
      'player@example.com',
    );
    expect(
      await screen.findByText(
        'If an account exists for this email, you will receive a password reset link.',
      ),
    ).toBeVisible();
  });
});
