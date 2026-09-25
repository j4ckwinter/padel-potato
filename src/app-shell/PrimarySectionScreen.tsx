import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../design-system/components/navigation';
import { Stack, Surface, Text } from '../design-system/primitives';
import { colors } from '../design-system/tokens';

type PrimarySectionPage = 'home' | 'games' | 'create' | 'players' | 'profile';

type PrimarySectionScreenProps = Readonly<{
  page: PrimarySectionPage;
}>;

const sectionCopy = Object.freeze({
  create: 'The create game journey will start here.',
  games: 'Your upcoming and open games will appear here.',
  home: 'Your padel group and next match will appear here.',
  players: 'Your friends and padel partners will appear here.',
  profile: 'Your player details and preferences will appear here.',
} satisfies Readonly<Record<PrimarySectionPage, string>>);

export function PrimarySectionScreen({ page }: PrimarySectionScreenProps) {
  const router = useRouter();
  const header =
    page === 'profile' ? (
      <AppHeader page="profile" />
    ) : (
      <AppHeader
        onNotificationPress={() => router.push('/notifications')}
        page={page}
        title={page === 'home' ? 'Padel Potato' : undefined}
      />
    );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <Surface background="canvas" padding="space16" style={styles.screen}>
        <Stack gap="space16">
          {header}
          <Surface padding="space20" radius="radius20">
            <Text color="textSecondary" variant="body">
              {sectionCopy[page]}
            </Text>
          </Surface>
        </Stack>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});
