import type { Meta } from '@storybook/react-native';
import { StyleSheet, Text, View } from 'react-native';

export function Smoke() {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.heading}>
        Foundations smoke story
      </Text>
      <Text>React Native Storybook is connected to the Expo workbench.</Text>
    </View>
  );
}

const meta = {
  title: 'Foundations/Smoke',
  component: Smoke,
} satisfies Meta<typeof Smoke>;

export default meta;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
  },
});
