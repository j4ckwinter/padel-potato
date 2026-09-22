import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { StyleSheet, Text as NativeText } from 'react-native';

import {
  Inline,
  type InlineProps,
} from '../src/design-system/primitives/Inline';
import { Stack, type StackProps } from '../src/design-system/primitives/Stack';
import {
  Surface,
  type SurfaceProps,
} from '../src/design-system/primitives/Surface';
import {
  Text as DesignText,
  type TextProps as DesignTextProps,
} from '../src/design-system/primitives/Text';
import {
  borders,
  type BorderToken,
  colors,
  type ColorToken,
  radii,
  type RadiusToken,
  spacing,
  type SpacingToken,
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

const layoutPrimitiveCases: Array<
  [string, (props: StackProps) => ReactElement, 'column' | 'row']
> = [
  ['Stack', Stack, 'column'],
  ['Inline', Inline, 'row'],
];

const inlineWrapCases: Array<[boolean, 'wrap' | 'nowrap']> = [
  [true, 'wrap'],
  [false, 'nowrap'],
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

      expect(
        flattenedStyle(screen.getByTestId('subject').props.style).color,
      ).toBe(colors[color]);
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

describe.each(layoutPrimitiveCases)(
  '%s layout primitive',
  (_name, Component, direction) => {
    it.each(Object.keys(spacing) as SpacingToken[])(
      'resolves the complete %s spacing token exactly',
      async (token) => {
        const screen = await render(
          <Component gap={token} padding={token} testID="subject" />,
        );

        expect(
          flattenedStyle(screen.getByTestId('subject').props.style),
        ).toEqual(
          expect.objectContaining({
            flexDirection: direction,
            gap: spacing[token],
            padding: spacing[token],
          }),
        );
      },
    );

    it('rejects unsupported and null spacing names', () => {
      expect(() => Component({ gap: 'space48' as SpacingToken })).toThrow(
        /Unsupported design-system value: space48\. Supported values:/u,
      );
      expect(() =>
        Component({ padding: null as unknown as SpacingToken }),
      ).toThrow(/Unsupported design-system value: null\. Supported values:/u);
    });

    it.each([
      'alignItems',
      'flexDirection',
      'gap',
      'justifyContent',
      'padding',
      'paddingBottom',
      'paddingEnd',
      'paddingHorizontal',
      'paddingLeft',
      'paddingRight',
      'paddingStart',
      'paddingTop',
      'paddingVertical',
    ] as const)('rejects the reserved %s layout style key', (reservedKey) => {
      const registered = StyleSheet.create({
        protected: { [reservedKey]: 999 },
      });

      expect(() =>
        Component({
          style: [{ width: 100 }, registered.protected] as StackProps['style'],
        } as StackProps & InlineProps),
      ).toThrow(
        new RegExp(
          `Unsupported design-system value: ${reservedKey}\\. Supported values:`,
          'u',
        ),
      );
    });

    it('keeps owned layout invariant while preserving allowed caller layout', async () => {
      const screen = await render(
        <Component
          align="center"
          gap="space20"
          justify="spaceBetween"
          padding="space12"
          style={{ marginTop: 8, width: 200 }}
          testID="subject"
        />,
      );

      expect(flattenedStyle(screen.getByTestId('subject').props.style)).toEqual(
        expect.objectContaining({
          alignItems: 'center',
          flexDirection: direction,
          gap: 20,
          justifyContent: 'space-between',
          marginTop: 8,
          padding: 12,
          width: 200,
        }),
      );
    });

    it('preserves zero, one, many, null, equal, and adjacent children in React order', async () => {
      const empty = await render(<Component testID="empty" />);
      expect(empty.getByTestId('empty').props.children).toBeUndefined();
      await empty.unmount();

      const screen = await render(
        <Component testID="subject">
          <NativeText testID="first">Same</NativeText>
          {null}
          <NativeText testID="second">Same</NativeText>
          <NativeText testID="third">Third</NativeText>
        </Component>,
      );

      expect(screen.getAllByText('Same')).toHaveLength(2);
      expect(
        screen
          .getByTestId('subject')
          .props.children.map(
            (child: ReactElement<{ testID?: string }> | null) =>
              child?.props.testID ?? null,
          ),
      ).toEqual(['first', null, 'second', 'third']);
    });

    it('passes caller accessibility props through without inventing a role', async () => {
      const unlabelled = await render(<Component testID="unlabelled" />);
      expect(
        unlabelled.getByTestId('unlabelled').props.accessibilityRole,
      ).toBeUndefined();
      await unlabelled.unmount();

      const labelled = await render(
        <Component
          accessibilityLabel="Player summary"
          accessibilityRole="summary"
          testID="labelled"
        />,
      );
      expect(labelled.getByTestId('labelled').props.accessibilityLabel).toBe(
        'Player summary',
      );
      expect(labelled.getByTestId('labelled').props.accessibilityRole).toBe(
        'summary',
      );
    });
  },
);

describe('Inline wrap boundary', () => {
  it.each(inlineWrapCases)(
    'maps %s to %s without changing row direction',
    async (wrap, expected) => {
      const screen = await render(<Inline testID="subject" wrap={wrap} />);
      expect(flattenedStyle(screen.getByTestId('subject').props.style)).toEqual(
        expect.objectContaining({ flexDirection: 'row', flexWrap: expected }),
      );
    },
  );

  it('rejects a non-boolean runtime wrap value', () => {
    expect(() => Inline({ wrap: 'wrap' as unknown as boolean })).toThrow(
      /Unsupported design-system value: wrap\. Supported values: true, false/u,
    );
  });
});

describe('Surface primitive', () => {
  it('uses the documented surface and padding defaults', async () => {
    const screen = await render(<Surface testID="subject" />);
    expect(flattenedStyle(screen.getByTestId('subject').props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: colors.surface,
        padding: spacing.space16,
      }),
    );
  });

  it.each(Object.keys(colors) as ColorToken[])(
    'resolves the %s background and border color exactly',
    async (token) => {
      const screen = await render(
        <Surface background={token} borderColor={token} testID="subject" />,
      );
      expect(flattenedStyle(screen.getByTestId('subject').props.style)).toEqual(
        expect.objectContaining({
          backgroundColor: colors[token],
          borderColor: colors[token],
        }),
      );
    },
  );

  it.each(Object.keys(radii) as RadiusToken[])(
    'resolves the %s radius exactly',
    async (token) => {
      const screen = await render(<Surface radius={token} testID="subject" />);
      expect(
        flattenedStyle(screen.getByTestId('subject').props.style).borderRadius,
      ).toBe(radii[token]);
    },
  );

  it.each(Object.keys(borders) as BorderToken[])(
    'resolves the %s border width exactly',
    async (token) => {
      const screen = await render(
        <Surface borderWidth={token} testID="subject" />,
      );
      expect(
        flattenedStyle(screen.getByTestId('subject').props.style).borderWidth,
      ).toBe(borders[token]);
    },
  );

  it.each(Object.keys(spacing) as SpacingToken[])(
    'resolves the %s padding exactly',
    async (token) => {
      const screen = await render(<Surface padding={token} testID="subject" />);
      expect(
        flattenedStyle(screen.getByTestId('subject').props.style).padding,
      ).toBe(spacing[token]);
    },
  );

  it.each([
    ['background', { background: 'raw-color' }],
    ['borderColor', { borderColor: null }],
    ['borderWidth', { borderWidth: 'borderHeavy' }],
    ['padding', { padding: 'space48' }],
    ['radius', { radius: 'radius24' }],
  ] as Array<[string, Record<string, unknown>]>)(
    'rejects unsupported %s tokens',
    (_name, props) => {
      expect(() => Surface(props as unknown as SurfaceProps)).toThrow(
        /Unsupported design-system value: .*Supported values:/u,
      );
    },
  );

  it.each([
    'backgroundColor',
    'borderBottomColor',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
    'borderBottomWidth',
    'borderColor',
    'borderLeftColor',
    'borderLeftWidth',
    'borderRadius',
    'borderRightColor',
    'borderRightWidth',
    'borderTopColor',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderTopWidth',
    'borderWidth',
    'boxShadow',
    'elevation',
    'shadowColor',
    'shadowOffset',
    'shadowOpacity',
    'shadowRadius',
  ] as const)('rejects the reserved %s surface style key', (reservedKey) => {
    const registered = StyleSheet.create({
      protected: {
        [reservedKey]: reservedKey === 'shadowOffset' ? {} : 'tampered',
      },
    });

    expect(() =>
      Surface({
        style: [{ width: 100 }, registered.protected] as SurfaceProps['style'],
      }),
    ).toThrow(
      new RegExp(
        `Unsupported design-system value: ${reservedKey}\\. Supported values:`,
        'u',
      ),
    );
  });

  it('applies allowed caller layout first and surface invariants last', async () => {
    const screen = await render(
      <Surface
        background="surfaceMuted"
        borderColor="border"
        borderWidth="borderDefault"
        padding="space24"
        radius="radius20"
        style={{ alignSelf: 'center', width: 240 }}
        testID="subject"
      />,
    );
    expect(flattenedStyle(screen.getByTestId('subject').props.style)).toEqual(
      expect.objectContaining({
        alignSelf: 'center',
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.border,
        borderRadius: radii.radius20,
        borderWidth: borders.borderDefault,
        padding: spacing.space24,
        width: 240,
      }),
    );
  });
});

describe('design-system primitive public boundaries', () => {
  it('re-exports direct component identities and keeps guards private', () => {
    const primitives = jest.requireActual<
      typeof import('../src/design-system/primitives')
    >('../src/design-system/primitives');
    const root = jest.requireActual<typeof import('../src/design-system')>(
      '../src/design-system',
    );
    const directText = jest.requireActual<
      typeof import('../src/design-system/primitives/Text')
    >('../src/design-system/primitives/Text');
    const directStack = jest.requireActual<
      typeof import('../src/design-system/primitives/Stack')
    >('../src/design-system/primitives/Stack');
    const directInline = jest.requireActual<
      typeof import('../src/design-system/primitives/Inline')
    >('../src/design-system/primitives/Inline');
    const directSurface = jest.requireActual<
      typeof import('../src/design-system/primitives/Surface')
    >('../src/design-system/primitives/Surface');

    expect(primitives.Text).toBe(directText.Text);
    expect(primitives.Stack).toBe(directStack.Stack);
    expect(primitives.Inline).toBe(directInline.Inline);
    expect(primitives.Surface).toBe(directSurface.Surface);
    expect(root.Text).toBe(directText.Text);
    expect(root.Stack).toBe(directStack.Stack);
    expect(root.Inline).toBe(directInline.Inline);
    expect(root.Surface).toBe(directSurface.Surface);
    expect(primitives).not.toHaveProperty('guardStyle');
    expect(root).not.toHaveProperty('guardStyle');
  });

  it('re-exports original token objects without runtime evidence or product imports', () => {
    const root = jest.requireActual<typeof import('../src/design-system')>(
      '../src/design-system',
    );
    expect(root.colors).toBe(colors);
    expect(root.spacing).toBe(spacing);
    expect(root.radii).toBe(radii);
    expect(root.borders).toBe(borders);

    const runtimeFiles = [
      'Text.tsx',
      'Stack.tsx',
      'Inline.tsx',
      'Surface.tsx',
      'styleGuards.ts',
      'index.ts',
    ];
    runtimeFiles.forEach((file) => {
      const source = readFileSync(
        join(process.cwd(), 'src/design-system/primitives', file),
        'utf8',
      );
      expect(source).not.toMatch(
        /design-spec|penpot|navigation|storage|network|product-model|product-copy/iu,
      );
    });
  });
});
