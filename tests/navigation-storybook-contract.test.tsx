import { describe, expect, it } from '@jest/globals';

import { render } from '@testing-library/react-native';

import { Children } from 'react';

import BottomNavigationStories, {
  Boundaries as BottomNavigationBoundaries,
  Variants as BottomNavigationVariants,
} from '../src/design-system/components/navigation/BottomNavigation.stories';

import SegmentedControlStories, {
  Boundaries as SegmentedControlBoundaries,
  normalizeSegmentedControlStoryArgs,
  Variants as SegmentedControlVariants,
} from '../src/design-system/components/navigation/SegmentedControl.stories';

import { SegmentedControl } from '../src/design-system/components/navigation/SegmentedControl';

import {
  bottomNavigationFixtures,
  segmentedControlFixtures,
} from '../src/design-system/stories/fixtures';

describe('Navigation composite Storybook contract', () => {
  it('publishes exact groups, bounded controls, and fixture variant counts', () => {
    expect(BottomNavigationStories.title).toBe('Navigation/Bottom Navigation');
    expect(BottomNavigationStories.argTypes).toEqual(
      expect.objectContaining({
        activeDestination: {
          control: 'select',
          options: ['home', 'games', 'create', 'players', 'profile'],
        },
        onDestinationPress: { action: 'destination pressed' },
      }),
    );
    expect(SegmentedControlStories.title).toBe('Navigation/Segmented Control');
    expect(SegmentedControlStories.argTypes).toEqual(
      expect.objectContaining({
        disabled: { control: 'boolean' },
        onValueChange: { action: 'value changed' },
        value: { control: 'select', options: ['Upcoming', 'Open'] },
      }),
    );

    const bottomVariants = BottomNavigationVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement<{ children: React.ReactNode }>;
    const segmentVariants = SegmentedControlVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement<{ children: React.ReactNode }>;
    expect(Children.toArray(bottomVariants.props.children)).toHaveLength(
      bottomNavigationFixtures.length,
    );
    expect(Children.toArray(segmentVariants.props.children)).toHaveLength(
      segmentedControlFixtures.length,
    );
  });

  it('keeps every SegmentedControl value transition inside the controlled options', async () => {
    for (const value of ['Upcoming', 'Open', 'Past', '', 'not-authored']) {
      for (const disabled of [false, true]) {
        const props = normalizeSegmentedControlStoryArgs({
          disabled,
          options: ['Upcoming', 'Open'],
          value,
        });
        expect(props.options).toContain(props.value);
        const screen = await render(<SegmentedControl {...props} />);
        expect(screen.getAllByRole('tab')).toHaveLength(2);
        await screen.unmount();
      }
    }
  });

  it('discloses native width, long labels, 200% scale, and adjacent-target boundaries', () => {
    const serialized = JSON.stringify([
      BottomNavigationBoundaries.render?.({} as never, {} as never),
      SegmentedControlBoundaries.render?.({} as never, {} as never),
    ]);
    expect(serialized).toContain('390');
    expect(serialized).toContain('350');
    expect(serialized).toContain('long');
    expect(serialized).toContain('200%');
    expect(serialized).toMatch(/adjacent|overlap/u);
    expect(serialized).toContain('native Storybook review');
  });
});
