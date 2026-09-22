import { describe, expect, it, jest } from '@jest/globals';
import {
  act,
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
  expectPressContract,
  expectTouchTargetContract,
} from '../src/design-system/testing';
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

const stateCases: Array<[string, boolean, boolean, 0 | 1]> = [
  ['enabled', false, false, 1],
  ['disabled', true, false, 0],
  ['loading', false, true, 0],
  ['disabled and loading', true, true, 0],
];

describe('Pressable interaction contract', () => {
  it('types and passes through the complete standard accessibility surface', async () => {
    const accessibilityProps: PressableProps = {
      accessibilityIgnoresInvertColors: true,
      accessibilityLabelledBy: ['heading', 'detail'],
      accessibilityLargeContentTitle: 'Create game',
      accessibilityRespondsToUserInteraction: true,
      accessibilityShowsLargeContentViewer: true,
      accessibilityViewIsModal: true,
      'aria-busy': false,
      'aria-checked': 'mixed',
      'aria-disabled': false,
      'aria-expanded': true,
      'aria-hidden': false,
      'aria-label': 'Create a game',
      'aria-labelledby': 'heading',
      'aria-live': 'polite',
      'aria-modal': true,
      'aria-selected': true,
      'aria-valuemax': 4,
      'aria-valuemin': 0,
      'aria-valuenow': 2,
      'aria-valuetext': 'Two of four players',
      role: 'button',
      screenReaderFocusable: true,
      testID: 'subject',
    };
    const screen = await render(<Pressable {...accessibilityProps} />);
    const subject = screen.getByTestId('subject');

    expect(subject.props).toEqual(
      expect.objectContaining({
        accessibilityIgnoresInvertColors: true,
        accessibilityLabel: 'Create a game',
        accessibilityLabelledBy: ['heading', 'detail'],
        accessibilityLargeContentTitle: 'Create game',
        accessibilityLiveRegion: 'polite',
        accessibilityRespondsToUserInteraction: true,
        accessibilityShowsLargeContentViewer: true,
        accessibilityViewIsModal: true,
        'aria-hidden': false,
        'aria-labelledby': 'heading',
        'aria-modal': true,
        role: 'button',
        screenReaderFocusable: true,
      }),
    );
    expect(subject.props.accessibilityState).toEqual({
      busy: false,
      checked: 'mixed',
      disabled: false,
      expanded: true,
      selected: true,
    });
    expect(subject.props.accessibilityValue).toEqual({
      max: 4,
      min: 0,
      now: 2,
      text: 'Two of four players',
    });
  });

  it('excludes native visual and interaction escape routes from its public and runtime contracts', () => {
    type EscapeRoute = Extract<
      | 'android_disableSound'
      | 'android_ripple'
      | 'delayLongPress'
      | 'pressRetentionOffset'
      | 'unstable_pressDelay',
      keyof PressableProps
    >;
    const publicContractIsClosed: EscapeRoute extends never ? true : false =
      true;
    expect(publicContractIsClosed).toBe(true);

    for (const key of [
      'android_disableSound',
      'android_ripple',
      'delayLongPress',
      'pressRetentionOffset',
      'unstable_pressDelay',
    ]) {
      expect(() =>
        Pressable({ [key]: true } as unknown as PressableProps),
      ).toThrow(
        new RegExp(
          `Unsupported design-system value: ${key}\\. Supported values:`,
          'u',
        ),
      );
    }
  });

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
      await expectPressContract(user, subject, onPress, expectedPresses);

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
        aria-busy={false}
        aria-disabled={false}
        disabled
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
    expect(subject.props['aria-busy']).not.toBe(false);
    expect(subject.props['aria-disabled']).not.toBe(false);
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
  ] as Array<[PressableSize, number, number]>)(
    '%s retains a %i visual frame and declares a minimum 44-point target',
    async (size, visualSize, expansion) => {
      const screen = await render(<Pressable size={size} testID="subject" />);
      const subject = screen.getByTestId('subject');
      const style = flattenedStyle(subject.props.style);

      expect(style.minWidth).toBe(dimensions[size]);
      expect(style.minHeight).toBe(dimensions[size]);
      expect(subject.props.hitSlop).toEqual({
        bottom: expansion,
        left: expansion,
        right: expansion,
        top: expansion,
      });
      expect(visualSize + expansion * 2).toBeGreaterThanOrEqual(44);
      expectTouchTargetContract(subject, visualSize as 40 | 44 | 48);
    },
  );

  it('drives the token focus ring only from native focus and blur callbacks', async () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    const screen = await render(
      <Pressable onBlur={onBlur} onFocus={onFocus} testID="subject" />,
    );
    const subject = screen.getByTestId('subject');

    expect(flattenedStyle(subject.props.style)).toEqual(
      expect.objectContaining({ outlineWidth: 0 }),
    );
    await act(async () => {
      fireEvent(subject, 'focus', { nativeEvent: {} });
    });
    expect(flattenedStyle(screen.getByTestId('subject').props.style)).toEqual(
      expect.objectContaining({
        outlineColor: colors.focusRing,
        outlineWidth: borders.focusRingWidth,
      }),
    );
    expect(onFocus).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent(screen.getByTestId('subject'), 'blur', { nativeEvent: {} });
    });
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
    'minHeight',
    'minWidth',
    'opacity',
    'outlineColor',
    'outlineWidth',
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

  it('allows caller dimensions without permitting them to remove the target minimum', async () => {
    const screen = await render(
      <Pressable
        size="controlHeight40"
        style={{ height: 12, width: 180 }}
        testID="subject"
      />,
    );
    expect(flattenedStyle(screen.getByTestId('subject').props.style)).toEqual(
      expect.objectContaining({
        height: 12,
        minHeight: dimensions.controlHeight40,
        minWidth: dimensions.controlHeight40,
        width: 180,
      }),
    );
  });

  it('rejects unsupported size and state values without a fallback', () => {
    expect(() =>
      Pressable({ size: 'controlHeight42' as PressableSize }),
    ).toThrow(
      /Unsupported design-system value: controlHeight42\. Supported values:/u,
    );
    expect(() => Pressable({ loading: 'yes' as unknown as boolean })).toThrow(
      /Unsupported design-system value: yes\. Supported values: true, false/u,
    );
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
