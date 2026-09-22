import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { act, fireEvent, render, userEvent } from '@testing-library/react-native';

import { Children } from 'react';

import { StyleSheet } from 'react-native';

import ButtonStories, {
  Boundaries as ButtonBoundaries,
  normalizeButtonStoryArgs,
  Variants as ButtonVariants,
} from '../src/design-system/components/actions/Button.stories';

import IconButtonStories, {
  Variants as IconButtonVariants,
} from '../src/design-system/components/actions/IconButton.stories';

import FavouriteStories, {
  Boundaries as FavouriteBoundaries,
  Interactive as FavouriteInteractive,
  Variants as FavouriteVariants,
} from '../src/design-system/components/actions/Favourite.stories';

import {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonStyle,
} from '../src/design-system/components/actions/Button';

import {
  IconButton,
  type IconButtonProps,
  type IconButtonSize,
} from '../src/design-system/components/actions/IconButton';

import {
  Favourite,
  type FavouriteProps,
} from '../src/design-system/components/actions/Favourite';

import * as actions from '../src/design-system/components/actions';

import { buttonFixtures, iconButtonFixtures, favouriteFixtures, buttonStyles, buttonSizes } from '../src/design-system/stories/fixtures';

import { colors } from '../src/design-system/tokens';

describe('Button public contract', () => {  it('exposes only closed authored style and size values', () => {
    const stylesAreClosed: ButtonStyle[] = [
      'primary',
      'secondary',
      'destructive',
      'ghost',
    ];
    const sizesAreClosed: ButtonSize[] = [40, 48];
    type VisualEscape = Extract<'layoutStyle' | 'color' | 'pressed' | 'focused', keyof ButtonProps>;
    const hasNoVisualEscape: VisualEscape extends never ? true : false = true;

    expect(stylesAreClosed).toEqual(buttonStyles);
    expect(sizesAreClosed).toEqual(buttonSizes);
    expect(hasNoVisualEscape).toBe(true);
  });
});

describe('Button interaction and visual contract', () => {
  it.each([
    ['enabled', false, false, 1],
    ['disabled', true, false, 0],
    ['loading', false, true, 0],
  ] as Array<[string, boolean, boolean, 0 | 1]>)(
    '%s activation invokes the callback the expected number of times',
    async (_case, disabled, loading, expectedCalls) => {
      const onPress = jest.fn();
      const user = userEvent.setup();
      const stateProps = loading
        ? { loading: true as const }
        : disabled
          ? { disabled: true as const }
          : {};
      const screen = await render(
        <Button
          label="Create game"
          onPress={onPress}
          style="primary"
          {...stateProps}
        />,
      );

      const button = screen.getByRole('button', { name: 'Create game' });
      await user.press(button);

      expect(onPress).toHaveBeenCalledTimes(expectedCalls);
      expect(button.props.accessibilityState).toEqual(
        expect.objectContaining({
          busy: loading,
          disabled: disabled || loading,
        }),
      );
      expect(button).toHaveAccessibleName('Create game');
    },
  );

  it('keeps canonical 160x48 geometry and name while loading', async () => {
    const screen = await render(
      <Button label="Create game" loading style="primary" />,
    );
    const subject = screen.getByRole('button', { name: 'Create game' });
    const visual = screen.getByText('•••', { includeHiddenElements: true }).parent;

    expect(subject).toBeDisabled();
    expect(screen.getByText('•••', { includeHiddenElements: true })).toBeTruthy();
    expect(flattenedStyle(subject.props.style)).toEqual(
      expect.objectContaining({
        height: 48,
        minHeight: 48,
        minWidth: 48,
        width: 160,
      }),
    );
    expect(flattenedStyle(visual?.props.style)).toEqual(
      expect.objectContaining({ borderRadius: 24, height: 48, width: 160 }),
    );
  });

  it('declares a 44-point target for the authored 40-point visual', async () => {
    const screen = await render(
      <Button label="Compact action" size={40} style="primary" />,
    );
    const subject = screen.getByRole('button', { name: 'Compact action' });

    expect(subject.props.hitSlop).toEqual({
      bottom: 2,
      left: 2,
      right: 2,
      top: 2,
    });
    expect(flattenedStyle(subject.props.style)).toEqual(
      expect.objectContaining({ height: 40, minHeight: 40, minWidth: 40, width: 160 }),
    );
  });

  it('uses native focus events and retains the authored disabled fill opacity', async () => {
    const focused = await render(
      <Button label="Focus action" style="primary" />,
    );
    const focusSubject = focused.getByRole('button', { name: 'Focus action' });
    await act(async () => {
      fireEvent(focusSubject, 'focus', { nativeEvent: {} });
    });
    expect(flattenedStyle(focused.getByRole('button', { name: 'Focus action' }).props.style)).toEqual(
      expect.objectContaining({ outlineColor: colors.focusRing, outlineWidth: 2 }),
    );

    const disabled = await render(
      <Button disabled label="Blocked action" style="primary" />,
    );
    const disabledVisual = disabled.getByText('Blocked action', {
      includeHiddenElements: true,
    }).parent;
    expect(flattenedStyle(disabledVisual?.props.style)).toEqual(
      expect.objectContaining({ backgroundColor: 'rgba(173, 229, 51, 0.8)' }),
    );
  });

  it('uses the native Pressable render state instead of a public persistent prop', () => {
    const rendered = Button({ label: 'Create game', style: 'primary' }) as React.ReactElement<{
      children: (state: { pressed: boolean }) => React.ReactElement<{ style: unknown }>;
    }>;
    const renderContent = rendered.props.children;

    expect(flattenedStyle(renderContent({ pressed: false }).props.style).backgroundColor).toBe(
      colors.accent,
    );
    expect(flattenedStyle(renderContent({ pressed: true }).props.style).backgroundColor).toBe(
      colors.surfaceAccent,
    );
  });

  it.each([
    ['primary', colors.accent],
    ['secondary', colors.surface],
    ['destructive', colors.danger],
    ['ghost', colors.canvas],
  ] as Array<[ButtonStyle, string]>)('renders the %s authored treatment', async (style, backgroundColor) => {
    const screen = await render(
      <Button {...({ label: `${style} action`, style } as ButtonProps)} />,
    );
    expect(flattenedStyle(screen.getByText(`${style} action`, { includeHiddenElements: true }).parent?.props.style)).toEqual(
      expect.objectContaining({ backgroundColor }),
    );
  });

  it('rejects empty names and unsupported runtime values without fallback', () => {
    expect(() => Button({ label: '', style: 'primary' })).toThrow(
      /Unsupported design-system value: .*Supported values: non-empty label/u,
    );
    expect(() =>
      Button({ label: 'Example', style: 'tertiary' as ButtonStyle } as ButtonProps),
    ).toThrow(/Unsupported design-system value: tertiary/u);
    expect(() =>
      Button({ label: 'Example', size: 44 as ButtonSize, style: 'primary' }),
    ).toThrow(/Unsupported design-system value: 44/u);
    expect(() =>
      Button({
        label: 'Example',
        pressed: true,
        style: 'primary',
      } as unknown as ButtonProps),
    ).toThrow(/Unsupported design-system value: pressed/u);
    for (const onPress of ['press', false, null, 0]) {
      expect(() => Button({
        label: 'Example',
        onPress,
        style: 'primary',
      } as unknown as ButtonProps)).toThrow(/Supported values: function/u);
    }
  });
});

describe('Button Storybook contract', () => {
  it('publishes the exact group and bounded controls', () => {
    expect(ButtonStories.title).toBe('Actions/Button');
    expect(ButtonStories.argTypes).toEqual(
      expect.objectContaining({
        disabled: { control: 'boolean' },
        loading: { control: 'boolean' },
        onPress: { action: 'pressed' },
        size: { control: 'select', options: buttonSizes },
        style: { control: 'select', options: buttonStyles },
      }),
    );
  });

  it('normalizes every independent control transition to an authored tuple', async () => {
    for (const style of buttonStyles) {
      for (const size of buttonSizes) {
        for (const disabled of [false, true]) {
          for (const loading of [false, true]) {
            const props = normalizeButtonStoryArgs({
              disabled,
              label: 'Controlled button',
              loading,
              size,
              style,
            });
            const screen = await render(<Button {...props} />);
            expect(screen.getByRole('button', { name: 'Controlled button' })).toBeTruthy();
            await screen.unmount();
          }
        }
      }
    }
  });

  it('keeps source-ordered variants and explicit long-label target-clearance boundaries', () => {
    const variants = ButtonVariants.render?.({} as never, {} as never) as React.ReactElement<{
      children: readonly React.ReactElement[];
    }>;
    const variantChildren = Children.toArray(variants.props.children);
    expect(variantChildren).toHaveLength(buttonFixtures.length);
    expect(variantChildren.every((entry) =>
      Children.count((entry as React.ReactElement<{ children: React.ReactNode }>).props.children) === 2,
    )).toBe(true);

    const boundaries = ButtonBoundaries.render?.({} as never, {} as never) as React.ReactElement;
    expect(JSON.stringify(boundaries)).toContain('200%');
    expect(JSON.stringify(boundaries)).toContain('hit-area');
  });
});
