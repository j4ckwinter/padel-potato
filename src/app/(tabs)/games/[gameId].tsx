import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { PlayerItem } from '../../../design-system/components/content';
import { BannerToast } from '../../../design-system/components/feedback';
import { AppHeader } from '../../../design-system/components/navigation';
import { Stack, Surface, Text } from '../../../design-system/primitives';
import { colors, sizing, spacing } from '../../../design-system/tokens';
import { demoGamePlayers } from '../../../features/demo/demoData';
import {
  findGameById,
  type CreatedGame,
} from '../../../features/games/gameRepository';

type GameLoadState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'notFound' }>
  | Readonly<{ game: CreatedGame; status: 'ready' }>;

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
  year: 'numeric',
});
const gamePlayerCapacity = demoGamePlayers.length;

function gameDate(game: CreatedGame) {
  const [yearText, monthText, dayText] = game.schedule.date.split('-');
  const date = new Date(
    Number(yearText),
    Number(monthText) - 1,
    Number(dayText),
  );
  return `${dateFormatter.format(date)} at ${game.schedule.time}`;
}

function gameAvailability(game: CreatedGame) {
  const spotsLeft = gamePlayerCapacity - game.setup.currentPlayerCount;
  if (spotsLeft === 0) return 'Game full';
  const spotLabel = spotsLeft === 1 ? 'spot' : 'spots';
  return `Open game · ${spotsLeft} ${spotLabel} left`;
}

export default function GameDetailsScreen() {
  const router = useRouter();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const gameId = typeof params.gameId === 'string' ? params.gameId : null;
  const [loadState, setLoadState] = useState<GameLoadState>({
    status: 'loading',
  });
  const [showCreated, setShowCreated] = useState(params.created === 'true');

  useEffect(() => {
    if (gameId === null) {
      return undefined;
    }

    let active = true;
    void findGameById(gameId).then((game) => {
      if (!active) return;
      setLoadState(game ? { game, status: 'ready' } : { status: 'notFound' });
    });

    return () => {
      active = false;
    };
  }, [gameId]);
  const displayedState: GameLoadState =
    gameId === null ? { status: 'notFound' } : loadState;

  const returnToGames = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/games');
  };
  const openPlayers = () => router.push('/players');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: sizing.size112 + bottomInset },
        ]}
      >
        <AppHeader
          onBackPress={returnToGames}
          page="gameDetails"
          subtitle={
            displayedState.status === 'ready'
              ? gameAvailability(displayedState.game)
              : undefined
          }
        />
        {showCreated ? (
          <BannerToast
            message="Your game is ready to share."
            onClose={() => setShowCreated(false)}
            style="success"
            title="Game created"
            type="toast"
          />
        ) : null}
        {displayedState.status === 'loading' ? (
          <Surface padding="space20" radius="radius20">
            <Text color="textSecondary" variant="body">
              Loading game...
            </Text>
          </Surface>
        ) : displayedState.status === 'notFound' ? (
          <Surface padding="space20" radius="radius20">
            <Stack gap="space8">
              <Text variant="heading">Game not found</Text>
              <Text color="textSecondary" variant="body">
                This game is no longer available.
              </Text>
            </Stack>
          </Surface>
        ) : (
          <Stack gap="space16">
            <Surface padding="space20" radius="radius20">
              <Stack gap="space20">
                <Stack gap="space8">
                  <Text accessibilityRole="header" variant="title">
                    {displayedState.game.name}
                  </Text>
                  <Text color="textSecondary" variant="body">
                    {displayedState.game.venue}
                  </Text>
                </Stack>
                <Stack gap="space16">
                  <Stack gap="space4">
                    <Text color="textSecondary" variant="label">
                      Date and time
                    </Text>
                    <Text variant="bodyStrong">
                      {gameDate(displayedState.game)}
                    </Text>
                  </Stack>
                  <Stack gap="space4">
                    <Text color="textSecondary" variant="label">
                      Duration
                    </Text>
                    <Text variant="bodyStrong">
                      {displayedState.game.setup.durationMinutes} minutes
                    </Text>
                  </Stack>
                  <Stack gap="space4">
                    <Text color="textSecondary" variant="label">
                      Game type
                    </Text>
                    <Text variant="bodyStrong">
                      {displayedState.game.setup.format}
                    </Text>
                  </Stack>
                </Stack>
              </Stack>
            </Surface>
            <Stack gap="space12">
              <Text accessibilityRole="header" variant="heading">
                Players
              </Text>
              <Stack gap="space8">
                {demoGamePlayers
                  .slice(0, displayedState.game.setup.currentPlayerCount)
                  .map((identity) => (
                    <PlayerItem
                      identity={identity}
                      key={identity.name}
                      onViewPlayer={openPlayers}
                      variant="game-slot"
                    />
                  ))}
                {Array.from(
                  {
                    length:
                      gamePlayerCapacity -
                      displayedState.game.setup.currentPlayerCount,
                  },
                  (_, index) => (
                    <PlayerItem
                      key={`open-player-slot-${index + 1}`}
                      onInvite={openPlayers}
                      variant="empty-game-slot"
                    />
                  ),
                )}
              </Stack>
            </Stack>
          </Stack>
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
