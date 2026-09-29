import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  PlayerPreferencesCard,
  SettingsRow,
} from '../../design-system/components/content';
import { Avatar } from '../../design-system/components/identity';
import {
  AppHeader,
  SectionHeader,
} from '../../design-system/components/navigation';
import { Inline, Stack, Surface, Text } from '../../design-system/primitives';
import { colors, sizing, spacing } from '../../design-system/tokens';
import { demoCurrentUser } from '../../features/demo/demoData';
import { PlayerStats } from '../../features/players/PlayerStats';

export default function ProfileScreen() {
  const router = useRouter();
  const { bottom: bottomInset } = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: sizing.size112 + bottomInset },
        ]}
        testID="profile-scroll"
      >
        <AppHeader page="profile" />
        <Surface padding="space20" radius="radius20">
          <Inline align="center" gap="space16">
            <Avatar
              accessibilityLabel={`${demoCurrentUser.identity.name} profile photo`}
              initials={demoCurrentUser.identity.initials}
              presence={demoCurrentUser.identity.presence}
              size={48}
            />
            <Stack gap="space4">
              <Text accessibilityRole="header" variant="title">
                {demoCurrentUser.identity.name}
              </Text>
              <Text color="textSecondary" variant="body">
                {demoCurrentUser.level} · Rating {demoCurrentUser.stats.rating}
              </Text>
            </Stack>
          </Inline>
        </Surface>
        <PlayerStats {...demoCurrentUser.stats} />
        <PlayerPreferencesCard
          content="full"
          days={demoCurrentUser.preferences.days}
          level={demoCurrentUser.level}
          side={demoCurrentUser.preferences.side}
          timeOfDay={demoCurrentUser.preferences.timeOfDay}
        />
        <Stack gap="space12">
          <SectionHeader title="Account" />
          <SettingsRow
            disabled={false}
            icon="profile"
            label="Account settings"
            onPress={() => router.push('/settings')}
            variant="navigation"
          />
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
