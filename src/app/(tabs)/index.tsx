import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { Button } from '../../design-system/components/actions';
import { GameCard } from '../../design-system/components/content';
import { EmptyState } from '../../design-system/components/feedback';
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
  const openGame = myGames.find((game) => availableGameSpots(game) > 0);
  const nextGameCard = nextGame
    ? gameListCard(nextGame, demoCurrentGamePlayer.id)
    : null;
  const openGameCard = openGame
    ? gameListCard(openGame, demoCurrentGamePlayer.id)
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
        <Stack gap="space12">
          <SectionHeader title="Coming up" />
          {nextGame && nextGameCard?.variant === 'next' ? (
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
          ) : games === null ? null : (
            <EmptyState
              content="noGames"
              onCreateGame={() => router.push('/create')}
            />
          )}
        </Stack>
        <Stack gap="space12">
          <SectionHeader title="Play padel" />
          <Stack gap="space8">
            <Button
              label="Create a game"
              onPress={() => router.push('/create')}
              style="primary"
            />
            <Button
              label="Find a game"
              onPress={() => router.push('/games')}
              style="secondary"
            />
          </Stack>
        </Stack>
        {openGame && openGameCard?.variant === 'open' ? (
          <Stack gap="space12">
            <SectionHeader title="Your open game" />
            <GameCard
              {...openGameCard}
              onViewGame={() => openGameDetails(openGame.id)}
            />
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
