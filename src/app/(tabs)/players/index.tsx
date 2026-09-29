import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { PlayerItem } from '../../../design-system/components/content';
import { Field } from '../../../design-system/components/forms';
import {
  AppHeader,
  SectionHeader,
  SegmentedControl,
} from '../../../design-system/components/navigation';
import { Stack, Surface, Text } from '../../../design-system/primitives';
import { colors, sizing, spacing } from '../../../design-system/tokens';
import { demoPlayers } from '../../../features/demo/demoData';

const collectionOptions = ['Friends', 'Discover'] as const;
type CollectionOption = (typeof collectionOptions)[number];

function initialCollection(
  view: string | string[] | undefined,
): CollectionOption {
  return view === 'discover' ? 'Discover' : 'Friends';
}

function collectionKey(option: CollectionOption) {
  return option === 'Friends' ? 'friends' : 'discover';
}

export default function PlayersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [collection, setCollection] = useState<CollectionOption>(() =>
    initialCollection(params.view),
  );
  const [playerQuery, setPlayerQuery] = useState('');

  const visiblePlayers = useMemo(() => {
    const normalizedQuery = playerQuery.trim().toLocaleLowerCase();
    return demoPlayers.filter(
      (player) =>
        player.collection === collectionKey(collection) &&
        (normalizedQuery.length === 0 ||
          player.identity.name.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [collection, playerQuery]);

  const openPlayer = (playerId: string) =>
    router.push({ pathname: '/players/[playerId]', params: { playerId } });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: sizing.size112 + bottomInset },
        ]}
        keyboardShouldPersistTaps="handled"
        testID="players-scroll"
      >
        <AppHeader
          onNotificationPress={() => router.push('/notifications')}
          page="players"
        />
        <SegmentedControl
          onValueChange={(value) => {
            if (value === 'Friends' || value === 'Discover') {
              setCollection(value);
            }
          }}
          options={collectionOptions}
          value={collection}
        />
        <Field
          label="Player"
          onChangeText={setPlayerQuery}
          placeholder="Search by name"
          type="search"
          value={playerQuery}
        />
        <Stack gap="space12">
          <SectionHeader
            title={collection === 'Friends' ? 'Your players' : 'Find players'}
          />
          {visiblePlayers.length > 0 ? (
            <Stack gap="space8">
              {visiblePlayers.map((player) => (
                <PlayerItem
                  identity={player.identity}
                  key={player.id}
                  onViewPlayer={() => openPlayer(player.id)}
                  variant="profile-link"
                />
              ))}
            </Stack>
          ) : (
            <Surface padding="space20" radius="radius20">
              <Stack gap="space4">
                <Text variant="heading">No players found</Text>
                <Text color="textSecondary" variant="body">
                  Try searching for a different name.
                </Text>
              </Stack>
            </Surface>
          )}
        </Stack>
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
