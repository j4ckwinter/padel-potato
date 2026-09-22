import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Inline } from '../../primitives/Inline';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { dayTimeSelectorFixtures } from '../../stories/fixtures';
import {
  DayTimeSelector,
  dayTimeSelectorTypes,
  type DayTimeSelectorProps,
} from './DayTimeSelector';

const selectorFixtures = dayTimeSelectorFixtures;
const noop = () => undefined;

const meta = {
  title: 'Forms/Day Time Selector',
  excludeStories: /(?:^normalize|^Interactive.*Harness$)/u,
  component: DayTimeSelector,
  argTypes: {
    disabled: { control: 'boolean' },
    onSelect: { action: 'selected' },
    selected: { control: 'boolean' },
    type: { control: 'select', options: dayTimeSelectorTypes },
  },
} satisfies Meta<typeof DayTimeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

type DayTimeSelectorStoryArgs = Readonly<Record<string, unknown>>;

export const normalizeDayTimeSelectorStoryArgs = (
  args: DayTimeSelectorStoryArgs,
): DayTimeSelectorProps => {
  const type = dayTimeSelectorTypes.includes(args.type as 'day' | 'time')
    ? args.type as 'day' | 'time'
    : 'day';
  const disabled = args.disabled === true;
  const stateProps = {
    disabled: disabled || undefined,
    onSelect: typeof args.onSelect === 'function'
      ? args.onSelect as DayTimeSelectorProps['onSelect']
      : noop,
    selected: !disabled && args.selected === true,
  };
  if (type === 'time') {
    return {
      ...stateProps,
      availability: typeof args.availability === 'string' && args.availability.trim().length > 0
        ? args.availability
        : '3 spots',
      time: typeof args.time === 'string' && args.time.trim().length > 0
        ? args.time
        : '18:30',
      type,
    } as DayTimeSelectorProps;
  }
  return {
    ...stateProps,
    date: typeof args.date === 'string' && args.date.trim().length > 0 ? args.date : '16 Sep',
    day: typeof args.day === 'string' && args.day.trim().length > 0 ? args.day : 'Mon',
    type,
  } as DayTimeSelectorProps;
};

export const Canonical: Story = {
  args: {
    date: '16 Sep',
    day: 'Mon',
    onSelect: noop,
    selected: false,
    type: 'day',
  },
  render: (args) => (
    <Stack gap="space8">
      <DayTimeSelector {...normalizeDayTimeSelectorStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        {'Canonical configuration'}
      </Text>
    </Stack>
  ),
};

const fixtureProps = (fixture: (typeof selectorFixtures)[number]): DayTimeSelectorProps => {
  const { state, type } = fixture.configuration;
  const stateProps = {
    disabled: state === 'disabled',
    onSelect: noop,
    selected: state === 'selected',
  };
  if (type === 'day') {
    const content = state === 'disabled'
      ? { day: 'Wed', date: '18 Sep' }
      : state === 'selected'
        ? { day: 'Tue', date: '17 Sep' }
        : { day: 'Mon', date: '16 Sep' };
    return { ...content, ...stateProps, type } as DayTimeSelectorProps;
  }
  const content = state === 'disabled'
    ? { time: '20:30', availability: 'Full' }
    : state === 'selected'
      ? { time: '19:00', availability: 'Selected' }
      : { time: '18:30', availability: '3 spots' };
  return { ...content, ...stateProps, type } as DayTimeSelectorProps;
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      {selectorFixtures.map((fixture) => (
        <Fragment key={fixture.label}>
          <DayTimeSelector {...fixtureProps(fixture)} />
          <Text color="textSecondary" variant="caption">
            {fixture.label}
          </Text>
        </Fragment>
      ))}
    </Stack>
  ),
};

export const States: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      <Inline gap="space8">
        <DayTimeSelector date="16 Sep" day="Mon" onSelect={noop} selected={false} type="day" />
        <DayTimeSelector date="17 Sep" day="Tue" onSelect={noop} selected type="day" />
        <DayTimeSelector date="18 Sep" day="Wed" disabled onSelect={noop} selected={false} type="day" />
      </Inline>
      <Inline gap="space8">
        <DayTimeSelector availability="3 spots" onSelect={noop} selected={false} time="18:30" type="time" />
        <DayTimeSelector availability="Selected" onSelect={noop} selected time="19:00" type="time" />
        <DayTimeSelector availability="Full" disabled onSelect={noop} selected={false} time="20:30" type="time" />
      </Inline>
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8">
      <Inline gap="space8">
        <DayTimeSelector date="Wednesday 17 September" day="Tournament finals day" onSelect={noop} selected={false} type="day" />
        <DayTimeSelector availability="Only one tournament place remaining" onSelect={noop} selected={false} time="18:30 GMT" type="time" />
      </Inline>
      <Text color="textSecondary" variant="caption">
        Full long content remains in each individual radio name at 200%; eight points preserve target clearance with no hit-area overlap. Native measurement remains Phase 5.
      </Text>
    </Stack>
  ),
};

export function InteractiveDayTimeSelectorHarness() {
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [selectedTime, setSelectedTime] = useState('18:30');
  return (
    <Stack gap="space12">
      <Inline gap="space8">
        {[
          ['Mon', '16 Sep'],
          ['Tue', '17 Sep'],
          ['Wed', '18 Sep'],
        ].map(([day, date]) => (
          <DayTimeSelector
            date={date}
            day={day}
            key={day}
            onSelect={() => setSelectedDay(day)}
            selected={selectedDay === day}
            type="day"
          />
        ))}
      </Inline>
      <Inline gap="space8">
        {[
          ['18:30', '3 spots'],
          ['19:00', '2 spots'],
        ].map(([time, availability]) => (
          <DayTimeSelector
            availability={availability}
            key={time}
            onSelect={() => setSelectedTime(time)}
            selected={selectedTime === time}
            time={time}
            type="time"
          />
        ))}
      </Inline>
    </Stack>
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: () => <InteractiveDayTimeSelectorHarness />,
};
