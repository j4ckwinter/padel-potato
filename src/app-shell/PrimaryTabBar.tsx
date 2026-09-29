import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BottomNavigation,
  bottomNavigationDestinations,
  type BottomNavigationDestination,
} from '../design-system/components/navigation/BottomNavigation';
import { colors, spacing } from '../design-system/tokens';

type TabBarRenderer = NonNullable<ComponentProps<typeof Tabs>['tabBar']>;
type PrimaryTabBarProps = Parameters<TabBarRenderer>[0];

const routeNameByDestination = {
  create: 'create',
  games: 'games',
  home: 'index',
  players: 'players',
  profile: 'profile',
} as const satisfies Readonly<Record<BottomNavigationDestination, string>>;

function destinationForRouteName(
  routeName: string,
): BottomNavigationDestination {
  const match = bottomNavigationDestinations.find(
    ({ destination }) => routeNameByDestination[destination] === routeName,
  );

  if (!match) {
    throw new Error(`Unsupported primary navigation route: ${routeName}`);
  }

  return match.destination;
}

export function PrimaryTabBar({ navigation, state }: PrimaryTabBarProps) {
  const activeRoute = state.routes[state.index];

  if (!activeRoute) {
    throw new Error('Primary navigation has no active route.');
  }

  const activeDestination = destinationForRouteName(activeRoute.name);
  const onDestinationPress = (destination: BottomNavigationDestination) => {
    const routeName = routeNameByDestination[destination];
    const route = state.routes.find(
      (candidate) => candidate.name === routeName,
    );

    if (!route) {
      throw new Error(`Primary navigation route is missing: ${routeName}`);
    }

    const event = navigation.emit({
      canPreventDefault: true,
      target: route.key,
      type: 'tabPress',
    });

    if (route.key !== activeRoute.key && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      pointerEvents="box-none"
      style={styles.safeArea}
      testID="primary-tab-bar"
    >
      <View style={styles.frame}>
        <BottomNavigation
          activeDestination={activeDestination}
          onDestinationPress={onDestinationPress}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  frame: {
    paddingBottom: spacing.space8,
    paddingHorizontal: spacing.space16,
    paddingTop: spacing.space8,
  },
  safeArea: {
    backgroundColor: colors.transparent,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
