import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { fieldFixtures } from '../../stories/fixtures';
import { Field, fieldStatuses, fieldTypes, type FieldProps } from './Field';

const noop = () => undefined;

const safeArgs = (args: Partial<FieldProps>): FieldProps => {
  const type = fieldTypes.includes(args.type as (typeof fieldTypes)[number])
    ? (args.type as (typeof fieldTypes)[number])
    : 'text';
  const common = {
    disabled: typeof args.disabled === 'boolean' ? args.disabled : false,
    label:
      typeof args.label === 'string' && args.label.trim()
        ? args.label
        : 'Game name',
    required: typeof args.required === 'boolean' ? args.required : false,
    value: typeof args.value === 'string' ? args.value : '',
  };
  const status = fieldStatuses.includes(args.status ?? 'default')
    ? (args.status ?? 'default')
    : 'default';
  const messageProps =
    status === 'default'
      ? { status: 'default' as const }
      : {
          message: status === 'error' ? 'Check this value' : 'Looks good',
          status,
        };

  if (type === 'stepper') {
    return {
      ...common,
      ...messageProps,
      onDecrement: noop,
      onIncrement: noop,
      type,
      value: common.value || '4 players',
    };
  }
  if (type === 'select' || type === 'date' || type === 'time') {
    return {
      ...common,
      ...messageProps,
      onPress: noop,
      placeholder: type === 'select' ? 'Choose level' : `Choose ${type}`,
      type,
    };
  }
  return {
    ...common,
    ...messageProps,
    onChangeText: noop,
    placeholder:
      type === 'search'
        ? 'Search games'
        : type === 'password'
          ? 'Enter your password'
          : 'Enter game name',
    type,
  };
};

const meta = {
  title: 'Forms/Field',
  component: Field,
  argTypes: {
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    status: { control: 'select', options: fieldStatuses },
    type: { control: 'select', options: fieldTypes },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: {
    label: 'Game name',
    onChangeText: noop,
    placeholder: 'Enter game name',
    required: true,
    type: 'text',
    value: '',
  },
  render: (args) => (
    <Stack gap="space8">
      <Field {...safeArgs(args)} />
      <Text color="textSecondary" variant="caption">
        {'Canonical configuration'}
      </Text>
    </Stack>
  ),
};

const fixtureProps = (fixture: (typeof fieldFixtures)[number]): FieldProps => {
  const { state, type } = fixture.configuration;
  if (type === 'stepper') {
    return {
      label: 'Players',
      message: 'Looks good',
      onDecrement: noop,
      onIncrement: noop,
      status: 'success',
      type,
      value: '4 players',
    };
  }
  if (type === 'select' || type === 'date' || type === 'time') {
    return {
      disabled: state === 'disabled',
      label: type === 'select' ? 'Level' : type === 'date' ? 'Date' : 'Time',
      onPress: noop,
      placeholder: type === 'select' ? 'Choose level' : `Choose ${type}`,
      type,
      value: type === 'date' ? '12 Sep 2026' : type === 'time' ? '18:30' : '',
    };
  }
  const base = {
    label:
      type === 'password'
        ? 'Password'
        : type === 'search'
          ? 'Search'
          : 'Game name',
    onChangeText: noop,
    placeholder:
      type === 'password'
        ? 'Enter your password'
        : type === 'search'
          ? 'Search games'
          : 'Enter game name',
    required: type === 'password' || (type === 'text' && state === 'default'),
    type,
    value:
      state === 'filled'
        ? 'secret12'
        : state === 'readOnly'
          ? 'Wednesday Evening Padel'
          : state === 'error' && type === 'search'
            ? 'Search players'
            : '',
  } as const;
  if (state === 'error') {
    return {
      ...base,
      message:
        type === 'password' ? 'Use at least 8 characters' : 'Check this value',
      status: 'error',
    };
  }
  return { ...base, readOnly: state === 'readOnly' };
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      {fieldFixtures.map((fixture) => (
        <Fragment key={fixture.label}>
          <Field {...fixtureProps(fixture)} />
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
      <Field
        label="Generated game name"
        onChangeText={noop}
        readOnly
        type="text"
        value="Wednesday Evening Padel"
      />
      <Field disabled label="Time" onPress={noop} type="time" value="18:30" />
      <Field
        label="Search"
        message="Check this value"
        onChangeText={noop}
        status="error"
        type="search"
        value="Search players"
      />
      <Field
        label="Players"
        message="Looks good"
        onDecrement={noop}
        onIncrement={noop}
        status="success"
        type="stepper"
        value="4 players"
      />
      <Text color="textSecondary" variant="caption">
        Press and keyboard focus drive transient styling; focused states are not
        persistent props.
      </Text>
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12" style={{ width: 260 }}>
      <Field
        label="Required empty value"
        onChangeText={noop}
        placeholder="Enter game name"
        required
        type="text"
        value=""
      />
      <Field
        label="Empty trigger value"
        onPress={noop}
        placeholder="Choose level"
        type="select"
        value=""
      />
      <Field
        label="A deliberately long password label that must wrap at constrained width"
        message="A long error remains visible and associated while the field demonstrates vertical growth"
        onChangeText={noop}
        status="error"
        type="password"
        value="A deliberately long controlled value that remains reachable"
      />
      <Field
        helperText="A long helper remains visible, associated, and free to grow vertically"
        label="Long helper example"
        onChangeText={noop}
        type="text"
        value="Value"
      />
      <Field
        label="Players"
        onDecrement={noop}
        onIncrement={noop}
        type="stepper"
        value="4 players"
      />
      <Text color="textSecondary" variant="caption">
        Empty content, constrained width, long value/helper/error vertical
        growth, 200% font-scale intent, and nested target clearance are host
        witnesses only. Native measurement requires native Storybook review.
      </Text>
    </Stack>
  ),
};

function InteractiveFieldHarness() {
  const [name, setName] = useState('');
  const [players, setPlayers] = useState(4);
  const [triggerCount, setTriggerCount] = useState(0);
  return (
    <Stack gap="space12">
      <Field
        label="Game name"
        onChangeText={setName}
        placeholder="Enter game name"
        required
        type="text"
        value={name}
      />
      <Field
        label="Level"
        onPress={() => setTriggerCount((count) => count + 1)}
        placeholder="Choose level"
        type="select"
        value="Intermediate"
      />
      <Field
        decrementDisabled={players <= 2}
        incrementDisabled={players >= 4}
        label="Players"
        onDecrement={() => setPlayers((count) => count - 1)}
        onIncrement={() => setPlayers((count) => count + 1)}
        type="stepper"
        value={`${players} players`}
      />
      <Text variant="body">{`Trigger activations: ${triggerCount}`}</Text>
    </Stack>
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: () => <InteractiveFieldHarness />,
};
