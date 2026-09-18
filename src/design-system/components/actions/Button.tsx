import type { GestureResponderEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';
import { buttonSizes, buttonStyles } from '../sourceRegistry';

export type ButtonStyle = (typeof buttonStyles)[number];
export type ButtonSize = (typeof buttonSizes)[number];

type ButtonCommonProps = Readonly<{
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
}>;

type EnabledButtonProps = ButtonCommonProps & (
  | Readonly<{
      style: 'primary';
      size?: 40 | 48;
      disabled?: false;
      loading?: false;
    }>
  | Readonly<{
      style: 'secondary' | 'destructive' | 'ghost';
      size?: 48;
      disabled?: false;
      loading?: false;
    }>
);

type DisabledButtonProps = ButtonCommonProps & Readonly<{
  style: 'primary';
  size?: 48;
  disabled: true;
  loading?: false;
}>;

type LoadingButtonProps = ButtonCommonProps & Readonly<{
  style: 'primary';
  size?: 48;
  disabled?: false;
  loading: true;
}>;

export type ButtonProps =
  | EnabledButtonProps
  | DisabledButtonProps
  | LoadingButtonProps;

const supportedRuntimeProps = Object.freeze([
  'disabled',
  'label',
  'loading',
  'onPress',
  'size',
  'style',
] as const);

const backgroundByStyle = Object.freeze({
  primary: colors.accent,
  secondary: colors.surface,
  destructive: colors.danger,
  ghost: colors.canvas,
} as const);

function unsupported(value: unknown, supported: readonly unknown[]): never {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supported.join(', ')}`,
  );
}

function validateButtonProps(props: ButtonProps) {
  for (const key of Object.keys(props)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupported(key, supportedRuntimeProps);
    }
  }

  if (typeof props.label !== 'string' || props.label.trim().length === 0) {
    unsupported(props.label, ['non-empty label']);
  }
  if (!buttonStyles.includes(props.style)) {
    unsupported(props.style, buttonStyles);
  }
  const size = props.size ?? 48;
  if (!buttonSizes.includes(size)) unsupported(size, buttonSizes);
  if (typeof props.disabled !== 'undefined' && typeof props.disabled !== 'boolean') {
    unsupported(props.disabled, [true, false]);
  }
  if (typeof props.loading !== 'undefined' && typeof props.loading !== 'boolean') {
    unsupported(props.loading, [true, false]);
  }
  if (typeof props.onPress !== 'undefined' && typeof props.onPress !== 'function') {
    unsupported(props.onPress, ['function']);
  }
  if (props.disabled && props.loading) {
    throw new Error('Unsupported Button state: disabled and loading cannot both be true.');
  }
  if (size === 40 && props.style !== 'primary') {
    throw new Error(`Unsupported Button combination: ${props.style}/40 has no revision-296 source record.`);
  }
  if ((props.disabled || props.loading) && (props.style !== 'primary' || size !== 48)) {
    throw new Error(
      `Unsupported Button combination: ${props.style}/${size}/${props.loading ? 'loading' : 'disabled'} has no revision-296 source record.`,
    );
  }
}

export function Button(props: ButtonProps) {
  validateButtonProps(props);
  const {
    disabled = false,
    label,
    loading = false,
    onPress,
    size = 48,
    style: buttonStyle,
  } = props;
  const radius = size / 2;
  // Pressable supplies the shared 0.4 blocked opacity. The authored Button
  // disabled fill is 0.32, so its inner accent alpha is 0.8 (0.8 * 0.4).
  const defaultBackground = disabled
    ? 'rgba(173, 229, 51, 0.8)'
    : backgroundByStyle[buttonStyle];

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      loading={loading}
      onPress={onPress}
      size={size === 40 ? 'controlHeight40' : 'controlHeight48'}
      style={{ height: size, width: 160 }}
    >
      {({ pressed }) => (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.content,
            {
              backgroundColor:
                pressed && buttonStyle === 'primary'
                  ? colors.surfaceAccent
                  : defaultBackground,
              borderRadius: radius,
              height: size,
            },
          ]}
        >
          <Text variant="label">{loading ? '•••' : label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: 160,
  },
});
