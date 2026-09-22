import { describe, expect, it } from '@jest/globals';

import * as ContentComponents from '../src/design-system/components/content';

describe('Content family public boundary', () => {
  it('exports exactly the seven public component families and no evidence or helpers', () => {
    expect(Object.keys(ContentComponents).sort()).toEqual([
      'GameCard',
      'NotificationRow',
      'PlayerItem',
      'PlayerPreferencesCard',
      'ScoreResultBlock',
      'SettingsRow',
      'StatTile',
    ]);
  });
});
