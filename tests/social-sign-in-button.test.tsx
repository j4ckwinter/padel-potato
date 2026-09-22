import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle } from './helpers/componentTest';

import {
  act,
  fireEvent,
  render,
  userEvent,
} from '@testing-library/react-native';

import { readFileSync } from 'node:fs';

import path from 'node:path';

import React, { Children } from 'react';

import SocialSignInButtonStories, {
  Boundaries as SocialSignInButtonBoundaries,
  Variants as SocialSignInButtonVariants,
} from '../src/design-system/components/authentication/SocialSignInButton.stories';

import {
  SocialSignInButton,
  type SocialSignInButtonProps,
  type SocialSignInProvider,
} from '../src/design-system/components/authentication/SocialSignInButton';

import { socialSignInButtonFixtures } from '../src/design-system/stories/fixtures';

import { colors } from '../src/design-system/tokens';

const socialFixtures = socialSignInButtonFixtures;

describe('SocialSignInButton public contract', () => {
  it('exposes only the two closed providers and no service-shaped props', () => {
    const providers: SocialSignInProvider[] = ['google', 'apple'];
    type ServiceEscape = Extract<
      'accessToken' | 'credential' | 'oauth' | 'session' | 'storage',
      keyof SocialSignInButtonProps
    >;
    const hasNoServiceEscape: ServiceEscape extends never ? true : false = true;

    expect(providers).toEqual(['google', 'apple']);
    expect(hasNoServiceEscape).toBe(true);
  });
});

describe('SocialSignInButton callback, semantics, and visual contract', () => {
  it.each([
    ['google', 'Continue with Google'],
    ['apple', 'Continue with Apple'],
  ] as [SocialSignInProvider, string][])(
    'renders fixed %s copy and exact local decorative artwork',
    async (provider, label) => {
      const screen = await render(<SocialSignInButton provider={provider} />);
      const subject = screen.getByRole('button', { name: label });

      expect(subject).toHaveAccessibleName(label);
      expect(
        screen.getByText(label, { includeHiddenElements: true }),
      ).toBeTruthy();
      expect(
        screen.getByTestId(`artwork-provider-${provider}`, {
          includeHiddenElements: true,
        }),
      ).toBeTruthy();
      expect(screen.queryAllByRole('image')).toHaveLength(0);
      expect(flattenedStyle(subject.props.style)).toEqual(
        expect.objectContaining({
          minHeight: 48,
          minWidth: 48,
          width: '100%',
        }),
      );
    },
  );

  it.each([
    ['enabled', false, 1],
    ['disabled', true, 0],
  ] as [string, boolean, 0 | 1][])(
    '%s activation emits only the consumer callback',
    async (_case, disabled, count) => {
      const onPress = jest.fn();
      const user = userEvent.setup();
      const screen = await render(
        <SocialSignInButton
          disabled={disabled}
          onPress={onPress}
          provider="google"
        />,
      );
      const subject = screen.getByRole('button', {
        disabled,
        name: 'Continue with Google',
      });
      await user.press(subject);

      expect(onPress).toHaveBeenCalledTimes(count);
      expect(subject.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled }),
      );
    },
  );

  it('uses native pressed and focus state without public simulation props', async () => {
    const rendered = SocialSignInButton({
      provider: 'google',
    }) as React.ReactElement<{
      children: (state: {
        pressed: boolean;
      }) => React.ReactElement<{ style: unknown }>;
    }>;
    expect(
      flattenedStyle(rendered.props.children({ pressed: false }).props.style)
        .backgroundColor,
    ).toBe(colors.surface);
    expect(
      flattenedStyle(rendered.props.children({ pressed: true }).props.style)
        .backgroundColor,
    ).toBe(colors.surfaceMuted);

    const focused = await render(<SocialSignInButton provider="google" />);
    const subject = focused.getByRole('button', {
      name: 'Continue with Google',
    });
    await act(async () => fireEvent(subject, 'focus', { nativeEvent: {} }));
    expect(
      flattenedStyle(
        focused.getByRole('button', { name: 'Continue with Google' }).props
          .style,
      ),
    ).toEqual(
      expect.objectContaining({
        outlineColor: colors.focusRing,
        outlineWidth: 2,
      }),
    );
  });

  it('rejects unsupported providers, values, and simulated states', () => {
    expect(() =>
      SocialSignInButton({ provider: 'github' as SocialSignInProvider }),
    ).toThrow(/Unsupported design-system value: github/u);
    expect(() =>
      SocialSignInButton({
        disabled: 'yes',
        provider: 'google',
      } as unknown as SocialSignInButtonProps),
    ).toThrow(/Unsupported design-system value: yes/u);
    expect(() =>
      SocialSignInButton({
        pressed: true,
        provider: 'google',
      } as unknown as SocialSignInButtonProps),
    ).toThrow(/Unsupported design-system value: pressed/u);
  });

  it('contains no authentication service, network, credential, token, session, or persistence behavior', () => {
    const source = readFileSync(
      path.join(
        process.cwd(),
        'src/design-system/components/authentication/SocialSignInButton.tsx',
      ),
      'utf8',
    );
    expect(source).not.toMatch(
      /\b(fetch|XMLHttpRequest|AsyncStorage|SecureStore|OAuth|accessToken|credential|session)\b/u,
    );
    expect(source).not.toMatch(
      /from ['"](?:expo-auth-session|@react-native-google-signin|@invertase)\b/u,
    );
  });
});

describe('SocialSignInButton Storybook contract', () => {
  it('publishes the exact group, bounded controls, and source-ordered variants', () => {
    expect(SocialSignInButtonStories.title).toBe(
      'Authentication/Social Sign-In Button',
    );
    expect(SocialSignInButtonStories.argTypes).toEqual(
      expect.objectContaining({
        disabled: { control: 'boolean' },
        onPress: { action: 'pressed' },
        provider: { control: 'select', options: ['google', 'apple'] },
      }),
    );
    const variants = SocialSignInButtonVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement<{
      children: React.ReactNode;
    }>;
    expect(Children.toArray(variants.props.children)).toHaveLength(
      socialFixtures.length,
    );
  });

  it('discloses long-copy, font-scale, target, and fixed-provider boundaries', () => {
    const boundaries = SocialSignInButtonBoundaries.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement;
    const serialized = JSON.stringify(boundaries);
    expect(serialized).toContain('200%');
    expect(serialized).toContain('44-point');
    expect(serialized).toContain('fixed provider copy');
  });
});
