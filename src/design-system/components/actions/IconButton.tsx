import type { GestureResponderEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '../../assets/Icon';
import { iconNames } from '../../assets/iconDefinitions';
import { Pressable } from '../../primitives/Pressable';
import { colors } from '../../tokens';
import {
  assertOnlyKeys,
  isCallback,
  isNonEmptyString,
  unsupportedValue,
} from '../../internal/validation';

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

function validateIconButtonProps(props: IconButtonProps) {
  assertOnlyKeys(props, supportedRuntimeProps);
  if (!isNonEmptyString(props.accessibilityLabel)) {
    unsupportedValue(props.accessibilityLabel, [
      'non-empty accessibility label',
    ]);
  }
  if (!iconNames.includes(props.icon)) unsupportedValue(props.icon, iconNames);
  if (!iconButtonSizes.includes(props.size ?? 40)) {
    unsupportedValue(props.size, iconButtonSizes);
  }
  if (
    typeof props.disabled !== 'undefined' &&
    typeof props.disabled !== 'boolean'
  ) {
    unsupportedValue(props.disabled, [true, false]);
  }
  if (typeof props.onPress !== 'undefined' && !isCallback(props.onPress)) {
    unsupportedValue(props.onPress, ['function']);
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
