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
