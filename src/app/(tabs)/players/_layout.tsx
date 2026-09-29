import { Stack } from 'expo-router';

import { colors } from '../../../design-system/tokens';

export default function PlayersLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.canvas },
        headerShown: false,
      }}
    />
  );
}
