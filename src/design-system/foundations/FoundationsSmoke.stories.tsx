import type { Meta } from '@storybook/react-native';

import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';

export function Smoke() {
  return (
    <Stack gap="space8" justify="center" padding="space24" style={{ flex: 1 }}>
      <Text accessibilityRole="header" variant="heading">
        Foundations smoke story
      </Text>
      <Text variant="body">
        React Native Storybook is connected to the Expo workbench.
      </Text>
    </Stack>
  );
}

const meta = {
  title: 'Foundations/Smoke',
  component: Smoke,
} satisfies Meta<typeof Smoke>;

export default meta;
