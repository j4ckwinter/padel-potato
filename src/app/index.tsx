import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Stack, Surface, Text } from '../design-system/primitives';
import { colors } from '../design-system/tokens';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Surface background="canvas" padding="space24" style={styles.screen}>
        <Stack gap="space8" justify="center" style={styles.content}>
          <Text variant="display">Padel Potato</Text>
          <Text color="textSecondary" variant="body">
            App foundation ready.
          </Text>
        </Stack>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});
