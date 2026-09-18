import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { StyleSheet, Text as NativeText, View } from 'react-native';

import { Icon } from '../src/design-system/assets/Icon';
import { Pressable } from '../src/design-system/primitives/Pressable';
import { Text } from '../src/design-system/primitives/Text';
import {
  expectAccessibilityState,
  expectAccessibilityValue,
  expectDecorativeIconHidden,
  expectLabelledIconImage,
  expectNoAccessibleName,
  expectPressContract,
  expectReservedStyleRejected,
  expectRoleAbsent,
  expectRoleAndName,
  expectTokenStyle,
  expectTouchTargetContract,
} from '../src/design-system/testing';
import { colors, typography } from '../src/design-system/tokens';

describe('shared accessibility and interaction assertions', () => {
  it('asserts explicit role, full Unicode name, value, and supplied states', async () => {
    const name = 'Partida 🎾 · Café · مرحبا · e\u0301';
    const screen = await render(
      <View
        accessibilityLabel={name}
        accessibilityRole="adjustable"
        accessibilityState={{ disabled: true, selected: true }}
        accessibilityValue={{ max: 4, min: 0, now: 2, text: 'Two of four' }}
        accessible
      />,
    );

    const subject = expectRoleAndName(screen, 'adjustable', name);
    expectAccessibilityValue(subject, {
      max: 4,
      min: 0,
      now: 2,
      text: 'Two of four',
    });
    expectAccessibilityState(subject, { disabled: true, selected: true });
  });

  it('does not swallow a failed observable expectation', async () => {
    const screen = await render(
      <View accessibilityLabel="Actual" accessibilityRole="summary" />,
    );

    expect(() => expectRoleAndName(screen, 'summary', 'Different')).toThrow();
    expect(() =>
      expectAccessibilityState(
        screen.getByRole('summary'),
        { disabled: true },
      ),
    ).toThrow();
  });

  it('requires explicit absent-role and empty-name expectations', async () => {
    const screen = await render(
      <View accessibilityLabel="" accessible testID="empty-name" />,
    );

    expectRoleAbsent(screen, 'button');
    expectNoAccessibleName(screen.getByTestId('empty-name'));
    expect(() => expectLabelledIconImage(screen, '')).toThrow(
      'A labelled asset requires a non-empty expected name.',
    );
  });

  it('asserts enabled and blocked press results through userEvent', async () => {
    const user = userEvent.setup();
    const enabledPress = jest.fn();
    const enabled = await render(
      <Pressable
        accessibilityLabel="Enabled"
        accessibilityRole="button"
        onPress={enabledPress}
      />,
    );
    await expectPressContract(
      user,
      enabled.getByRole('button', { name: 'Enabled' }),
      enabledPress,
      1,
    );
    await enabled.unmount();

    const blockedPress = jest.fn();
    const blocked = await render(
      <Pressable
        accessibilityLabel="Loading"
        accessibilityRole="button"
        loading
        onPress={blockedPress}
      />,
    );
    await expectPressContract(
      user,
      blocked.getByRole('button', { name: 'Loading' }),
      blockedPress,
      0,
    );
  });

  it('asserts declared target geometry and exact resolved token styles', async () => {
    const targetScreen = await render(
      <Pressable size="controlHeight40" testID="target" />,
    );
    expectTouchTargetContract(targetScreen.getByTestId('target'), 40);
    await targetScreen.unmount();

    const tokenScreen = await render(
      <Text color="accent" testID="token" variant="heading">
        Token-backed
      </Text>,
    );
    expectTokenStyle(tokenScreen.getByTestId('token'), {
      ...typography.heading,
      color: colors.accent,
    });
  });

  it('asserts reserved style rejection without hiding the render case', () => {
    expectReservedStyleRejected(
      () =>
        Pressable({
          style: { opacity: 0 } as never,
        }),
      'opacity',
    );
  });

  it('distinguishes decorative icons from labelled image semantics', async () => {
    const decorative = await render(<Icon name="add" testID="decorative" />);
    expectDecorativeIconHidden(decorative, 'decorative');
    await decorative.unmount();

    const name = 'Add player 🎾';
    const labelled = await render(
      <Icon accessibilityLabel={name} name="add" testID="labelled" />,
    );
    expectLabelledIconImage(labelled, name);
  });

  it('compares flattened registered token styles rather than snapshots', async () => {
    const registered = StyleSheet.create({ layout: { marginTop: 8 } });
    const screen = await render(
      <Text style={registered.layout} testID="subject" variant="body">
        Registered
      </Text>,
    );

    expectTokenStyle(screen.getByTestId('subject'), {
      ...typography.body,
      color: colors.ink,
      marginTop: 8,
    });
    expect(screen.getByText('Registered')).toBeVisible();
  });
});

describe('published interaction and long-content host contract', () => {
  it('publishes Pressable by identity while keeping test helpers on a dedicated boundary', () => {
    const primitives = jest.requireActual<
      typeof import('../src/design-system/primitives')
    >('../src/design-system/primitives');
    const root = jest.requireActual<typeof import('../src/design-system')>(
      '../src/design-system',
    );
    const testing = jest.requireActual<typeof import('../src/design-system/testing')>(
      '../src/design-system/testing',
    );

    expect(primitives.Pressable).toBe(Pressable);
    expect(root.Pressable).toBe(Pressable);
    expect(root).not.toHaveProperty('expectRoleAndName');
    expect(testing.expectRoleAndName).toBe(expectRoleAndName);
    expect(testing.expectTouchTargetContract).toBe(expectTouchTargetContract);
  });

  it('keeps long Unicode name, scaling, wrapping host props, and activation observable', async () => {
    const name =
      'Create a four-player padel match 🎾 for Café Norte · مرحبا · e\u0301 · confirm every invited player';
    const onPress = jest.fn();
    const user = userEvent.setup();
    const screen = await render(
      <Pressable
        accessibilityLabel={name}
        accessibilityRole="button"
        onPress={onPress}
        style={{ width: 180 }}
        testID="action"
      >
        <Text style={{ width: 180 }} testID="content" variant="body">
          {name}
        </Text>
      </Pressable>,
    );

    const action = expectRoleAndName(screen, 'button', name);
    const content = screen.getByTestId('content');
    expect(content.props.children).toBe(name);
    expect(content.props.allowFontScaling).not.toBe(false);
    expect(content.props.maxFontSizeMultiplier).toBeUndefined();
    expect(StyleSheet.flatten(content.props.style)).toEqual(
      expect.objectContaining({ width: 180 }),
    );
    await expectPressContract(user, action, onPress, 1);
  });

  it('retains an explicit required-action name across loading while empty text stays empty', async () => {
    const screen = await render(
      <Pressable
        accessibilityLabel="Confirm result"
        accessibilityRole="button"
        loading
      >
        <Text testID="empty-content" variant="body">
          {null}
        </Text>
      </Pressable>,
    );

    expectRoleAndName(screen, 'button', 'Confirm result');
    expect(screen.getByRole('button', { name: 'Confirm result' })).toBeBusy();
    expect(screen.getByRole('button', { name: 'Confirm result' })).toBeDisabled();
    expect(screen.getByTestId('empty-content').props.children).toBeNull();
    expect(screen.queryByText(/.+/u)).toBeNull();
  });

  it('proves host semantics only, not native measurement, clipping, focus order, VoiceOver, or TalkBack', async () => {
    const screen = await render(
      <Pressable
        accessibilityLabel="Host contract"
        accessibilityRole="button"
        size="controlHeight40"
        testID="subject"
      />,
    );

    expectRoleAndName(screen, 'button', 'Host contract');
    expectTouchTargetContract(screen.getByTestId('subject'), 40);
  });
});
