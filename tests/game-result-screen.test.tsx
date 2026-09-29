import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GameDetailsScreen from '../src/app/(tabs)/games/[gameId]';
import GameResultScreen from '../src/app/(tabs)/games/result';
import { findGameById } from '../src/features/games/gameRepository';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

const mockUseLocalSearchParams = jest.mocked(useLocalSearchParams);
const mockUseRouter = jest.mocked(useRouter);

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

describe('game result screen', () => {
  it('validates, saves, and displays a final result', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      gameId: 'demo-my-next-game',
    });
    const back = jest.fn();
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({
      back,
      canGoBack: jest.fn(() => true),
      push: jest.fn(),
      replace,
    } as unknown as ReturnType<typeof useRouter>);
    const user = userEvent.setup();

    const resultScreen = await render(appScreen(<GameResultScreen />));

    expect(
      await resultScreen.findByRole('header', { name: 'Enter result' }),
    ).toBeVisible();
    expect(resultScreen.getByText('Teams')).toBeVisible();

    await user.press(
      resultScreen.getAllByRole('button', {
        name: 'Decrease Alex Morgan & Jamie Taylor',
      })[0],
    );
    await user.press(resultScreen.getByRole('button', { name: 'Save result' }));

    expect(
      resultScreen.getByRole('alert', {
        name: /Check the score/u,
      }),
    ).toBeVisible();
    expect(replace).not.toHaveBeenCalled();

    await user.press(
      resultScreen.getAllByRole('button', {
        name: 'Increase Alex Morgan & Jamie Taylor',
      })[0],
    );
    await user.press(resultScreen.getByRole('button', { name: 'Save result' }));

    expect(replace).toHaveBeenCalledWith({
      params: {
        gameId: 'demo-my-next-game',
        resultRecorded: 'true',
      },
      pathname: '/games/[gameId]',
    });
    await expect(findGameById('demo-my-next-game')).resolves.toMatchObject({
      lifecycle: {
        result: {
          sets: [
            [6, 4],
            [6, 4],
          ],
        },
        status: 'completed',
      },
    });

    mockUseLocalSearchParams.mockReturnValue({
      gameId: 'demo-my-next-game',
      resultRecorded: 'true',
    });
    await resultScreen.rerender(appScreen(<GameDetailsScreen />));

    expect(await resultScreen.findByText('Game completed')).toBeVisible();
    expect(
      resultScreen.getByRole('summary', {
        name: /YOU WON, Final score, Alex Morgan & Jamie Taylor, set 1 6, set 2 6/u,
      }),
    ).toBeVisible();
    expect(
      resultScreen.getByRole('alert', {
        name: 'Result saved. The final score is now part of the game record.',
      }),
    ).toBeVisible();
  });
});
