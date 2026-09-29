import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsRow } from '../design-system/components/content';
import {
  AppHeader,
  SectionHeader,
} from '../design-system/components/navigation';
import { Stack } from '../design-system/primitives';
import { colors, spacing } from '../design-system/tokens';

export default function SettingsScreen() {
  const router = useRouter();
  const [gameReminders, setGameReminders] = useState(true);

  const returnToProfile = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/profile');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader onBackPress={returnToProfile} page="settings" />
        <Stack gap="space12">
          <SectionHeader title="Notifications" />
          <SettingsRow
            checked={gameReminders}
            disabled={false}
            icon="notification"
            label="Game reminders"
            onCheckedChange={setGameReminders}
            variant="toggle"
          />
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.space16,
    padding: spacing.space16,
  },
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
});
