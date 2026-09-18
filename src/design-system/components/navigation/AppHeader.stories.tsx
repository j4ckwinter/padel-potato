import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase3Families, phase3SourceIdentity } from '../sourceRegistry';
import {
  AppHeader,
  appHeaderPages,
  type AppHeaderPage,
  type AppHeaderProps,
} from './AppHeader';

const family = phase3Families[11];
const records = family.records;
const noop = () => undefined;
const sourceLabel = (recordId: string) =>
  `Penpot ${phase3SourceIdentity.fileId} / ${phase3SourceIdentity.pageId} / revision ${phase3SourceIdentity.revision} / set ${family.sourceId} / record ${recordId}`;

const storyProps = (page: AppHeaderPage): AppHeaderProps => {
  if (page === 'home' || page === 'games' || page === 'create' || page === 'players') {
    return { onNotificationPress: noop, page };
  }
  if (page === 'profile') return { page };
  if (page === 'playerDetails') {
    return {
      favouriteChecked: false,
      onBackPress: noop,
      onFavouriteChange: noop,
      page,
    };
  }
  return { onBackPress: noop, page };
};

const meta = {
  title: 'Navigation/App Header',
  component: AppHeader,
  argTypes: {
    favouriteChecked: { control: 'boolean' },
    onBackPress: { action: 'back pressed' },
    onFavouriteChange: { action: 'favourite changed' },
    onNotificationPress: { action: 'notifications pressed' },
    page: { control: 'select', options: appHeaderPages },
    subtitle: { control: 'text' },
    title: { control: 'text' },
  },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: { onNotificationPress: noop, page: 'home' },
  render: (args) => (
    <Stack gap="space8">
      <AppHeader {...args} />
      <Text color="textSecondary" variant="caption">
        {sourceLabel('482a7222-5a3b-8086-8008-a614fb46e43a')}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      {records.map((record) => {
        const page = record.normalizedTuple.page as AppHeaderPage;
        return (
          <Fragment key={record.id}>
            <AppHeader {...storyProps(page)} />
            <Text color="textSecondary" variant="caption">
              {`${record.originalTuple.Page} · ${record.id}`}
            </Text>
          </Fragment>
        );
      })}
    </Stack>
  ),
};

export const States: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8">
      <AppHeader {...storyProps('profile')} />
      <AppHeader {...storyProps('notifications')} />
      <AppHeader {...storyProps('playerDetails')} />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8">
      <AppHeader
        onNotificationPress={noop}
        page="home"
        subtitle="A complete long supporting message for the next tournament match"
        title="Hi, Alexandra and the entire tournament team"
      />
      <AppHeader page="profile" />
      <Text color="textSecondary" variant="caption">
        long title and subtitle copy retains semantic order at 200% while 44-point actions keep overlap clearance. Profile intentionally has no overflow under revision 296. Native measurement remains Phase 5.
      </Text>
    </Stack>
  ),
};

export function InteractiveAppHeaderHarness() {
  const [checked, setChecked] = useState(false);
  return (
    <AppHeader
      favouriteChecked={checked}
      onBackPress={noop}
      onFavouriteChange={setChecked}
      page="playerDetails"
    />
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: () => <InteractiveAppHeaderHarness />,
};
