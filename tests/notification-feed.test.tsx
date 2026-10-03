import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, userEvent, waitFor, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import NotificationsScreen from '../src/app/notifications';
import { demoAppServices } from '../src/features/demo/demoAppServices';
import {
  AppServicesProvider,
  type AppServices,
} from '../src/features/services/AppServicesContext';
import type {
  ActivityNotification,
  NotificationRepository,
} from '../src/features/notifications/activity';
import {
  notificationGroups,
  notificationTimestamp,
} from '../src/features/notifications/feedViewModel';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: () => {},
}));
const push = jest.fn();
beforeEach(() => {
  push.mockClear();
  jest.mocked(useRouter).mockReturnValue({
    push,
    canGoBack: () => true,
    back: jest.fn(),
  } as unknown as ReturnType<typeof useRouter>);
});
function item(
  id: string,
  readAt: string | null = null,
  createdAt = new Date().toISOString(),
): ActivityNotification {
  return {
    id,
    kind: 'invitation',
    title: `Invitation ${id}`,
    message: 'Sam invited you to doubles.',
    createdAt,
    readAt,
    target: { type: 'invitation', invitationId: id, gameId: 'game' },
  };
}
function content(services: AppServices) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <AppServicesProvider services={services}>
        <NotificationsScreen />
      </AppServicesProvider>
    </SafeAreaProvider>
  );
}
async function show(notifications: NotificationRepository) {
  return render(content({ ...demoAppServices, notifications }));
}
describe('notification feed', () => {
  it('filters by durable read state, groups by date and retains accurate header count', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const screen = await show({
      list: async () => [
        item('pending', new Date().toISOString()),
        item('answered'),
        item('old', null, yesterday),
      ],
      markRead: async () => {},
    });
    expect(await screen.findByText('2 unread notifications')).toBeVisible();
    expect(screen.getByText('Today')).toBeVisible();
    expect(screen.getByText('Earlier')).toBeVisible();
    await userEvent.setup().press(screen.getByRole('tab', { name: 'Unread' }));
    expect(
      screen.queryByRole('button', { name: /Invitation pending,/ }),
    ).not.toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: /Invitation answered,/ }),
    ).toBeVisible();
    expect(screen.getByText('2 unread notifications')).toBeVisible();
  });
  it('opens invitation detail without responding and persists read state on reload', async () => {
    let rows = [item('one')];
    const markRead = jest.fn(async () => {
      rows = rows.map((row) => ({ ...row, readAt: new Date().toISOString() }));
    });
    const screen = await show({ list: async () => rows, markRead });
    await userEvent
      .setup()
      .press(await screen.findByRole('button', { name: /Invitation one,/ }));
    expect(markRead).toHaveBeenCalledWith('one');
    expect(push).toHaveBeenCalledWith({
      pathname: '/invitations/[invitationId]',
      params: { invitationId: 'one' },
    });
    expect(await screen.findByText('0 unread notifications')).toBeVisible();
    await userEvent.setup().press(screen.getByRole('tab', { name: 'Unread' }));
    expect(
      screen.getByText("You're all caught up. No unread notifications."),
    ).toBeVisible();
  });
  it('keeps navigation reachable when marking read fails and retries durably', async () => {
    let failing = true;
    let readAt: string | null = null;
    const markRead = jest.fn(async () => {
      if (failing) throw new Error('offline');
      readAt = new Date().toISOString();
    });
    const screen = await show({
      list: async () => [item('one', readAt)],
      markRead,
    });
    await userEvent
      .setup()
      .press(await screen.findByRole('button', { name: /Invitation one,/ }));
    expect(push).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        'Could not mark this notification as read. Please try again.',
      ),
    ).toBeVisible();
    failing = false;
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Retry marking as read' }));
    expect(await screen.findByText('0 unread notifications')).toBeVisible();
    expect(push).toHaveBeenCalledTimes(1);
  });
  it('discards a read completion and navigation after account ownership changes', async () => {
    let resolve!: () => void;
    const pending = new Promise<void>((done) => {
      resolve = done;
    });
    const screen = await show({
      list: async () => [item('old')],
      markRead: () => pending,
    });
    await userEvent
      .setup()
      .press(await screen.findByRole('button', { name: /Invitation old,/ }));
    await screen.rerender(
      content({
        ...demoAppServices,
        notifications: {
          list: async () => [item('new')],
          markRead: async () => {},
        },
      }),
    );
    await screen.findByRole('button', { name: /Invitation new,/ });
    await act(async () => resolve());
    expect(push).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: /Invitation old,/ }),
    ).not.toBeOnTheScreen();
  });
  it('retries a failed load without reporting a false zero unread count', async () => {
    let failing = true;
    const screen = await show({
      list: async () => {
        if (failing) throw new Error('offline');
        return [item('one')];
      },
      markRead: async () => {},
    });
    expect(
      await screen.findByText(
        'Could not load notifications. Please try again.',
      ),
    ).toBeVisible();
    expect(screen.queryByText('0 unread notifications')).not.toBeOnTheScreen();
    failing = false;
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('1 unread notification')).toBeVisible();
  });
  it('renders read warning activity and routes it to its game', async () => {
    const row = {
      ...item('warning', '2026-10-03T00:00:00Z'),
      kind: 'spot_remaining' as const,
      target: { type: 'game' as const, gameId: 'game' },
    };
    const screen = await show({
      list: async () => [row],
      markRead: async () => {},
    });
    await userEvent
      .setup()
      .press(
        await screen.findByRole('button', { name: /Invitation warning,/ }),
      );
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        pathname: '/games/[gameId]',
        params: { gameId: 'game' },
      }),
    );
  });
});
describe('notification presentation', () => {
  it('uses local midnight and stable newest-first ties', () => {
    const now = new Date(2026, 9, 3, 0, 5);
    const today = new Date(2026, 9, 3, 0, 1).toISOString();
    const earlier = new Date(2026, 9, 2, 23, 59).toISOString();
    expect(
      notificationGroups(
        [
          item('a', null, today),
          item('old', null, earlier),
          item('b', null, today),
        ],
        now,
      ).map((group) => ({
        title: group.title,
        ids: group.items.map((row) => row.id),
      })),
    ).toEqual([
      { title: 'Today', ids: ['b', 'a'] },
      { title: 'Earlier', ids: ['old'] },
    ]);
    expect(notificationTimestamp(today, now)).toBe('4m');
    expect(
      notificationGroups(
        [
          item('older', null, '2026-10-03T01:00:00+02:00'),
          item('newer', null, '2026-10-03T00:00:00Z'),
        ],
        now,
      ).flatMap((group) => group.items.map((row) => row.id)),
    ).toEqual(['newer', 'older']);
  });
});
