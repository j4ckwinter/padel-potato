import { useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '../../assets/Icon';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { borders, colors, opacity, radii, typography } from '../../tokens';
import { IconButton } from '../actions';

export const editableFieldTypes = Object.freeze(['text', 'password', 'search'] as const);
export const triggerFieldTypes = Object.freeze(['select', 'date', 'time'] as const);
export const fieldTypes = Object.freeze([
  ...editableFieldTypes,
  ...triggerFieldTypes,
  'stepper',
] as const);
export const fieldStatuses = Object.freeze(['default', 'success', 'error'] as const);

export type EditableFieldType = (typeof editableFieldTypes)[number];
export type TriggerFieldType = (typeof triggerFieldTypes)[number];
export type FieldStatus = (typeof fieldStatuses)[number];

type DefaultMessageProps = Readonly<{
  helperText?: string;
  message?: never;
  status?: 'default';
}>;

type ValidationMessageProps = Readonly<{
  helperText?: never;
  message: string;
  status: 'error' | 'success';
}>;

type FieldMessageProps = DefaultMessageProps | ValidationMessageProps;

type FieldBaseProps = Readonly<{
  disabled?: boolean;
  label: string;
  required?: boolean;
  value: string;
}> & FieldMessageProps;

type FieldPlaceholderProps = Readonly<{
  placeholder?: string;
}>;

export type EditableFieldProps = FieldBaseProps & FieldPlaceholderProps &
  Readonly<{
    onChangeText: (value: string) => void;
    readOnly?: boolean;
    type: EditableFieldType;
  }>;

export type TriggerFieldProps = FieldBaseProps & FieldPlaceholderProps &
  Readonly<{
    onPress: (event: GestureResponderEvent) => void;
    type: TriggerFieldType;
  }>;

export type StepperFieldProps = FieldBaseProps &
  Readonly<{
    decrementDisabled?: boolean;
    incrementDisabled?: boolean;
    onDecrement: () => void;
    onIncrement: () => void;
    type: 'stepper';
  }>;

export type FieldProps = EditableFieldProps | TriggerFieldProps | StepperFieldProps;

const commonRuntimeProps = Object.freeze([
  'disabled',
  'helperText',
  'label',
  'message',
  'required',
  'status',
  'type',
  'value',
] as const);

const editableRuntimeProps = Object.freeze([
  ...commonRuntimeProps,
  'onChangeText',
  'placeholder',
  'readOnly',
] as const);

const triggerRuntimeProps = Object.freeze([
  ...commonRuntimeProps,
  'onPress',
  'placeholder',
] as const);

const stepperRuntimeProps = Object.freeze([
  ...commonRuntimeProps,
  'decrementDisabled',
  'incrementDisabled',
  'onDecrement',
  'onIncrement',
] as const);

const unsupported = (value: unknown, supported: readonly unknown[]): never => {
  throw new Error(
    `Unsupported design-system value: ${String(value)}. Supported values: ${supported.join(', ')}`,
  );
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

function validateCommonProps(props: FieldProps) {
  if (!isNonEmptyString(props.label)) unsupported(props.label, ['non-empty label']);
  if (typeof props.value !== 'string') unsupported(props.value, ['string value']);
  if (typeof props.disabled !== 'undefined' && typeof props.disabled !== 'boolean') {
    unsupported(props.disabled, [true, false]);
  }
  if (typeof props.required !== 'undefined' && typeof props.required !== 'boolean') {
    unsupported(props.required, [true, false]);
  }

  const status = props.status ?? 'default';
  if (!fieldStatuses.includes(status)) unsupported(status, fieldStatuses);
  if (status === 'default') {
    if (typeof props.message !== 'undefined') {
      unsupported('message', ['helperText for default status']);
    }
    if (typeof props.helperText !== 'undefined' && !isNonEmptyString(props.helperText)) {
      unsupported(props.helperText, ['non-empty helper text']);
    }
  } else {
    if (!isNonEmptyString(props.message)) {
      unsupported(props.message, [`non-empty ${status} message`]);
    }
    if (typeof props.helperText !== 'undefined') {
      unsupported('helperText', ['message for success or error status']);
    }
  }
}

function validateFieldProps(props: FieldProps) {
  const type = props.type;
  if (!fieldTypes.includes(type as (typeof fieldTypes)[number])) {
    unsupported(type, fieldTypes);
  }

  const editable = editableFieldTypes.includes(type as EditableFieldType);
  const trigger = triggerFieldTypes.includes(type as TriggerFieldType);
  const supportedKeys = editable
    ? editableRuntimeProps
    : trigger
      ? triggerRuntimeProps
      : stepperRuntimeProps;
  for (const key of Object.keys(props)) {
    if (!supportedKeys.includes(key as never)) unsupported(key, supportedKeys);
  }
  validateCommonProps(props);

  if (editable || trigger) {
    const placeholder = (props as EditableFieldProps | TriggerFieldProps).placeholder;
    if (typeof placeholder !== 'undefined' && !isNonEmptyString(placeholder)) {
      unsupported(placeholder, ['non-empty placeholder']);
    }
  }

  if (editable) {
    const editableProps = props as EditableFieldProps;
    if (typeof editableProps.onChangeText !== 'function') {
      unsupported(editableProps.onChangeText, ['onChangeText callback']);
    }
    if (
      typeof editableProps.readOnly !== 'undefined' &&
      typeof editableProps.readOnly !== 'boolean'
    ) {
      unsupported(editableProps.readOnly, [true, false]);
    }
  } else if (trigger) {
    const triggerProps = props as TriggerFieldProps;
    if (typeof triggerProps.onPress !== 'function') {
      unsupported(triggerProps.onPress, ['onPress callback']);
    }
  } else {
    const stepperProps = props as StepperFieldProps;
    if (!isNonEmptyString(stepperProps.value)) {
      unsupported(stepperProps.value, ['non-empty stepper value']);
    }
    if (typeof stepperProps.onDecrement !== 'function') {
      unsupported(stepperProps.onDecrement, ['onDecrement callback']);
    }
    if (typeof stepperProps.onIncrement !== 'function') {
      unsupported(stepperProps.onIncrement, ['onIncrement callback']);
    }
    for (const bound of [stepperProps.decrementDisabled, stepperProps.incrementDisabled]) {
      if (typeof bound !== 'undefined' && typeof bound !== 'boolean') {
        unsupported(bound, [true, false]);
      }
    }
  }
}

const labelText = (label: string, required: boolean) =>
  required ? `${label} *` : label;

const accessibleName = (label: string, required: boolean) =>
  required ? `${label}, required` : label;

function accessibilityHintFor(props: FieldProps) {
  const parts: string[] = [];
  if ('readOnly' in props && props.readOnly) parts.push('Read only');
  if (props.status === 'error') parts.push(`Error: ${props.message}`);
  if (props.status === 'success') parts.push(`Success: ${props.message}`);
  if ((props.status ?? 'default') === 'default' && props.helperText) {
    parts.push(props.helperText);
  }
  return parts.length > 0 ? parts.join('. ') : undefined;
}

const statusBorderColor = (status: FieldStatus) => {
  if (status === 'error') return colors.danger;
  if (status === 'success') return colors.accent;
  return colors.border;
};

const triggerIcon = (type: TriggerFieldType) => {
  if (type === 'date') return 'calendar' as const;
  if (type === 'time') return 'clock' as const;
  return 'chevron' as const;
};

type FieldShellProps = Readonly<{
  children: React.ReactNode;
  props: FieldProps;
}>;

function FieldShell({ children, props }: FieldShellProps) {
  const supportingText = props.status === 'default' || props.status === undefined
    ? props.helperText
    : props.message;
  return (
    <View
      style={[
        styles.field,
        supportingText ? styles.fieldWithSupportingText : styles.fieldWithoutSupportingText,
      ]}
      testID="field"
    >
      <View style={styles.labelRow}>
        <Text color="textSecondary" variant="label">
          {labelText(props.label, props.required ?? false)}
        </Text>
      </View>
      {children}
      {supportingText ? (
        <View style={styles.supportingRow}>
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

function EditableField(props: EditableFieldProps) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const status = props.status ?? 'default';
  const blocked = (props.disabled ?? false) || (props.readOnly ?? false);
  const hint = accessibilityHintFor(props);
  const hasTrailingAction = props.type === 'password' ||
    (props.type === 'search' && props.value.length > 0);

  return (
    <FieldShell props={props}>
      <View
        style={[
          styles.control,
          {
            backgroundColor: props.readOnly ? colors.surfaceMuted : colors.surface,
            borderColor: focused ? colors.focusRing : statusBorderColor(status),
            borderWidth: focused ? borders.focusRingWidth : borders.borderDefault,
          },
          props.disabled ? styles.disabled : undefined,
        ]}
        testID="field-control"
      >
        <TextInput
          accessibilityHint={hint}
          accessibilityLabel={accessibleName(props.label, props.required ?? false)}
          accessibilityState={{ disabled: props.disabled ?? false }}
          editable={!blocked}
          onBlur={() => setFocused(false)}
          onChangeText={(nextValue) => {
            if (!blocked) props.onChangeText(nextValue);
          }}
          onFocus={() => setFocused(true)}
          placeholder={props.placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={props.type === 'password' && !passwordVisible}
          selectionColor={colors.accent}
          style={[styles.input, hasTrailingAction ? styles.inputWithAction : undefined]}
          value={props.value}
        />
        {props.type === 'password' ? (
          <IconButton
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            disabled={props.disabled}
            icon="eye"
            onPress={() => setPasswordVisible((visible) => !visible)}
            size={40}
          />
        ) : null}
        {props.type === 'search' && props.value.length > 0 ? (
          <IconButton
            accessibilityLabel="Clear search"
            disabled={blocked}
            icon="close"
            onPress={() => props.onChangeText('')}
            size={40}
          />
        ) : null}
      </View>
    </FieldShell>
  );
}

function TriggerField(props: TriggerFieldProps) {
  const status = props.status ?? 'default';
  const displayedValue = props.value || props.placeholder || '';
  return (
    <FieldShell props={props}>
      <Pressable
        accessibilityHint={accessibilityHintFor(props)}
        accessibilityLabel={accessibleName(props.label, props.required ?? false)}
        accessibilityRole="button"
        accessibilityValue={{ text: displayedValue }}
        disabled={props.disabled}
        onPress={props.onPress}
        size="controlHeight48"
        style={styles.trigger}
        testID="field-control"
      >
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.triggerContent,
            { borderColor: statusBorderColor(status) },
          ]}
        >
          <Text
            color={props.value ? 'ink' : 'muted'}
            style={styles.triggerText}
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

type StepperActionProps = Readonly<{
  disabled: boolean;
  label: string;
  onPress: () => void;
  symbol: '\u2212' | '+';
}>;

function StepperAction({ disabled, label, onPress, symbol }: StepperActionProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      size="controlHeight44"
      style={styles.stepperAction}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.stepperActionContent}
      >
        <Text variant="heading">{symbol}</Text>
      </View>
    </Pressable>
  );
}

function StepperField(props: StepperFieldProps) {
  const status = props.status ?? 'default';
  const globallyDisabled = props.disabled ?? false;
  return (
    <FieldShell props={props}>
      <View
        style={[
          styles.control,
          styles.stepperControl,
          { borderColor: statusBorderColor(status) },
        ]}
        testID="field-control"
      >
        <View
          accessibilityHint={accessibilityHintFor(props)}
          accessibilityLabel={`${accessibleName(props.label, props.required ?? false)} value`}
          accessibilityValue={{ text: props.value }}
          accessible
          style={[styles.stepperValue, globallyDisabled ? styles.disabled : undefined]}
          testID="field-stepper-value"
        >
          <Text variant="body">{props.value}</Text>
        </View>
        <View style={styles.stepperActions}>
          <StepperAction
            disabled={globallyDisabled || (props.decrementDisabled ?? false)}
            label={`Decrease ${props.label}`}
            onPress={props.onDecrement}
            symbol={'\u2212'}
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

export function Field(props: FieldProps) {
  validateFieldProps(props);
  if (editableFieldTypes.includes(props.type as EditableFieldType)) {
    return <EditableField {...(props as EditableFieldProps)} />;
  }
  if (triggerFieldTypes.includes(props.type as TriggerFieldType)) {
    return <TriggerField {...(props as TriggerFieldProps)} />;
  }
  return <StepperField {...(props as StepperFieldProps)} />;
}

const styles = StyleSheet.create({
  control: {
    alignItems: 'center',
    borderRadius: radii.radius12,
    flexDirection: 'row',
    height: 52,
    overflow: 'hidden',
    width: '100%',
  },
  disabled: {
    opacity: opacity.opacityDisabled,
  },
  field: {
    maxWidth: '100%',
    width: 350,
  },
  fieldWithSupportingText: {
    minHeight: 100,
  },
  fieldWithoutSupportingText: {
    minHeight: 84,
  },
  input: {
    color: colors.ink,
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    paddingVertical: 0,
    ...typography.body,
  },
  inputWithAction: {
    paddingRight: 8,
  },
  labelRow: {
    height: 18,
    justifyContent: 'center',
    marginBottom: 6,
  },
  supportingRow: {
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 16,
  },
  stepperAction: {
    height: 44,
    width: 44,
  },
  stepperActionContent: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  stepperActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  stepperControl: {
    backgroundColor: colors.surface,
    borderWidth: borders.borderDefault,
    paddingLeft: 16,
    paddingRight: 4,
  },
  stepperValue: {
    flex: 1,
    justifyContent: 'center',
  },
  trigger: {
    height: 52,
    width: '100%',
  },
  triggerContent: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.radius12,
    borderWidth: borders.borderDefault,
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: 16,
    width: '100%',
  },
  triggerText: {
    flex: 1,
  },
});
