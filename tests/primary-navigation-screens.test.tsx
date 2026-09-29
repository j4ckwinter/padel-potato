import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from '../src/app/(tabs)';
import NotificationsScreen from '../src/app/notifications';
import { flattenedStyle } from './helpers/componentTest';

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
  it('connects Home to the next game and primary actions', async () => {
    const navigation = router();
    const user = userEvent.setup();
    const screen = await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 844, width: 390, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 47 },
        }}
      >
        <HomeScreen />
      </SafeAreaProvider>,
    );

    expect(screen.getByRole('header', { name: 'Padel Potato' })).toBeVisible();
    expect(screen.queryByText('Hi, Alex')).not.toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Coming up' })).toBeVisible();
    expect(screen.getByText('Thursday Evening Padel')).toBeVisible();
    expect(
      screen.getByRole('header', { name: 'Your open game' }),
    ).toBeVisible();
    expect(screen.getByText('Tuesday After-work Padel')).toBeVisible();

    await user.press(screen.getAllByRole('button', { name: 'View game' })[0]);
    expect(navigation.push).toHaveBeenCalledWith({
      params: { gameId: 'demo-my-next-game' },
      pathname: '/games/[gameId]',
    });

    await user.press(screen.getByRole('button', { name: 'Create a game' }));
    expect(navigation.push).toHaveBeenCalledWith('/create');

    await user.press(screen.getByRole('button', { name: 'Find a game' }));
    expect(navigation.push).toHaveBeenCalledWith('/games');

    await user.press(screen.getByRole('button', { name: 'Notifications' }));
    expect(navigation.push).toHaveBeenCalledWith('/notifications');

    expect(
      flattenedStyle(
        screen.getByTestId('home-scroll').props.contentContainerStyle,
      ).paddingBottom,
    ).toBe(146);
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
