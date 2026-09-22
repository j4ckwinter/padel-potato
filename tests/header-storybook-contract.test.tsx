import { describe, expect, it, jest } from '@jest/globals';

import { render } from '@testing-library/react-native';

import { Children } from 'react';

import {
  appHeaderFixtures,
  sectionHeaderFixtures,
} from '../src/design-system/stories/fixtures';

import AppHeaderStories, {
  Boundaries as AppHeaderBoundaries,
  normalizeAppHeaderStoryArgs,
  Variants as AppHeaderVariants,
} from '../src/design-system/components/navigation/AppHeader.stories';

import {
  AppHeader,
  appHeaderPages,
} from '../src/design-system/components/navigation/AppHeader';

import SectionHeaderStories, {
  Boundaries as SectionHeaderBoundaries,
  Variants as SectionHeaderVariants,
} from '../src/design-system/components/navigation/SectionHeader.stories';

describe('Header Storybook contract', () => {
  it('publishes exact groups, bounded callbacks, and source-order variants', () => {
    expect(AppHeaderStories.title).toBe('Navigation/App Header');
    expect(AppHeaderStories.argTypes).toEqual(
      expect.objectContaining({
        page: { control: 'select', options: appHeaderPages },
      }),
    );
    expect(JSON.stringify(AppHeaderStories.argTypes)).not.toMatch(
      /overflow|router|navigate/iu,
    );
    expect(SectionHeaderStories.title).toBe('Navigation/Section Header');

    const appVariants = AppHeaderVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement<{ children: React.ReactNode }>;
    const sectionVariants = SectionHeaderVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement<{ children: React.ReactNode }>;
    expect(Children.toArray(appVariants.props.children)).toHaveLength(
      appHeaderFixtures.length,
    );
    expect(Children.toArray(sectionVariants.props.children)).toHaveLength(
      sectionHeaderFixtures.length,
    );
  });

  it('rebuilds a valid action contract for every AppHeader page transition', async () => {
    for (const page of appHeaderPages) {
      const props = normalizeAppHeaderStoryArgs({
        favouriteChecked: true,
        onBackPress: jest.fn(),
        onFavouriteChange: jest.fn(),
        onNotificationPress: jest.fn(),
        page,
        subtitle: 'Controlled subtitle',
        title: 'Controlled title',
      });
      expect(props.page).toBe(page);
      const screen = await render(<AppHeader {...props} />);
      expect(
        screen.getByRole('header', { name: 'Controlled title' }),
      ).toBeTruthy();
      await screen.unmount();
    }
  });

  it('discloses long text, 200% scale, action overlap, and Profile no-overflow boundaries', () => {
    const serialized = JSON.stringify([
      AppHeaderBoundaries.render?.({} as never, {} as never),
      SectionHeaderBoundaries.render?.({} as never, {} as never),
    ]);
    expect(serialized).toContain('long');
    expect(serialized).toContain('200%');
    expect(serialized).toMatch(/overlap|clearance/u);
    expect(serialized).toContain('Profile');
    expect(serialized).toContain('no overflow');
    expect(serialized).toContain('native Storybook review');
  });
});
