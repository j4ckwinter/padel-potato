import { fireEvent, render, userEvent } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import {
  Field,
  type EditableFieldProps,
  type FieldProps,
  type TriggerFieldProps,
} from '../src/design-system/components/forms/Field';
import { phase3Families } from '../src/design-system/components/sourceRegistry';
import { colors } from '../src/design-system/tokens';

const flattenedStyle = (style: unknown) =>
  StyleSheet.flatten(
    style as Parameters<typeof StyleSheet.flatten>[0],
  ) as Record<string, unknown>;

const fieldRecords = phase3Families[3].records;

describe('Field source and public contract', () => {
  it('retains the exact twelve-record sparse ledger in source order', () => {
    expect(phase3Families[3]).toEqual(expect.objectContaining({
      key: 'field',
      recordCount: 12,
      sourceId: '482a7222-5a3b-8086-8008-a60edc77a99f',
    }));
    expect(fieldRecords.map((record) => record.normalizedTuple)).toEqual([
      { type: 'text', state: 'readOnly' },
      { type: 'search', state: 'default' },
      { type: 'password', state: 'error' },
      { type: 'password', state: 'filled' },
      { type: 'password', state: 'focused' },
      { type: 'password', state: 'default' },
      { type: 'stepper', state: 'success' },
      { type: 'search', state: 'error' },
      { type: 'time', state: 'disabled' },
      { type: 'date', state: 'filled' },
      { type: 'select', state: 'focused' },
      { type: 'text', state: 'default' },
    ]);

    type EditableKinds = Extract<FieldProps, { type: 'text' | 'password' | 'search' }>['type'];
    type TriggerKinds = Extract<FieldProps, { type: 'select' | 'date' | 'time' }>['type'];
    const editableKinds: EditableKinds[] = ['text', 'password', 'search'];
    const triggerKinds: TriggerKinds[] = ['select', 'date', 'time'];
    type ImpossibleCallback = Extract<'onPress', keyof EditableFieldProps>;
    type ImpossibleEdit = Extract<'onChangeText', keyof TriggerFieldProps>;
    const hasNoImpossibleCallbacks: [ImpossibleCallback, ImpossibleEdit] extends [never, never]
      ? true
      : false = true;

    expect(editableKinds).toEqual(['text', 'password', 'search']);
    expect(triggerKinds).toEqual(['select', 'date', 'time']);
    expect(hasNoImpossibleCallbacks).toBe(true);
  });
});

describe('Field editable branches', () => {
  it('uses a native controlled TextInput and retains empty required copy until rerender', async () => {
    const onChangeText = jest.fn();
    const user = userEvent.setup();
    const screen = await render(
      <Field
        label="Game name"
        onChangeText={onChangeText}
        placeholder="Enter game name"
        required
        type="text"
        value=""
      />,
    );
    const input = screen.UNSAFE_getByType(TextInput);

    expect(screen.getByText('Game name *')).toBeTruthy();
    expect(input.props.placeholder).toBe('Enter game name');
    expect(input.props.value).toBe('');
    expect(input.props.accessibilityLabel).toBe('Game name, required');
    await user.type(input, 'Wednesday');
    expect(onChangeText).toHaveBeenCalled();
    expect(input.props.value).toBe('');

    await screen.rerender(
      <Field
        label="Game name"
        onChangeText={onChangeText}
        placeholder="Enter game name"
        required
        type="text"
        value="Wednesday"
      />,
    );
    expect(screen.UNSAFE_getByType(TextInput).props.value).toBe('Wednesday');
  });

  it('keeps read-only distinct from disabled and suppresses native edits', async () => {
    const onChangeText = jest.fn();
    const readOnly = await render(
      <Field
        label="Generated game name"
        onChangeText={onChangeText}
        readOnly
        type="text"
        value="Wednesday Evening Padel"
      />,
    );
    const readOnlyInput = readOnly.UNSAFE_getByType(TextInput);
    fireEvent.changeText(readOnlyInput, 'Changed');

    expect(readOnlyInput.props.editable).toBe(false);
    expect(readOnlyInput.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );
    expect(readOnlyInput.props.accessibilityHint).toContain('Read only');
    expect(onChangeText).not.toHaveBeenCalled();

    const disabled = await render(
      <Field
        disabled
        label="Game name"
        onChangeText={onChangeText}
        type="text"
        value="Wednesday Evening Padel"
      />,
    );
    const disabledInput = disabled.UNSAFE_getByType(TextInput);
    expect(disabledInput.props.editable).toBe(false);
    expect(disabledInput.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('keeps password visibility and search clear as isolated named child actions', async () => {
    const passwordChange = jest.fn();
    const password = await render(
      <Field
        label="Password"
        onChangeText={passwordChange}
        required
        type="password"
        value="secret12"
      />,
    );
    const passwordInput = password.UNSAFE_getByType(TextInput);
    expect(passwordInput.props.secureTextEntry).toBe(true);
    await userEvent.setup().press(password.getByRole('button', { name: 'Show password' }));
    expect(password.UNSAFE_getByType(TextInput).props.secureTextEntry).toBe(false);
    expect(passwordChange).not.toHaveBeenCalled();

    const searchChange = jest.fn();
    const search = await render(
      <Field
        label="Search"
        onChangeText={searchChange}
        type="search"
        value="clubs"
      />,
    );
    await userEvent.setup().press(search.getByRole('button', { name: 'Clear search' }));
    expect(searchChange).toHaveBeenCalledTimes(1);
    expect(searchChange).toHaveBeenCalledWith('');
    expect(search.UNSAFE_getByType(TextInput).props.value).toBe('clubs');
  });

  it('keeps helper, success, and error copy visible and announced', async () => {
    const helper = await render(
      <Field
        helperText="Shown to invited players"
        label="Game name"
        onChangeText={() => undefined}
        type="text"
        value="Wednesday"
      />,
    );
    expect(helper.getByText('Shown to invited players')).toBeTruthy();
    expect(helper.UNSAFE_getByType(TextInput).props.accessibilityHint).toContain(
      'Shown to invited players',
    );

    const error = await render(
      <Field
        label="Password"
        message="Use at least 8 characters"
        onChangeText={() => undefined}
        status="error"
        type="password"
        value="short"
      />,
    );
    expect(error.getByText('Use at least 8 characters')).toBeTruthy();
    expect(error.UNSAFE_getByType(TextInput).props.accessibilityHint).toContain('Error');
    expect(flattenedStyle(error.getByTestId('field-control')).borderColor).toBe(colors.danger);

    const success = await render(
      <Field
        label="Players"
        message="Looks good"
        onChangeText={() => undefined}
        status="success"
        type="text"
        value="4 players"
      />,
    );
    expect(success.getByText('Looks good')).toBeTruthy();
    expect(success.UNSAFE_getByType(TextInput).props.accessibilityHint).toContain('Success');
    expect(flattenedStyle(success.getByTestId('field-control')).borderColor).toBe(colors.accent);
  });
});

describe('Field trigger branches', () => {
  it.each([
    ['select', 'Choose level', 'Intermediate'],
    ['date', 'Choose date', '12 Sep 2026'],
    ['time', 'Choose time', '18:30'],
  ] as Array<[TriggerFieldProps['type'], string, string]>) (
    '%s is a controlled trigger-only button',
    async (type, placeholder, value) => {
      const onPress = jest.fn();
      const screen = await render(
        <Field
          label={`${type} field`}
          onPress={onPress}
          placeholder={placeholder}
          type={type}
          value={value}
        />,
      );
      const trigger = screen.getByRole('button', { name: `${type} field` });
      await userEvent.setup().press(trigger);

      expect(trigger.props.accessibilityValue).toEqual({ text: value });
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(screen.getByText(value, { includeHiddenElements: true })).toBeTruthy();
      expect(screen.UNSAFE_queryAllByType(TextInput)).toHaveLength(0);
      expect(screen.queryByTestId('field-picker-overlay')).toBeNull();
    },
  );

  it('announces the placeholder and blocks a disabled trigger', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <Field
        disabled
        label="Time"
        onPress={onPress}
        placeholder="Choose time"
        type="time"
        value=""
      />,
    );
    const trigger = screen.getByRole('button', { disabled: true, name: 'Time' });
    await userEvent.setup().press(trigger);

    expect(trigger.props.accessibilityValue).toEqual({ text: 'Choose time' });
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByText('Choose time', { includeHiddenElements: true })).toBeTruthy();
  });
});

describe('Field runtime closure', () => {
  it('rejects malformed and impossible cast combinations', () => {
    expect(() => Field({
      label: 'Game name',
      onChangeText: () => undefined,
      type: 'slider',
      value: '',
    } as unknown as FieldProps)).toThrow(/Unsupported design-system value: slider/u);
    expect(() => Field({
      label: 'Game name',
      onChangeText: () => undefined,
      onPress: () => undefined,
      type: 'text',
      value: '',
    } as unknown as FieldProps)).toThrow(/Unsupported design-system value: onPress/u);
    expect(() => Field({
      label: 'Date',
      onChangeText: () => undefined,
      onPress: () => undefined,
      type: 'date',
      value: '',
    } as unknown as FieldProps)).toThrow(/Unsupported design-system value: onChangeText/u);
    expect(() => Field({
      label: '',
      onPress: () => undefined,
      type: 'select',
      value: '',
    })).toThrow(/Supported values: non-empty label/u);
    expect(() => Field({
      label: 'Game name',
      message: 'Bad',
      onChangeText: () => undefined,
      status: 'warning',
      type: 'text',
      value: '',
    } as unknown as FieldProps)).toThrow(/Unsupported design-system value: warning/u);
  });
});
