import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { PrimarySectionScreen } from '../src/app-shell/PrimarySectionScreen';
import NotificationsScreen from '../src/app/notifications';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = jest.mocked(useRouter);

function router({ canGoBack = false }: { canGoBack?: boolean } = {}) {
  const value = {
    back: jest.fn(),
    canGoBack: jest.fn(() => canGoBack),
    push: jest.fn(),
    replace: jest.fn(),
  } as unknown as ReturnType<typeof useRouter>;

  mockUseRouter.mockReturnValue(value);
  return value;
}

describe('primary navigation screens', () => {
  it('opens notifications from Home without presenting a fake user name', async () => {
    const navigation = router();
    const user = userEvent.setup();
    const screen = await render(<PrimarySectionScreen page="home" />);

    expect(screen.getByRole('header', { name: 'Padel Potato' })).toBeVisible();
    expect(screen.queryByText('Hi, Alex')).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Notifications' }));

    expect(navigation.push).toHaveBeenCalledWith('/notifications');
  });

  it('returns a directly opened Notifications screen to Home', async () => {
    const navigation = router();
    const user = userEvent.setup();
    const screen = await render(<NotificationsScreen />);

    await user.press(screen.getByRole('button', { name: 'Back' }));

    expect(navigation.back).not.toHaveBeenCalled();
    expect(navigation.replace).toHaveBeenCalledWith('/');
  });
});
