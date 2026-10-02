import { describe, expect, it } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PasswordRecoveryScreen from '../src/app/password-recovery';
import { SessionProvider } from '../src/features/authentication/SessionContext';
import { createAuthGateway, testSession } from './helpers/authGateway';

function app(gateway: ReturnType<typeof createAuthGateway>) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 34, left: 0, right: 0, top: 47 },
      }}
    >
      <SessionProvider gateway={gateway}>
        <PasswordRecoveryScreen />
      </SessionProvider>
    </SafeAreaProvider>
  );
}

describe('password recovery screen', () => {
  it('requires matching passwords before updating the account', async () => {
    const gateway = createAuthGateway({ ...testSession, recovery: true });
    const user = userEvent.setup();
    const screen = await render(app(gateway));
    const save = screen.getByRole('button', { name: 'Save new password' });
    expect(save).toBeDisabled();
    await user.type(screen.getByLabelText('New password'), 'new-password');
    await user.type(screen.getByLabelText('Confirm password'), 'different');
    expect(save).toBeDisabled();
    await user.clear(screen.getByLabelText('Confirm password'));
    await user.type(screen.getByLabelText('Confirm password'), 'new-password');
    await user.press(save);
    expect(gateway.updatePassword).toHaveBeenCalledWith('new-password');
  });

  it('keeps a failed reset retryable and cancels by signing out', async () => {
    const gateway = createAuthGateway({ ...testSession, recovery: true });
    gateway.updatePassword.mockResolvedValueOnce({
      status: 'error',
      message: 'Could not update your password. Try again.',
    });
    const user = userEvent.setup();
    const screen = await render(app(gateway));
    await user.type(screen.getByLabelText('New password'), 'new-password');
    await user.type(screen.getByLabelText('Confirm password'), 'new-password');
    await user.press(screen.getByRole('button', { name: 'Save new password' }));
    expect(
      await screen.findByRole('alert', {
        name: /Could not update your password/u,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Save new password' }),
    ).toBeEnabled();
    await user.press(
      screen.getByRole('button', { name: 'Cancel and sign out' }),
    );
    expect(gateway.signOut).toHaveBeenCalledTimes(1);
  });
});
