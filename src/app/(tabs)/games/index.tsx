import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { GameCard } from '../../../design-system/components/content';
import { Field } from '../../../design-system/components/forms';
import {
  AppHeader,
  SectionHeader,
  SegmentedControl,
} from '../../../design-system/components/navigation';
import { Stack, Surface, Text } from '../../../design-system/primitives';
import { colors, sizing, spacing } from '../../../design-system/tokens';
import {
  demoGameCards,
  type DemoGameCardEntry,
} from '../../../features/demo/demoData';

const collectionOptions = ['Discover', 'My games'] as const;
type CollectionOption = (typeof collectionOptions)[number];

function collectionKey(option: CollectionOption) {
  return option === 'Discover' ? 'discover' : 'mine';
}

function GameResultCard({
  entry,
  onViewGame,
}: Readonly<{
  entry: DemoGameCardEntry;
  onViewGame: (gameId: string) => void;
}>) {
  const openGame = () => onViewGame(entry.game.id);

  switch (entry.card.variant) {
    case 'next':
      return <GameCard {...entry.card} onViewGame={openGame} />;
    case 'open':
      return <GameCard {...entry.card} onViewGame={openGame} />;
  }
}

export default function GamesScreen() {
  const router = useRouter();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [collection, setCollection] = useState<CollectionOption>('Discover');
  const [venueQuery, setVenueQuery] = useState('');

  const visibleGames = useMemo(() => {
    const normalizedQuery = venueQuery.trim().toLocaleLowerCase();
    return demoGameCards.filter(
      ({ card, collection: entryCollection }) =>
        entryCollection === collectionKey(collection) &&
        (normalizedQuery.length === 0 ||
          card.venue.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [collection, venueQuery]);

  const openGame = (gameId: string) =>
    router.push({ pathname: '/games/[gameId]', params: { gameId } });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: sizing.size112 + bottomInset },
        ]}
        keyboardShouldPersistTaps="handled"
        testID="games-scroll"
      >
        <AppHeader
          onNotificationPress={() => router.push('/notifications')}
          page="games"
        />
        <SegmentedControl
          onValueChange={(value) => {
            if (value === 'Discover' || value === 'My games') {
              setCollection(value);
            }
          }}
          options={collectionOptions}
          value={collection}
        />
        <Field
          label="Venue"
          onChangeText={setVenueQuery}
          placeholder="Search by venue"
          type="search"
          value={venueQuery}
        />
        <Stack gap="space12">
          <SectionHeader
            title={
              collection === 'Discover' ? 'Open games near you' : 'Your games'
            }
          />
          {visibleGames.length > 0 ? (
            <Stack gap="space16">
              {visibleGames.map((entry) => (
                <GameResultCard
                  entry={entry}
                  key={entry.game.id}
                  onViewGame={openGame}
                />
              ))}
            </Stack>
          ) : (
            <Surface padding="space20" radius="radius20">
              <Stack gap="space4">
                <Text variant="heading">No games found</Text>
                <Text color="textSecondary" variant="body">
                  Try searching for a different venue.
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
