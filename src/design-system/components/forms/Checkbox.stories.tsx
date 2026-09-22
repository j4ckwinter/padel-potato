import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Inline } from '../../primitives/Inline';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { checkboxFixtures } from '../../stories/fixtures';
import { Checkbox } from './Checkbox';

const noop = () => undefined;

const meta = {
  title: 'Forms/Checkbox',
  excludeStories: /^Interactive.*Harness$/u,
  component: Checkbox,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onCheckedChange: { action: 'checked changed' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: {
    accessibilityLabel: 'Include completed games',
    checked: false,
    onCheckedChange: noop,
  },
  render: (args) => (
    <Stack gap="space8">
      <Checkbox {...args} />
      <Text color="textSecondary" variant="caption">
        {'Canonical configuration'}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      {checkboxFixtures.map((fixture) => (
        <Fragment key={fixture.label}>
          <Checkbox
            accessibilityLabel="Include completed games"
            checked={fixture.configuration.state === 'checked'}
            disabled={fixture.configuration.state === 'disabled'}
            onCheckedChange={noop}
          />
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
    <Inline gap="space8">
      <Checkbox accessibilityLabel="Unchecked" checked={false} onCheckedChange={noop} />
      <Checkbox accessibilityLabel="Checked" checked onCheckedChange={noop} />
      <Checkbox accessibilityLabel="Disabled" checked={false} disabled onCheckedChange={noop} />
    </Inline>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8">
      <Inline gap="space4">
        <Checkbox
          accessibilityLabel="Include completed tournament games in the historical results filter"
          checked={false}
          onCheckedChange={noop}
        />
        <Checkbox accessibilityLabel="Adjacent option" checked onCheckedChange={noop} />
      </Inline>
      <Text color="textSecondary" variant="caption">
        The complete accessible name remains available at 200%; four points preserve target clearance between adjacent expanded controls. Native measurement remains Phase 5.
      </Text>
    </Stack>
  ),
};

export function InteractiveCheckboxHarness() {
  const [checked, setChecked] = useState(false);
  return (
    <Stack gap="space8">
      <Checkbox
        accessibilityLabel="Include completed games"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <Text variant="body">{checked ? 'Checked' : 'Unchecked'}</Text>
    </Stack>
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: () => <InteractiveCheckboxHarness />,
};
