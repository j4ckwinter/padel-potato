import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, userEvent } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GameDetailsScreen from '../src/app/(tabs)/games/[gameId]';
import GameResultScreen from '../src/app/(tabs)/games/result';
import { demoParticipantsForCount } from '../src/features/demo/demoData';
import {
  incrementCurrentPlayers,
  initialGameDraft,
  selectGameDay,
  selectGameTime,
  updateGameVenue,
} from '../src/features/game-creation/gameDraft';
import { createGame, findGameById } from '../src/features/games/gameRepository';

jest.mock('expo-router', () => {
  const focusedCallbacks = new WeakSet<() => void>();
  return {
    useFocusEffect: jest.fn((callback: () => void) => {
      if (!focusedCallbacks.has(callback)) {
        focusedCallbacks.add(callback);
        callback();
      }
    }),
    useLocalSearchParams: jest.fn(),
    useRouter: jest.fn(),
  };
});

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
    const dismissTo = jest.fn();
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({
      back,
      canGoBack: jest.fn(() => true),
      dismissTo,
      push: jest.fn(),
      replace,
      setParams: jest.fn(),
    } as unknown as ReturnType<typeof useRouter>);
    const user = userEvent.setup();

    const resultScreen = await render(appScreen(<GameResultScreen />));

    expect(
      await resultScreen.findByRole('header', { name: 'Enter result' }),
    ).toBeVisible();
    expect(resultScreen.getByText('Teams')).toBeVisible();
    expect(
      resultScreen.getByRole('radio', { name: 'Jamie Taylor' }),
    ).toBeChecked();
    await user.press(resultScreen.getByRole('radio', { name: 'Sam Kim' }));
    expect(resultScreen.getByRole('radio', { name: 'Sam Kim' })).toBeChecked();
    expect(resultScreen.getAllByLabelText(/ value$/u)).toHaveLength(4);
    resultScreen.getAllByLabelText(/ value$/u).forEach((score) => {
      expect(score).toHaveAccessibilityValue({ text: '—' });
    });

    await user.press(resultScreen.getByRole('button', { name: 'Save result' }));

    expect(
      resultScreen.getByRole('alert', {
        name: /Check the score/u,
      }),
    ).toBeVisible();
    expect(replace).not.toHaveBeenCalled();

    await user.press(resultScreen.getByRole('button', { name: 'Add set' }));
    expect(resultScreen.getByRole('header', { name: 'Set 3' })).toBeVisible();
    expect(
      resultScreen.getByRole('button', { name: 'Remove set 3' }),
    ).toBeVisible();

    for (let setIndex = 0; setIndex < 3; setIndex += 1) {
      for (let point = 0; point < 6; point += 1) {
        await fireEvent.press(
          resultScreen.getAllByRole('button', {
            name: 'Increase Alex Morgan & Sam Kim',
          })[setIndex],
        );
      }
      for (let point = 0; point < 4; point += 1) {
        await fireEvent.press(
          resultScreen.getAllByRole('button', {
            name: 'Increase Jamie Taylor & Riley Brown',
          })[setIndex],
        );
      }
    }
    await user.press(resultScreen.getByRole('button', { name: 'Save result' }));

    expect(dismissTo).toHaveBeenCalledWith({
      params: {
        gameId: 'demo-my-next-game',
        resultRecorded: 'true',
        returnTo: 'games',
      },
      pathname: '/games/[gameId]',
    });
    await expect(findGameById('demo-my-next-game')).resolves.toMatchObject({
      lifecycle: {
        result: {
          sets: [
            [6, 4],
            [6, 4],
            [6, 4],
          ],
          teams: [
            ['alex-morgan', 'sam-kim'],
            ['jamie-taylor', 'riley-brown'],
          ],
        },
        status: 'completed',
      },
    });

    mockUseLocalSearchParams.mockReturnValue({
      gameId: 'demo-my-next-game',
      resultRecorded: 'true',
      returnTo: 'games',
    });
    await resultScreen.rerender(appScreen(<GameDetailsScreen />));

    expect(await resultScreen.findByText('Game completed')).toBeVisible();
    expect(
      resultScreen.getByRole('summary', {
        name: /YOU WON, Final score, Alex Morgan & Sam Kim, set 1 6, set 2 6, set 3 6/u,
      }),
    ).toBeVisible();
    expect(
      resultScreen.getByRole('alert', {
        name: 'Result saved. The final score is now part of the game record.',
      }),
    ).toBeVisible();

    await user.press(resultScreen.getByRole('button', { name: 'Back' }));
    expect(dismissTo).toHaveBeenLastCalledWith('/games');
    expect(back).not.toHaveBeenCalled();
  });

  it('offers a third set for a 60-minute game', async () => {
    const fourPlayerDraft = incrementCurrentPlayers(
      incrementCurrentPlayers(incrementCurrentPlayers(initialGameDraft)),
    );
    const draft = updateGameVenue(
      selectGameTime(selectGameDay(fourPlayerDraft, '2026-10-02'), '18:30'),
      'Potato Padel Club',
    );
    const game = await createGame({
      draft,
      participants: demoParticipantsForCount(4),
    });
    mockUseLocalSearchParams.mockReturnValue({ gameId: game.id });
    mockUseRouter.mockReturnValue({
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
      dismissTo: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      setParams: jest.fn(),
    } as unknown as ReturnType<typeof useRouter>);
    const user = userEvent.setup();
    const screen = await render(appScreen(<GameResultScreen />));

    expect(
      await screen.findByRole('header', { name: 'Enter result' }),
    ).toBeVisible();
    await user.press(screen.getByRole('button', { name: 'Add set' }));
    expect(screen.getByRole('header', { name: 'Set 3' })).toBeVisible();
    expect(screen.getAllByLabelText(/ value$/u)).toHaveLength(6);
    screen.getAllByLabelText(/ value$/u).forEach((score) => {
      expect(score).toHaveAccessibilityValue({ text: '—' });
    });
  });
});
