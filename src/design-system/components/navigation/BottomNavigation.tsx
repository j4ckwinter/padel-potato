import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '../../assets/Icon';
import { unsupportedValue as unsupported } from '../../internal/validation';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { borders, colors, radii, sizing, spacing } from '../../tokens';

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
            minHeight="size76"
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
    borderRadius: radii.radiusFull,
    borderWidth: borders.borderDefault,
    flexDirection: 'row',
    minHeight: sizing.size76,
    overflow: 'visible',
    width: '100%',
  },
  iconFrame: {
    alignItems: 'center',
    borderRadius: radii.radius16,
    height: sizing.size32,
    justifyContent: 'center',
    width: sizing.size40,
  },
  iconFrameActive: {
    backgroundColor: colors.surfaceAccent,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.space4,
    justifyContent: 'center',
  },
  target: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
  },
});
