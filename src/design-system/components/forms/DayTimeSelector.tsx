import { useState } from 'react';
import { Pressable as NativePressable, StyleSheet, View } from 'react-native';

import { unsupportedValue as unsupported } from '../../internal/validation';
import { Text } from '../../primitives/Text';
import { borders, colors, opacity, radii, sizing, spacing } from '../../tokens';

export const dayTimeSelectorTypes = Object.freeze(['day', 'time'] as const);

export type DayTimeSelectorType = (typeof dayTimeSelectorTypes)[number];

type SelectorStateProps =
  | Readonly<{ selected: boolean; disabled?: false }>
  | Readonly<{ selected: false; disabled: true }>;

type DaySelectorProps = Readonly<{
  date: string;
  day: string;
  type: 'day';
}>;

type TimeSelectorProps = Readonly<{
  availability: string;
  time: string;
  type: 'time';
}>;

type CommonSelectorProps = Readonly<{
  onSelect: () => void;
  selectionMode?: 'single' | 'multiple';
}> &
  SelectorStateProps;

export type DayTimeSelectorProps = CommonSelectorProps &
  (DaySelectorProps | TimeSelectorProps);

const commonRuntimeProps = Object.freeze([
  'disabled',
  'onSelect',
  'selected',
  'selectionMode',
  'type',
] as const);
const dayRuntimeProps = Object.freeze([
  ...commonRuntimeProps,
  'date',
  'day',
] as const);
const timeRuntimeProps = Object.freeze([
  ...commonRuntimeProps,
  'availability',
  'time',
] as const);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

function validateDayTimeSelectorProps(props: DayTimeSelectorProps) {
  const runtimeProps = props as unknown as Record<string, unknown>;
  if (
    !dayTimeSelectorTypes.includes(runtimeProps.type as DayTimeSelectorType)
  ) {
    unsupported(runtimeProps.type, dayTimeSelectorTypes);
  }
  const supportedKeys =
    runtimeProps.type === 'day' ? dayRuntimeProps : timeRuntimeProps;
  for (const key of Object.keys(runtimeProps)) {
    if (!supportedKeys.includes(key as never)) unsupported(key, supportedKeys);
  }
  if (
    runtimeProps.selectionMode !== undefined &&
    runtimeProps.selectionMode !== 'single' &&
    runtimeProps.selectionMode !== 'multiple'
  ) {
    unsupported(runtimeProps.selectionMode, ['single', 'multiple']);
  }
  if (typeof runtimeProps.selected !== 'boolean') {
    unsupported(runtimeProps.selected, [true, false]);
  }
  if (
    typeof runtimeProps.disabled !== 'undefined' &&
    typeof runtimeProps.disabled !== 'boolean'
  ) {
    unsupported(runtimeProps.disabled, [true, false]);
  }
  if (runtimeProps.selected && runtimeProps.disabled) {
    unsupported('selected/disabled', ['default', 'selected', 'disabled']);
  }
  if (typeof runtimeProps.onSelect !== 'function') {
    unsupported(runtimeProps.onSelect, ['function']);
  }
  if (runtimeProps.type === 'day') {
    if (!isNonEmptyString(runtimeProps.day))
      unsupported(runtimeProps.day, ['non-empty day']);
    if (!isNonEmptyString(runtimeProps.date))
      unsupported(runtimeProps.date, ['non-empty date']);
  } else {
    if (!isNonEmptyString(runtimeProps.time))
      unsupported(runtimeProps.time, ['non-empty time']);
    if (!isNonEmptyString(runtimeProps.availability)) {
      unsupported(runtimeProps.availability, ['non-empty availability']);
    }
  }
}

export function DayTimeSelector(props: DayTimeSelectorProps) {
  validateDayTimeSelectorProps(props);
  const { disabled = false, onSelect, selected, type } = props;
  const [focused, setFocused] = useState(false);
  const primary = type === 'day' ? props.day : props.time;
  const supporting = type === 'day' ? props.date : props.availability;
  const accessibleName = `${primary}, ${supporting}`;
  const dimensions = type === 'day' ? styles.day : styles.time;
  const primaryColor = disabled
    ? 'muted'
    : type === 'day' && !selected
      ? 'textSecondary'
      : 'ink';
  const supportingColor = disabled
    ? 'muted'
    : selected
      ? type === 'time'
        ? 'deep'
        : 'ink'
      : 'textSecondary';

  return (
    <View
      style={{ opacity: disabled ? opacity.opacityDisabled : 1 }}
      testID="day-time-selector-root"
    >
      <NativePressable
        accessibilityLabel={accessibleName}
        accessibilityRole={
          props.selectionMode === 'multiple' ? 'checkbox' : 'radio'
        }
        accessibilityState={{ checked: selected, disabled }}
        disabled={disabled}
        focusable={!disabled}
        hitSlop={{ bottom: 0, left: 0, right: 0, top: 0 }}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        onPress={disabled ? undefined : onSelect}
        style={[
          styles.target,
          dimensions,
          {
            backgroundColor: disabled
              ? colors.surfaceMuted
              : selected
                ? colors.accent
                : colors.surface,
            borderColor: focused || selected ? colors.focusRing : colors.border,
            borderWidth:
              focused || selected
                ? borders.focusRingWidth
                : borders.borderDefault,
          },
        ]}
      >
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.content}
          testID="day-time-selector-content"
        >
          <Text
            color={primaryColor}
            variant={type === 'day' ? 'label' : 'bodyStrong'}
          >
            {primary}
          </Text>
          <Text
            color={supportingColor}
            variant={type === 'day' ? 'bodyStrong' : 'caption'}
          >
            {supporting}
          </Text>
        </View>
      </NativePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    borderRadius: radii.radius16,
    gap: spacing.space4,
    justifyContent: 'center',
  },
  day: {
    height: sizing.size72,
    width: sizing.size104,
  },
  target: {
    alignItems: 'center',
    borderRadius: radii.radius16,
    justifyContent: 'center',
    minHeight: sizing.size44,
    minWidth: sizing.size44,
  },
  time: {
    height: sizing.size56,
    width: sizing.size112,
  },
});
