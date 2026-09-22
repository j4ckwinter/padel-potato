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

describe('ChoiceChip controlled public contract', () => {
  it.each([
    ['option', 'none', false, 'radio'],
    ['option', 'leading', true, 'radio'],
    ['filter', 'leading', true, 'checkbox'],
    ['filter', 'trailing', false, 'checkbox'],
  ] as Array<
    [
      ChoiceChipProps['type'],
      ChoiceChipProps['icon'],
      boolean,
      'checkbox' | 'radio',
    ]
  >)(
    '%s/%s selected=%s emits the next controlled value once with %s semantics',
    async (type, icon, selected, role) => {
      const onSelectedChange = jest.fn();
      const initialProps = {
        icon,
        label: 'Intermediate',
        onSelectedChange,
        selected,
        type,
      } as ChoiceChipProps;
      const screen = await render(<ChoiceChip {...initialProps} />);
      const chip = screen.getByRole(role, {
        checked: selected,
        name: 'Intermediate',
      });

      await userEvent.setup().press(chip);
      expect(onSelectedChange).toHaveBeenCalledTimes(1);
      expect(onSelectedChange).toHaveBeenCalledWith(!selected);
      expect(chip.props.accessibilityState).toEqual(
        expect.objectContaining({ checked: selected }),
      );

      const nextProps = {
        icon: selected ? (type === 'option' ? 'none' : 'trailing') : 'leading',
        label: 'Intermediate',
        onSelectedChange,
        selected: !selected,
        type,
      } as ChoiceChipProps;
      await screen.rerender(<ChoiceChip {...nextProps} />);
      expect(
        screen.getByRole(role, { checked: !selected, name: 'Intermediate' }),
      ).toBeTruthy();
    },
  );

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
    expect(chip.props.hitSlop).toEqual({
      bottom: 2,
      left: 2,
      right: 2,
      top: 2,
    });
    expect(flattenedStyle(chip.props.style)).toEqual(
      expect.objectContaining({
        height: 40,
        minHeight: 40,
        minWidth: 40,
        width: 148,
      }),
    );
    expect(
      flattenedStyle(
        screen.getByTestId('choice-chip-content', {
          includeHiddenElements: true,
        }).props.style,
      ),
    ).toEqual(
      expect.objectContaining({
        borderRadius: 20,
        height: 40,
        paddingHorizontal: 12,
      }),
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
      expect.objectContaining({
        outlineColor: colors.focusRing,
        outlineWidth: 2,
      }),
    );
    expect(
      flattenedStyle(
        screen.getByTestId('choice-chip-content', {
          includeHiddenElements: true,
        }).props.style,
      ),
    ).toEqual(
      expect.objectContaining({ borderColor: colors.border, borderWidth: 1 }),
    );
    await act(async () => fireEvent(chip, 'blur', { nativeEvent: {} }));
    expect(flattenedStyle(chip.props.style).outlineWidth).toBe(0);
    expect(
      flattenedStyle(
        screen.getByTestId('choice-chip-content', {
          includeHiddenElements: true,
        }).props.style,
      ),
    ).toEqual(
      expect.objectContaining({ borderColor: colors.border, borderWidth: 1 }),
    );

    expect(() =>
      ChoiceChip({
        icon: 'leading',
        label: 'Social',
        onSelectedChange: () => undefined,
        selected: false,
        type: 'option',
      } as unknown as ChoiceChipProps),
    ).toThrow(/Unsupported design-system value: option\/leading\/default/u);
    expect(() =>
      ChoiceChip({
        icon: 'trailing',
        label: 'Social',
        onSelectedChange: () => undefined,
        selected: false,
        type: 'option',
      } as unknown as ChoiceChipProps),
    ).toThrow(/Unsupported design-system value: option\/trailing/u);
    expect(() =>
      ChoiceChip({
        icon: 'none',
        label: 'Intermediate',
        onSelectedChange: () => undefined,
        selected: false,
        type: 'filter',
      } as unknown as ChoiceChipProps),
    ).toThrow(/Unsupported design-system value: filter\/none/u);
  });
});

describe('ChoiceChip Storybook contract', () => {
  it('publishes Forms/Choice Chip with bounded controls and all source rows', () => {
    expect(ChoiceChipStories.title).toBe('Forms/Choice Chip');
    expect(ChoiceChipStories.argTypes).toEqual(
      expect.objectContaining({
        disabled: { control: 'boolean' },
        icon: { control: false, table: { disable: true } },
        selected: { control: 'boolean' },
        type: { control: 'select', options: ['option', 'filter'] },
      }),
    );
    const variants = ChoiceChipVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement<{
      children: React.ReactNode;
    }>;
    expect(React.Children.toArray(variants.props.children)).toHaveLength(
      choiceChipFixtures.length,
    );
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
          expect(props).toEqual(
            expect.objectContaining({
              disabled: disabled || undefined,
              icon: effectiveSelected
                ? 'leading'
                : type === 'option'
                  ? 'none'
                  : 'trailing',
              selected: effectiveSelected,
              type,
            }),
          );
          const screen = await render(<ChoiceChip {...props} />);
          const chip = screen.getByRole(
            type === 'option' ? 'radio' : 'checkbox',
            {
              checked: effectiveSelected,
              disabled,
              name: 'Controlled chip',
            },
          );
          expect(chip.props.accessibilityState).toEqual(
            expect.objectContaining({
              checked: effectiveSelected,
              disabled,
            }),
          );
          await screen.unmount();
        }
      }
    }
  });

  it('records long-copy, 200%-scale, clearance, and interactive witnesses', () => {
    const boundaries = ChoiceChipBoundaries.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement;
    const boundaryJson = JSON.stringify(boundaries);
    expect(boundaryJson).toContain('200%');
    expect(boundaryJson).toContain('long label');
    expect(boundaryJson).toContain('target clearance');
    expect(boundaryJson).toContain('Phase 5');
    const interactive = ChoiceChipInteractive.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement;
    expect((interactive.type as { name?: string }).name).toBe(
      'InteractiveChoiceChipHarness',
    );
  });
});
