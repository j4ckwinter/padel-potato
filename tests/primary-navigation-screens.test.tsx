import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from '../src/app/(tabs)';
import NotificationsScreen from '../src/app/notifications';
import { demoCurrentGamePlayer } from '../src/features/demo/demoData';
import {
  joinGame,
  transitionGameLifecycle,
} from '../src/features/games/gameRepository';
import { flattenedStyle } from './helpers/componentTest';

jest.mock('expo-router', () => {
  const focusedCallbacks = new WeakSet<() => void>();
  return {
    useFocusEffect: (callback: () => void) => {
      if (!focusedCallbacks.has(callback)) {
        focusedCallbacks.add(callback);
        callback();
      }
    },
    useRouter: jest.fn(),
  };
});

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
  it('connects Home to games and notifications', async () => {
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
    expect(await screen.findByText('Thursday Evening Padel')).toBeVisible();
    expect(
      screen.getByRole('header', { name: 'Your open games' }),
    ).toBeVisible();
    expect(screen.getByText('Tuesday After-work Padel')).toBeVisible();
    expect(screen.getByText('Wednesday Lunch Padel')).toBeVisible();
    expect(screen.queryByText('Friday Evening Padel')).not.toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'View all your games' }),
    ).toBeVisible();
    expect(
      screen.getByRole('header', { name: 'Recommended for you' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('header', { name: 'Play padel' }),
    ).not.toBeOnTheScreen();
    expect(screen.getByText('Wednesday Evening Padel')).toBeVisible();
    expect(screen.getByText('Saturday Morning Padel')).toBeVisible();
    expect(screen.queryByText('Sunday Social Padel')).not.toBeOnTheScreen();

    await user.press(screen.getAllByRole('button', { name: 'View game' })[0]);
    expect(navigation.push).toHaveBeenCalledWith({
      params: { gameId: 'demo-my-next-game' },
      pathname: '/games/[gameId]',
    });

    await user.press(screen.getByRole('button', { name: 'View all games' }));
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

  it('shows two open games with a plural heading', async () => {
    await joinGame('demo-shoreditch-evening', demoCurrentGamePlayer);
    router();

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

    expect(await screen.findByText('Wednesday Evening Padel')).toBeVisible();
    expect(screen.getAllByText('Wednesday Evening Padel')).toHaveLength(1);
    expect(
      screen.getByRole('header', { name: 'Your open games' }),
    ).toBeVisible();
  });

  it('limits open games on Home and links to the complete collection', async () => {
    await joinGame('demo-canary-social', demoCurrentGamePlayer);
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

    expect(await screen.findByText('Wednesday Evening Padel')).toBeVisible();
    expect(screen.getByText('Sunday Social Padel')).toBeVisible();
    expect(
      screen.queryByText('Tuesday After-work Padel'),
    ).not.toBeOnTheScreen();

    await user.press(
      screen.getByRole('button', { name: 'View all your games' }),
    );
    expect(navigation.push).toHaveBeenCalledWith({
      params: { collection: 'mine' },
      pathname: '/games',
    });
  });

  it('hides Coming up when the player has no next game', async () => {
    await transitionGameLifecycle('demo-my-next-game', {
      at: '2026-10-01T20:30:00.000Z',
      type: 'finish',
    });
    router();

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

    expect(await screen.findByText('Recommended for you')).toBeVisible();
    expect(
      screen.queryByRole('header', { name: 'Coming up' }),
    ).not.toBeOnTheScreen();
  });
});
