import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  PlayerPreferencesCard,
  StatTile,
} from '../../../design-system/components/content';
import { AppHeader } from '../../../design-system/components/navigation';
import { Stack, Surface, Text } from '../../../design-system/primitives';
import { colors, sizing, spacing } from '../../../design-system/tokens';
import { findDemoPlayerById } from '../../../features/demo/demoData';

export default function PlayerDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const playerId = typeof params.playerId === 'string' ? params.playerId : null;
  const player = playerId === null ? null : findDemoPlayerById(playerId);
  const [favouriteOverrides, setFavouriteOverrides] = useState<
    Readonly<Record<string, boolean>>
  >({});
  const favourite = player
    ? (favouriteOverrides[player.id] ?? player.favourite)
    : false;

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
        {player ? (
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
            <Stack gap="space12">
              <Text accessibilityRole="header" variant="heading">
                Player stats
              </Text>
              <StatTile
                content="rating"
                label="Rating"
                state="positive"
                supportingText="Current player rating"
                type="featured"
                value={player.stats.rating}
              />
              <View style={styles.statRow}>
                <StatTile
                  content="gamesPlayed"
                  label="Games"
                  state="neutral"
                  supportingText="Games played"
                  type="compact"
                  value={player.stats.gamesPlayed}
                />
                <StatTile
                  content="winRate"
                  label="Win rate"
                  state="positive"
                  supportingText="All-time win rate"
                  type="compact"
                  value={player.stats.winRate}
                />
              </View>
            </Stack>
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
  statRow: {
    flexDirection: 'row',
    gap: spacing.space12,
  },
});
