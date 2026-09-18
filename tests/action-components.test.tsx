import { describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, userEvent } from '@testing-library/react-native';
import { Children } from 'react';
import { StyleSheet } from 'react-native';

import ButtonStories, {
  Boundaries as ButtonBoundaries,
  Variants as ButtonVariants,
} from '../src/design-system/components/actions/Button.stories';
import IconButtonStories, {
  Variants as IconButtonVariants,
} from '../src/design-system/components/actions/IconButton.stories';
import FavouriteStories, {
  Boundaries as FavouriteBoundaries,
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
import {
  buttonRecords,
  buttonSizes,
  buttonStyles,
  phase3Families,
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

const iconButtonRecords = phase3Families[1].records;

describe('IconButton source and public contract', () => {
  it('retains the exact six records and approved Value 2 normalization in source order', () => {
    expect(phase3Families[1]).toEqual(expect.objectContaining({
      key: 'iconButton',
      recordCount: 6,
      sourceId: '482a7222-5a3b-8086-8008-a60eda8bf731',
    }));
    expect(iconButtonRecords.map((record) => record.id)).toEqual([
      '482a7222-5a3b-8086-8008-a60eda87a472',
      '482a7222-5a3b-8086-8008-a60eda8475eb',
      '482a7222-5a3b-8086-8008-a60eda809f18',
      '482a7222-5a3b-8086-8008-a60eda7d0395',
      '482a7222-5a3b-8086-8008-a60eda7950b0',
      'ab02a31f-1852-80be-8008-a6fb1c6fcb94',
    ]);
    expect(iconButtonRecords.at(-1)).toEqual(expect.objectContaining({
      originalTuple: { Icon: 'Value 2', Size: '44', State: 'Default' },
      normalizedTuple: { icon: 'notification', size: 44, state: 'default' },
    }));

    const closedSizes: IconButtonSize[] = [40, 44];
    type VisualEscape = Extract<'pressed' | 'focused' | 'style' | 'color', keyof IconButtonProps>;
    const hasNoVisualEscape: VisualEscape extends never ? true : false = true;
    expect(closedSizes).toEqual([40, 44]);
    expect(hasNoVisualEscape).toBe(true);
  });

  it.each([
    ['enabled', false, 1],
    ['disabled', true, 0],
  ] as Array<[string, boolean, 0 | 1]>)('%s activation follows the shared blocked contract', async (_name, disabled, expectedCalls) => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    const screen = await render(
      <IconButton
        accessibilityLabel="Open notifications"
        disabled={disabled}
        icon="notification"
        onPress={onPress}
      />,
    );
    const subject = screen.getByRole('button', { name: 'Open notifications' });
    await user.press(subject);

    expect(onPress).toHaveBeenCalledTimes(expectedCalls);
    expect(subject.props.accessibilityState).toEqual(expect.objectContaining({ disabled }));
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it.each([
    [40, 2],
    [44, 0],
  ] as Array<[IconButtonSize, number]>)('keeps the %s visual and declares the effective 44-point target', async (size, expansion) => {
    const screen = await render(
      <IconButton accessibilityLabel={`${size} action`} icon="notification" size={size} />,
    );
    const subject = screen.getByRole('button', { name: `${size} action` });
    expect(subject.props.hitSlop).toEqual({
      bottom: expansion,
      left: expansion,
      right: expansion,
      top: expansion,
    });
    expect(flattenedStyle(subject.props.style)).toEqual(expect.objectContaining({
      height: size,
      minHeight: size,
      minWidth: size,
      width: size,
    }));
  });

  it('derives pressed styling from the native render state', () => {
    const rendered = IconButton({
      accessibilityLabel: 'Open notifications',
      icon: 'notification',
    }) as React.ReactElement<{
      children: (state: { pressed: boolean }) => React.ReactElement<{ style: unknown }>;
    }>;
    expect(flattenedStyle(rendered.props.children({ pressed: false }).props.style).backgroundColor).toBe(colors.surface);
    expect(flattenedStyle(rendered.props.children({ pressed: true }).props.style).backgroundColor).toBe(colors.surfaceAccent);
  });

  it('rejects missing names and casted invalid values with the standard diagnostic', () => {
    expect(() => IconButton({ accessibilityLabel: '', icon: 'notification' })).toThrow(
      /Unsupported design-system value: .*Supported values: non-empty accessibility label/u,
    );
    expect(() => IconButton({
      accessibilityLabel: 'Example',
      icon: 'not-authored' as IconButtonProps['icon'],
    })).toThrow(/Unsupported design-system value: not-authored/u);
    expect(() => IconButton({
      accessibilityLabel: 'Example',
      icon: 'notification',
      size: 48 as IconButtonSize,
    })).toThrow(/Unsupported design-system value: 48/u);
    expect(() => IconButton({
      accessibilityLabel: 'Example',
      disabled: 'yes',
      icon: 'notification',
    } as unknown as IconButtonProps)).toThrow(/Unsupported design-system value: yes/u);
  });
});

describe('IconButton Storybook contract', () => {
  it('publishes the exact group, bounded controls, and six source-ordered records', () => {
    expect(IconButtonStories.title).toBe('Actions/Icon Button');
    expect(IconButtonStories.argTypes).toEqual(expect.objectContaining({
      disabled: { control: 'boolean' },
      icon: expect.objectContaining({ control: 'select' }),
      onPress: { action: 'pressed' },
      size: { control: 'select', options: [40, 44] },
    }));
    const variants = IconButtonVariants.render?.({} as never, {} as never) as React.ReactElement<{
      children: React.ReactNode;
    }>;
    expect(Children.toArray(variants.props.children)).toHaveLength(iconButtonRecords.length);
  });
});

const favouriteRecords = phase3Families[2].records;

describe('Favourite source and controlled contract', () => {
  it('retains Selected then Default and completes all 17 action records in source order', () => {
    expect(phase3Families[2]).toEqual(expect.objectContaining({
      key: 'favourite',
      recordCount: 2,
      sourceId: 'ab02a31f-1852-80be-8008-a6fb4b80c769',
    }));
    expect(favouriteRecords.map((record) => ({
      id: record.id,
      normalizedTuple: record.normalizedTuple,
      originalTuple: record.originalTuple,
    }))).toEqual([
      {
        id: 'ab02a31f-1852-80be-8008-a6fb4b70487f',
        normalizedTuple: { checked: true },
        originalTuple: { 'Property 1': 'Selected' },
      },
      {
        id: 'ab02a31f-1852-80be-8008-a6fb4b6d6c28',
        normalizedTuple: { checked: false },
        originalTuple: { 'Property 1': 'Default' },
      },
    ]);
    expect([
      ...buttonRecords,
      ...iconButtonRecords,
      ...favouriteRecords,
    ]).toHaveLength(17);
  });

  it('emits the opposite checked value once and remains controlled until rerender', async () => {
    const onCheckedChange = jest.fn();
    const user = userEvent.setup();
    const screen = await render(
      <Favourite
        accessibilityLabel="Add Alex to favourites"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );
    const subject = screen.getByRole('checkbox', {
      checked: false,
      name: 'Add Alex to favourites',
    });
    await user.press(subject);

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(subject.props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));
    expect(screen.queryByTestId('favourite-selected-fill', { includeHiddenElements: true })).toBeNull();

    await screen.rerender(
      <Favourite
        accessibilityLabel="Add Alex to favourites"
        checked
        onCheckedChange={onCheckedChange}
      />,
    );
    expect(screen.getByRole('checkbox', {
      checked: true,
      name: 'Add Alex to favourites',
    })).toBeTruthy();
    expect(screen.getByTestId('favourite-selected-fill', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('phase3-artwork-heart', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it('blocks disabled changes and keeps exact 44-point geometry', async () => {
    const onCheckedChange = jest.fn();
    const user = userEvent.setup();
    const screen = await render(
      <Favourite
        accessibilityLabel="Add Alex to favourites"
        checked={false}
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );
    const subject = screen.getByRole('checkbox', {
      checked: false,
      disabled: true,
      name: 'Add Alex to favourites',
    });
    await user.press(subject);

    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(subject.props.hitSlop).toEqual({ bottom: 0, left: 0, right: 0, top: 0 });
    expect(flattenedStyle(subject.props.style)).toEqual(expect.objectContaining({
      height: 44,
      minHeight: 44,
      minWidth: 44,
      width: 44,
    }));
  });

  it('rejects blank names, invalid controlled values, and simulated transient props', () => {
    const onCheckedChange = jest.fn();
    expect(() => Favourite({
      accessibilityLabel: '',
      checked: false,
      onCheckedChange,
    })).toThrow(/Unsupported design-system value: .*Supported values: non-empty accessibility label/u);
    expect(() => Favourite({
      accessibilityLabel: 'Favourite',
      checked: 'mixed',
      onCheckedChange,
    } as unknown as FavouriteProps)).toThrow(/Unsupported design-system value: mixed/u);
    expect(() => Favourite({
      accessibilityLabel: 'Favourite',
      checked: false,
      onCheckedChange,
      pressed: true,
    } as unknown as FavouriteProps)).toThrow(/Unsupported design-system value: pressed/u);
  });
});

describe('Favourite Storybook and action barrel contract', () => {
  it('publishes only the bounded action components and their public registries', () => {
    expect(Object.keys(actions).sort()).toEqual([
      'Button',
      'Favourite',
      'IconButton',
    ]);
  });

  it('publishes the exact group, source-ordered records, and long-name target boundary', () => {
    expect(FavouriteStories.title).toBe('Actions/Favourite');
    expect(FavouriteStories.argTypes).toEqual(expect.objectContaining({
      checked: { control: 'boolean' },
      disabled: { control: 'boolean' },
      onCheckedChange: { action: 'checked changed' },
    }));
    const variants = FavouriteVariants.render?.({} as never, {} as never) as React.ReactElement<{
      children: React.ReactNode;
    }>;
    expect(Children.toArray(variants.props.children)).toHaveLength(favouriteRecords.length);

    const boundaries = FavouriteBoundaries.render?.({} as never, {} as never) as React.ReactElement;
    expect(JSON.stringify(boundaries)).toContain('200%');
    expect(JSON.stringify(boundaries)).toContain('44-point');
  });
});
