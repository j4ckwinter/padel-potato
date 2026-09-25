import { Tabs } from 'expo-router';

import { PrimaryTabBar } from '../../app-shell/PrimaryTabBar';
import { colors } from '../../design-system/tokens';

export default function PrimaryNavigationLayout() {
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.canvas },
      }}
      tabBar={(props) => <PrimaryTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="games" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="players" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
