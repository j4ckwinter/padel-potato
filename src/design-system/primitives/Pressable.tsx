import { useState } from 'react';
import {
  Pressable as NativePressable,
  type GestureResponderEvent,
  type NativeSyntheticEvent,
  type PressableProps as NativePressableProps,
  type StyleProp,
  type TargetedEvent,
  type ViewStyle,
} from 'react-native';

import { borders, colors, dimensions, opacity } from '../tokens';
import {
  guardStyle,
  resolveBooleanDesignValue,
  resolveDesignToken,
} from './styleGuards';

const pressableSizes = {
  controlHeight40: dimensions.controlHeight40,
  controlHeight44: dimensions.controlHeight44,
  controlHeight48: dimensions.controlHeight48,
} as const;

const pressableLayoutStyleKeys = [
  'alignSelf',
  'bottom',
  'flex',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'height',
  'left',
  'margin',
  'marginBottom',
  'marginEnd',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginTop',
  'marginVertical',
  'position',
  'right',
  'top',
  'width',
] as const satisfies readonly (keyof ViewStyle)[];

const pressableOwnedStyleKeys = [
  'minHeight',
  'minWidth',
  'opacity',
  'outlineColor',
  'outlineStyle',
  'outlineWidth',
] as const satisfies readonly (keyof ViewStyle)[];

const supportedRuntimeProps = [
  'accessibilityActions',
  'accessibilityElementsHidden',
  'accessibilityHint',
  'accessibilityLabel',
  'accessibilityLanguage',
  'accessibilityLiveRegion',
  'accessibilityRole',
  'accessibilityState',
  'accessibilityValue',
  'accessible',
  'children',
  'disabled',
  'focusable',
  'id',
  'importantForAccessibility',
  'loading',
  'nativeID',
  'onAccessibilityAction',
  'onAccessibilityEscape',
  'onAccessibilityTap',
  'onBlur',
  'onFocus',
  'onLayout',
  'onMagicTap',
  'onPress',
  'size',
  'style',
  'testID',
] as const;

const unsupported = (value: unknown, supportedValues: readonly string[]): never => {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supportedValues.join(', ')}`,
  );
};

export type PressableSize = keyof typeof pressableSizes;
export type PressableLayoutStyle = Pick<
  ViewStyle,
  (typeof pressableLayoutStyleKeys)[number]
>;

type SupportedNativeProps = Pick<
  NativePressableProps,
  | 'accessibilityActions'
  | 'accessibilityElementsHidden'
  | 'accessibilityHint'
  | 'accessibilityLabel'
  | 'accessibilityLanguage'
  | 'accessibilityLiveRegion'
  | 'accessibilityRole'
  | 'accessibilityState'
  | 'accessibilityValue'
  | 'accessible'
  | 'children'
  | 'focusable'
  | 'id'
  | 'importantForAccessibility'
  | 'nativeID'
  | 'onAccessibilityAction'
  | 'onAccessibilityEscape'
  | 'onAccessibilityTap'
  | 'onBlur'
  | 'onFocus'
  | 'onLayout'
  | 'onMagicTap'
  | 'testID'
>;

export type PressableProps = SupportedNativeProps & {
  disabled?: boolean;
  loading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  size?: PressableSize;
  style?: StyleProp<PressableLayoutStyle>;
};

/**
 * Shared native activation boundary.
 *
 * `controlHeight40` uses two points of symmetric hit expansion to declare a
 * 44x44 target. React Native clips hitSlop to the parent bounds, so consumers
 * must retain at least two points of clear surrounding parent space.
 */
export function Pressable(props: PressableProps) {
  for (const key of Object.keys(props)) {
    if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
      unsupported(key, supportedRuntimeProps);
    }
  }

  const {
    accessibilityState,
    disabled = false,
    loading = false,
    onBlur,
    onFocus,
    onPress,
    size = 'controlHeight44',
    style,
    ...nativeProps
  } = props;

  guardStyle(style, pressableOwnedStyleKeys, pressableLayoutStyleKeys);
  const isDisabled = resolveBooleanDesignValue(disabled, true, false);
  const isLoading = resolveBooleanDesignValue(loading, true, false);
  const visualSize = resolveDesignToken(pressableSizes, size);
  const blocked = isDisabled || isLoading;
  const expansion = Math.max(0, (44 - visualSize) / 2);
  const [focused, setFocused] = useState(false);

  const handleFocus = (event: NativeSyntheticEvent<TargetedEvent>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: NativeSyntheticEvent<TargetedEvent>) => {
    setFocused(false);
    onBlur?.(event);
  };

  const handlePress = onPress
    ? (event: GestureResponderEvent) => {
        if (!blocked) onPress(event);
      }
    : undefined;

  return (
    <NativePressable
      {...nativeProps}
      accessibilityState={{
        ...accessibilityState,
        busy: isLoading,
        disabled: blocked,
      }}
      disabled={blocked}
      hitSlop={{
        bottom: expansion,
        left: expansion,
        right: expansion,
        top: expansion,
      }}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onPress={handlePress}
      style={[
        style,
        {
          minHeight: visualSize,
          minWidth: visualSize,
          opacity: blocked ? opacity.opacityDisabled : 1,
          outlineColor: colors.focusRing,
          outlineStyle: 'solid',
          outlineWidth: focused ? borders.focusRingWidth : 0,
        },
      ]}
    />
  );
}
