import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, userEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import NotificationsScreen from '../src/app/invitations/[invitationId]';
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
  jest.mocked(useLocalSearchParams).mockReturnValue({ invitationId: 'invite' });
});
async function show(services: AppServices, screen: 'inbox' | 'players') {
  if (
    services.invitations.findIncomingById ===
    demoAppServices.invitations.findIncomingById
  ) {
    services = {
      ...services,
      invitations: {
        ...services.invitations,
        findIncomingById: async (id) =>
          (await services.invitations.listIncoming()).find(
            (item) => item.id === id,
          ) ?? null,
      },
    };
  }
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
  it('ignores a response error after the invitation route changes', async () => {
    const game = (await demoAppServices.games.list())[0]!;
    let reject!: (error: Error) => void;
    const response = new Promise<void>((_resolve, fail) => {
      reject = fail;
    });
    const services = {
      ...demoAppServices,
      invitations: {
        ...demoAppServices.invitations,
        respond: () => response,
        findIncomingById: async (id: string) => ({
          id,
          game,
          inviterId: 'friend',
          inviteeId: demoCurrentUser.id,
          inviterName: 'Sam',
          inviteeName: 'Me',
          status: 'pending' as const,
        }),
      },
    };
    const screen = await show(services, 'inbox');
    await userEvent
      .setup()
      .press(
        await screen.findByRole('button', { name: `Accept ${game.name}` }),
      );
    jest.mocked(useLocalSearchParams).mockReturnValue({ invitationId: 'next' });
    await screen.rerender(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 844, width: 390, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <AppServicesProvider services={services}>
          <NotificationsScreen />
        </AppServicesProvider>
      </SafeAreaProvider>,
    );
    reject(new Error('Old response failed'));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: `Accept ${game.name}` }),
      ).toBeEnabled(),
    );
    expect(screen.queryByText('Old response failed')).not.toBeOnTheScreen();
  });
  it('shows a closed invitation without response controls and keeps the game reachable', async () => {
    const game = (await demoAppServices.games.list())[0]!;
    const screen = await show(
      {
        ...demoAppServices,
        invitations: {
          ...demoAppServices.invitations,
          listIncoming: async () => [
            {
              id: 'invite',
              game,
              inviterId: 'friend',
              inviteeId: demoCurrentUser.id,
              inviterName: 'Sam',
              inviteeName: 'Me',
              status: 'closed',
            },
          ],
        },
      },
      'inbox',
    );
    expect(await screen.findByText('Invitation closed')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: `Accept ${game.name}` }),
    ).not.toBeOnTheScreen();
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: `View ${game.name}` }));
    expect(push).toHaveBeenCalledWith({
      pathname: '/games/[gameId]',
      params: { gameId: game.id },
    });
  });
  it('explains a missing invitation without offering acceptance', async () => {
    const screen = await show(
      {
        ...demoAppServices,
        invitations: {
          ...demoAppServices.invitations,
          listIncoming: async () => [],
        },
      },
      'inbox',
    );
    expect(
      await screen.findByText('This invitation is no longer available.'),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /^Accept / }),
    ).not.toBeOnTheScreen();
  });
  it('opens an old invitation through exact lookup when it is absent from the inbox page', async () => {
    const game = (await demoAppServices.games.list())[0]!;
    const findIncomingById = jest.fn(async () => ({
      id: 'invite',
      game,
      inviterId: 'friend',
      inviteeId: demoCurrentUser.id,
      inviterName: 'Sam',
      inviteeName: 'Me',
      status: 'pending' as const,
    }));
    const listIncoming = jest.fn(async () => []);
    const screen = await show(
      {
        ...demoAppServices,
        invitations: {
          ...demoAppServices.invitations,
          findIncomingById,
          listIncoming,
        },
      },
      'inbox',
    );
    expect(
      await screen.findByRole('button', { name: `Accept ${game.name}` }),
    ).toBeEnabled();
    expect(findIncomingById).toHaveBeenCalledWith('invite');
    expect(listIncoming).not.toHaveBeenCalled();
  });
  it('shows an unavailable invitation without querying when the route has no ID', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    const findIncomingById = jest.fn(async () => null);
    const screen = await show(
      {
        ...demoAppServices,
        invitations: { ...demoAppServices.invitations, findIncomingById },
      },
      'inbox',
    );
    expect(
      await screen.findByText('This invitation is no longer available.'),
    ).toBeVisible();
    expect(findIncomingById).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: /^Accept / }),
    ).not.toBeOnTheScreen();
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
