import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
import type {
  CompletedGame,
  Game,
  ScheduledGame,
} from '../../../features/games/game';
import {
  completedGameListCard,
  completedGamesForPlayer,
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

function requestedCollection(value: string | string[] | undefined) {
  return value === 'mine' ? 'My games' : 'Discover';
}

function ActiveGameCard({
  game,
  onViewGame,
}: Readonly<{
  game: ScheduledGame;
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

function PreviousGameCard({
  game,
  onViewGame,
}: Readonly<{
  game: CompletedGame;
  onViewGame: (gameId: string) => void;
}>) {
  return (
    <GameCard
      {...completedGameListCard(game, demoCurrentGamePlayer.id)}
      onViewResults={() => onViewGame(game.id)}
    />
  );
}

export default function GamesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const collection = requestedCollection(params.collection);
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
  const previousGames = useMemo(() => {
    if (collection !== 'My games') return [];
    const normalizedQuery = venueQuery.trim().toLocaleLowerCase();
    return completedGamesForPlayer(
      games ?? [],
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
              router.setParams({ collection: collectionKey(value) });
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
              collection === 'Discover'
                ? 'Open games near you'
                : 'Upcoming games'
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
                <ActiveGameCard
                  game={game}
                  key={game.id}
                  onViewGame={openGame}
                />
              ))}
            </Stack>
          ) : (
            <Surface padding="space20" radius="radius20">
              <Stack gap="space4">
                <Text variant="heading">
                  {collection === 'Discover'
                    ? 'No games found'
                    : 'No upcoming games'}
                </Text>
                <Text color="textSecondary" variant="body">
                  {collection === 'Discover' || venueQuery.trim().length > 0
                    ? 'Try searching for a different venue.'
                    : 'Create or join a game to add it here.'}
                </Text>
              </Stack>
            </Surface>
          )}
        </Stack>
        {collection === 'My games' && games !== null ? (
          <Stack gap="space12">
            <SectionHeader title="Previous games" />
            {previousGames.length > 0 ? (
              <Stack gap="space16">
                {previousGames.map((game) => (
                  <PreviousGameCard
                    game={game}
                    key={game.id}
                    onViewGame={openGame}
                  />
                ))}
              </Stack>
            ) : (
              <Surface padding="space20" radius="radius20">
                <Stack gap="space4">
                  <Text variant="heading">No previous games yet</Text>
                  <Text color="textSecondary" variant="body">
                    {venueQuery.trim().length > 0
                      ? 'Try searching for a different venue.'
                      : 'Completed games will appear here.'}
                  </Text>
                </Stack>
              </Surface>
            )}
          </Stack>
        ) : null}
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
