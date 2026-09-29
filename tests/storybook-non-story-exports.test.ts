import { describe, expect, it } from '@jest/globals';

import * as ButtonStories from '../src/design-system/components/actions/Button.stories';
import * as AuthDividerStories from '../src/design-system/components/authentication/AuthDivider.stories';
import * as GameCardStories from '../src/design-system/components/content/GameCard.stories';
import * as NotificationRowStories from '../src/design-system/components/content/NotificationRow.stories';
import * as PlayerItemStories from '../src/design-system/components/content/PlayerItem.stories';
import * as PlayerPreferencesCardStories from '../src/design-system/components/content/PlayerPreferencesCard.stories';
import * as ScoreResultBlockStories from '../src/design-system/components/content/ScoreResultBlock.stories';
import * as SettingsRowStories from '../src/design-system/components/content/SettingsRow.stories';
import * as StatTileStories from '../src/design-system/components/content/StatTile.stories';
import * as BannerToastStories from '../src/design-system/components/feedback/BannerToast.stories';
import * as EmptyStateStories from '../src/design-system/components/feedback/EmptyState.stories';
import * as ChoiceChipStories from '../src/design-system/components/forms/ChoiceChip.stories';
import * as CheckboxStories from '../src/design-system/components/forms/Checkbox.stories';
import * as DayTimeSelectorStories from '../src/design-system/components/forms/DayTimeSelector.stories';
import * as AvatarStories from '../src/design-system/components/identity/Avatar.stories';
import * as AvatarGroupStories from '../src/design-system/components/identity/AvatarGroup.stories';
import * as AvatarPickerStories from '../src/design-system/components/identity/AvatarPicker.stories';
import * as AppHeaderStories from '../src/design-system/components/navigation/AppHeader.stories';
import * as BottomNavigationStories from '../src/design-system/components/navigation/BottomNavigation.stories';
import * as SectionHeaderStories from '../src/design-system/components/navigation/SectionHeader.stories';
import * as SegmentedControlStories from '../src/design-system/components/navigation/SegmentedControl.stories';
import * as StepProgressStories from '../src/design-system/components/progress/StepProgress.stories';
import * as StatusChipStories from '../src/design-system/components/status/StatusChip.stories';

type StoryModule = Readonly<Record<string, unknown>> & {
  default: Readonly<{ excludeStories?: RegExp }>;
};

const storyModules = [
  ButtonStories,
  AuthDividerStories,
  GameCardStories,
  NotificationRowStories,
  PlayerItemStories,
  PlayerPreferencesCardStories,
  ScoreResultBlockStories,
  SettingsRowStories,
  StatTileStories,
  BannerToastStories,
  EmptyStateStories,
  ChoiceChipStories,
  CheckboxStories,
  DayTimeSelectorStories,
  AvatarStories,
  AvatarGroupStories,
  AvatarPickerStories,
  AppHeaderStories,
  BottomNavigationStories,
  SectionHeaderStories,
  SegmentedControlStories,
  StepProgressStories,
  StatusChipStories,
] as const satisfies readonly StoryModule[];

describe('Storybook non-story export contract', () => {
  it('excludes every helper export from CSF story discovery', () => {
    const helperExports = storyModules.flatMap((storyModule) =>
      Object.keys(storyModule)
        .filter(
          (exportName) =>
            exportName.startsWith('normalize') ||
            exportName.endsWith('Configurations') ||
            /^Interactive.*Harness$/u.test(exportName) ||
            exportName === 'authDividerStoryApplicability',
        )
        .map((exportName) => ({ exportName, meta: storyModule.default })),
    );

    expect(helperExports).toHaveLength(35);
    for (const { exportName, meta } of helperExports) {
      expect(meta.excludeStories).toBeInstanceOf(RegExp);
      expect(meta.excludeStories?.test(exportName)).toBe(true);
    }
  });
});
