import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import {
  Text as DesignText,
  type TextProps as DesignTextProps,
} from '../src/design-system/primitives/Text';
import {
  colors,
  type ColorToken,
  typography,
  type TypographyToken,
} from '../src/design-system/tokens';

const flattenedStyle = (style: unknown) =>
  StyleSheet.flatten(
    style as Parameters<typeof StyleSheet.flatten>[0],
  ) as Record<string, unknown>;

const invalidTextTokenCases: Array<[string, Record<string, unknown>]> = [
  ['missing typography token', { variant: 'missing' }],
  ['null typography token', { variant: null }],
  ['missing color token', { color: 'missing', variant: 'body' }],
  ['null color token', { color: null, variant: 'body' }],
];

describe('Text primitive', () => {
  it.each(Object.keys(typography) as TypographyToken[])(
    'resolves the %s typography token exactly with ink by default',
    async (variant) => {
      const screen = await render(
        <DesignText testID="subject" variant={variant}>
          Token text
        </DesignText>,
      );

      expect(flattenedStyle(screen.getByTestId('subject').props.style)).toEqual(
        expect.objectContaining({
          ...typography[variant],
          color: colors.ink,
        }),
      );
    },
  );

  it.each(Object.keys(colors) as ColorToken[])(
    'resolves the %s color token exactly',
    async (color) => {
      const screen = await render(
        <DesignText color={color} testID="subject" variant="body">
          Token text
        </DesignText>,
      );

      expect(flattenedStyle(screen.getByTestId('subject').props.style).color).toBe(
        colors[color],
      );
    },
  );

  it.each(invalidTextTokenCases)(
    'rejects a %s with the supported values',
    (_label, props) => {
    expect(() =>
      DesignText({
        ...(props as unknown as DesignTextProps),
        children: 'Rejected token',
      }),
    ).toThrow(/Unsupported design-system value: .*Supported values:/u);
    },
  );

  it.each([
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'lineHeight',
    'letterSpacing',
    'color',
  ] as const)('rejects the reserved %s text style key', (reservedKey) => {
    expect(() =>
      DesignText({
        children: 'Protected text',
        style: { [reservedKey]: 'tampered' } as DesignTextProps['style'],
        variant: 'body',
      }),
    ).toThrow(
      new RegExp(
        `Unsupported design-system value: ${reservedKey}\\. Supported values:`,
        'u',
      ),
    );
  });

  it('preserves layout style while applying token-owned text values last', async () => {
    const screen = await render(
      <DesignText
        color="accent"
        style={{ alignSelf: 'center', marginTop: 12 }}
        testID="subject"
        variant="heading"
      >
        Protected text
      </DesignText>,
    );

    const style = flattenedStyle(screen.getByTestId('subject').props.style);
    expect(style).toEqual(
      expect.objectContaining({
        alignSelf: 'center',
        marginTop: 12,
        ...typography.heading,
        color: colors.accent,
      }),
    );
  });

  it('renders empty content without phantom copy', async () => {
    const screen = await render(
      <DesignText testID="subject" variant="body">
        {null}
      </DesignText>,
    );

    expect(screen.getByTestId('subject').props.children).toBeNull();
    expect(screen.queryByText(/.+/u)).toBeNull();
  });

  it('passes Unicode, native accessibility props, and default scaling through untouched', async () => {
    const content = 'Padel 🏓️ · Café · مرحبا · e\u0301';
    const screen = await render(
      <DesignText
        accessibilityLabel={content}
        accessibilityRole="header"
        testID="subject"
        variant="display"
      >
        {content}
      </DesignText>,
    );
    const subject = screen.getByTestId('subject');

    expect(subject.props.children).toBe(content);
    expect(subject.props.accessibilityLabel).toBe(content);
    expect(subject.props.accessibilityRole).toBe('header');
    expect(subject.props.allowFontScaling).not.toBe(false);
    expect(subject.props.maxFontSizeMultiplier).toBeUndefined();
  });
});
