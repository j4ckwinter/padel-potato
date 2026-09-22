import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '../../assets/Icon';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';

export const bottomNavigationDestinations = Object.freeze([
  Object.freeze({ destination: 'home', icon: 'home', label: 'Home' }),
  Object.freeze({ destination: 'games', icon: 'calendar', label: 'Games' }),
  Object.freeze({ destination: 'create', icon: 'add', label: 'Create' }),
  Object.freeze({ destination: 'players', icon: 'players', label: 'Players' }),
  Object.freeze({ destination: 'profile', icon: 'profile', label: 'Profile' }),
] as const satisfies readonly Readonly<{
  destination: string;
  icon: IconName;
  label: string;
}>[]);

export type BottomNavigationDestination =
  (typeof bottomNavigationDestinations)[number]['destination'];

export type BottomNavigationProps = Readonly<{
  activeDestination: BottomNavigationDestination;
  onDestinationPress: (destination: BottomNavigationDestination) => void;
}>;

const destinations = bottomNavigationDestinations.map(
  ({ destination }) => destination,
);
const supportedRuntimeProps = Object.freeze([
  'activeDestination',
  'onDestinationPress',
] as const);

const unsupported = (value: unknown, supported: readonly unknown[]): never => {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supported.join(', ')}`,
  );
};

function validateBottomNavigationProps(props: BottomNavigationProps) {
  for (const key of Object.keys(props)) {
    if (
      !supportedRuntimeProps.includes(
        key as (typeof supportedRuntimeProps)[number],
      )
    ) {
      unsupported(key, supportedRuntimeProps);
    }
  }
  if (!destinations.includes(props.activeDestination)) {
    unsupported(props.activeDestination, destinations);
  }
  if (typeof props.onDestinationPress !== 'function') {
    unsupported(props.onDestinationPress, ['function']);
  }
}

export function BottomNavigation(props: BottomNavigationProps) {
  validateBottomNavigationProps(props);
  const { activeDestination, onDestinationPress } = props;

  return (
    <View style={styles.container} testID="bottom-navigation">
      {bottomNavigationDestinations.map(({ destination, icon, label }) => {
        const selected = activeDestination === destination;
        const accentAction = destination === 'create';
        return (
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={destination}
            onPress={() => onDestinationPress(destination)}
            size="controlHeight44"
            style={styles.target}
            testID={`bottom-navigation-${destination}`}
          >
            <View
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.item}
            >
              <View
                style={[
                  styles.iconFrame,
                  (selected || accentAction) && styles.iconFrameActive,
                ]}
              >
                <Icon name={icon} />
              </View>
              <Text
                color={selected || accentAction ? 'ink' : 'muted'}
                variant="micro"
              >
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    height: 76,
    overflow: 'visible',
    width: 390,
  },
  iconFrame: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 40,
  },
  iconFrameActive: {
    backgroundColor: colors.surfaceAccent,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  target: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    height: 76,
  },
});
