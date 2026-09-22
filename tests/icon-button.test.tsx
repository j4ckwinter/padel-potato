import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import { Children } from 'react';

import IconButtonStories, {
  Variants as IconButtonVariants,
} from '../src/design-system/components/actions/IconButton.stories';

import {
  IconButton,
  type IconButtonProps,
  type IconButtonSize,
} from '../src/design-system/components/actions/IconButton';

import { iconButtonFixtures } from '../src/design-system/stories/fixtures';

import { colors } from '../src/design-system/tokens';

describe('IconButton public contract', () => {
  it.each([
    ['enabled', false, 1],
    ['disabled', true, 0],
  ] as [string, boolean, 0 | 1][])(
    '%s activation follows the shared blocked contract',
    async (_name, disabled, expectedCalls) => {
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
      const subject = screen.getByRole('button', {
        name: 'Open notifications',
      });
      await user.press(subject);

      expect(onPress).toHaveBeenCalledTimes(expectedCalls);
      expect(subject.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled }),
      );
      expect(screen.queryAllByRole('image')).toHaveLength(0);
    },
  );

  it.each([
    [40, 2],
    [44, 0],
  ] as [IconButtonSize, number][])(
    'keeps the %s visual and declares the effective 44-point target',
    async (size, expansion) => {
      const screen = await render(
        <IconButton
          accessibilityLabel={`${size} action`}
          icon="notification"
          size={size}
        />,
      );
      const subject = screen.getByRole('button', { name: `${size} action` });
      expect(subject.props.hitSlop).toEqual({
        bottom: expansion,
        left: expansion,
        right: expansion,
        top: expansion,
      });
      expect(flattenedStyle(subject.props.style)).toEqual(
        expect.objectContaining({
          minHeight: size,
          minWidth: size,
        }),
      );
    },
  );

  it('derives pressed styling from the native render state', () => {
    const rendered = IconButton({
      accessibilityLabel: 'Open notifications',
      icon: 'notification',
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
    ).toBe(colors.surfaceAccent);
  });

  it('rejects missing names and casted invalid values with the standard diagnostic', () => {
    expect(() =>
      IconButton({ accessibilityLabel: '', icon: 'notification' }),
    ).toThrow(
      /Unsupported design-system value: .*Supported values: non-empty accessibility label/u,
    );
    expect(() =>
      IconButton({
        accessibilityLabel: 'Example',
        icon: 'not-authored' as IconButtonProps['icon'],
      }),
    ).toThrow(/Unsupported design-system value: not-authored/u);
    expect(() =>
      IconButton({
        accessibilityLabel: 'Example',
        icon: 'notification',
        size: 48 as IconButtonSize,
      }),
    ).toThrow(/Unsupported design-system value: 48/u);
    expect(() =>
      IconButton({
        accessibilityLabel: 'Example',
        disabled: 'yes',
        icon: 'notification',
      } as unknown as IconButtonProps),
    ).toThrow(/Unsupported design-system value: yes/u);
    for (const onPress of ['press', false, null, 0]) {
      expect(() =>
        IconButton({
          accessibilityLabel: 'Example',
          icon: 'notification',
          onPress,
        } as unknown as IconButtonProps),
      ).toThrow(/Supported values: function/u);
    }
  });
});

describe('IconButton Storybook contract', () => {
  it('publishes the exact group, bounded controls, and six declared configurations', () => {
    expect(IconButtonStories.title).toBe('Actions/Icon Button');
    expect(IconButtonStories.argTypes).toEqual(
      expect.objectContaining({
        disabled: { control: 'boolean' },
        icon: expect.objectContaining({ control: 'select' }),
        onPress: { action: 'pressed' },
        size: { control: 'select', options: [40, 44] },
      }),
    );
    const variants = IconButtonVariants.render?.(
      {} as never,
      {} as never,
    ) as React.ReactElement<{
      children: React.ReactNode;
    }>;
    expect(Children.toArray(variants.props.children)).toHaveLength(
      iconButtonFixtures.length,
    );
  });
});
