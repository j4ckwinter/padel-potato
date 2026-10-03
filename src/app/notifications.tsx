import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../design-system/components/actions';
import { NotificationRow } from '../design-system/components/content';
import { EmptyState } from '../design-system/components/feedback';
import {
  AppHeader,
  SectionHeader,
  SegmentedControl,
} from '../design-system/components/navigation';
import { Stack, Surface, Text } from '../design-system/primitives';
import { colors } from '../design-system/tokens';
import type { ActivityNotification } from '../features/notifications/activity';
import {
  notificationGroups,
  notificationTimestamp,
  rowTypeByKind,
} from '../features/notifications/feedViewModel';
import {
  useSocialRefresh,
  useSocialResource,
  useSocialMutationState,
} from '../features/players/useSocialRefresh';
import { useAppServices } from '../features/services/AppServicesContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications } = useAppServices();
  const { version, refresh } = useSocialRefresh();
  const scope = useRef({ version: 0 });
  useEffect(() => {
    const requestScope = scope.current;
    requestScope.version++;
    return () => {
      requestScope.version++;
    };
  }, [notifications]);
  const load = useCallback(() => notifications.list(), [notifications]);
  const resource = useSocialResource(load, version);
  const items = resource.status === 'ready' ? resource.value : null;
  const [filter, setFilter] = useState('All');
  const [error, setError] = useSocialMutationState<string | null>(
    notifications,
    '',
    null,
  );
  const [busy, setBusy] = useSocialMutationState<string | null>(
    notifications,
    '',
    null,
  );
  const [retryItem, setRetryItem] =
    useSocialMutationState<ActivityNotification | null>(
      notifications,
      '',
      null,
    );
  const unread = items?.filter((item) => item.readAt === null).length;
  async function markRead(item: ActivityNotification, navigate: boolean) {
    if (busy) return;
    const request = scope.current.version;
    setBusy(item.id);
    try {
      await notifications.markRead(item.id);
      if (request !== scope.current.version) return;
      setError(null);
      setRetryItem(null);
      refresh();
    } catch {
      if (request !== scope.current.version) return;
      setError('Could not mark this notification as read. Please try again.');
      setRetryItem(item);
    } finally {
      if (request === scope.current.version) setBusy(null);
    }
    if (request !== scope.current.version || !navigate) return;
    router.push(
      item.target.type === 'invitation'
        ? {
            pathname: '/invitations/[invitationId]',
            params: { invitationId: item.target.invitationId },
          }
        : {
            pathname: '/games/[gameId]',
            params: { gameId: item.target.gameId },
          },
    );
  }
  const now = new Date();
  const groups = notificationGroups(
    items?.filter((item) => filter === 'All' || item.readAt === null) ?? [],
    now,
  );
  return (
    <SafeAreaView style={styles.safeArea}>
      <Surface background="canvas" padding="space16" style={styles.screen}>
        <ScrollView>
          <Stack gap="space16">
            <AppHeader
              page="notifications"
              subtitle={
                unread === undefined
                  ? 'Updates and activity'
                  : `${unread} unread ${unread === 1 ? 'notification' : 'notifications'}`
              }
              onBackPress={() =>
                router.canGoBack() ? router.back() : router.replace('/')
              }
            />
            <SegmentedControl
              options={['All', 'Unread']}
              value={filter}
              onValueChange={setFilter}
            />
            {error ? (
              <Stack gap="space8">
                <Text accessibilityRole="alert" variant="body">
                  {error}
                </Text>
                <Button
                  label="Retry marking as read"
                  style="secondary"
                  onPress={() => {
                    if (retryItem) void markRead(retryItem, false);
                  }}
                />
              </Stack>
            ) : null}
            {resource.status === 'error' ? (
              <Stack gap="space8">
                <Text accessibilityRole="alert" variant="body">
                  Could not load notifications. Please try again.
                </Text>
                <Button
                  label="Retry"
                  style="primary"
                  size={48}
                  loading={false}
                  onPress={refresh}
                />
              </Stack>
            ) : null}
            {resource.status === 'loading' ? (
              <Text variant="body">Loading notifications...</Text>
            ) : null}
            {items !== null && groups.length === 0 ? (
              filter === 'Unread' ? (
                <Text variant="body">
                  You&apos;re all caught up. No unread notifications.
                </Text>
              ) : (
                <EmptyState content="noNotifications" />
              )
            ) : null}
            {groups.map((group) => (
              <Stack key={group.title} gap="space8">
                <SectionHeader title={group.title} />
                {group.items.map((item) => (
                  <NotificationRow
                    key={item.id}
                    title={item.title}
                    message={item.message}
                    read={item.readAt !== null}
                    type={rowTypeByKind[item.kind]}
                    timestamp={notificationTimestamp(item.createdAt, now)}
                    onPress={() => {
                      void markRead(item, true);
                    }}
                  />
                ))}
              </Stack>
            ))}
          </Stack>
        </ScrollView>
      </Surface>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.canvas, flex: 1 },
  screen: { flex: 1 },
});
