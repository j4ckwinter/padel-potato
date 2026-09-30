import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { GameCard } from '../../design-system/components/content';
import {
  AppHeader,
  SectionHeader,
} from '../../design-system/components/navigation';
import { Stack } from '../../design-system/primitives';
import { colors, sizing, spacing } from '../../design-system/tokens';
import { demoCurrentGamePlayer } from '../../features/demo/demoData';
import { availableGameSpots, type Game } from '../../features/games/game';
import {
  gameListCard,
  gamesInCollection,
} from '../../features/games/gameCardViewModel';
import { listGames } from '../../features/games/gameRepository';

export default function HomeScreen() {
  const router = useRouter();
  const { bottom: bottomInset } = useSafeAreaInsets();
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

  const myGames = useMemo(
    () => gamesInCollection(games ?? [], 'mine', demoCurrentGamePlayer.id),
    [games],
  );
  const nextGame = myGames.find((game) => availableGameSpots(game) === 0);
  const openGames = myGames.filter((game) => availableGameSpots(game) > 0);
  const visibleOpenGames = openGames.slice(0, 2);
  const recommendedGames = useMemo(
    () =>
      gamesInCollection(
        games ?? [],
        'discover',
        demoCurrentGamePlayer.id,
      ).slice(0, 2),
    [games],
  );
  const nextGameCard = nextGame
    ? gameListCard(nextGame, demoCurrentGamePlayer.id)
    : null;
  const openGameDetails = (gameId: string) =>
    router.push({ pathname: '/games/[gameId]', params: { gameId } });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: sizing.size112 + bottomInset },
        ]}
        testID="home-scroll"
      >
        <AppHeader
          onNotificationPress={() => router.push('/notifications')}
          page="home"
          title="Padel Potato"
        />
        {nextGame && nextGameCard?.variant === 'next' ? (
          <Stack gap="space12">
            <SectionHeader title="Coming up" />
            <GameCard
              detailPrimary={nextGameCard.venue}
              detailSecondary={nextGameCard.time}
              eyebrow="Your next game"
              illustration="nextGame"
              onViewGame={() => openGameDetails(nextGame.id)}
              participants={nextGameCard.participants}
              title={nextGameCard.title}
              variant="illustrated"
            />
          </Stack>
        ) : null}
        {visibleOpenGames.length > 0 ? (
          <Stack gap="space12">
            {openGames.length > 2 ? (
              <SectionHeader
                actionLabel="View all your games"
                onActionPress={() =>
                  router.push({
                    params: { collection: 'mine' },
                    pathname: '/games',
                  })
                }
                title="Your open games"
              />
            ) : (
              <SectionHeader
                title={
                  openGames.length === 1 ? 'Your open game' : 'Your open games'
                }
              />
            )}
            <Stack gap="space16">
              {visibleOpenGames.map((game) => (
                <GameCard
                  {...gameListCard(game, demoCurrentGamePlayer.id)}
                  key={game.id}
                  onViewGame={() => openGameDetails(game.id)}
                />
              ))}
            </Stack>
          </Stack>
        ) : null}
        {recommendedGames.length > 0 ? (
          <Stack gap="space12">
            <SectionHeader
              actionLabel="View all games"
              onActionPress={() => router.push('/games')}
              title="Recommended for you"
            />
            <Stack gap="space16">
              {recommendedGames.map((game) => (
                <GameCard
                  {...gameListCard(game, demoCurrentGamePlayer.id)}
                  key={game.id}
                  onViewGame={() => openGameDetails(game.id)}
                />
              ))}
            </Stack>
          </Stack>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.space20,
    paddingHorizontal: spacing.space16,
    paddingTop: spacing.space16,
  },
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
});
