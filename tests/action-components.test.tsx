import { describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, userEvent } from '@testing-library/react-native';
import { Children } from 'react';
import { StyleSheet } from 'react-native';

import ButtonStories, {
  Boundaries as ButtonBoundaries,
  Variants as ButtonVariants,
} from '../src/design-system/components/actions/Button.stories';
import {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonStyle,
} from '../src/design-system/components/actions/Button';
import {
  buttonRecords,
  buttonSizes,
  buttonStyles,
  phase3SourceIdentity,
} from '../src/design-system/components/sourceRegistry';
import { colors } from '../src/design-system/tokens';

const flattenedStyle = (style: unknown) =>
  StyleSheet.flatten(
    style as Parameters<typeof StyleSheet.flatten>[0],
  ) as Record<string, unknown>;

describe('Button source contract', () => {
  it('retains the exact sparse nine-record revision-296 ledger in source order', () => {
    expect(phase3SourceIdentity).toEqual(expect.objectContaining({
      fileId: 'c514c1fb-1cda-8125-8008-a606253a77a3',
      pageId: '482a7222-5a3b-8086-8008-a6073072bbb1',
      revision: 296,
    }));
    expect(buttonStyles).toEqual([
      'primary',
      'secondary',
      'destructive',
      'ghost',
    ]);
    expect(buttonSizes).toEqual([40, 48]);
    expect(buttonRecords).toHaveLength(9);
    expect(buttonRecords.map((record) => record.id)).toEqual([
      '482a7222-5a3b-8086-8008-a60ea00aa7c3',
      '482a7222-5a3b-8086-8008-a60ea006c15d',
      '482a7222-5a3b-8086-8008-a60ea002fe1f',
      '482a7222-5a3b-8086-8008-a60e9fff0e5a',
      '482a7222-5a3b-8086-8008-a60e9ffb012d',
      '482a7222-5a3b-8086-8008-a60e9ff76866',
      '482a7222-5a3b-8086-8008-a60e9ff37cc9',
      '482a7222-5a3b-8086-8008-a60e9fef8841',
      '482a7222-5a3b-8086-8008-a60e9febb9fe',
    ]);
    expect(buttonRecords.map((record) => record.originalTuple)).toEqual([
      { Style: 'Primary', Size: '48', State: 'Disabled' },
      { Style: 'Primary', Size: '48', State: 'Default' },
      { Style: 'Ghost', Size: '48', State: 'Default' },
      { Style: 'Primary', Size: '48', State: 'Loading' },
      { Style: 'Primary', Size: '48', State: 'Focused' },
      { Style: 'Destructive', Size: '48', State: 'Default' },
      { Style: 'Primary', Size: '48', State: 'Pressed' },
      { Style: 'Primary', Size: '40', State: 'Default' },
      { Style: 'Secondary', Size: '48', State: 'Default' },
    ]);
  });

  it('exposes only closed authored style and size values', () => {
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

  it('keeps source-ordered variants and explicit long-label target-clearance boundaries', () => {
    const variants = ButtonVariants.render?.({} as never, {} as never) as React.ReactElement<{
      children: readonly React.ReactElement[];
    }>;
    const variantChildren = Children.toArray(variants.props.children);
    expect(variantChildren).toHaveLength(buttonRecords.length);
    expect(variantChildren.every((entry) =>
      Children.count((entry as React.ReactElement<{ children: React.ReactNode }>).props.children) === 2,
    )).toBe(true);

    const boundaries = ButtonBoundaries.render?.({} as never, {} as never) as React.ReactElement;
    expect(JSON.stringify(boundaries)).toContain('200%');
    expect(JSON.stringify(boundaries)).toContain('hit-area');
  });
});
