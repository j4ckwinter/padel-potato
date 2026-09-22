import { View } from 'react-native';

import { Icon } from '../../../assets/Icon';
import { Pressable } from '../../../primitives/Pressable';
import { Text } from '../../../primitives/Text';
import { isNonEmptyString } from '../../../internal/validation';
import {
  FieldShell,
  fieldAccessibilityHint,
  fieldAccessibleName,
  fieldBorderColor,
} from './FieldShell';
import { fieldStyles } from './styles';
import type { TriggerFieldProps, TriggerFieldType } from './types';

function triggerIcon(type: TriggerFieldType) {
  if (type === 'date') return 'calendar' as const;
  if (type === 'time') return 'clock' as const;
  return 'chevron' as const;
}

export function TriggerField(props: TriggerFieldProps) {
  const status = props.status ?? 'default';
  const hasValue = isNonEmptyString(props.value);
  const displayedValue = hasValue ? props.value : (props.placeholder as string);

  return (
    <FieldShell props={props}>
      <Pressable
        accessibilityHint={fieldAccessibilityHint(props)}
        accessibilityLabel={fieldAccessibleName(
          props.label,
          props.required ?? false,
        )}
        accessibilityRole="button"
        accessibilityValue={{ text: displayedValue }}
        disabled={props.disabled}
        onPress={props.onPress}
        size="controlHeight48"
        style={fieldStyles.trigger}
        testID="field-control"
      >
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            fieldStyles.triggerContent,
            { borderColor: fieldBorderColor(status) },
          ]}
        >
          <Text
            color={hasValue ? 'ink' : 'muted'}
            style={fieldStyles.triggerText}
            variant="body"
          >
            {displayedValue}
          </Text>
          <Icon name={triggerIcon(props.type)} />
        </View>
      </Pressable>
    </FieldShell>
  );
}
