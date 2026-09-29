import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PlayerDetailsScreen from '../src/app/(tabs)/players/[playerId]';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

const mockUseLocalSearchParams = jest.mocked(useLocalSearchParams);
const mockUseRouter = jest.mocked(useRouter);

async function renderPlayerDetails(playerId: string, canGoBackValue = true) {
  const back = jest.fn();
  const replace = jest.fn();
  mockUseLocalSearchParams.mockReturnValue({ playerId });
  mockUseRouter.mockReturnValue({
    back,
    canGoBack: jest.fn(() => canGoBackValue),
    replace,
  } as unknown as ReturnType<typeof useRouter>);

  return {
    back,
    replace,
    screen: await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 844, width: 390, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 47 },
        }}
      >
        <PlayerDetailsScreen />
      </SafeAreaProvider>,
    ),
  };
}

describe('player details screen', () => {
  it('shows a complete player profile and controls its favourite state', async () => {
    const { back, screen } = await renderPlayerDetails('jamie-taylor');
    const user = userEvent.setup();

    expect(screen.getByRole('header', { name: 'Jamie Taylor' })).toBeVisible();
    expect(screen.getByText('Intermediate · Rating 4.5')).toBeVisible();
    expect(
      screen.getByRole('header', { name: 'About Jamie Taylor' }),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Competitive left-side player who is always up for a weekend match.',
      ),
    ).toBeVisible();
    expect(
      screen.getByRole('summary', {
        name: 'Rating, 4.5, Current player rating, positive trend',
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('summary', {
        name: 'Playing preferences, Left, Weekends, Mornings',
      }),
    ).toBeVisible();

    const favourite = screen.getByRole('checkbox', {
      name: 'Favourite player',
    });
    expect(favourite).not.toBeChecked();
    await user.press(favourite);
    expect(favourite).toBeChecked();

    await user.press(screen.getByRole('button', { name: 'Back' }));
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('returns a directly opened profile to the Players tab', async () => {
    const { back, replace, screen } = await renderPlayerDetails(
      'riley-brown',
      false,
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Back' }));

    expect(back).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/players');
  });

  it('explains when a player no longer exists', async () => {
    const { screen } = await renderPlayerDetails('missing-player');

    expect(
      screen.getByRole('header', { name: 'Player profile' }),
    ).toBeVisible();
    expect(
      screen.getByRole('header', { name: 'Player not found' }),
    ).toBeVisible();
    expect(
      screen.getByText('This player profile is no longer available.'),
    ).toBeVisible();
  });
});
