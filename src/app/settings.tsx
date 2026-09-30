import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../design-system/components/actions';
import { SettingsRow } from '../design-system/components/content';
import { BannerToast } from '../design-system/components/feedback';
import {
  AppHeader,
  SectionHeader,
} from '../design-system/components/navigation';
import { Stack } from '../design-system/primitives';
import { colors, spacing } from '../design-system/tokens';
import { useSession } from '../features/authentication/SessionContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useSession();
  const [gameReminders, setGameReminders] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);

  const returnToProfile = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/profile');
  };

  const endSession = async () => {
    setSigningOut(true);
    setSignOutFailed(false);
    const result = await signOut();
    if (result.status === 'storageError') {
      setSignOutFailed(true);
      setSigningOut(false);
    }
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
        <Stack gap="space12">
          <SectionHeader title="Account" />
          {signOutFailed ? (
            <BannerToast
              message="Your saved session could not be removed."
              onClose={() => setSignOutFailed(false)}
              style="error"
              title="Could not sign out"
              type="toast"
            />
          ) : null}
          {signingOut ? (
            <Button label="Sign out" loading style="primary" />
          ) : (
            <Button
              label="Sign out"
              onPress={() => void endSession()}
              style="destructive"
            />
          )}
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
