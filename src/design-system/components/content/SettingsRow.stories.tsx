import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families, phase4SourceIdentity } from '../phase4SourceRegistry';
import { SettingsRow, type SettingsRowProps } from './SettingsRow';

const records = phase4Families[8].records;
const sourceLabel = (recordId: string) =>
  `Penpot ${phase4SourceIdentity.fileId} / ${phase4SourceIdentity.pageId} / revision ${phase4SourceIdentity.revision} / set 482a7222-5a3b-8086-8008-a61b708e9d2e / record ${recordId}`;

type StoryArgs = Readonly<{
  configuration?: unknown;
  label?: unknown;
  onAction?: unknown;
  onCheckedChange?: unknown;
  onPress?: unknown;
  value?: unknown;
}>;

export const settingsRowStoryConfigurations = Object.freeze(
  records
    .filter(({ normalizedTuple }) => normalizedTuple.state !== 'pressed')
    .map(({ normalizedTuple }) => (
      `${normalizedTuple.type}/${normalizedTuple.icon}/${normalizedTuple.state}`
    )),
);

const meta = {
  title: 'Content/Settings Row',
  argTypes: {
    configuration: { control: 'select', options: settingsRowStoryConfigurations },
    onAction: { action: 'branch action' },
  },
  parameters: { controls: { include: ['configuration', 'onAction'] } },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

export function normalizeSettingsRowStoryArgs(args: StoryArgs): SettingsRowProps {
  if (!settingsRowStoryConfigurations.includes(
    args.configuration as (typeof settingsRowStoryConfigurations)[number],
  )) {
    throw new Error(`Unsupported Settings Row story configuration: ${String(args.configuration)}.`);
  }
  const branchAction = typeof args.onAction === 'function' ? args.onAction : undefined;
  const onPress = branchAction
    ? branchAction as () => void
    : typeof args.onPress === 'function' ? args.onPress as () => void : () => undefined;
  const onCheckedChange = branchAction
    ? branchAction as (checked: boolean) => void
    : typeof args.onCheckedChange === 'function'
      ? args.onCheckedChange as (checked: boolean) => void
      : () => undefined;
  if (args.configuration === 'destructive/close/default') {
    return { icon: 'close', onPress, variant: 'destructive' };
  }
  if (args.configuration === 'value/location/default') {
    return {
      icon: 'location',
      label: typeof args.label === 'string' && args.label.trim() ? args.label : 'Location',
      onPress,
      value: typeof args.value === 'string' && args.value.trim() ? args.value : 'London',
      variant: 'value',
    };
  }
  if (typeof args.configuration === 'string' && args.configuration.startsWith('toggle/')) {
    return {
      checked: args.configuration === 'toggle/notification/on',
      disabled: args.configuration === 'toggle/notification/disabled',
      icon: 'notification',
      label: typeof args.label === 'string' && args.label.trim() ? args.label : 'Notifications',
      onCheckedChange,
      variant: 'toggle',
    };
  }
  const court = args.configuration === 'navigation/court/default';
  const label = typeof args.label === 'string' && args.label.trim()
    ? args.label
    : court ? 'Courts' : 'Account';
  return court
    ? { disabled: false, icon: 'court', label, onPress, variant: 'navigation' }
    : {
        disabled: args.configuration === 'navigation/profile/disabled',
        icon: 'profile',
        label,
        onPress,
        variant: 'navigation',
      };
}

function recordProps(record: (typeof records)[number]): SettingsRowProps {
  const { icon, state, type } = record.normalizedTuple;
  if (type === 'destructive') return { icon: 'close', onPress: () => undefined, variant: 'destructive' };
  if (type === 'value') {
    return { icon: 'location', label: 'Location', onPress: () => undefined, value: 'London', variant: 'value' };
  }
  if (type === 'toggle') {
    return {
      checked: state === 'on',
      disabled: state === 'disabled',
      icon: 'notification',
      label: 'Notifications',
      onCheckedChange: () => undefined,
      variant: 'toggle',
    };
  }
  return {
    disabled: state === 'disabled',
    icon: icon === 'court' ? 'court' : 'profile',
    label: icon === 'court' ? 'Courts' : 'Account',
    onPress: () => undefined,
    variant: 'navigation',
  } as SettingsRowProps;
}

export const Canonical: Story = {
  args: { configuration: 'navigation/profile/default', label: 'Account', onPress: () => undefined },
  render: (args) => (
    <Stack gap="space8">
      <SettingsRow {...normalizeSettingsRowStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">{sourceLabel(records[8].id)}</Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      {records.map((record) => (
        <Fragment key={record.id}>
          <SettingsRow {...recordProps(record)} />
          <Text color="textSecondary" variant="caption">
            {`${Object.values(record.originalTuple).join(' / ')} Â· ${record.id}`}
          </Text>
        </Fragment>
      ))}
    </Stack>
  ),
};

export const States: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      <SettingsRow {...recordProps(records[8])} />
      <Text color="textSecondary" variant="caption">Hold Account to inspect the native-driven pressed state.</Text>
      <SettingsRow {...recordProps(records[6])} />
      <SettingsRow {...recordProps(records[4])} />
      <SettingsRow {...recordProps(records[3])} />
      <SettingsRow {...recordProps(records[2])} />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 352 }}>
      <SettingsRow
        icon="location"
        label="Preferred location for ÅucÃ­a Nguyá»…n from æ±äº¬"
        onPress={() => undefined}
        value="Padel United International Centre, London"
        variant="value"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full label and value semantics remain available. Native 200% font-scale review remains a Phase 5 backstop.
      </Text>
    </Stack>
  ),
};

function InteractiveHarness(props: Readonly<{
  onCheckedChange?: unknown;
  onPress?: unknown;
}>) {
  const [checked, setChecked] = useState(false);
  const onCheckedChange = typeof props.onCheckedChange === 'function'
    ? props.onCheckedChange as (next: boolean) => void
    : undefined;
  const onPress = typeof props.onPress === 'function' ? props.onPress as () => void : undefined;
  return (
    <Stack gap="space16">
      <SettingsRow
        checked={checked}
        disabled={false}
        icon="notification"
        label="Notifications"
        onCheckedChange={(next) => {
          setChecked(next);
          onCheckedChange?.(next);
        }}
        variant="toggle"
      />
      <SettingsRow disabled={false} icon="profile" label="Account" onPress={() => onPress?.()} variant="navigation" />
      <SettingsRow icon="close" onPress={() => onPress?.()} variant="destructive" />
    </Stack>
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: (args) => (
    <InteractiveHarness
      onCheckedChange={'onCheckedChange' in args ? args.onCheckedChange : undefined}
      onPress={'onPress' in args ? args.onPress : undefined}
    />
  ),
};
