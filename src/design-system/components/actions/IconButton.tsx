import type { GestureResponderEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '../../assets/Icon';
import { iconNames } from '../../assets/generated/iconRegistry';
import { Pressable } from '../../primitives/Pressable';
import { colors } from '../../tokens';

export const iconButtonSizes = Object.freeze([40, 44] as const);

export type IconButtonSize = (typeof iconButtonSizes)[number];

export type IconButtonProps = Readonly<{
  accessibilityLabel: string;
  disabled?: boolean;
  icon: IconName;
  onPress?: (event: GestureResponderEvent) => void;
  size?: IconButtonSize;
}>;

const supportedRuntimeProps = Object.freeze([
  'accessibilityLabel',
  'disabled',
  'icon',
  'onPress',
  'size',
] as const);

const unsupported = (value: unknown, supported: readonly unknown[]): never => {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supported.join(', ')}`,
  );
};

function validateIconButtonProps(props: IconButtonProps) {
  for (const key of Object.keys(props)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupported(key, supportedRuntimeProps);
    }
  }
  if (
    typeof props.accessibilityLabel !== 'string' ||
    props.accessibilityLabel.trim().length === 0
  ) {
    unsupported(props.accessibilityLabel, ['non-empty accessibility label']);
  }
  if (!iconNames.includes(props.icon)) unsupported(props.icon, iconNames);
  if (!iconButtonSizes.includes(props.size ?? 40)) {
    unsupported(props.size, iconButtonSizes);
  }
  if (typeof props.disabled !== 'undefined' && typeof props.disabled !== 'boolean') {
    unsupported(props.disabled, [true, false]);
  }
  if (typeof props.onPress !== 'undefined' && typeof props.onPress !== 'function') {
    unsupported(props.onPress, ['function']);
  }
}

export function IconButton(props: IconButtonProps) {
  validateIconButtonProps(props);
  const {
    accessibilityLabel,
    disabled = false,
    icon,
    onPress,
    size = 40,
  } = props;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      size={size === 40 ? 'controlHeight40' : 'controlHeight44'}
      style={{ height: size, width: size }}
    >
      {({ pressed }) => (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.content,
            {
              backgroundColor: pressed ? colors.surfaceAccent : colors.surface,
              borderRadius: size / 2,
              height: size,
              width: size,
            },
          ]}
        >
          <Icon name={icon} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
