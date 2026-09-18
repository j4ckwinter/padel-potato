import { describe, expect, it, jest } from '@jest/globals';
import {
  fireEvent,
  render,
  userEvent,
} from '@testing-library/react-native';
import { StyleSheet, Text as NativeText } from 'react-native';

import {
  Pressable,
  type PressableProps,
  type PressableSize,
} from '../src/design-system/primitives/Pressable';
import {
  borders,
  colors,
  dimensions,
  opacity,
} from '../src/design-system/tokens';

const flattenedStyle = (style: unknown) =>
  StyleSheet.flatten(
    style as Parameters<typeof StyleSheet.flatten>[0],
  ) as Record<string, unknown>;

const stateCases = [
  ['enabled', false, false, 1],
  ['disabled', true, false, 0],
  ['loading', false, true, 0],
  ['disabled and loading', true, true, 0],
] as const;

describe('Pressable interaction contract', () => {
  it.each(stateCases)(
    '%s exposes accurate state and invokes the action the expected number of times',
    async (_name, disabled, loading, expectedPresses) => {
      const onPress = jest.fn();
      const user = userEvent.setup();
      const screen = await render(
        <Pressable
          accessibilityLabel="Activate example"
          accessibilityRole="button"
          disabled={disabled}
          loading={loading}
          onPress={onPress}
          testID="subject"
        >
          <NativeText>Activate example</NativeText>
        </Pressable>,
      );

      const subject = screen.getByRole('button', {
        name: 'Activate example',
      });
      await user.press(subject);

      expect(onPress).toHaveBeenCalledTimes(expectedPresses);
      expect(subject.props.disabled).toBe(disabled || loading);
      expect(subject.props.accessibilityState).toEqual(
        expect.objectContaining({
          busy: loading,
          disabled: disabled || loading,
        }),
      );
      expect(flattenedStyle(subject.props.style).opacity).toBe(
        disabled || loading ? opacity.opacityDisabled : 1,
      );
    },
  );

  it('preserves caller value and non-blocking state while overriding blocked invariants', async () => {
    const screen = await render(
      <Pressable
        accessibilityLabel="Player setting"
        accessibilityRole="switch"
        accessibilityState={{
          busy: false,
          checked: 'mixed',
          disabled: false,
          expanded: true,
          selected: true,
        }}
        accessibilityValue={{ max: 4, min: 0, now: 2, text: 'Two players' }}
        loading
        testID="subject"
      />,
    );

    const subject = screen.getByRole('switch', {
      name: 'Player setting',
    });
    expect(subject.props.accessibilityState).toEqual({
      busy: true,
      checked: 'mixed',
      disabled: true,
      expanded: true,
      selected: true,
    });
    expect(subject).toHaveAccessibilityValue({
      max: 4,
      min: 0,
      now: 2,
      text: 'Two players',
    });
  });

  it.each([
    ['controlHeight40', 40, 2],
    ['controlHeight44', 44, 0],
    ['controlHeight48', 48, 0],
  ] as Array<[PressableSize, number, number]>) (
    '%s retains a %i visual frame and declares a minimum 44-point target',
    async (size, visualSize, expansion) => {
      const screen = await render(
        <Pressable size={size} testID="subject" />,
      );
      const subject = screen.getByTestId('subject');
      const style = flattenedStyle(subject.props.style);

      expect(style.width).toBe(dimensions[size]);
      expect(style.height).toBe(dimensions[size]);
      expect(subject.props.hitSlop).toEqual({
        bottom: expansion,
        left: expansion,
        right: expansion,
        top: expansion,
      });
      expect(visualSize + expansion * 2).toBeGreaterThanOrEqual(44);
    },
  );

  it('drives the token focus ring only from native focus and blur callbacks', async () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    const screen = await render(
      <Pressable
        onBlur={onBlur}
        onFocus={onFocus}
        testID="subject"
      />,
    );
    const subject = screen.getByTestId('subject');

    expect(flattenedStyle(subject.props.style)).toEqual(
      expect.objectContaining({ outlineWidth: 0 }),
    );
    fireEvent(subject, 'focus', { nativeEvent: {} });
    expect(flattenedStyle(screen.getByTestId('subject').props.style)).toEqual(
      expect.objectContaining({
        outlineColor: colors.focusRing,
        outlineWidth: borders.focusRingWidth,
      }),
    );
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent(screen.getByTestId('subject'), 'blur', { nativeEvent: {} });
    expect(flattenedStyle(screen.getByTestId('subject').props.style)).toEqual(
      expect.objectContaining({ outlineWidth: 0 }),
    );
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('keeps content and its accessible name stable while loading', async () => {
    const content = 'Activate example 🎾 · Café · مرحبا · e\u0301';
    const screen = await render(
      <Pressable
        accessibilityLabel={content}
        accessibilityRole="button"
        loading
        testID="subject"
      >
        <NativeText>{content}</NativeText>
      </Pressable>,
    );

    expect(screen.getByRole('button', { name: content })).toBeDisabled();
    expect(screen.getByText(content)).toBeVisible();
  });

  it.each([
    'height',
    'minHeight',
    'minWidth',
    'opacity',
    'outlineColor',
    'outlineWidth',
    'width',
  ] as const)('rejects the reserved %s style key', (reservedKey) => {
    expect(() =>
      Pressable({
        style: { [reservedKey]: 0 } as PressableProps['style'],
      }),
    ).toThrow(
      new RegExp(
        `Unsupported design-system value: ${reservedKey}\\. Supported values:`,
        'u',
      ),
    );
  });

  it('rejects unsupported size and state values without a fallback', () => {
    expect(() =>
      Pressable({ size: 'controlHeight42' as PressableSize }),
    ).toThrow(/Unsupported design-system value: controlHeight42\. Supported values:/u);
    expect(() =>
      Pressable({ loading: 'yes' as unknown as boolean }),
    ).toThrow(/Unsupported design-system value: yes\. Supported values: true, false/u);
  });

  it('does not invent a role or product semantic state', async () => {
    const screen = await render(<Pressable testID="subject" />);
    const subject = screen.getByTestId('subject');

    expect(subject.props.accessibilityRole).toBeUndefined();
    expect(subject.props.accessibilityState).toEqual({
      busy: false,
      disabled: false,
    });
  });
});
