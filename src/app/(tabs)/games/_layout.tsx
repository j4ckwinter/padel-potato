import { Stack } from 'expo-router';

import { colors } from '../../../design-system/tokens';

export default function GamesLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.canvas },
        headerShown: false,
      }}
    />
  );
}
