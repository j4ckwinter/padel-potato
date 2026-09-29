import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import GameDetailsScreen from '../src/app/(tabs)/games/[gameId]';
import {
  initialGameDraft,
  selectGameDay,
  selectGameTime,
  updateGameVenue,
} from '../src/features/game-creation/gameDraft';
import { createGame } from '../src/features/games/gameRepository';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

const mockUseLocalSearchParams = jest.mocked(useLocalSearchParams);
const mockUseRouter = jest.mocked(useRouter);

describe('game details screen', () => {
  it('displays the game created by the submission flow', async () => {
    const game = await createGame(
      updateGameVenue(
        selectGameTime(selectGameDay(initialGameDraft, '2026-10-02'), '18:30'),
        'Potato Padel Club',
      ),
    );
    mockUseLocalSearchParams.mockReturnValue({
      created: 'true',
      gameId: game.id,
    });
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace } as unknown as ReturnType<
      typeof useRouter
    >);
    const user = userEvent.setup();

    const screen = await render(<GameDetailsScreen />);

    expect(await screen.findByText('Friday Evening Padel')).toBeVisible();
    expect(screen.getByText('Potato Padel Club')).toBeVisible();
    expect(screen.getByText('Friday, 2 October 2026 at 18:30')).toBeVisible();
    expect(screen.getByText('60 minutes')).toBeVisible();
    expect(screen.getByText('Social game')).toBeVisible();
    expect(screen.getByText('4 players')).toBeVisible();
    expect(
      screen.getByRole('alert', {
        name: 'Game created. Your game is ready to share.',
      }),
    ).toBeVisible();

    await user.press(screen.getByRole('button', { name: 'Back' }));

    expect(replace).toHaveBeenCalledWith('/games');
  });
});
