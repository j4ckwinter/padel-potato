import { EditableField } from './field/EditableField';
import { StepperField } from './field/StepperField';
import { TriggerField } from './field/TriggerField';
import {
  editableFieldTypes,
  triggerFieldTypes,
  type EditableFieldProps,
  type EditableFieldType,
  type FieldProps,
  type StepperFieldProps,
  type TriggerFieldProps,
  type TriggerFieldType,
} from './field/types';
import { validateFieldProps } from './field/validation';

export {
  editableFieldTypes,
  fieldStatuses,
  fieldTypes,
  triggerFieldTypes,
} from './field/types';
export type {
  EditableFieldProps,
  EditableFieldType,
  FieldProps,
  FieldStatus,
  StepperFieldProps,
  TriggerFieldProps,
  TriggerFieldType,
} from './field/types';

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
