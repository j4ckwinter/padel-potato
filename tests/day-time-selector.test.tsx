import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import React from 'react';

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

import { dayTimeSelectorFixtures } from '../src/design-system/stories/fixtures';

describe('DayTimeSelector controlled public contract', () => {
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
    const option = screen.getByRole('radio', {
      checked: false,
      name: 'Tue, 17 Sep',
    });
    await userEvent.setup().press(option);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(option.props.accessibilityState).toEqual(
      expect.objectContaining({ checked: false }),
    );

    await screen.rerender(
      <DayTimeSelector
        date="17 Sep"
        day="Tue"
        onSelect={onSelect}
        selected
        type="day"
      />,
    );
    expect(
      screen.getByRole('radio', { checked: true, name: 'Tue, 17 Sep' }),
    ).toBeTruthy();
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
        <DayTimeSelector
          date="16 Sep"
          day="Mon"
          onSelect={() => undefined}
          selected={false}
          type="day"
        />
        <DayTimeSelector
          date="17 Sep"
          day="Tue"
          onSelect={() => undefined}
          selected
          type="day"
        />
        <DayTimeSelector
          availability="3 spots"
          onSelect={() => undefined}
          selected={false}
          time="18:30"
          type="time"
        />
      </>,
    );
    expect(
      screen
        .getAllByRole('radio')
        .map((option) => option.props.accessibilityLabel),
    ).toEqual(['Mon, 16 Sep', 'Tue, 17 Sep', '18:30, 3 spots']);
    expect(
      screen.getByRole('radio', { name: 'Mon, 16 Sep' }).props.hitSlop,
    ).toEqual({
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    });
    expect(
      screen.getByRole('radio', { name: 'Tue, 17 Sep' }).props.hitSlop,
    ).toEqual({
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    });
  });

  it('uses exact day/time geometry and the family-owned 0.55 disabled exception', async () => {
    const onSelect = jest.fn();
    const day = await render(
      <DayTimeSelector
        date="18 Sep"
        day="Wed"
        disabled
        onSelect={onSelect}
        selected={false}
        type="day"
      />,
    );
    const dayOption = day.getByRole('radio', {
      checked: false,
      disabled: true,
      name: 'Wed, 18 Sep',
    });
    await userEvent.setup().press(dayOption);
    expect(onSelect).not.toHaveBeenCalled();
    expect(flattenedStyle(dayOption.props.style)).toEqual(
      expect.objectContaining({
        height: 72,
        minHeight: 44,
        minWidth: 44,
        width: 104,
      }),
    );
    expect(
      flattenedStyle(day.getByTestId('day-time-selector-root').props.style)
        .opacity,
    ).toBe(0.4);

    const time = await render(
      <DayTimeSelector
        availability="3 spots"
        onSelect={() => undefined}
        selected={false}
        time="18:30"
        type="time"
      />,
    );
    expect(
      flattenedStyle(
        time.getByRole('radio', { name: '18:30, 3 spots' }).props.style,
      ),
    ).toEqual(expect.objectContaining({ height: 56, width: 112 }));
    expect(
      flattenedStyle(
        time.getByTestId('day-time-selector-content', {
          includeHiddenElements: true,
        }).props.style,
      ),
    ).toEqual(expect.objectContaining({ borderRadius: 16 }));
  });

  it('rejects mixed content, unsupported tuples, empty copy, and unknown props', () => {
    expect(() =>
      DayTimeSelector({
        date: '17 Sep',
        day: 'Tue',
        onSelect: () => undefined,
        selected: true,
        disabled: true,
        type: 'day',
      } as unknown as DayTimeSelectorProps),
    ).toThrow(/Unsupported design-system value: selected\/disabled/u);
    expect(() =>
      DayTimeSelector({
        availability: '3 spots',
        date: '17 Sep',
        onSelect: () => undefined,
        selected: false,
        time: '18:30',
        type: 'time',
      } as unknown as DayTimeSelectorProps),
    ).toThrow(/Unsupported design-system value: date/u);
    expect(() =>
      DayTimeSelector({
        date: '',
        day: 'Tue',
        onSelect: () => undefined,
        selected: false,
        type: 'day',
      }),
    ).toThrow(/Supported values: non-empty date/u);
    expect(() =>
      DayTimeSelector({
        availability: '3 spots',
        onSelect: () => undefined,
        selected: false,
        time: '18:30',
        type: 'slot',
      } as unknown as DayTimeSelectorProps),
    ).toThrow(/Unsupported design-system value: slot/u);
  });
});

describe('DayTimeSelector Storybook and forms publication contract', () => {
  it('publishes Forms/Day Time Selector with closed controls and every source row', () => {
    expect(DayTimeSelectorStories.title).toBe('Forms/Day Time Selector');
    expect(DayTimeSelectorStories.argTypes).toEqual(
      expect.objectContaining({
        disabled: { control: 'boolean' },
        selected: { control: 'boolean' },
        type: { control: 'select', options: ['day', 'time'] },
      }),
    );
    const variants = DayTimeSelectorVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement<{
      children: React.ReactNode;
    }>;
    expect(React.Children.toArray(variants.props.children)).toHaveLength(
      dayTimeSelectorFixtures.length,
    );
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
    const boundaries = DayTimeSelectorBoundaries.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement;
    const boundaryJson = JSON.stringify(boundaries);
    expect(boundaryJson).toContain('200%');
    expect(boundaryJson).toContain('long content');
    expect(boundaryJson).toContain('target clearance');
    expect(boundaryJson).toContain('native Storybook review');
    const interactive = DayTimeSelectorInteractive.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement;
    expect((interactive.type as { name?: string }).name).toBe(
      'InteractiveDayTimeSelectorHarness',
    );
  });
});
