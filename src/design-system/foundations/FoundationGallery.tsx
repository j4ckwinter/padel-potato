import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import {
  borders,
  colors,
  dimensions,
  opacity,
  radii,
  spacing,
  typography,
} from '../tokens';

export type FoundationCategory =
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'radii'
  | 'dimensions'
  | 'borders'
  | 'opacity';

type FoundationGalleryProps = {
  category?: FoundationCategory;
};

export const foundationCategories = Object.freeze([
  'colors',
  'typography',
  'spacing',
  'radii',
  'dimensions',
  'borders',
  'opacity',
] as const satisfies readonly FoundationCategory[]);

const categoryHeadings: Readonly<Record<FoundationCategory, string>> = {
  colors: 'Semantic colors',
  typography: 'Typography',
  spacing: 'Spacing',
  radii: 'Radii',
  dimensions: 'Dimensions',
  borders: 'Borders',
  opacity: 'Opacity',
};

function Section({
  category,
  children,
}: {
  category: FoundationCategory;
  children: ReactNode;
}) {
  return (
    <View
      accessibilityLabel={`${categoryHeadings[category]} foundation tokens`}
      style={styles.section}
      testID={`foundation-section-${category}`}
    >
      <Text accessibilityRole="header" style={styles.sectionHeading}>
        {categoryHeadings[category]}
      </Text>
      {children}
    </View>
  );
}

function TokenText({ children }: { children: ReactNode }) {
  return <Text style={styles.tokenName}>{children}</Text>;
}

function ColorSpecimens() {
  return (
    <View style={styles.wrapRow}>
      {(Object.keys(colors) as (keyof typeof colors)[]).map((tokenName) => (
        <View
          key={tokenName}
          style={styles.colorItem}
          testID={`foundation-token-colors-${tokenName}`}
        >
          <View
            accessibilityLabel={`${tokenName} color ${colors[tokenName]}`}
            style={[styles.colorSwatch, { backgroundColor: colors[tokenName] }]}
          />
          <TokenText>{tokenName}</TokenText>
          <Text style={styles.value}>{colors[tokenName]}</Text>
        </View>
      ))}
    </View>
  );
}

function TypographySpecimens() {
  return (
    <View style={styles.stack}>
      {(Object.keys(typography) as (keyof typeof typography)[]).map(
        (tokenName) => {
          const token = typography[tokenName];
          return (
            <View
              key={tokenName}
              style={styles.specimenCard}
              testID={`foundation-token-typography-${tokenName}`}
            >
              <Text style={[styles.specimenText, token as TextStyle]}>
                {tokenName === 'display'
                  ? 'Same court. Better people.'
                  : 'Padel Potato'}
              </Text>
              <TokenText>{tokenName}</TokenText>
              <Text style={styles.value}>
                {`${token.fontSize}px / ${token.lineHeight}px · ${token.fontWeight}`}
              </Text>
            </View>
          );
        },
      )}
    </View>
  );
}

type ScalarCategory = Exclude<FoundationCategory, 'colors' | 'typography'>;

type ScalarSpecimensProps = {
  category: ScalarCategory;
  tokens: Readonly<Record<string, number>>;
};

function scalarVisual(category: ScalarCategory, value: number): ViewStyle {
  switch (category) {
    case 'spacing':
      return {
        height: spacing.space8,
        width: value,
        borderRadius: radii.radius8,
      };
    case 'radii':
      return {
        height: dimensions.controlHeight40,
        width: dimensions.controlHeight48,
        borderRadius: value,
      };
    case 'dimensions':
      return { height: value, width: value, borderRadius: radii.radius8 };
    case 'borders':
      return {
        height: dimensions.controlHeight40,
        width: dimensions.controlHeight48,
        borderRadius: radii.radius8,
        borderWidth: value,
        backgroundColor: colors.surface,
      };
    case 'opacity':
      return {
        height: dimensions.controlHeight40,
        width: dimensions.controlHeight48,
        borderRadius: radii.radius8,
        opacity: value,
      };
  }
}

function ScalarSpecimens({ category, tokens }: ScalarSpecimensProps) {
  return (
    <View style={styles.stack}>
      {Object.entries(tokens).map(([tokenName, value]) => (
        <View
          key={tokenName}
          style={styles.scalarRow}
          testID={`foundation-token-${category}-${tokenName}`}
        >
          <View
            accessibilityLabel={`${tokenName} specimen ${value}`}
            style={[styles.scalarSpecimen, scalarVisual(category, value)]}
          />
          <View style={styles.scalarCopy}>
            <TokenText>{tokenName}</TokenText>
            <Text style={styles.value}>
              {category === 'opacity' ? value : `${value} px`}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function FoundationSection({ category }: { category: FoundationCategory }) {
  switch (category) {
    case 'colors':
      return (
        <Section category={category}>
          <ColorSpecimens />
        </Section>
      );
    case 'typography':
      return (
        <Section category={category}>
          <TypographySpecimens />
        </Section>
      );
    case 'spacing':
      return (
        <Section category={category}>
          <ScalarSpecimens category={category} tokens={spacing} />
        </Section>
      );
    case 'radii':
      return (
        <Section category={category}>
          <ScalarSpecimens category={category} tokens={radii} />
        </Section>
      );
    case 'dimensions':
      return (
        <Section category={category}>
          <ScalarSpecimens category={category} tokens={dimensions} />
        </Section>
      );
    case 'borders':
      return (
        <Section category={category}>
          <ScalarSpecimens category={category} tokens={borders} />
        </Section>
      );
    case 'opacity':
      return (
        <Section category={category}>
          <ScalarSpecimens category={category} tokens={opacity} />
        </Section>
      );
  }
}

export function FoundationGallery({ category }: FoundationGalleryProps = {}) {
  if (category !== undefined && !foundationCategories.includes(category)) {
    throw new Error(`Unsupported foundation category: "${String(category)}"`);
  }

  const visibleCategories = category ? [category] : foundationCategories;

  return (
    <ScrollView
      contentContainerStyle={styles.gallery}
      style={styles.canvas}
      testID="foundation-gallery"
    >
      <View style={styles.introduction}>
        <Text accessibilityRole="header" style={styles.title}>
          Padel Potato Foundations
        </Text>
        <Text style={styles.subtitle}>
          Shared runtime tokens used by every design-system component.
        </Text>
      </View>
      {visibleCategories.map((visibleCategory) => (
        <FoundationSection category={visibleCategory} key={visibleCategory} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: colors.canvas,
  },
  gallery: {
    gap: spacing.space32,
    padding: spacing.space32,
  },
  introduction: {
    gap: spacing.space4,
  },
  title: {
    ...typography.display,
    color: colors.ink,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
  },
  section: {
    gap: spacing.space20,
  },
  sectionHeading: {
    ...typography.section,
    color: colors.ink,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.space24,
  },
  colorItem: {
    gap: spacing.space4,
    width: dimensions.controlHeight48 * 2,
  },
  colorSwatch: {
    borderColor: colors.border,
    borderRadius: radii.radius16,
    borderWidth: borders.borderDefault,
    height: dimensions.controlHeight48,
  },
  stack: {
    gap: spacing.space16,
  },
  specimenCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.radius16,
    borderWidth: borders.borderDefault,
    gap: spacing.space4,
    padding: spacing.space16,
  },
  specimenText: {
    color: colors.ink,
  },
  tokenName: {
    ...typography.label,
    color: colors.ink,
  },
  value: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  scalarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.space16,
  },
  scalarSpecimen: {
    backgroundColor: colors.accent,
  },
  scalarCopy: {
    flex: 1,
    gap: spacing.space4,
  },
});
