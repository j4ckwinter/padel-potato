import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import {
  act,
  fireEvent,
  render,
  userEvent,
} from '@testing-library/react-native';

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

import {
  socialSignInButtonFixtures,
  authDividerFixtures,
} from '../src/design-system/stories/fixtures';

import { colors } from '../src/design-system/tokens';

describe('AuthDivider static public contract', () => {
  it('renders readable default or custom content at exact geometry with hidden rules', async () => {
    const screen = await render(<AuthDivider />);
    const label = screen.getByText('or');
    const container = screen.getByTestId('auth-divider');
    const rules = screen.getAllByTestId(/auth-divider-rule/u, {
      includeHiddenElements: true,
    });

    expect(label).toBeTruthy();
    expect(flattenedStyle(container.props.style)).toEqual(
      expect.objectContaining({
        height: 24,
        width: 352,
      }),
    );
    expect(rules).toHaveLength(2);
    expect(
      rules.every(
        (rule) =>
          rule.props.accessible === false &&
          rule.props.accessibilityElementsHidden === true &&
          rule.props.importantForAccessibility === 'no-hide-descendants',
      ),
    ).toBe(true);
    expect(screen.queryAllByRole('button')).toHaveLength(0);

    await screen.rerender(<AuthDivider label="or continue with email" />);
    expect(screen.getByText('or continue with email')).toBeTruthy();
  });

  it('rejects blank required content and all interaction or state props', () => {
    expect(() => AuthDivider({ label: '' })).toThrow(
      /Unsupported design-system value: .*Supported values: non-empty label/u,
    );
    expect(() => AuthDivider({ label: '   ' })).toThrow(
      /Unsupported design-system value: .*Supported values: non-empty label/u,
    );
    expect(() =>
      AuthDivider({ onPress: jest.fn() } as unknown as AuthDividerProps),
    ).toThrow(/Unsupported design-system value: onPress/u);
    expect(() =>
      AuthDivider({ disabled: true } as unknown as AuthDividerProps),
    ).toThrow(/Unsupported design-system value: disabled/u);
  });
});
