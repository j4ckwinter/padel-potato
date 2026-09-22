import { StyleSheet, View } from 'react-native';

import { unsupportedValue as unsupported } from '../../internal/validation';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { borders, colors, radii, sizing } from '../../tokens';

export type SegmentOptions =
  | readonly [string, string]
  | readonly [string, string, string]
  | readonly [string, string, string, string];

export type SegmentedControlProps = Readonly<{
  disabled?: boolean;
  onValueChange: (value: string) => void;
  options: SegmentOptions;
  value: string;
}>;

const supportedRuntimeProps = Object.freeze([
  'disabled',
  'onValueChange',
  'options',
  'value',
] as const);

function validOptions(options: unknown): options is SegmentOptions {
  return (
    Array.isArray(options) &&
    [2, 3, 4].includes(options.length) &&
    options.every(
      (option) => typeof option === 'string' && option.trim().length > 0,
    ) &&
    new Set(options).size === options.length
  );
}

function validateSegmentedControlProps(props: SegmentedControlProps) {
  for (const key of Object.keys(props)) {
    if (
      !supportedRuntimeProps.includes(
        key as (typeof supportedRuntimeProps)[number],
      )
    ) {
      unsupported(key, supportedRuntimeProps);
    }
  }
  if (!validOptions(props.options)) {
    unsupported(props.options, ['exactly 2, 3, or 4 unique non-empty options']);
  }
  if (!props.options.includes(props.value)) {
    unsupported(props.value, props.options);
  }
  if (typeof props.onValueChange !== 'function') {
    unsupported(props.onValueChange, ['function']);
  }
  if (
    typeof props.disabled !== 'undefined' &&
    typeof props.disabled !== 'boolean'
  ) {
    unsupported(props.disabled, [true, false]);
  }
}

export function SegmentedControl(props: SegmentedControlProps) {
  validateSegmentedControlProps(props);
  const { disabled = false, onValueChange, options, value } = props;

  return (
    <View style={styles.container} testID="segmented-control">
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            accessibilityLabel={option}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            disabled={disabled}
            key={option}
            minHeight="size48"
            onPress={() => onValueChange(option)}
            size="controlHeight48"
            style={styles.target}
            testID={`segmented-control-${option}`}
          >
            <View
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.segment, selected && styles.segmentSelected]}
            >
              <Text color={selected ? 'ink' : 'textSecondary'} variant="label">
                {option}
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
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.radius20,
    flexDirection: 'row',
    minHeight: sizing.size48,
    overflow: 'visible',
    width: '100%',
  },
  segment: {
    alignItems: 'center',
    borderColor: colors.transparent,
    borderRadius: radii.radius20,
    borderWidth: borders.borderDefault,
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
  },
  segmentSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
  },
  target: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
  },
});
