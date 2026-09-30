import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
    useLocalSearchParams: jest.fn(() => ({})),
    useRouter: jest.fn(),
  };
});

const mockUseLocalSearchParams = jest.mocked(useLocalSearchParams);
const mockUseRouter = jest.mocked(useRouter);

function gamesScreen() {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 34, left: 0, right: 0, top: 47 },
      }}
    >
      <GamesScreen />
    </SafeAreaProvider>
  );
}

async function renderGamesScreen(
  initialParams: Readonly<{ collection?: string }> = {},
) {
  const push = jest.fn();
  const setParams = jest.fn();
  mockUseLocalSearchParams.mockReturnValue(initialParams);
  mockUseRouter.mockReturnValue({ push, setParams } as unknown as ReturnType<
    typeof useRouter
  >);
  const screen = await render(gamesScreen());

  return {
    push,
    rerender: async (params: Readonly<{ collection?: string }>) => {
      mockUseLocalSearchParams.mockReturnValue(params);
      await screen.rerender(gamesScreen());
    },
    screen,
    setParams,
  };
}

describe('games screen', () => {
  it('browses discover and personal game collections', async () => {
    const { push, rerender, screen, setParams } = await renderGamesScreen();
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
    expect(setParams).toHaveBeenCalledWith({ collection: 'mine' });
    await rerender({ collection: 'mine' });

    expect(screen.getByRole('tab', { name: 'My games' })).toBeSelected();
    expect(
      screen.getByRole('header', { name: 'Upcoming games' }),
    ).toBeVisible();
    expect(screen.getByText('Thursday Evening Padel')).toBeVisible();
    expect(screen.getByText('Tuesday After-work Padel')).toBeVisible();
    expect(screen.getByText('Wednesday Lunch Padel')).toBeVisible();
    expect(screen.getByText('Friday Evening Padel')).toBeVisible();
    expect(
      screen.getByRole('header', { name: 'Previous games' }),
    ).toBeVisible();
    expect(screen.getByText('Monday Night Padel')).toBeVisible();
    expect(screen.getByText('Sunday Evening Padel')).toBeVisible();
    expect(screen.getByText('You lost')).toBeVisible();
    expect(screen.getByText('You won')).toBeVisible();
    expect(
      screen.getAllByRole('button', { name: 'View results' }),
    ).toHaveLength(2);
    expect(
      screen.getByTestId('artwork-illustrated-card-match-lost', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();
    expect(
      screen.getByTestId('artwork-illustrated-card-match-won', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();
    expect(screen.queryByText('Wednesday Evening Padel')).not.toBeOnTheScreen();
    expect(
      screen.getAllByTestId('avatar-group-empty-identity', {
        includeHiddenElements: true,
      }),
    ).toHaveLength(6);

    await user.press(screen.getAllByRole('button', { name: 'View game' })[0]);

    expect(push).toHaveBeenCalledWith({
      params: { gameId: 'demo-my-next-game' },
      pathname: '/games/[gameId]',
    });

    await user.press(
      screen.getAllByRole('button', { name: 'View results' })[1],
    );

    expect(push).toHaveBeenCalledWith({
      params: { gameId: 'demo-completed-game' },
      pathname: '/games/[gameId]',
    });
  });

  it('opens directly on My games when requested', async () => {
    const { screen } = await renderGamesScreen({ collection: 'mine' });

    expect(screen.getByRole('tab', { name: 'My games' })).toBeSelected();
    expect(await screen.findByText('Thursday Evening Padel')).toBeVisible();
    expect(screen.queryByText('Saturday Morning Padel')).not.toBeOnTheScreen();
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
    const { rerender, screen } = await renderGamesScreen();
    const user = userEvent.setup();

    await screen.findByText('Wednesday Evening Padel');
    expect(screen.queryByText('Sunday Social Padel')).not.toBeOnTheScreen();

    await user.press(screen.getByRole('tab', { name: 'My games' }));
    await rerender({ collection: 'mine' });

    expect(await screen.findByText('Sunday Social Padel')).toBeVisible();
  });
});
