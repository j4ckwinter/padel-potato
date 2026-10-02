import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, userEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import NotificationsScreen from '../src/app/notifications';
import PlayersScreen from '../src/app/(tabs)/players';
import { demoAppServices } from '../src/features/demo/demoAppServices';
import {
  AppServicesProvider,
  type AppServices,
} from '../src/features/services/AppServicesContext';
import type { GameInvitation } from '../src/features/invitations/invitation';
import { demoCurrentUser, demoPlayers } from '../src/features/demo/demoData';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useFocusEffect: () => {},
}));
const push = jest.fn();
beforeEach(() => {
  jest.mocked(useRouter).mockReturnValue({
    push,
    canGoBack: () => true,
    back: jest.fn(),
  } as unknown as ReturnType<typeof useRouter>);
  jest.mocked(useLocalSearchParams).mockReturnValue({});
});
async function show(services: AppServices, screen: 'inbox' | 'players') {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 34, left: 0, right: 0, top: 47 },
      }}
    >
      <AppServicesProvider services={services}>
        {screen === 'inbox' ? <NotificationsScreen /> : <PlayersScreen />}
      </AppServicesProvider>
    </SafeAreaProvider>,
  );
}
describe('invitation screens', () => {
  it('explains an inbox load failure and retries the request', async () => {
    let failing = true;
    const listIncoming = jest.fn(async () => {
      if (failing) throw new Error('network');
      return [];
    });
    const services = {
      ...demoAppServices,
      invitations: { ...demoAppServices.invitations, listIncoming },
    };
    const screen = await show(services, 'inbox');
    expect(
      await screen.findByText('Could not load invitations. Please try again.'),
    ).toBeVisible();
    failing = false;
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(listIncoming).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(
        screen.queryByText('Could not load invitations. Please try again.'),
      ).not.toBeOnTheScreen(),
    );
  });
  it('shows the game context, accepts an invitation, and refreshes its status', async () => {
    const game = (await demoAppServices.games.list())[0]!;
    let status: GameInvitation['status'] = 'pending';
    const respond = jest.fn(async () => {
      status = 'accepted';
    });
    const services = {
      ...demoAppServices,
      invitations: {
        ...demoAppServices.invitations,
        respond,
        listIncoming: async () => [
          {
            id: 'invite',
            game,
            inviterId: 'friend',
            inviteeId: demoCurrentUser.id,
            inviterName: 'Sam',
            inviteeName: 'Me',
            status,
          },
        ],
      },
    };
    const screen = await show(services, 'inbox');
    expect(
      await screen.findByText(`Sam invited you to play at ${game.venue}.`),
    ).toBeVisible();
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: `Accept ${game.name}` }));
    expect(respond).toHaveBeenCalledWith('invite', 'accept');
    expect(await screen.findByText('Invitation accepted')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: `Accept ${game.name}` }),
    ).not.toBeOnTheScreen();
  });
  it('leaves a failed response actionable and displays the capacity error', async () => {
    const game = (await demoAppServices.games.list())[0]!;
    const services = {
      ...demoAppServices,
      invitations: {
        ...demoAppServices.invitations,
        respond: async () => {
          throw new Error('This game is full.');
        },
        listIncoming: async () => [
          {
            id: 'invite',
            game,
            inviterId: 'friend',
            inviteeId: demoCurrentUser.id,
            inviterName: 'Sam',
            inviteeName: 'Me',
            status: 'pending' as const,
          },
        ],
      },
    };
    const screen = await show(services, 'inbox');
    await userEvent
      .setup()
      .press(
        await screen.findByRole('button', { name: `Accept ${game.name}` }),
      );
    expect(await screen.findByText('This game is full.')).toBeVisible();
    expect(
      screen.getByRole('button', { name: `Decline ${game.name}` }),
    ).toBeEnabled();
  });
  it('sends a game-specific invitation from discovery and shows the persisted pending state', async () => {
    const source = (await demoAppServices.games.list())[0]!;
    const game = {
      ...source,
      lifecycle: { status: 'scheduled' as const },
      participants: [
        { player: demoAppServices.currentPlayer, role: 'organiser' as const },
      ] as const,
    };
    const target = demoPlayers.find(
      (player) => !player.favourite && !player.recentlyPlayedWith,
    )!;
    let sent: readonly GameInvitation[] = [];
    const send = jest.fn(async () => {
      sent = [
        {
          id: 'sent',
          game,
          inviterId: demoCurrentUser.id,
          inviteeId: target.id,
          inviterName: 'Me',
          inviteeName: target.identity.name,
          status: 'pending',
        },
      ];
    });
    const services = {
      ...demoAppServices,
      games: { ...demoAppServices.games, findById: async () => game },
      invitations: {
        ...demoAppServices.invitations,
        send,
        listSent: async () => sent,
      },
    };
    jest
      .mocked(useLocalSearchParams)
      .mockReturnValue({ gameId: game.id, view: 'discover' });
    const screen = await show(services, 'players');
    await userEvent.setup().press(
      await screen.findByRole('button', {
        name: `Invite ${target.identity.name}`,
      }),
    );
    expect(send).toHaveBeenCalledWith(game.id, target.id);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: `Invited ${target.identity.name}` }),
      ).toBeDisabled(),
    );
  });
});
