import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import {
  act,
  fireEvent,
  render,
  userEvent,
} from '@testing-library/react-native';

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

import {
  fieldFixtures,
  choiceChipFixtures,
  checkboxFixtures,
  dayTimeSelectorFixtures,
} from '../src/design-system/stories/fixtures';

import { colors } from '../src/design-system/tokens';

describe('Checkbox controlled public contract', () => {
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
    expect(checkbox.props.accessibilityState).toEqual(
      expect.objectContaining({ checked: false }),
    );

    await screen.rerender(
      <Checkbox
        accessibilityLabel="Include completed games"
        checked
        onCheckedChange={onCheckedChange}
      />,
    );
    expect(
      screen.getByRole('checkbox', {
        checked: true,
        name: 'Include completed games',
      }),
    ).toBeTruthy();
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
    const checkbox = screen.getByRole('checkbox', {
      name: 'Include completed games',
    });
    expect(checkbox.props.hitSlop).toEqual({
      bottom: 2,
      left: 2,
      right: 2,
      top: 2,
    });
    expect(flattenedStyle(checkbox.props.style)).toEqual(
      expect.objectContaining({
        height: 40,
        minHeight: 40,
        minWidth: 40,
        width: 40,
      }),
    );
    expect(
      flattenedStyle(
        screen.getByTestId('checkbox-content', { includeHiddenElements: true })
          .props.style,
      ),
    ).toEqual(
      expect.objectContaining({
        backgroundColor: colors.accent,
        borderRadius: 8,
        height: 40,
        width: 40,
      }),
    );

    await act(async () => fireEvent(checkbox, 'focus', { nativeEvent: {} }));
    expect(flattenedStyle(checkbox.props.style)).toEqual(
      expect.objectContaining({
        outlineColor: colors.focusRing,
        outlineWidth: 2,
      }),
    );
    expect(
      flattenedStyle(
        screen.getByTestId('checkbox-content', { includeHiddenElements: true })
          .props.style,
      ),
    ).toEqual(
      expect.objectContaining({
        borderColor: colors.border,
        borderWidth: 1,
      }),
    );
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it('rejects indeterminate, malformed booleans, empty names, and unknown props', () => {
    expect(() =>
      Checkbox({
        accessibilityLabel: 'Include completed games',
        checked: 'mixed',
        onCheckedChange: () => undefined,
      } as unknown as CheckboxProps),
    ).toThrow(/Unsupported design-system value: mixed/u);
    expect(() =>
      Checkbox({
        accessibilityLabel: '',
        checked: false,
        onCheckedChange: () => undefined,
      }),
    ).toThrow(/Supported values: non-empty accessibility label/u);
    expect(() =>
      Checkbox({
        accessibilityLabel: 'Include completed games',
        checked: false,
        indeterminate: true,
        onCheckedChange: () => undefined,
      } as unknown as CheckboxProps),
    ).toThrow(/Unsupported design-system value: indeterminate/u);
  });
});

describe('Checkbox Storybook contract', () => {
  it('publishes Forms/Checkbox with boolean-only controls and every source row', () => {
    expect(CheckboxStories.title).toBe('Forms/Checkbox');
    expect(CheckboxStories.argTypes).toEqual(
      expect.objectContaining({
        checked: { control: 'boolean' },
        disabled: { control: 'boolean' },
      }),
    );
    expect(CheckboxStories.argTypes).not.toHaveProperty('indeterminate');
    const variants = CheckboxVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement<{
      children: React.ReactNode;
    }>;
    expect(React.Children.toArray(variants.props.children)).toHaveLength(
      checkboxFixtures.length,
    );
  });

  it('records adjacency, 200%-name, target-clearance, and interactive witnesses', () => {
    const boundaries = CheckboxBoundaries.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement;
    const boundaryJson = JSON.stringify(boundaries);
    expect(boundaryJson).toContain('200%');
    expect(boundaryJson).toContain('target clearance');
    expect(boundaryJson).toContain('Phase 5');
    const interactive = CheckboxInteractive.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement;
    expect((interactive.type as { name?: string }).name).toBe(
      'InteractiveCheckboxHarness',
    );
  });
});
