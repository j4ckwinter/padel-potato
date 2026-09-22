import { View } from 'react-native';

import { Pressable } from '../../../primitives/Pressable';
import { Text } from '../../../primitives/Text';
import {
  FieldShell,
  fieldAccessibilityHint,
  fieldAccessibleName,
  fieldBorderColor,
} from './FieldShell';
import { fieldStyles } from './styles';
import type { StepperFieldProps } from './types';

function StepperAction({
  disabled,
  label,
  onPress,
  symbol,
}: Readonly<{ disabled: boolean; label: string; onPress: () => void; symbol: '−' | '+' }>) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      size="controlHeight44"
      style={fieldStyles.stepperAction}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={fieldStyles.stepperActionContent}
      >
        <Text variant="heading">{symbol}</Text>
      </View>
    </Pressable>
  );
}

export function StepperField(props: StepperFieldProps) {
  const status = props.status ?? 'default';
  const globallyDisabled = props.disabled ?? false;

  return (
    <FieldShell props={props}>
      <View
        style={[
          fieldStyles.control,
          fieldStyles.stepperControl,
          { borderColor: fieldBorderColor(status) },
        ]}
        testID="field-control"
      >
        <View
          accessibilityHint={fieldAccessibilityHint(props)}
          accessibilityLabel={`${fieldAccessibleName(props.label, props.required ?? false)} value`}
          accessibilityValue={{ text: props.value }}
          accessible
          style={[fieldStyles.stepperValue, globallyDisabled ? fieldStyles.disabled : undefined]}
          testID="field-stepper-value"
        >
          <Text variant="body">{props.value}</Text>
        </View>
        <View style={fieldStyles.stepperActions}>
          <StepperAction
            disabled={globallyDisabled || (props.decrementDisabled ?? false)}
            label={`Decrease ${props.label}`}
            onPress={props.onDecrement}
            symbol="−"
          />
          <StepperAction
            disabled={globallyDisabled || (props.incrementDisabled ?? false)}
            label={`Increase ${props.label}`}
            onPress={props.onIncrement}
            symbol="+"
          />
        </View>
      </View>
    </FieldShell>
  );
}
