import { describe, expect, it } from '@jest/globals';

import * as designSystem from '../src/design-system';
import {
  storybookBackstops,
  storyContracts,
  storyTaxonomy,
} from '../src/design-system/stories/storyContract';

const expectedExports = [
  'Button',
  'IconButton',
  'Favourite',
  'Field',
  'ChoiceChip',
  'Checkbox',
  'DayTimeSelector',
  'SocialSignInButton',
  'AuthDivider',
  'BottomNavigation',
  'SegmentedControl',
  'AppHeader',
  'SectionHeader',
] as const;

const expectedTitles = [
  'Actions/Button',
  'Actions/Icon Button',
  'Actions/Favourite',
  'Forms/Field',
  'Forms/Choice Chip',
  'Forms/Checkbox',
  'Forms/Day Time Selector',
  'Authentication/Social Sign-In Button',
  'Authentication/Auth Divider',
  'Navigation/Bottom Navigation',
  'Navigation/Segmented Control',
  'Navigation/App Header',
  'Navigation/Section Header',
] as const;

const componentStoryContracts = Object.fromEntries(
  expectedExports.map((name) => [name, storyContracts[name]]),
);

describe('action, form, and navigation Storybook catalogue contract', () => {
  it('publishes exactly the 13 component families from the root boundary', () => {
    for (const name of expectedExports)
      expect(designSystem[name]).toEqual(expect.any(Function));
    expect(Object.keys(componentStoryContracts)).toEqual(expectedExports);
    expect(
      Object.values(componentStoryContracts).map(({ title }) => title),
    ).toEqual(expectedTitles);
  });

  it('accounts for the exact five-category taxonomy with non-empty stories or reasons', () => {
    expect(storyTaxonomy).toEqual([
      'Canonical',
      'Variants',
      'States',
      'Boundaries',
      'Interactive',
    ]);
    for (const contract of Object.values(componentStoryContracts)) {
      expect(Object.keys(contract.categories)).toEqual(storyTaxonomy);
      for (const entry of Object.values(contract.categories)) {
        expect(
          entry.status === 'story' ? entry.story : entry.reason,
        ).not.toHaveLength(0);
      }
    }
  });

  it('permits only closed persistent controls and real callbacks', () => {
    const prohibited = [
      'pressed',
      'focused',
      'layoutStyle',
      'color',
      'artwork',
      'router',
      'picker',
      'authService',
    ];
    for (const contract of Object.values(componentStoryContracts)) {
      expect(
        contract.controls.every((control) => !prohibited.includes(control)),
      ).toBe(true);
      expect(contract.actions.every((action) => action.startsWith('on'))).toBe(
        true,
      );
    }
    expect(storyContracts.ChoiceChip.controls).toEqual([
      'type',
      'selected',
      'disabled',
    ]);
  });

  it('retains machine-readable UI backstops without claiming native acceptance', () => {
    expect(storybookBackstops.interactiveComponents).toMatchObject({
      emptyField: { status: 'host-contract' },
      longContent: { nativeStatus: 'deferred-to-native-review' },
      compositeOrder: { status: 'host-contract' },
      segmentCardinality: { counts: [2, 3, 4], equalAllocation: true },
      targetClearance: { minimumEffectiveTarget: 44 },
      nativeReview: {
        ios: 'deferred-to-native-review',
        android: 'deferred-to-native-review',
        fontScale200: 'deferred-to-native-review',
        voiceOver: 'deferred-to-native-review',
        talkBack: 'deferred-to-native-review',
      },
    });
  });
});
