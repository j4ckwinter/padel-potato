import type { GestureResponderEvent } from 'react-native';

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

type FieldBaseProps = Readonly<{
  disabled?: boolean;
  label: string;
  required?: boolean;
  value: string;
}> & (DefaultMessageProps | ValidationMessageProps);

type FieldPlaceholderProps = Readonly<{ placeholder?: string }>;

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
