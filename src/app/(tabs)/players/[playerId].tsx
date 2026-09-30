import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { PlayerPreferencesCard } from '../../../design-system/components/content';
import { AppHeader } from '../../../design-system/components/navigation';
import { Stack, Surface, Text } from '../../../design-system/primitives';
import { colors, sizing, spacing } from '../../../design-system/tokens';
import { PlayerStats } from '../../../features/players/PlayerStats';
import type { PlayerDirectoryEntry } from '../../../features/players/player';
import { useAppServices } from '../../../features/services/AppServicesContext';

type PlayerLoadState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ playerId: string; status: 'notFound' }>
  | Readonly<{
      player: PlayerDirectoryEntry;
      playerId: string;
      status: 'ready';
    }>;

export default function PlayerDetailsScreen() {
  const router = useRouter();
  const { players } = useAppServices();
  const params = useLocalSearchParams();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const playerId = typeof params.playerId === 'string' ? params.playerId : null;
  const [loadState, setLoadState] = useState<PlayerLoadState>({
    status: 'loading',
  });
  const [favouriteOverrides, setFavouriteOverrides] = useState<
    Readonly<Record<string, boolean>>
  >({});
  const displayedState: PlayerLoadState =
    playerId === null
      ? { playerId: '', status: 'notFound' }
      : 'playerId' in loadState && loadState.playerId === playerId
        ? loadState
        : { status: 'loading' };
  const player =
    displayedState.status === 'ready' ? displayedState.player : null;
  const favourite = player
    ? (favouriteOverrides[player.id] ?? player.favourite)
    : false;

  useEffect(() => {
    if (playerId === null) return undefined;

    let active = true;
    void players.findById(playerId).then((foundPlayer) => {
      if (!active) return;
      setLoadState(
        foundPlayer === null
          ? { playerId, status: 'notFound' }
          : { player: foundPlayer, playerId, status: 'ready' },
      );
    });
    return () => {
      active = false;
    };
  }, [playerId, players]);

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
          onFavouriteChange={(checked) => {
            if (player) {
              setFavouriteOverrides((overrides) => ({
                ...overrides,
                [player.id]: checked,
              }));
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
        {displayedState.status === 'loading' ? (
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
