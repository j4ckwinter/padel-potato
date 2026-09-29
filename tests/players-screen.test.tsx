import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PlayersScreen from '../src/app/(tabs)/players';
import { flattenedStyle } from './helpers/componentTest';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

const mockUseLocalSearchParams = jest.mocked(useLocalSearchParams);
const mockUseRouter = jest.mocked(useRouter);

async function renderPlayersScreen(view?: string) {
  const push = jest.fn();
  mockUseLocalSearchParams.mockReturnValue(view ? { view } : {});
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
        <PlayersScreen />
      </SafeAreaProvider>,
    ),
  };
}

describe('players screen', () => {
  it('browses favourite, recent, and discoverable players', async () => {
    const { push, screen } = await renderPlayersScreen();
    const user = userEvent.setup();

    expect(screen.getByRole('header', { name: 'Players' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'My players' })).toBeSelected();
    expect(screen.getByRole('header', { name: 'Favourites' })).toBeVisible();
    expect(
      screen.getByRole('header', { name: 'Recently played with' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'View Jamie Taylor, Intermediate · Rating 4.5',
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'View Sam Kim, Advanced · Rating 4.8',
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /View Riley Brown/ }),
    ).not.toBeOnTheScreen();
    expect(
      screen.getAllByRole('button', { name: /View Sam Kim/u }),
    ).toHaveLength(1);
    expect(
      screen.queryByRole('button', { name: /View Alex Morgan/ }),
    ).not.toBeOnTheScreen();

    await user.press(screen.getByRole('tab', { name: 'Discover' }));

    expect(screen.getByRole('tab', { name: 'Discover' })).toBeSelected();
    expect(screen.getByRole('header', { name: 'Find players' })).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'View Riley Brown, Intermediate · Rating 4.4',
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'View Taylor Singh, Beginner · Rating 3.9',
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'View Morgan Lee, Advanced · Rating 4.9',
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /View Alex Morgan/ }),
    ).not.toBeOnTheScreen();

    await user.press(
      screen.getByRole('button', {
        name: 'View Riley Brown, Intermediate · Rating 4.4',
      }),
    );
    expect(push).toHaveBeenCalledWith({
      params: { playerId: 'riley-brown' },
      pathname: '/players/[playerId]',
    });
  });

  it('starts on Discover when opened from an invitation slot', async () => {
    const { screen } = await renderPlayersScreen('discover');

    expect(screen.getByRole('tab', { name: 'Discover' })).toBeSelected();
    expect(
      screen.getByRole('button', { name: /View Riley Brown/ }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /View Alex Morgan/ }),
    ).not.toBeOnTheScreen();
  });

  it('filters the selected collection by name and explains empty results', async () => {
    const { screen } = await renderPlayersScreen();
    const user = userEvent.setup();
    const search = screen.getByLabelText('Player');

    expect(search).toHaveProp('placeholder', 'Search by name');
    await user.type(search, 'Jamie');

    expect(
      screen.getByRole('button', { name: /View Jamie Taylor/ }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /View Alex Morgan/ }),
    ).not.toBeOnTheScreen();

    await user.clear(search);
    await user.type(search, 'Nobody');

    expect(screen.getByText('No players found')).toBeVisible();
    expect(
      screen.getByText('Try searching for a different name.'),
    ).toBeVisible();
  });

  it('opens notifications and clears the floating navigation', async () => {
    const { push, screen } = await renderPlayersScreen();
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Notifications' }));
    expect(push).toHaveBeenCalledWith('/notifications');
    expect(
      flattenedStyle(
        screen.getByTestId('players-scroll').props.contentContainerStyle,
      ).paddingBottom,
    ).toBe(146);
  });
});
