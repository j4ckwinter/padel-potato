import { View } from 'react-native';

import { Text } from '../../../primitives/Text';
import { colors } from '../../../tokens';
import { fieldStyles } from './styles';
import type { FieldProps, FieldStatus } from './types';

export const fieldLabel = (label: string, required: boolean) =>
  required ? `${label} *` : label;

export const fieldAccessibleName = (label: string, required: boolean) =>
  required ? `${label}, required` : label;

export function fieldAccessibilityHint(props: FieldProps) {
  const parts: string[] = [];
  if ('readOnly' in props && props.readOnly) parts.push('Read only');
  if (props.status === 'error') parts.push(`Error: ${props.message}`);
  if (props.status === 'success') parts.push(`Success: ${props.message}`);
  if ((props.status ?? 'default') === 'default' && props.helperText) parts.push(props.helperText);
  return parts.length > 0 ? parts.join('. ') : undefined;
}

export function fieldBorderColor(status: FieldStatus) {
  if (status === 'error') return colors.danger;
  if (status === 'success') return colors.accent;
  return colors.border;
}

export function FieldShell({
  children,
  props,
}: Readonly<{ children: React.ReactNode; props: FieldProps }>) {
  const supportingText = props.status === 'default' || props.status === undefined
    ? props.helperText
    : props.message;

  return (
    <View
      style={[
        fieldStyles.field,
        supportingText
          ? fieldStyles.fieldWithSupportingText
          : fieldStyles.fieldWithoutSupportingText,
      ]}
      testID="field"
    >
      <View style={fieldStyles.labelRow}>
        <Text color="textSecondary" variant="label">
          {fieldLabel(props.label, props.required ?? false)}
        </Text>
      </View>
      {children}
      {supportingText ? (
        <View style={fieldStyles.supportingRow}>
          <Text
            accessibilityLiveRegion={props.status === 'error' ? 'assertive' : 'polite'}
            variant="caption"
          >
            {supportingText}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
