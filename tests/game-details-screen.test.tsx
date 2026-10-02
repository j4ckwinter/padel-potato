import { describe, expect, it, jest } from '@jest/globals';
import { act, render, userEvent } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GameDetailsScreen from '../src/app/(tabs)/games/[gameId]';
import { demoAppServices } from '../src/features/demo/demoAppServices';
import {
  initialGameDraft,
  selectGameDay,
  selectGameTime,
  updateGameVenue,
} from '../src/features/game-creation/gameDraft';
import { AppServicesProvider } from '../src/features/services/AppServicesContext';

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
      <AppServicesProvider services={demoAppServices}>
        {children}
      </AppServicesProvider>
    </SafeAreaProvider>
  );
}

describe('game details screen', () => {
  it('displays the game created by the submission flow', async () => {
    const draft = updateGameVenue(
      selectGameTime(selectGameDay(initialGameDraft, '2026-10-02'), '18:30'),
      'Potato Padel Club',
    );
    const game = await demoAppServices.games.create(draft);
    mockUseLocalSearchParams.mockReturnValue({
      created: 'true',
      gameId: game.id,
    });
    const back = jest.fn();
    const canGoBack = jest.fn(() => true);
    const push = jest.fn();
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({
      back,
      canGoBack,
      push,
      replace,
    } as unknown as ReturnType<typeof useRouter>);
    const user = userEvent.setup();

    const screen = await render(appScreen(<GameDetailsScreen />));

    expect(await screen.findByText('Friday Evening Padel')).toBeVisible();
    expect(
      screen.getByRole('header', { name: 'Friday Evening Padel' }),
    ).toBeVisible();
    expect(screen.getByText('Potato Padel Club')).toBeVisible();
    expect(screen.getByText('Friday, 2 October 2026 at 18:30')).toBeVisible();
    expect(screen.getByText('60 minutes')).toBeVisible();
    expect(screen.getByText('Social game')).toBeVisible();
    expect(screen.getByRole('header', { name: 'Players' })).toBeVisible();
    expect(screen.queryByText('1 of 4 players')).not.toBeOnTheScreen();
    expect(screen.getByText('Open game · 3 spots left')).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'View Alex Morgan, Organiser · Rating 4.7',
      }),
    ).toBeVisible();
    const openPlayerSlots = screen.getAllByRole('button', {
      name: 'Invite player to open slot',
    });
    expect(openPlayerSlots).toHaveLength(3);
    expect(
      screen.getByRole('alert', {
        name: 'Game created. Your game is ready to share.',
      }),
    ).toBeVisible();

    await user.press(openPlayerSlots[0]);
    expect(push).toHaveBeenCalledWith({
      params: { view: 'discover' },
      pathname: '/players',
    });

    await user.press(
      screen.getByRole('button', {
        name: 'View Alex Morgan, Organiser · Rating 4.7',
      }),
    );
    expect(push).toHaveBeenCalledWith('/profile');

    await user.press(screen.getByRole('button', { name: 'Back' }));

    expect(back).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  });

  it('labels a four-player game as full', async () => {
    mockUseLocalSearchParams.mockReturnValue({ gameId: 'demo-my-next-game' });
    mockUseRouter.mockReturnValue({
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
      push: jest.fn(),
      replace: jest.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    const screen = await render(appScreen(<GameDetailsScreen />));

    expect(await screen.findByText('Game full')).toBeVisible();
    expect(
      screen.queryByText('Open game · 0 spots left'),
    ).not.toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: 'Invite player to open slot' }),
    ).not.toBeOnTheScreen();
  });

  it('returns a directly opened game detail to the Games tab', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      gameId: 'demo-canary-social',
    });
    const back = jest.fn();
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({
      back,
      canGoBack: jest.fn(() => false),
      push: jest.fn(),
      replace,
    } as unknown as ReturnType<typeof useRouter>);
    const user = userEvent.setup();

    const screen = await render(appScreen(<GameDetailsScreen />));

    await user.press(screen.getByRole('button', { name: 'Back' }));

    expect(back).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/games');
  });

  it('joins a discovered game and updates its participant record', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      gameId: 'demo-stratford-morning',
    });
    mockUseRouter.mockReturnValue({
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
      push: jest.fn(),
      replace: jest.fn(),
    } as unknown as ReturnType<typeof useRouter>);
    const user = userEvent.setup();

    const screen = await render(appScreen(<GameDetailsScreen />));

    expect(await screen.findByText('Open game · 1 spot left')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Invite player to open slot' }),
    ).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Join game' }));

    expect(await screen.findByText('Game full')).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'View Alex Morgan, Player · Rating 4.7',
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('alert', {
        name: "You're in. This game is now in My games.",
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Join game' }),
    ).not.toBeOnTheScreen();
    await expect(
      demoAppServices.games.findById('demo-stratford-morning'),
    ).resolves.toMatchObject({
      participants: expect.arrayContaining([
        expect.objectContaining({
          player: expect.objectContaining({
            id: demoAppServices.currentPlayer.id,
          }),
          role: 'player',
        }),
      ]),
    });
  });

  it('shows inactive game details without join or invitation actions', async () => {
    await demoAppServices.games.transitionLifecycle('demo-canary-social', {
      at: '2026-10-04T12:30:00.000Z',
      type: 'finish',
    });
    mockUseLocalSearchParams.mockReturnValue({
      gameId: 'demo-canary-social',
    });
    mockUseRouter.mockReturnValue({
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
      push: jest.fn(),
      replace: jest.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    const screen = await render(appScreen(<GameDetailsScreen />));

    expect(await screen.findByText('Awaiting result')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Join game' }),
    ).not.toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: 'Invite player to open slot' }),
    ).not.toBeOnTheScreen();
  });

  it('opens result entry for a full game organised by the current player', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      gameId: 'demo-my-next-game',
    });
    const push = jest.fn();
    mockUseRouter.mockReturnValue({
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
      push,
      replace: jest.fn(),
    } as unknown as ReturnType<typeof useRouter>);
    const user = userEvent.setup();

    const screen = await render(appScreen(<GameDetailsScreen />));

    await user.press(
      await screen.findByRole('button', { name: 'Enter result' }),
    );

    expect(push).toHaveBeenCalledWith({
      params: { gameId: 'demo-my-next-game' },
      pathname: '/games/result',
    });
    await expect(
      demoAppServices.games.findById('demo-my-next-game'),
    ).resolves.toMatchObject({
      lifecycle: { status: 'scheduled' },
    });
  });
});

it('confirms cancellation and shows the cancelled game after saving', async () => {
  const game = await demoAppServices.games.create(
    updateGameVenue(
      selectGameTime(selectGameDay(initialGameDraft, '2099-10-07'), '18:30'),
      'Future Club',
    ),
  );
  mockUseLocalSearchParams.mockReturnValue({ gameId: game.id });
  const push = jest.fn();
  mockUseRouter.mockReturnValue({ push } as unknown as ReturnType<
    typeof useRouter
  >);
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const screen = await render(appScreen(<GameDetailsScreen />));
  const user = userEvent.setup();
  await user.press(
    await screen.findByRole('button', { name: 'Reschedule game' }),
  );
  expect(push).toHaveBeenCalledWith({
    pathname: '/games/reschedule',
    params: { gameId: game.id },
  });
  await user.press(screen.getByRole('button', { name: 'Cancel game' }));
  expect(
    (await demoAppServices.games.findById(game.id))?.lifecycle.status,
  ).toBe('scheduled');
  expect(alert).toHaveBeenCalledWith(
    'Cancel game?',
    'The game and pending invitations will be cancelled for everyone.',
    expect.any(Array),
  );
  const buttons = alert.mock.calls[0][2];
  await act(async () => {
    buttons?.find((button) => button.text === 'Cancel game')?.onPress?.();
  });
  expect(
    await screen.findByLabelText('Game update. Game cancelled.'),
  ).toBeVisible();
  expect(
    (await demoAppServices.games.findById(game.id))?.lifecycle.status,
  ).toBe('cancelled');
  alert.mockRestore();
});
