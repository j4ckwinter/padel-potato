import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, userEvent } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

import FieldStories, {
  Boundaries as FieldBoundaries,
  Interactive as FieldInteractive,
  Variants as FieldVariants,
} from '../src/design-system/components/forms/Field.stories';
import {
  Field,
  type EditableFieldProps,
  type FieldProps,
  type StepperFieldProps,
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
    const input = screen.getByLabelText('Game name, required');

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
    expect(screen.getByLabelText('Game name, required').props.value).toBe('Wednesday');
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
    const readOnlyInput = readOnly.getByLabelText('Generated game name');
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
    const disabledInput = disabled.getByLabelText('Game name');
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
    const passwordInput = password.getByLabelText('Password, required');
    expect(passwordInput.props.secureTextEntry).toBe(true);
    await userEvent.setup().press(password.getByRole('button', { name: 'Show password' }));
    expect(password.getByLabelText('Password, required').props.secureTextEntry).toBe(false);
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
    expect(search.getByLabelText('Search').props.value).toBe('clubs');
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
    expect(helper.getByLabelText('Game name').props.accessibilityHint).toContain(
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
    expect(error.getByLabelText('Password').props.accessibilityHint).toContain('Error');
    expect(flattenedStyle(error.getByTestId('field-control').props.style).borderColor).toBe(colors.danger);

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
    expect(success.getByLabelText('Players').props.accessibilityHint).toContain('Success');
    expect(flattenedStyle(success.getByTestId('field-control').props.style).borderColor).toBe(colors.accent);
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
      expect(screen.queryAllByPlaceholderText(placeholder)).toHaveLength(0);
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

describe('Field stepper branch', () => {
  it('emits separate decrement and increment requests while retaining the controlled value', async () => {
    const onDecrement = jest.fn();
    const onIncrement = jest.fn();
    const screen = await render(
      <Field
        label="Players"
        onDecrement={onDecrement}
        onIncrement={onIncrement}
        type="stepper"
        value="4 players"
      />,
    );
    const decrement = screen.getByRole('button', { name: 'Decrease Players' });
    const increment = screen.getByRole('button', { name: 'Increase Players' });

    await userEvent.setup().press(decrement);
    expect(onDecrement).toHaveBeenCalledTimes(1);
    expect(onIncrement).not.toHaveBeenCalled();
    expect(screen.getByText('4 players', { includeHiddenElements: true })).toBeTruthy();

    await userEvent.setup().press(increment);
    expect(onDecrement).toHaveBeenCalledTimes(1);
    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('field-stepper-value').props.accessibilityValue).toEqual({
      text: '4 players',
    });
  });

  it('announces independent bounds and keeps both targets exactly 44x44', async () => {
    const onDecrement = jest.fn();
    const onIncrement = jest.fn();
    const screen = await render(
      <Field
        decrementDisabled
        label="Players"
        onDecrement={onDecrement}
        onIncrement={onIncrement}
        type="stepper"
        value="2 players"
      />,
    );
    const decrement = screen.getByRole('button', {
      disabled: true,
      name: 'Decrease Players',
    });
    const increment = screen.getByRole('button', {
      disabled: false,
      name: 'Increase Players',
    });
    await userEvent.setup().press(decrement);
    await userEvent.setup().press(increment);

    expect(onDecrement).not.toHaveBeenCalled();
    expect(onIncrement).toHaveBeenCalledTimes(1);
    for (const action of [decrement, increment]) {
      expect(action.props.hitSlop).toEqual({ bottom: 0, left: 0, right: 0, top: 0 });
      expect(flattenedStyle(action.props.style)).toEqual(expect.objectContaining({
        height: 44,
        minHeight: 44,
        minWidth: 44,
        width: 44,
      }));
    }
  });

  it('blocks both actions when the whole Field is disabled', async () => {
    const onDecrement = jest.fn();
    const onIncrement = jest.fn();
    const screen = await render(
      <Field
        disabled
        label="Players"
        onDecrement={onDecrement}
        onIncrement={onIncrement}
        type="stepper"
        value="4 players"
      />,
    );
    await userEvent.setup().press(screen.getByRole('button', {
      disabled: true,
      name: 'Decrease Players',
    }));
    await userEvent.setup().press(screen.getByRole('button', {
      disabled: true,
      name: 'Increase Players',
    }));
    expect(onDecrement).not.toHaveBeenCalled();
    expect(onIncrement).not.toHaveBeenCalled();
  });
});

describe('Field focus, geometry, and content boundaries', () => {
  it('derives focus treatment from native events and preserves exact shell metrics', async () => {
    const screen = await render(
      <Field
        label="Game name"
        onChangeText={() => undefined}
        type="text"
        value="Wednesday"
      />,
    );
    const input = screen.getByLabelText('Game name');
    fireEvent(input, 'focus', { nativeEvent: {} });
    expect(flattenedStyle(screen.getByTestId('field-control').props.style)).toEqual(
      expect.objectContaining({ borderColor: colors.focusRing, borderWidth: 2, height: 52 }),
    );
    expect(flattenedStyle(screen.getByTestId('field').props.style)).toEqual(
      expect.objectContaining({ minHeight: 84, width: 350 }),
    );

    fireEvent(input, 'blur', { nativeEvent: {} });
    expect(flattenedStyle(screen.getByTestId('field-control').props.style)).toEqual(
      expect.objectContaining({ borderColor: colors.border, borderWidth: 1 }),
    );

    await screen.rerender(
      <Field
        label="A deliberately long password label that wraps without hiding the field"
        message="A long error remains visible, reachable, and associated while the shell grows vertically"
        onChangeText={() => undefined}
        status="error"
        type="password"
        value="short"
      />,
    );
    expect(screen.getByText(/A long error remains visible/u)).toBeTruthy();
    expect(screen.getByLabelText(/A deliberately long password label/u).props.accessibilityHint).toContain(
      'A long error remains visible',
    );
    expect(flattenedStyle(screen.getByTestId('field').props.style)).toEqual(
      expect.objectContaining({ minHeight: 100, width: 350 }),
    );
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
    expect(() => Field({
      label: 'Players',
      onDecrement: () => undefined,
      onIncrement: () => undefined,
      onPress: () => undefined,
      type: 'stepper',
      value: '4 players',
    } as unknown as StepperFieldProps)).toThrow(/Unsupported design-system value: onPress/u);
    expect(() => Field({
      decrementDisabled: 'minimum',
      label: 'Players',
      onDecrement: () => undefined,
      onIncrement: () => undefined,
      type: 'stepper',
      value: '4 players',
    } as unknown as StepperFieldProps)).toThrow(/Unsupported design-system value: minimum/u);
  });
});

describe('Field Storybook contract', () => {
  it('publishes the exact group, bounded controls, and twelve source-ordered rows', () => {
    expect(FieldStories.title).toBe('Forms/Field');
    expect(FieldStories.argTypes).toEqual(expect.objectContaining({
      disabled: { control: 'boolean' },
      required: { control: 'boolean' },
      status: { control: 'select', options: ['default', 'success', 'error'] },
      type: {
        control: 'select',
        options: ['text', 'password', 'search', 'select', 'date', 'time', 'stepper'],
      },
    }));
    const variants = FieldVariants.render?.({} as never, {} as never) as React.ReactElement<{
      children: React.ReactNode;
    }>;
    expect(React.Children.toArray(variants.props.children)).toHaveLength(fieldRecords.length);
  });

  it('records all required boundary and interactive witnesses without native-proof claims', () => {
    const boundaries = FieldBoundaries.render?.({} as never, {} as never) as React.ReactElement;
    const boundaryJson = JSON.stringify(boundaries);
    expect(boundaryJson).toContain('200%');
    expect(boundaryJson).toContain('constrained width');
    expect(boundaryJson).toContain('empty');
    expect(boundaryJson).toContain('vertical growth');
    expect(boundaryJson).toContain('nested target clearance');
    expect(boundaryJson).toContain('Phase 5');

    const interactive = FieldInteractive.render?.({} as never, {} as never) as React.ReactElement;
    expect(JSON.stringify(interactive)).toContain('InteractiveFieldHarness');
  });
});
