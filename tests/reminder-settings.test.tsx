import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render, userEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { router, useRootNavigationState } from 'expo-router';

import SettingsScreen from '../src/app/settings';
import { demoAppServices } from '../src/features/demo/demoAppServices';
import {
  canShowReminders,
  reconcileDeviceReminders,
  requestReminderPermission,
} from '../src/features/notifications/deviceNotifications';
import { ReminderProvider } from '../src/features/notifications/ReminderProvider';
import { loadReminderPreference } from '../src/features/notifications/reminders';
import { useAppServicesLoadState } from '../src/features/services/AppServicesContext';

jest.mock('expo-router', () => ({
  useRootNavigationState: jest.fn(() => ({ key: 'root' })),
  useRouter: () => ({
    back: jest.fn(),
    canGoBack: () => false,
    replace: jest.fn(),
  }),
  router: { push: jest.fn() },
}));
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getLastNotificationResponseAsync: jest.fn(async () => null),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  clearLastNotificationResponseAsync: jest.fn(async () => undefined),
}));
jest.mock('../src/features/notifications/deviceNotifications', () => ({
  supportsDeviceReminders: true,
  canShowReminders: jest.fn(async () => true),
  requestReminderPermission: jest.fn(async () => true),
  reconcileDeviceReminders: jest.fn(async () => undefined),
}));
jest.mock('../src/features/authentication/SessionContext', () => ({
  useSession: () => ({ signOut: jest.fn(async () => ({ status: 'success' })) }),
}));
jest.mock('../src/features/services/AppServicesContext', () => ({
  useAppServicesLoadState: jest.fn(),
}));

function screen() {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 34, left: 0, right: 0, top: 47 },
      }}
    >
      <ReminderProvider>
        <SettingsScreen />
      </ReminderProvider>
    </SafeAreaProvider>
  );
}

describe('reminder settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRootNavigationState).mockReturnValue({
      key: 'root',
      index: 0,
      routeNames: [],
      routes: [],
      type: 'stack',
      stale: false,
    });
    jest
      .mocked(Notifications.getLastNotificationResponseAsync)
      .mockResolvedValue(null);
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
    jest.mocked(useAppServicesLoadState).mockReturnValue({
      state: { status: 'ready', services: demoAppServices },
      retry: jest.fn(),
      completeOnboarding: jest.fn(async () => undefined),
    });
    jest.mocked(requestReminderPermission).mockResolvedValue(true);
    jest.mocked(canShowReminders).mockResolvedValue(true);
  });

  it('waits for the root navigator before opening a cold-start reminder and ignores another account', async () => {
    const response = {
      actionIdentifier: 'default',
      notification: {
        request: {
          identifier: 'cold-start',
          content: {
            data: {
              kind: 'gameReminder',
              userId: demoAppServices.currentUser.id,
              gameId: 'test-game',
            },
          },
        },
      },
    } as unknown as Notifications.NotificationResponse;
    jest
      .mocked(useRootNavigationState)
      .mockReturnValue(
        undefined as unknown as ReturnType<typeof useRootNavigationState>,
      );
    jest
      .mocked(Notifications.getLastNotificationResponseAsync)
      .mockResolvedValue(response);
    const view = await render(screen());
    await waitFor(() =>
      expect(Notifications.getLastNotificationResponseAsync).toHaveBeenCalled(),
    );
    expect(router.push).not.toHaveBeenCalled();
    jest.mocked(useRootNavigationState).mockReturnValue({
      key: 'mounted',
      index: 0,
      routeNames: [],
      routes: [],
      type: 'stack',
      stale: false,
    });
    await view.rerender(screen());
    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/games/[gameId]',
        params: { gameId: 'test-game' },
      }),
    );
    await view.rerender(screen());
    expect(router.push).toHaveBeenCalledTimes(1);
    await view.unmount();
    jest.mocked(router.push).mockClear();
    response.notification.request.content.data = {
      kind: 'gameReminder',
      userId: 'other-account',
      gameId: 'private-game',
    };
    await render(screen());
    await waitFor(() =>
      expect(
        Notifications.clearLastNotificationResponseAsync,
      ).toHaveBeenCalled(),
    );
    expect(router.push).not.toHaveBeenCalled();
  });

  it('requests permission on opt-in and restores the account preference on reopening', async () => {
    const user = userEvent.setup();
    const view = await render(screen());
    expect(
      view.getByRole('switch', { name: 'Game reminders' }),
    ).not.toBeChecked();
    await user.press(view.getByRole('switch', { name: 'Game reminders' }));
    await waitFor(() =>
      expect(
        view.getByRole('switch', { name: 'Game reminders' }),
      ).toBeChecked(),
    );
    expect(requestReminderPermission).toHaveBeenCalledTimes(1);
    expect(loadReminderPreference(demoAppServices.currentUser.id)).toBe(true);
    await view.unmount();
    const reopened = await render(screen());
    expect(
      reopened.getByRole('switch', { name: 'Game reminders' }),
    ).toBeChecked();
    await user.press(reopened.getByRole('switch', { name: 'Game reminders' }));
    await waitFor(() =>
      expect(loadReminderPreference(demoAppServices.currentUser.id)).toBe(
        false,
      ),
    );
    expect(reconcileDeviceReminders).toHaveBeenCalledWith([]);
  });

  it('keeps reminders off when permission is denied and explains how to enable them', async () => {
    jest.mocked(requestReminderPermission).mockResolvedValue(false);
    const user = userEvent.setup();
    const view = await render(screen());
    await user.press(view.getByRole('switch', { name: 'Game reminders' }));
    expect(
      await view.findByRole('alert', {
        name: 'Could not update reminders. Allow notifications in your device settings to enable game reminders.',
      }),
    ).toBeVisible();
    expect(
      view.getByRole('switch', { name: 'Game reminders' }),
    ).not.toBeChecked();
    expect(loadReminderPreference(demoAppServices.currentUser.id)).toBe(false);
  });

  it('does not save an old account preference after a permission dialog finishes', async () => {
    let resolvePermission: (allowed: boolean) => void = () => undefined;
    jest.mocked(requestReminderPermission).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePermission = resolve;
        }),
    );
    const user = userEvent.setup();
    const view = await render(screen());
    await user.press(view.getByRole('switch', { name: 'Game reminders' }));
    jest.mocked(useAppServicesLoadState).mockReturnValue({
      state: { status: 'inactive' },
      retry: jest.fn(),
      completeOnboarding: jest.fn(async () => undefined),
    });
    await view.rerender(screen());
    resolvePermission(true);
    await waitFor(() =>
      expect(reconcileDeviceReminders).toHaveBeenCalledWith([]),
    );
    expect(loadReminderPreference(demoAppServices.currentUser.id)).toBe(false);
    jest.mocked(useAppServicesLoadState).mockReturnValue({
      state: { status: 'ready', services: demoAppServices },
      retry: jest.fn(),
      completeOnboarding: jest.fn(async () => undefined),
    });
    await view.rerender(screen());
    expect(view.getByRole('switch', { name: 'Game reminders' })).toBeEnabled();
  });

  it('does not let delayed initial notification hydration replace a newer live tap', async () => {
    let resolveInitial: (
      response: Notifications.NotificationResponse | null,
    ) => void = () => undefined;
    jest
      .mocked(Notifications.getLastNotificationResponseAsync)
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveInitial = resolve;
          }),
      );
    await render(screen());
    const notification = (id: string) =>
      ({
        actionIdentifier: 'default',
        notification: {
          request: {
            identifier: id,
            content: {
              data: {
                kind: 'gameReminder',
                userId: demoAppServices.currentUser.id,
                gameId: id,
              },
            },
          },
        },
      }) as unknown as Notifications.NotificationResponse;
    const listener = jest.mocked(
      Notifications.addNotificationResponseReceivedListener,
    ).mock.calls[0][0];
    await act(async () => {
      listener(notification('new-game'));
    });
    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/games/[gameId]',
        params: { gameId: 'new-game' },
      }),
    );
    await act(async () => {
      resolveInitial(notification('old-game'));
    });
    expect(router.push).toHaveBeenCalledTimes(1);
  });
});
