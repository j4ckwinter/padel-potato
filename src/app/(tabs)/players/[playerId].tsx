import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { Button } from '../../../design-system/components/actions';
import {
  useSocialRefresh,
  useSocialResource,
  useSocialMutationState,
} from '../../../features/players/useSocialRefresh';
import { PlayerPreferencesCard } from '../../../design-system/components/content';
import { AppHeader } from '../../../design-system/components/navigation';
import { Stack, Surface, Text } from '../../../design-system/primitives';
import { colors, sizing, spacing } from '../../../design-system/tokens';
import { PlayerStats } from '../../../features/players/PlayerStats';
import { useAppServices } from '../../../features/services/AppServicesContext';

export default function PlayerDetailsScreen() {
  const router = useRouter();
  const { players } = useAppServices();
  const params = useLocalSearchParams();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const playerId = typeof params.playerId === 'string' ? params.playerId : null;
  const { version, refresh } = useSocialRefresh();
  const requestScope = useRef({ version: 0 });
  useEffect(() => {
    const scope = requestScope.current;
    scope.version++;
    return () => {
      scope.version++;
    };
  }, [players, playerId]);
  const [saving, setSaving] = useSocialMutationState(
    players,
    playerId ?? '',
    false,
  );
  const [error, setError] = useSocialMutationState<string | null>(
    players,
    playerId ?? '',
    null,
  );
  const load = useCallback(
    () => (playerId ? players.findById(playerId) : Promise.resolve(null)),
    [playerId, players],
  );
  const resource = useSocialResource(load, version);
  const displayedState = resource;
  const player = resource.status === 'ready' ? resource.value : null;
  const favourite = player?.favourite ?? false;

  const returnToPlayers = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/players');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: sizing.size112 + bottomInset },
        ]}
        testID="player-profile-scroll"
      >
        <AppHeader
          favouriteChecked={favourite}
          onBackPress={returnToPlayers}
          onFavouriteChange={async (checked) => {
            if (!player || saving) return;
            const scope = requestScope.current.version;
            setSaving(true);
            setError(null);
            try {
              await players.setFavourite(player.id, checked);
              if (scope === requestScope.current.version) refresh();
            } catch {
              if (scope === requestScope.current.version)
                setError('Could not save favourite. Please try again.');
            } finally {
              if (scope === requestScope.current.version) setSaving(false);
            }
          }}
          page="playerDetails"
          subtitle={
            player
              ? `${player.level} · Rating ${player.stats.rating}`
              : undefined
          }
          title={player?.identity.name}
        />
        {error ? (
          <Text accessibilityRole="alert" variant="body">
            {error}
          </Text>
        ) : null}
        {saving ? <Text variant="body">Saving favourite...</Text> : null}
        {displayedState.status === 'error' ? (
          <Stack gap="space8">
            <Text accessibilityRole="alert" variant="body">
              Could not load this player.
            </Text>
            <Button label="Retry" style="primary" onPress={refresh} />
          </Stack>
        ) : displayedState.status === 'loading' ? (
          <Surface padding="space20" radius="radius20">
            <Text color="textSecondary" variant="body">
              Loading player...
            </Text>
          </Surface>
        ) : player ? (
          <Stack gap="space16">
            <Surface padding="space20" radius="radius20">
              <Stack gap="space8">
                <Text accessibilityRole="header" variant="heading">
                  About {player.identity.name}
                </Text>
                <Text color="textSecondary" variant="body">
                  {player.bio}
                </Text>
              </Stack>
            </Surface>
            <PlayerStats {...player.stats} />
            <PlayerPreferencesCard
              content="profile"
              days={player.preferences.days}
              side={player.preferences.side}
              timeOfDay={player.preferences.timeOfDay}
            />
          </Stack>
        ) : (
          <Surface padding="space20" radius="radius20">
            <Stack gap="space8">
              <Text accessibilityRole="header" variant="heading">
                Player not found
              </Text>
              <Text color="textSecondary" variant="body">
                This player profile is no longer available.
              </Text>
            </Stack>
          </Surface>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.space16,
    paddingHorizontal: spacing.space16,
    paddingTop: spacing.space16,
  },
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
});
