import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { act, fireEvent, render, userEvent } from '@testing-library/react-native';

import { readFileSync } from 'node:fs';

import path from 'node:path';

import React, { Children } from 'react';

import { StyleSheet } from 'react-native';

import SocialSignInButtonStories, {
  Boundaries as SocialSignInButtonBoundaries,
  Variants as SocialSignInButtonVariants,
} from '../src/design-system/components/authentication/SocialSignInButton.stories';

import {
  SocialSignInButton,
  type SocialSignInButtonProps,
  type SocialSignInProvider,
} from '../src/design-system/components/authentication/SocialSignInButton';

import AuthDividerStories, {
  Boundaries as AuthDividerBoundaries,
  Variants as AuthDividerVariants,
  authDividerStoryApplicability,
} from '../src/design-system/components/authentication/AuthDivider.stories';

import {
  AuthDivider,
  type AuthDividerProps,
} from '../src/design-system/components/authentication/AuthDivider';

import * as authentication from '../src/design-system/components/authentication';

import { socialSignInButtonFixtures, authDividerFixtures } from '../src/design-system/stories/fixtures';

import { colors } from '../src/design-system/tokens';

describe('Authentication publication and Storybook contract', () => {
  it('publishes only the two bounded components', () => {
    expect(Object.keys(authentication).sort()).toEqual([
      'AuthDivider',
      'SocialSignInButton',
    ]);
  });  it('marks transient states and interaction explicitly inapplicable with no callback control', () => {
    expect(authDividerStoryApplicability.States).toEqual(expect.objectContaining({
      status: 'inapplicable',
      reason: expect.stringMatching(/static|no authored transient state/iu),
    }));
    expect(authDividerStoryApplicability.Interactive).toEqual(expect.objectContaining({
      status: 'inapplicable',
      reason: expect.stringMatching(/no callback|no product interaction/iu),
    }));
    expect(JSON.stringify(AuthDividerStories.argTypes)).not.toMatch(/action|callback|press/iu);
  });

  it('discloses empty-content rejection, long-copy, and 200% font-scale boundaries', () => {
    const boundaries = AuthDividerBoundaries.render?.({} as never, {} as never) as React.ReactElement;
    const serialized = JSON.stringify(boundaries);
    expect(serialized).toContain('blank');
    expect(serialized).toContain('200%');
    expect(serialized).toContain('static');
  });
});
