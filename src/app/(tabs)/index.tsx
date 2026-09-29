import { useRouter } from 'expo-router';
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
import { demoGameCards } from '../../features/demo/demoData';

const nextGame = demoGameCards.find(
  (entry) => entry.collection === 'mine' && entry.card.variant === 'next',
);
const openGame = demoGameCards.find(
  (entry) => entry.collection === 'mine' && entry.card.variant === 'open',
);

export default function HomeScreen() {
  const router = useRouter();
  const { bottom: bottomInset } = useSafeAreaInsets();
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
          {nextGame?.card.variant === 'next' ? (
            <GameCard
              detailPrimary={nextGame.card.venue}
              detailSecondary={nextGame.card.time}
              eyebrow="Your next game"
              illustration="nextGame"
              onViewGame={() => openGameDetails(nextGame.game.id)}
              participants={nextGame.card.participants}
              title={nextGame.card.title}
              variant="illustrated"
            />
          ) : (
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
        {openGame?.card.variant === 'open' ? (
          <Stack gap="space12">
            <SectionHeader title="Your open game" />
            <GameCard
              {...openGame.card}
              onViewGame={() => openGameDetails(openGame.game.id)}
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
