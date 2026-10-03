import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../design-system/components/actions';
import { AppHeader } from '../../design-system/components/navigation';
import { Stack, Surface, Text } from '../../design-system/primitives';
import { colors } from '../../design-system/tokens';
import {
  useSocialRefresh,
  useSocialResource,
  useSocialMutationState,
} from '../../features/players/useSocialRefresh';
import { useAppServices } from '../../features/services/AppServicesContext';

export default function InvitationScreen() {
  const router = useRouter();
  const { invitationId } = useLocalSearchParams<{ invitationId: string }>();
  const { invitations } = useAppServices();
  const { version, refresh } = useSocialRefresh();
  const requestScope = useRef({ version: 0 });
  useEffect(() => {
    const scope = requestScope.current;
    scope.version++;
    return () => {
      scope.version++;
    };
  }, [invitations, invitationId]);
  const load = useCallback(
    () =>
      invitationId
        ? invitations.findIncomingById(invitationId)
        : Promise.resolve(null),
    [invitations, invitationId],
  );
  const resource = useSocialResource(load, version);
  const items =
    resource.status === 'ready'
      ? resource.value
        ? [resource.value]
        : []
      : null;
  const [error, setError] = useSocialMutationState<string | null>(
    invitations,
    invitationId ?? '',
    null,
  );
  const [busy, setBusy] = useSocialMutationState<string | null>(
    invitations,
    invitationId ?? '',
    null,
  );
  async function respond(id: string, response: 'accept' | 'decline') {
    if (busy) return;
    const scope = requestScope.current.version;
    setBusy(id);
    setError(null);
    try {
      await invitations.respond(id, response);
      if (scope === requestScope.current.version) refresh();
    } catch (cause) {
      if (scope !== requestScope.current.version) return;
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not answer invitation. Please try again.',
      );
    } finally {
      if (scope === requestScope.current.version) setBusy(null);
    }
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <Surface background="canvas" padding="space16" style={styles.screen}>
        <ScrollView>
          <Stack gap="space16">
            <AppHeader
              page="notifications"
              title="Invitation"
              subtitle="Review your game invitation"
              onBackPress={() =>
                router.canGoBack() ? router.back() : router.replace('/')
              }
            />
            {error || resource.status === 'error' ? (
              <Stack gap="space8">
                <Text accessibilityRole="alert" variant="body">
                  {error ?? 'Could not load invitations. Please try again.'}
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
            {items === null ? (
              resource.status === 'loading' ? (
                <Text variant="body">Loading invitations...</Text>
              ) : null
            ) : items.length === 0 ? (
              <Text variant="body">
                This invitation is no longer available.
              </Text>
            ) : (
              items.map((invitation) => (
                <Surface
                  key={invitation.id}
                  padding="space16"
                  radius="radius16"
                >
                  <Stack gap="space8">
                    <Text variant="heading">{invitation.game.name}</Text>
                    <Text variant="body">
                      {invitation.inviterName} invited you to play at{' '}
                      {invitation.game.venue}.
                    </Text>
                    <Text variant="body">
                      {invitation.game.schedule.date} at{' '}
                      {invitation.game.schedule.time}
                    </Text>
                    <Text variant="body">
                      {invitation.status === 'pending'
                        ? 'Awaiting your response'
                        : invitation.status === 'closed'
                          ? 'Invitation closed'
                          : `Invitation ${invitation.status}`}
                    </Text>
                    {invitation.status === 'pending' ? (
                      <Stack gap="space8">
                        <Button
                          label={`Accept ${invitation.game.name}`}
                          style="primary"
                          size={48}
                          loading={false}
                          {...(busy !== null
                            ? { disabled: true as const }
                            : {})}
                          onPress={() => {
                            void respond(invitation.id, 'accept');
                          }}
                        />
                        <Button
                          label={`Decline ${invitation.game.name}`}
                          style="primary"
                          size={48}
                          loading={false}
                          {...(busy !== null
                            ? { disabled: true as const }
                            : {})}
                          onPress={() => {
                            void respond(invitation.id, 'decline');
                          }}
                        />
                      </Stack>
                    ) : null}
                    <Button
                      label={`View ${invitation.game.name}`}
                      style="secondary"
                      onPress={() =>
                        router.push({
                          pathname: '/games/[gameId]',
                          params: { gameId: invitation.game.id },
                        })
                      }
                    />
                  </Stack>
                </Surface>
              ))
            )}
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
