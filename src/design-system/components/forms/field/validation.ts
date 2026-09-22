import {
  assertOnlyKeys,
  isCallback,
  isNonEmptyString,
  unsupportedValue,
} from '../../../internal/validation';
import {
  editableFieldTypes,
  fieldStatuses,
  fieldTypes,
  triggerFieldTypes,
  type EditableFieldProps,
  type EditableFieldType,
  type FieldProps,
  type StepperFieldProps,
  type TriggerFieldProps,
  type TriggerFieldType,
} from './types';

const commonRuntimeProps = [
  'disabled',
  'helperText',
  'label',
  'message',
  'required',
  'status',
  'type',
  'value',
] as const;
const editableRuntimeProps = [
  ...commonRuntimeProps,
  'onChangeText',
  'placeholder',
  'readOnly',
] as const;
const triggerRuntimeProps = [
  ...commonRuntimeProps,
  'onPress',
  'placeholder',
] as const;
const stepperRuntimeProps = [
  ...commonRuntimeProps,
  'decrementDisabled',
  'incrementDisabled',
  'onDecrement',
  'onIncrement',
] as const;

function validateCommonProps(props: FieldProps) {
  if (!isNonEmptyString(props.label))
    unsupportedValue(props.label, ['non-empty label']);
  if (typeof props.value !== 'string')
    unsupportedValue(props.value, ['string value']);
  if (
    typeof props.disabled !== 'undefined' &&
    typeof props.disabled !== 'boolean'
  ) {
    unsupportedValue(props.disabled, [true, false]);
  }
  if (
    typeof props.required !== 'undefined' &&
    typeof props.required !== 'boolean'
  ) {
    unsupportedValue(props.required, [true, false]);
  }

  const status = props.status ?? 'default';
  if (!fieldStatuses.includes(status)) unsupportedValue(status, fieldStatuses);
  if (status === 'default') {
    if (typeof props.message !== 'undefined') {
      unsupportedValue('message', ['helperText for default status']);
    }
    if (
      typeof props.helperText !== 'undefined' &&
      !isNonEmptyString(props.helperText)
    ) {
      unsupportedValue(props.helperText, ['non-empty helper text']);
    }
  } else {
    if (!isNonEmptyString(props.message)) {
      unsupportedValue(props.message, [`non-empty ${status} message`]);
    }
    if (typeof props.helperText !== 'undefined') {
      unsupportedValue('helperText', ['message for success or error status']);
    }
  }
}

export function validateFieldProps(props: FieldProps) {
  const type = props.type;
  if (!fieldTypes.includes(type as (typeof fieldTypes)[number]))
    unsupportedValue(type, fieldTypes);

  const editable = editableFieldTypes.includes(type as EditableFieldType);
  const trigger = triggerFieldTypes.includes(type as TriggerFieldType);
  const supportedKeys = editable
    ? editableRuntimeProps
    : trigger
      ? triggerRuntimeProps
      : stepperRuntimeProps;
  assertOnlyKeys(props, supportedKeys);
  validateCommonProps(props);

  if (editable || trigger) {
    const placeholder = (props as EditableFieldProps | TriggerFieldProps)
      .placeholder;
    if (typeof placeholder !== 'undefined' && !isNonEmptyString(placeholder)) {
      unsupportedValue(placeholder, ['non-empty placeholder']);
    }
  }

  if (editable) {
    const editableProps = props as EditableFieldProps;
    if (!isCallback(editableProps.onChangeText)) {
      unsupportedValue(editableProps.onChangeText, ['onChangeText callback']);
    }
    if (
      typeof editableProps.readOnly !== 'undefined' &&
      typeof editableProps.readOnly !== 'boolean'
    ) {
      unsupportedValue(editableProps.readOnly, [true, false]);
    }
  } else if (trigger) {
    const triggerProps = props as TriggerFieldProps;
    if (
      !isNonEmptyString(triggerProps.value) &&
      !isNonEmptyString(triggerProps.placeholder)
    ) {
      unsupportedValue(triggerProps.placeholder, [
        'non-empty placeholder when trigger value is empty',
      ]);
    }
    if (!isCallback(triggerProps.onPress))
      unsupportedValue(triggerProps.onPress, ['onPress callback']);
  } else {
    const stepperProps = props as StepperFieldProps;
    if (!isNonEmptyString(stepperProps.value))
      unsupportedValue(stepperProps.value, ['non-empty stepper value']);
    if (!isCallback(stepperProps.onDecrement))
      unsupportedValue(stepperProps.onDecrement, ['onDecrement callback']);
    if (!isCallback(stepperProps.onIncrement))
      unsupportedValue(stepperProps.onIncrement, ['onIncrement callback']);
    for (const bound of [
      stepperProps.decrementDisabled,
      stepperProps.incrementDisabled,
    ]) {
      if (typeof bound !== 'undefined' && typeof bound !== 'boolean')
        unsupportedValue(bound, [true, false]);
    }
  }
}
