import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { colors, borders } from '../../../tokens';
import { IconButton } from '../../actions';
import {
  FieldShell,
  fieldAccessibilityHint,
  fieldAccessibleName,
  fieldBorderColor,
} from './FieldShell';
import { fieldStyles } from './styles';
import type { EditableFieldProps } from './types';

export function EditableField(props: EditableFieldProps) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const status = props.status ?? 'default';
  const blocked = (props.disabled ?? false) || (props.readOnly ?? false);
  const hasTrailingAction =
    props.type === 'password' ||
    (props.type === 'search' && props.value.length > 0);

  return (
    <FieldShell props={props}>
      <View
        style={[
          fieldStyles.control,
          {
            backgroundColor: props.readOnly
              ? colors.surfaceMuted
              : colors.surface,
            borderColor: focused ? colors.focusRing : fieldBorderColor(status),
            borderWidth: focused
              ? borders.focusRingWidth
              : borders.borderDefault,
          },
          props.disabled ? fieldStyles.disabled : undefined,
        ]}
        testID="field-control"
      >
        <TextInput
          {...(props.type === 'password'
            ? { autoCapitalize: 'none' as const, autoCorrect: false }
            : {})}
          {...(props.keyboardType === 'email-address'
            ? { autoCorrect: false }
            : {})}
          {...(props.autoCapitalize === undefined
            ? {}
            : { autoCapitalize: props.autoCapitalize })}
          {...(props.keyboardType === undefined
            ? {}
            : { keyboardType: props.keyboardType })}
          accessibilityHint={fieldAccessibilityHint(props)}
          accessibilityLabel={fieldAccessibleName(
            props.label,
            props.required ?? false,
          )}
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
          style={[
            fieldStyles.input,
            hasTrailingAction ? fieldStyles.inputWithAction : undefined,
          ]}
          value={props.value}
        />
        {props.type === 'password' ? (
          <IconButton
            accessibilityLabel={
              passwordVisible ? 'Hide password' : 'Show password'
            }
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
