import { describe, expect, it } from '@jest/globals';

import React from 'react';

import AuthDividerStories, {
  Boundaries as AuthDividerBoundaries,
  authDividerStoryApplicability,
} from '../src/design-system/components/authentication/AuthDivider.stories';

import * as authentication from '../src/design-system/components/authentication';

describe('Authentication publication and Storybook contract', () => {
  it('publishes only the two bounded components', () => {
    expect(Object.keys(authentication).sort()).toEqual([
      'AuthDivider',
      'SocialSignInButton',
    ]);
  });
  it('marks transient states and interaction explicitly inapplicable with no callback control', () => {
    expect(authDividerStoryApplicability.States).toEqual(
      expect.objectContaining({
        status: 'inapplicable',
        reason: expect.stringMatching(/static|no authored transient state/iu),
      }),
    );
    expect(authDividerStoryApplicability.Interactive).toEqual(
      expect.objectContaining({
        status: 'inapplicable',
        reason: expect.stringMatching(/no callback|no product interaction/iu),
      }),
    );
    expect(JSON.stringify(AuthDividerStories.argTypes)).not.toMatch(
      /action|callback|press/iu,
    );
  });

  it('discloses empty-content rejection, long-copy, and 200% font-scale boundaries', () => {
    const boundaries = AuthDividerBoundaries.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement;
    const serialized = JSON.stringify(boundaries);
    expect(serialized).toContain('blank');
    expect(serialized).toContain('200%');
    expect(serialized).toContain('static');
  });
});
