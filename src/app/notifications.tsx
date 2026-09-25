import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../design-system/components/feedback';
import { AppHeader } from '../design-system/components/navigation';
import { Stack, Surface } from '../design-system/primitives';
import { colors } from '../design-system/tokens';

export default function NotificationsScreen() {
  const router = useRouter();
  const onBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Surface background="canvas" padding="space16" style={styles.screen}>
        <Stack gap="space16">
          <AppHeader page="notifications" onBackPress={onBackPress} />
          <EmptyState content="noNotifications" />
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
