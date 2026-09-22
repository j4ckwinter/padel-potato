import { describe, expect, it } from '@jest/globals';

import * as designSystem from '../src/design-system';
import {
  phase3Backstops,
  phase3StoryContracts,
  storyTaxonomy,
} from '../src/design-system/stories/storyContract';

const expectedExports = [
  'Button', 'IconButton', 'Favourite', 'Field', 'ChoiceChip', 'Checkbox',
  'DayTimeSelector', 'SocialSignInButton', 'AuthDivider', 'BottomNavigation',
  'SegmentedControl', 'AppHeader', 'SectionHeader',
] as const;

const expectedTitles = [
  'Actions/Button', 'Actions/Icon Button', 'Actions/Favourite', 'Forms/Field',
  'Forms/Choice Chip', 'Forms/Checkbox', 'Forms/Day Time Selector',
  'Authentication/Social Sign-In Button', 'Authentication/Auth Divider',
  'Navigation/Bottom Navigation', 'Navigation/Segmented Control',
  'Navigation/App Header', 'Navigation/Section Header',
] as const;

describe('Phase 3 Storybook catalogue contract', () => {
  it('publishes exactly the 13 component families from the root boundary', () => {
    for (const name of expectedExports) expect(designSystem[name]).toEqual(expect.any(Function));
    expect(Object.keys(phase3StoryContracts)).toEqual(expectedExports);
    expect(Object.values(phase3StoryContracts).map(({ title }) => title)).toEqual(expectedTitles);
  });

  it('accounts for the exact five-category taxonomy with non-empty stories or reasons', () => {
    expect(storyTaxonomy).toEqual(['Canonical', 'Variants', 'States', 'Boundaries', 'Interactive']);
    for (const contract of Object.values(phase3StoryContracts)) {
      expect(Object.keys(contract.categories)).toEqual(storyTaxonomy);
      for (const entry of Object.values(contract.categories)) {
        expect(entry.status === 'story' ? entry.story : entry.reason).not.toHaveLength(0);
      }
    }
  });

  it('permits only closed persistent controls and real callbacks', () => {
    const prohibited = ['pressed', 'focused', 'layoutStyle', 'color', 'artwork', 'router', 'picker', 'authService'];
    for (const contract of Object.values(phase3StoryContracts)) {
      expect(contract.controls.every((control) => !prohibited.includes(control))).toBe(true);
      expect(contract.actions.every((action) => action.startsWith('on'))).toBe(true);
    }
    expect(phase3StoryContracts.ChoiceChip.controls).toEqual(['type', 'selected', 'disabled']);
  });

  it('retains machine-readable UI backstops without claiming native acceptance', () => {
    expect(phase3Backstops).toMatchObject({
      emptyField: { status: 'host-contract' },
      longContent: { nativeStatus: 'deferred-to-phase-5' },
      compositeOrder: { status: 'host-contract' },
      segmentCardinality: { counts: [2, 3, 4], equalAllocation: true },
      targetClearance: { minimumEffectiveTarget: 44 },
      nativeReview: {
        ios: 'deferred-to-phase-5', android: 'deferred-to-phase-5',
        fontScale200: 'deferred-to-phase-5', voiceOver: 'deferred-to-phase-5',
        talkBack: 'deferred-to-phase-5',
      },
    });
  });
});
