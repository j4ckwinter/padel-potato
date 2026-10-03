import * as Notifications from './localNotifications';
import { router, useRootNavigationState } from 'expo-router';
import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { subscribeToGameChanges } from '../games/gameChanges';
import { useAppServicesLoadState } from '../services/AppServicesContext';
import {
  canShowReminders,
  reconcileDeviceReminders,
  requestReminderPermission,
  supportsDeviceReminders,
} from './deviceNotifications';
import {
  gameReminderPlan,
  emptyReminderPlan,
  loadReminderPreference,
  saveReminderPreference,
} from './reminders';

type ReminderContextValue = Readonly<{
  enabled: boolean;
  pending: boolean;
  error: string | null;
  setEnabled: (enabled: boolean) => Promise<void>;
  dismissError: () => void;
}>;

const ReminderContext = createContext<ReminderContextValue | null>(null);

export function ReminderProvider({ children }: PropsWithChildren) {
  const { state } = useAppServicesLoadState();
  const services =
    state.status === 'ready' && state.services.onboarding.completed
      ? state.services
      : null;
  const userId = services?.currentUser.id ?? null;
  const currentUserId = useRef(userId);
  const accountVersion = useRef(0);
  useLayoutEffect(() => {
    currentUserId.current = userId;
    accountVersion.current++;
    return () => {
      currentUserId.current = null;
    };
  }, [userId]);
  const navigation = useRootNavigationState();
  const handledResponse = useRef<string | null>(null);
  const [preference, setPreference] = useState<{
    userId: string;
    enabled: boolean;
  } | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    userId: string | null;
    message: string;
  } | null>(null);
  const pending = userId !== null && pendingUserId === userId;
  const error = feedback?.userId === userId ? feedback.message : null;
  const setError = useCallback(
    (message: string | null) =>
      setFeedback(message === null ? null : { userId, message }),
    [userId],
  );
  const [response, setResponse] =
    useState<Notifications.NotificationResponse | null>(null);
  const enabled =
    userId !== null &&
    (preference?.userId === userId
      ? preference.enabled
      : loadReminderPreference(userId));

  useEffect(() => {
    if (!supportsDeviceReminders) return;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    let active = true;
    let liveResponseReceived = false;
    void Notifications.getLastNotificationResponseAsync()
      .then((last) => {
        if (active && !liveResponseReceived) setResponse(last);
      })
      .catch(() => undefined);
    const listener = Notifications.addNotificationResponseReceivedListener(
      (next) => {
        liveResponseReceived = true;
        if (active) setResponse(next);
      },
    );
    return () => {
      active = false;
      listener.remove();
    };
  }, []);

  useEffect(() => {
    if (!response || !services || !userId || !navigation?.key) return;
    const data = response.notification.request.content.data;
    const responseKey = JSON.stringify([
      response.notification.request.identifier,
      response.notification.date,
      data?.reminderAt,
    ]);
    if (handledResponse.current === responseKey) return;
    handledResponse.current = responseKey;
    void Notifications.clearLastNotificationResponseAsync().catch(
      () => undefined,
    );
    if (
      !data ||
      data.kind !== 'gameReminder' ||
      data.userId !== userId ||
      typeof data.gameId !== 'string' ||
      !/^[a-zA-Z0-9-]+$/u.test(data.gameId)
    )
      return;
    router.push({
      pathname: '/games/[gameId]',
      params: { gameId: data.gameId },
    });
  }, [navigation?.key, response, services, userId]);

  useEffect(() => {
    if (!supportsDeviceReminders) return;
    let active = true;
    let version = 0;
    const refresh = async () => {
      const request = ++version;
      try {
        if (!services || !enabled || !(await canShowReminders())) {
          if (active && request === version)
            await reconcileDeviceReminders(emptyReminderPlan);
          return;
        }
        const games = await services.games.list();
        if (active && request === version && currentUserId.current === userId) {
          await reconcileDeviceReminders(
            gameReminderPlan(services.currentUser.id, games),
          );
        }
      } catch {
        if (active && request === version)
          setError(
            'Your game reminders could not be updated. Open Settings to try again.',
          );
      }
    };
    void refresh();
    const changes = subscribeToGameChanges(() => void refresh());
    const foreground = AppState.addEventListener('change', (next) => {
      if (next === 'active') void refresh();
    });
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') void refresh();
    }, 60_000);
    return () => {
      active = false;
      version++;
      changes();
      foreground.remove();
      clearInterval(interval);
      void reconcileDeviceReminders(emptyReminderPlan).catch(() => undefined);
    };
  }, [enabled, services, userId, setError]);

  const setEnabled = useCallback(
    async (next: boolean) => {
      if (!userId || pending) return;
      const version = accountVersion.current;
      const stillCurrent = () =>
        currentUserId.current === userId && accountVersion.current === version;
      setPendingUserId(userId);
      setError(null);
      try {
        if (next && !(await requestReminderPermission())) {
          if (stillCurrent())
            setError(
              supportsDeviceReminders
                ? 'Allow notifications in your device settings to enable game reminders.'
                : 'Game reminders are available on iOS and Android.',
            );
          return;
        }
        if (!stillCurrent()) return;
        if (!next && supportsDeviceReminders)
          await reconcileDeviceReminders(emptyReminderPlan);
        if (!stillCurrent()) return;
        saveReminderPreference(userId, next);
        setPreference({ userId, enabled: next });
      } catch {
        if (stillCurrent())
          setError('Your reminder preference could not be saved. Try again.');
      } finally {
        setPendingUserId((current) => (current === userId ? null : current));
      }
    },
    [pending, userId, setError],
  );

  const value = useMemo(
    () => ({
      enabled,
      pending,
      error,
      setEnabled,
      dismissError: () => setError(null),
    }),
    [enabled, pending, error, setEnabled, setError],
  );
  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const value = use(ReminderContext);
  if (!value) throw new Error('useReminders requires ReminderProvider.');
  return value;
}
