import { describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, userEvent } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

import FieldStories, {
  Boundaries as FieldBoundaries,
  Interactive as FieldInteractive,
  Variants as FieldVariants,
} from '../src/design-system/components/forms/Field.stories';
import ChoiceChipStories, {
  Boundaries as ChoiceChipBoundaries,
  Interactive as ChoiceChipInteractive,
  normalizeChoiceChipStoryArgs,
  Variants as ChoiceChipVariants,
} from '../src/design-system/components/forms/ChoiceChip.stories';
import {
  ChoiceChip,
  type ChoiceChipProps,
} from '../src/design-system/components/forms/ChoiceChip';
import CheckboxStories, {
  Boundaries as CheckboxBoundaries,
  Interactive as CheckboxInteractive,
  Variants as CheckboxVariants,
} from '../src/design-system/components/forms/Checkbox.stories';
import {
  Checkbox,
  type CheckboxProps,
} from '../src/design-system/components/forms/Checkbox';
import DayTimeSelectorStories, {
  Boundaries as DayTimeSelectorBoundaries,
  Interactive as DayTimeSelectorInteractive,
  normalizeDayTimeSelectorStoryArgs,
  Variants as DayTimeSelectorVariants,
} from '../src/design-system/components/forms/DayTimeSelector.stories';
import {
  DayTimeSelector,
  type DayTimeSelectorProps,
} from '../src/design-system/components/forms/DayTimeSelector';
import * as forms from '../src/design-system/components/forms';
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
const choiceChipRecords = phase3Families[4].records;
const checkboxRecords = phase3Families[5].records;
const dayTimeSelectorRecords = phase3Families[6].records;

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

  it('renders and announces a non-empty placeholder for an empty controlled trigger', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <Field
        label="Time"
        onPress={onPress}
        placeholder="Choose time"
        type="time"
        value=""
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Time' });
    await userEvent.setup().press(trigger);

    expect(trigger.props.accessibilityValue).toEqual({ text: 'Choose time' });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Choose time', { includeHiddenElements: true })).toBeTruthy();
  });

  it.each([undefined, '', '   '])(
    'rejects an empty controlled trigger with placeholder %p',
    (placeholder) => {
      expect(() => Field({
        label: 'Level',
        onPress: () => undefined,
        placeholder,
        type: 'select',
        value: '',
      })).toThrow(/non-empty placeholder/u);
    },
  );

  it('rejects a whitespace-only controlled trigger value without a placeholder', () => {
    expect(() => Field({
      label: 'Date',
      onPress: () => undefined,
      type: 'date',
      value: '   ',
    })).toThrow(/non-empty placeholder when trigger value is empty/u);
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
    await act(async () => {
      fireEvent(input, 'focus', { nativeEvent: {} });
    });
    expect(flattenedStyle(screen.getByTestId('field-control').props.style)).toEqual(
      expect.objectContaining({ borderColor: colors.focusRing, borderWidth: 2, height: 52 }),
    );
    expect(flattenedStyle(screen.getByTestId('field').props.style)).toEqual(
      expect.objectContaining({ minHeight: 84, width: 350 }),
    );

    await act(async () => {
      fireEvent(input, 'blur', { nativeEvent: {} });
    });
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
    expect((interactive.type as { name?: string }).name).toBe('InteractiveFieldHarness');
  });
});

describe('ChoiceChip source and controlled contract', () => {
  it('retains the exact eight-record sparse ledger in deterministic source order', () => {
    expect(phase3Families[4]).toEqual(expect.objectContaining({
      key: 'choiceChip',
      recordCount: 8,
      sourceId: '482a7222-5a3b-8086-8008-a61b1055dd19',
    }));
    expect(choiceChipRecords.map((record) => record.normalizedTuple)).toEqual([
      { type: 'filter', state: 'disabled', icon: 'trailing' },
      { type: 'filter', state: 'focused', icon: 'trailing' },
      { type: 'filter', state: 'selected', icon: 'leading' },
      { type: 'filter', state: 'default', icon: 'trailing' },
      { type: 'option', state: 'disabled', icon: 'none' },
      { type: 'option', state: 'focused', icon: 'none' },
      { type: 'option', state: 'selected', icon: 'leading' },
      { type: 'option', state: 'default', icon: 'none' },
    ]);

    type ImpossibleOptionTrailing = Extract<
      ChoiceChipProps,
      { type: 'option'; icon: 'trailing' }
    >;
    type ImpossibleFilterNone = Extract<
      ChoiceChipProps,
      { type: 'filter'; icon: 'none' }
    >;
    const sparseContract: [ImpossibleOptionTrailing, ImpossibleFilterNone] extends [never, never]
      ? true
      : false = true;
    expect(sparseContract).toBe(true);
  });

  it.each([
    ['option', 'none', false, 'radio'],
    ['option', 'leading', true, 'radio'],
    ['filter', 'leading', true, 'checkbox'],
    ['filter', 'trailing', false, 'checkbox'],
  ] as Array<[
    ChoiceChipProps['type'],
    ChoiceChipProps['icon'],
    boolean,
    'checkbox' | 'radio',
  ]>)('%s/%s selected=%s emits the next controlled value once with %s semantics', async (
    type,
    icon,
    selected,
    role,
  ) => {
    const onSelectedChange = jest.fn();
    const initialProps = {
      icon,
      label: 'Intermediate',
      onSelectedChange,
      selected,
      type,
    } as ChoiceChipProps;
    const screen = await render(<ChoiceChip {...initialProps} />);
    const chip = screen.getByRole(role, { checked: selected, name: 'Intermediate' });

    await userEvent.setup().press(chip);
    expect(onSelectedChange).toHaveBeenCalledTimes(1);
    expect(onSelectedChange).toHaveBeenCalledWith(!selected);
    expect(chip.props.accessibilityState).toEqual(expect.objectContaining({ checked: selected }));

    const nextProps = {
      icon: selected ? (type === 'option' ? 'none' : 'trailing') : 'leading',
      label: 'Intermediate',
      onSelectedChange,
      selected: !selected,
      type,
    } as ChoiceChipProps;
    await screen.rerender(<ChoiceChip {...nextProps} />);
    expect(screen.getByRole(role, { checked: !selected, name: 'Intermediate' })).toBeTruthy();
  });

  it('blocks disabled activation, hides icon semantics, and owns 148x40 plus 44 target geometry', async () => {
    const onSelectedChange = jest.fn();
    const screen = await render(
      <ChoiceChip
        disabled
        icon="trailing"
        label="Intermediate"
        onSelectedChange={onSelectedChange}
        selected={false}
        type="filter"
      />,
    );
    const chip = screen.getByRole('checkbox', {
      checked: false,
      disabled: true,
      name: 'Intermediate',
    });
    await userEvent.setup().press(chip);

    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(chip.props.hitSlop).toEqual({ bottom: 2, left: 2, right: 2, top: 2 });
    expect(flattenedStyle(chip.props.style)).toEqual(expect.objectContaining({
      height: 40,
      minHeight: 40,
      minWidth: 40,
      width: 148,
    }));
    expect(flattenedStyle(screen.getByTestId(
      'choice-chip-content',
      { includeHiddenElements: true },
    ).props.style)).toEqual(
      expect.objectContaining({ borderRadius: 20, height: 40, paddingHorizontal: 12 }),
    );
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it('renders one shared two-point focus indicator and rejects unsupported runtime tuples', async () => {
    const screen = await render(
      <ChoiceChip
        icon="none"
        label="Social"
        onSelectedChange={() => undefined}
        selected={false}
        type="option"
      />,
    );
    const chip = screen.getByRole('radio', { name: 'Social' });
    await act(async () => fireEvent(chip, 'focus', { nativeEvent: {} }));
    expect(flattenedStyle(chip.props.style)).toEqual(
      expect.objectContaining({ outlineColor: colors.focusRing, outlineWidth: 2 }),
    );
    expect(flattenedStyle(screen.getByTestId(
      'choice-chip-content',
      { includeHiddenElements: true },
    ).props.style)).toEqual(
      expect.objectContaining({ borderColor: colors.border, borderWidth: 1 }),
    );
    await act(async () => fireEvent(chip, 'blur', { nativeEvent: {} }));
    expect(flattenedStyle(chip.props.style).outlineWidth).toBe(0);
    expect(flattenedStyle(screen.getByTestId(
      'choice-chip-content',
      { includeHiddenElements: true },
    ).props.style)).toEqual(
      expect.objectContaining({ borderColor: colors.border, borderWidth: 1 }),
    );

    expect(() => ChoiceChip({
      icon: 'leading',
      label: 'Social',
      onSelectedChange: () => undefined,
      selected: false,
      type: 'option',
    } as unknown as ChoiceChipProps)).toThrow(/Unsupported design-system value: option\/leading\/default/u);
    expect(() => ChoiceChip({
      icon: 'trailing',
      label: 'Social',
      onSelectedChange: () => undefined,
      selected: false,
      type: 'option',
    } as unknown as ChoiceChipProps)).toThrow(/Unsupported design-system value: option\/trailing/u);
    expect(() => ChoiceChip({
      icon: 'none',
      label: 'Intermediate',
      onSelectedChange: () => undefined,
      selected: false,
      type: 'filter',
    } as unknown as ChoiceChipProps)).toThrow(/Unsupported design-system value: filter\/none/u);
  });
});

describe('ChoiceChip Storybook contract', () => {
  it('publishes Forms/Choice Chip with bounded controls and all source rows', () => {
    expect(ChoiceChipStories.title).toBe('Forms/Choice Chip');
    expect(ChoiceChipStories.argTypes).toEqual(expect.objectContaining({
      disabled: { control: 'boolean' },
      icon: { control: false, table: { disable: true } },
      selected: { control: 'boolean' },
      type: { control: 'select', options: ['option', 'filter'] },
    }));
    const variants = ChoiceChipVariants.render?.({} as never, {} as never) as React.ReactElement<{
      children: React.ReactNode;
    }>;
    expect(React.Children.toArray(variants.props.children)).toHaveLength(choiceChipRecords.length);
  });

  it('normalizes every visible type, selected, and disabled transition to the exact source tuple', async () => {
    for (const type of ['option', 'filter'] as const) {
      for (const selected of [false, true]) {
        for (const disabled of [false, true]) {
          const props = normalizeChoiceChipStoryArgs({
            disabled,
            label: 'Controlled chip',
            selected,
            type,
          });
          const effectiveSelected = selected && !disabled;
          expect(props).toEqual(expect.objectContaining({
            disabled: disabled || undefined,
            icon: effectiveSelected ? 'leading' : type === 'option' ? 'none' : 'trailing',
            selected: effectiveSelected,
            type,
          }));
          const screen = await render(<ChoiceChip {...props} />);
          const chip = screen.getByRole(type === 'option' ? 'radio' : 'checkbox', {
            checked: effectiveSelected,
            disabled,
            name: 'Controlled chip',
          });
          expect(chip.props.accessibilityState).toEqual(expect.objectContaining({
            checked: effectiveSelected,
            disabled,
          }));
          await screen.unmount();
        }
      }
    }
  });

  it('records long-copy, 200%-scale, clearance, and interactive witnesses', () => {
    const boundaries = ChoiceChipBoundaries.render?.({} as never, {} as never) as React.ReactElement;
    const boundaryJson = JSON.stringify(boundaries);
    expect(boundaryJson).toContain('200%');
    expect(boundaryJson).toContain('long label');
    expect(boundaryJson).toContain('target clearance');
    expect(boundaryJson).toContain('Phase 5');
    const interactive = ChoiceChipInteractive.render?.({} as never, {} as never) as React.ReactElement;
    expect((interactive.type as { name?: string }).name).toBe('InteractiveChoiceChipHarness');
  });
});

describe('Checkbox source and controlled contract', () => {
  it('retains only unchecked, checked, focused, and disabled in source order', () => {
    expect(phase3Families[5]).toEqual(expect.objectContaining({
      key: 'checkbox',
      recordCount: 4,
      sourceId: '482a7222-5a3b-8086-8008-a61e92e286a2',
    }));
    expect(checkboxRecords.map((record) => record.normalizedTuple)).toEqual([
      { state: 'disabled' },
      { state: 'focused' },
      { state: 'checked' },
      { state: 'unchecked' },
    ]);
    expect(checkboxRecords.some((record) =>
      (Object.values(record.normalizedTuple) as string[]).includes('indeterminate'))).toBe(false);
  });

  it('emits the opposite boolean once while checked state remains consumer-owned', async () => {
    const onCheckedChange = jest.fn();
    const screen = await render(
      <Checkbox
        accessibilityLabel="Include completed games"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );
    const checkbox = screen.getByRole('checkbox', {
      checked: false,
      name: 'Include completed games',
    });
    await userEvent.setup().press(checkbox);

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(checkbox.props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));

    await screen.rerender(
      <Checkbox
        accessibilityLabel="Include completed games"
        checked
        onCheckedChange={onCheckedChange}
      />,
    );
    expect(screen.getByRole('checkbox', {
      checked: true,
      name: 'Include completed games',
    })).toBeTruthy();
  });

  it('blocks disabled activation and keeps the outer stable semantic name', async () => {
    const onCheckedChange = jest.fn();
    const screen = await render(
      <Checkbox
        accessibilityLabel="Include completed games"
        checked={false}
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );
    const checkbox = screen.getByRole('checkbox', {
      checked: false,
      disabled: true,
      name: 'Include completed games',
    });
    await userEvent.setup().press(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it('expands the 40 visual to 44, renders one shared focus indicator, and hides decorative check art', async () => {
    const screen = await render(
      <Checkbox
        accessibilityLabel="Include completed games"
        checked
        onCheckedChange={() => undefined}
      />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Include completed games' });
    expect(checkbox.props.hitSlop).toEqual({ bottom: 2, left: 2, right: 2, top: 2 });
    expect(flattenedStyle(checkbox.props.style)).toEqual(expect.objectContaining({
      height: 40,
      minHeight: 40,
      minWidth: 40,
      width: 40,
    }));
    expect(flattenedStyle(screen.getByTestId(
      'checkbox-content',
      { includeHiddenElements: true },
    ).props.style)).toEqual(expect.objectContaining({
      backgroundColor: colors.accent,
      borderRadius: 8,
      height: 40,
      width: 40,
    }));

    await act(async () => fireEvent(checkbox, 'focus', { nativeEvent: {} }));
    expect(flattenedStyle(checkbox.props.style)).toEqual(
      expect.objectContaining({ outlineColor: colors.focusRing, outlineWidth: 2 }),
    );
    expect(flattenedStyle(screen.getByTestId(
      'checkbox-content',
      { includeHiddenElements: true },
    ).props.style)).toEqual(expect.objectContaining({
      borderColor: colors.border,
      borderWidth: 1,
    }));
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it('rejects indeterminate, malformed booleans, empty names, and unknown props', () => {
    expect(() => Checkbox({
      accessibilityLabel: 'Include completed games',
      checked: 'mixed',
      onCheckedChange: () => undefined,
    } as unknown as CheckboxProps)).toThrow(/Unsupported design-system value: mixed/u);
    expect(() => Checkbox({
      accessibilityLabel: '',
      checked: false,
      onCheckedChange: () => undefined,
    })).toThrow(/Supported values: non-empty accessibility label/u);
    expect(() => Checkbox({
      accessibilityLabel: 'Include completed games',
      checked: false,
      indeterminate: true,
      onCheckedChange: () => undefined,
    } as unknown as CheckboxProps)).toThrow(/Unsupported design-system value: indeterminate/u);
  });
});

describe('Checkbox Storybook contract', () => {
  it('publishes Forms/Checkbox with boolean-only controls and every source row', () => {
    expect(CheckboxStories.title).toBe('Forms/Checkbox');
    expect(CheckboxStories.argTypes).toEqual(expect.objectContaining({
      checked: { control: 'boolean' },
      disabled: { control: 'boolean' },
    }));
    expect(CheckboxStories.argTypes).not.toHaveProperty('indeterminate');
    const variants = CheckboxVariants.render?.({} as never, {} as never) as React.ReactElement<{
      children: React.ReactNode;
    }>;
    expect(React.Children.toArray(variants.props.children)).toHaveLength(checkboxRecords.length);
  });

  it('records adjacency, 200%-name, target-clearance, and interactive witnesses', () => {
    const boundaries = CheckboxBoundaries.render?.({} as never, {} as never) as React.ReactElement;
    const boundaryJson = JSON.stringify(boundaries);
    expect(boundaryJson).toContain('200%');
    expect(boundaryJson).toContain('target clearance');
    expect(boundaryJson).toContain('Phase 5');
    const interactive = CheckboxInteractive.render?.({} as never, {} as never) as React.ReactElement;
    expect((interactive.type as { name?: string }).name).toBe('InteractiveCheckboxHarness');
  });
});

describe('DayTimeSelector source and controlled contract', () => {
  it('retains the exact six records in time-then-day source order', () => {
    expect(phase3Families[6]).toEqual(expect.objectContaining({
      key: 'dayTimeSelector',
      recordCount: 6,
      sourceId: '482a7222-5a3b-8086-8008-a62580c2b764',
    }));
    expect(dayTimeSelectorRecords.map((record) => record.normalizedTuple)).toEqual([
      { type: 'time', state: 'disabled' },
      { type: 'time', state: 'selected' },
      { type: 'time', state: 'default' },
      { type: 'day', state: 'disabled' },
      { type: 'day', state: 'selected' },
      { type: 'day', state: 'default' },
    ]);

    type ImpossibleDayTime = Extract<DayTimeSelectorProps, {
      type: 'day'; time: string;
    }>;
    type ImpossibleTimeDate = Extract<DayTimeSelectorProps, {
      type: 'time'; date: string;
    }>;
    const discriminatedContent: [ImpossibleDayTime, ImpossibleTimeDate] extends [never, never]
      ? true
      : false = true;
    expect(discriminatedContent).toBe(true);
  });

  it('names each day option from visible day/date content and retains caller-owned selection', async () => {
    const onSelect = jest.fn();
    const screen = await render(
      <DayTimeSelector
        date="17 Sep"
        day="Tue"
        onSelect={onSelect}
        selected={false}
        type="day"
      />,
    );
    const option = screen.getByRole('radio', { checked: false, name: 'Tue, 17 Sep' });
    await userEvent.setup().press(option);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(option.props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));

    await screen.rerender(
      <DayTimeSelector
        date="17 Sep"
        day="Tue"
        onSelect={onSelect}
        selected
        type="day"
      />,
    );
    expect(screen.getByRole('radio', { checked: true, name: 'Tue, 17 Sep' })).toBeTruthy();
  });

  it('names each time option from visible time/availability content and emits once', async () => {
    const onSelect = jest.fn();
    const screen = await render(
      <DayTimeSelector
        availability="3 spots"
        onSelect={onSelect}
        selected={false}
        time="18:30"
        type="time"
      />,
    );
    const option = screen.getByRole('radio', {
      checked: false,
      name: '18:30, 3 spots',
    });
    await userEvent.setup().press(option);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('keeps options individually named, in rendered order, and without overlapping targets', async () => {
    const screen = await render(
      <>
        <DayTimeSelector date="16 Sep" day="Mon" onSelect={() => undefined} selected={false} type="day" />
        <DayTimeSelector date="17 Sep" day="Tue" onSelect={() => undefined} selected type="day" />
        <DayTimeSelector availability="3 spots" onSelect={() => undefined} selected={false} time="18:30" type="time" />
      </>,
    );
    expect(screen.getAllByRole('radio').map((option) => option.props.accessibilityLabel)).toEqual([
      'Mon, 16 Sep',
      'Tue, 17 Sep',
      '18:30, 3 spots',
    ]);
    expect(screen.getByRole('radio', { name: 'Mon, 16 Sep' }).props.hitSlop).toEqual({
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    });
    expect(screen.getByRole('radio', { name: 'Tue, 17 Sep' }).props.hitSlop).toEqual({
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    });
  });

  it('uses exact day/time geometry and the family-owned 0.55 disabled exception', async () => {
    const onSelect = jest.fn();
    const day = await render(
      <DayTimeSelector date="18 Sep" day="Wed" disabled onSelect={onSelect} selected={false} type="day" />,
    );
    const dayOption = day.getByRole('radio', {
      checked: false,
      disabled: true,
      name: 'Wed, 18 Sep',
    });
    await userEvent.setup().press(dayOption);
    expect(onSelect).not.toHaveBeenCalled();
    expect(flattenedStyle(dayOption.props.style)).toEqual(expect.objectContaining({
      height: 72,
      minHeight: 44,
      minWidth: 44,
      width: 104,
    }));
    expect(flattenedStyle(day.getByTestId('day-time-selector-root').props.style).opacity).toBe(0.55);

    const time = await render(
      <DayTimeSelector availability="3 spots" onSelect={() => undefined} selected={false} time="18:30" type="time" />,
    );
    expect(flattenedStyle(time.getByRole('radio', { name: '18:30, 3 spots' }).props.style)).toEqual(
      expect.objectContaining({ height: 56, width: 112 }),
    );
    expect(flattenedStyle(time.getByTestId(
      'day-time-selector-content',
      { includeHiddenElements: true },
    ).props.style)).toEqual(expect.objectContaining({ borderRadius: 16 }));
  });

  it('rejects mixed content, unsupported tuples, empty copy, and unknown props', () => {
    expect(() => DayTimeSelector({
      date: '17 Sep',
      day: 'Tue',
      onSelect: () => undefined,
      selected: true,
      disabled: true,
      type: 'day',
    } as unknown as DayTimeSelectorProps)).toThrow(/Unsupported design-system value: selected\/disabled/u);
    expect(() => DayTimeSelector({
      availability: '3 spots',
      date: '17 Sep',
      onSelect: () => undefined,
      selected: false,
      time: '18:30',
      type: 'time',
    } as unknown as DayTimeSelectorProps)).toThrow(/Unsupported design-system value: date/u);
    expect(() => DayTimeSelector({
      date: '',
      day: 'Tue',
      onSelect: () => undefined,
      selected: false,
      type: 'day',
    })).toThrow(/Supported values: non-empty date/u);
    expect(() => DayTimeSelector({
      availability: '3 spots',
      onSelect: () => undefined,
      selected: false,
      time: '18:30',
      type: 'slot',
    } as unknown as DayTimeSelectorProps)).toThrow(/Unsupported design-system value: slot/u);
  });
});

describe('DayTimeSelector Storybook and forms publication contract', () => {
  it('publishes Forms/Day Time Selector with closed controls and every source row', () => {
    expect(DayTimeSelectorStories.title).toBe('Forms/Day Time Selector');
    expect(DayTimeSelectorStories.argTypes).toEqual(expect.objectContaining({
      disabled: { control: 'boolean' },
      selected: { control: 'boolean' },
      type: { control: 'select', options: ['day', 'time'] },
    }));
    const variants = DayTimeSelectorVariants.render?.({} as never, {} as never) as React.ReactElement<{
      children: React.ReactNode;
    }>;
    expect(React.Children.toArray(variants.props.children)).toHaveLength(dayTimeSelectorRecords.length);
  });

  it('normalizes branch and state transitions without retaining incompatible content keys', async () => {
    for (const type of ['day', 'time'] as const) {
      for (const selected of [false, true]) {
        for (const disabled of [false, true]) {
          const props = normalizeDayTimeSelectorStoryArgs({
            availability: '3 spots',
            date: '16 Sep',
            day: 'Mon',
            disabled,
            selected,
            time: '18:30',
            type,
          });
          expect('day' in props).toBe(type === 'day');
          expect('time' in props).toBe(type === 'time');
          const screen = await render(<DayTimeSelector {...props} />);
          expect(screen.getByRole('radio')).toBeTruthy();
          await screen.unmount();
        }
      }
    }
  });

  it('records long-content, 200%-scale, target-clearance, and interactive witnesses', () => {
    const boundaries = DayTimeSelectorBoundaries.render?.({} as never, {} as never) as React.ReactElement;
    const boundaryJson = JSON.stringify(boundaries);
    expect(boundaryJson).toContain('200%');
    expect(boundaryJson).toContain('long content');
    expect(boundaryJson).toContain('target clearance');
    expect(boundaryJson).toContain('Phase 5');
    const interactive = DayTimeSelectorInteractive.render?.({} as never, {} as never) as React.ReactElement;
    expect((interactive.type as { name?: string }).name).toBe('InteractiveDayTimeSelectorHarness');
  });

  it('publishes only the four forms families while accounting for all 30 records', () => {
    expect(Object.keys(forms).sort()).toEqual([
      'Checkbox',
      'ChoiceChip',
      'DayTimeSelector',
      'Field',
    ]);
    expect([
      phase3Families[3],
      phase3Families[4],
      phase3Families[5],
      phase3Families[6],
    ].reduce((total, family) => total + family.recordCount, 0)).toBe(30);
  });
});
