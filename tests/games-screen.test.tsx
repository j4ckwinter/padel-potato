import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GamesScreen from '../src/app/(tabs)/games';
import { demoCurrentGamePlayer } from '../src/features/demo/demoData';
import { joinGame } from '../src/features/games/gameRepository';
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

async function renderGamesScreen() {
  const push = jest.fn();
  mockUseRouter.mockReturnValue({ push } as unknown as ReturnType<
    typeof useRouter
  >);

  return {
    push,
    screen: await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 844, width: 390, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 47 },
        }}
      >
        <GamesScreen />
      </SafeAreaProvider>,
    ),
  };
}

describe('games screen', () => {
  it('browses discover and personal game collections', async () => {
    const { push, screen } = await renderGamesScreen();
    const user = userEvent.setup();

    expect(screen.getByRole('header', { name: 'Games' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Discover' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'My games' })).not.toBeSelected();
    expect(screen.getByLabelText('Venue')).toHaveProp(
      'placeholder',
      'Search by venue',
    );
    expect(
      screen.getByRole('header', { name: 'Open games near you' }),
    ).toBeVisible();
    expect(await screen.findByText('Wednesday Evening Padel')).toBeVisible();
    expect(screen.getByText('Saturday Morning Padel')).toBeVisible();
    expect(screen.getByText('Sunday Social Padel')).toBeVisible();
    expect(screen.queryByText('Thursday Evening Padel')).not.toBeOnTheScreen();
    expect(
      screen.getAllByTestId('avatar-group-empty-identity', {
        includeHiddenElements: true,
      }),
    ).toHaveLength(6);

    await user.press(screen.getByRole('tab', { name: 'My games' }));

    expect(screen.getByRole('tab', { name: 'My games' })).toBeSelected();
    expect(screen.getByRole('header', { name: 'Your games' })).toBeVisible();
    expect(screen.getByText('Thursday Evening Padel')).toBeVisible();
    expect(screen.getByText('Tuesday After-work Padel')).toBeVisible();
    expect(screen.queryByText('Wednesday Evening Padel')).not.toBeOnTheScreen();
    expect(
      screen.getAllByTestId('avatar-group-empty-identity', {
        includeHiddenElements: true,
      }),
    ).toHaveLength(2);

    await user.press(screen.getAllByRole('button', { name: 'View game' })[0]);

    expect(push).toHaveBeenCalledWith({
      params: { gameId: 'demo-my-next-game' },
      pathname: '/games/[gameId]',
    });
  });

  it('filters the selected collection by venue and explains empty results', async () => {
    const { screen } = await renderGamesScreen();
    const user = userEvent.setup();
    const search = screen.getByLabelText('Venue');

    await screen.findByText('Sunday Social Padel');

    await user.type(search, 'Canary');

    expect(screen.getByText('Sunday Social Padel')).toBeVisible();
    expect(screen.queryByText('Wednesday Evening Padel')).not.toBeOnTheScreen();
    expect(screen.queryByText('Saturday Morning Padel')).not.toBeOnTheScreen();

    await user.clear(search);
    await user.type(search, 'Manchester');

    expect(screen.getByText('No games found')).toBeVisible();
    expect(
      screen.getByText('Try searching for a different venue.'),
    ).toBeVisible();
  });

  it('keeps game cards clear of the floating navigation', async () => {
    const { screen } = await renderGamesScreen();

    expect(
      flattenedStyle(
        screen.getByTestId('games-scroll').props.contentContainerStyle,
      ).paddingBottom,
    ).toBe(146);
  });

  it('moves a joined game from Discover to My games', async () => {
    await joinGame('demo-canary-social', demoCurrentGamePlayer);
    const { screen } = await renderGamesScreen();
    const user = userEvent.setup();

    await screen.findByText('Wednesday Evening Padel');
    expect(screen.queryByText('Sunday Social Padel')).not.toBeOnTheScreen();

    await user.press(screen.getByRole('tab', { name: 'My games' }));

    expect(await screen.findByText('Sunday Social Padel')).toBeVisible();
  });
});
