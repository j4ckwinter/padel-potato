import { describe, expect, it } from '@jest/globals';

import * as FeedbackComponents from '../src/design-system/components/feedback';

describe('Feedback family public boundary', () => {
  it('exports only the two feedback components and intentional runtime constants', () => {
    expect(Object.keys(FeedbackComponents).sort()).toEqual([
      'BannerToast',
      'EmptyState',
      'bannerToastStyles',
      'bannerToastTypes',
    ]);
  });
});
