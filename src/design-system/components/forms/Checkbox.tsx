import { StyleSheet, View } from 'react-native';

import { Icon } from '../../assets/Icon';
import { unsupportedValue as unsupported } from '../../internal/validation';
import { Pressable } from '../../primitives/Pressable';
import { colors } from '../../tokens';

export type CheckboxProps = Readonly<{
  accessibilityLabel: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}>;

const supportedRuntimeProps = Object.freeze([
  'accessibilityLabel',
  'checked',
  'disabled',
  'onCheckedChange',
] as const);

function validateCheckboxProps(props: CheckboxProps) {
  const runtimeProps = props as unknown as Record<string, unknown>;
  for (const key of Object.keys(runtimeProps)) {
    if (
      !supportedRuntimeProps.includes(
        key as (typeof supportedRuntimeProps)[number],
      )
    ) {
      unsupported(key, supportedRuntimeProps);
    }
  }
  if (
    typeof runtimeProps.accessibilityLabel !== 'string' ||
    runtimeProps.accessibilityLabel.trim().length === 0
  ) {
    unsupported(runtimeProps.accessibilityLabel, [
      'non-empty accessibility label',
    ]);
  }
  if (typeof runtimeProps.checked !== 'boolean') {
    unsupported(runtimeProps.checked, [true, false]);
  }
  if (
    typeof runtimeProps.disabled !== 'undefined' &&
    typeof runtimeProps.disabled !== 'boolean'
  ) {
    unsupported(runtimeProps.disabled, [true, false]);
  }
  if (typeof runtimeProps.onCheckedChange !== 'function') {
    unsupported(runtimeProps.onCheckedChange, ['function']);
  }
}

export function Checkbox(props: CheckboxProps) {
  validateCheckboxProps(props);
  const {
    accessibilityLabel,
    checked,
    disabled = false,
    onCheckedChange,
  } = props;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      size="controlHeight40"
      style={styles.target}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.content,
          {
            backgroundColor: disabled
              ? colors.surfaceMuted
              : checked
                ? colors.accent
                : colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
        testID="checkbox-content"
      >
        {checked ? <Icon name="check" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  target: {
    height: 40,
    width: 40,
  },
});
