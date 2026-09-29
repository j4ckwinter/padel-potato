import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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
import { demoCurrentGamePlayer } from '../../../features/demo/demoData';
import type { Game } from '../../../features/games/game';
import {
  gameListCard,
  gamesInCollection,
  type GameCollection,
} from '../../../features/games/gameCardViewModel';
import { listGames } from '../../../features/games/gameRepository';

const collectionOptions = ['Discover', 'My games'] as const;
type CollectionOption = (typeof collectionOptions)[number];

function collectionKey(option: CollectionOption): GameCollection {
  return option === 'Discover' ? 'discover' : 'mine';
}

function GameResultCard({
  game,
  onViewGame,
}: Readonly<{
  game: Game;
  onViewGame: (gameId: string) => void;
}>) {
  const card = gameListCard(game, demoCurrentGamePlayer.id);
  const openGame = () => onViewGame(game.id);

  switch (card.variant) {
    case 'next':
      return <GameCard {...card} onViewGame={openGame} />;
    case 'open':
      return <GameCard {...card} onViewGame={openGame} />;
  }
}

export default function GamesScreen() {
  const router = useRouter();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [collection, setCollection] = useState<CollectionOption>('Discover');
  const [venueQuery, setVenueQuery] = useState('');
  const [games, setGames] = useState<readonly Game[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void listGames().then((availableGames) => {
        if (active) setGames(availableGames);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const visibleGames = useMemo(() => {
    const normalizedQuery = venueQuery.trim().toLocaleLowerCase();
    return gamesInCollection(
      games ?? [],
      collectionKey(collection),
      demoCurrentGamePlayer.id,
    ).filter(
      (game) =>
        normalizedQuery.length === 0 ||
        game.venue.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [collection, games, venueQuery]);

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
          {games === null ? (
            <Surface padding="space20" radius="radius20">
              <Text color="textSecondary" variant="body">
                Loading games...
              </Text>
            </Surface>
          ) : visibleGames.length > 0 ? (
            <Stack gap="space16">
              {visibleGames.map((game) => (
                <GameResultCard
                  game={game}
                  key={game.id}
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
