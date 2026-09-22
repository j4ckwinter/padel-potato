import { describe, expect, it, jest } from '@jest/globals';

import {
  borders,
  colors,
  dimensions,
  layoutWidths,
  fontAssets,
  fontProvenance,
  opacity,
  radii,
  sizing,
  spacing,
  typography,
  type BorderToken,
  type DimensionToken,
  type LayoutWidthToken,
  type OpacityToken,
  type RadiusToken,
  type SizingToken,
  type SpacingToken,
} from '../src/design-system/tokens';

const expected = {
  spacing: {
    space0: 0,
    space4: 4,
    space8: 8,
    space12: 12,
    space16: 16,
    space20: 20,
    space24: 24,
    space32: 32,
    space40: 40,
  },
  radii: {
    radius8: 8,
    radius12: 12,
    radius16: 16,
    radius20: 20,
    radius28: 28,
    radius36: 36,
    radiusFull: 999,
  },
  dimensions: {
    controlHeight40: 40,
    controlHeight44: 44,
    controlHeight48: 48,
    iconSize20: 20,
  },
  layoutWidths: { compact: 320, content: 352, viewport: 390 },
  borders: { borderDefault: 1, focusRingWidth: 2 },
  opacity: { opacityDisabled: 0.4 },
} as const;

describe('layout measurement token contracts', () => {
  it('publishes exact immutable scales', () => {
    expect(spacing).toEqual(expected.spacing);
    expect(radii).toEqual(expected.radii);
    expect(dimensions).toEqual(expected.dimensions);
    expect(layoutWidths).toEqual(expected.layoutWidths);
    expect(borders).toEqual(expected.borders);
    expect(opacity).toEqual(expected.opacity);
    for (const scale of [
      spacing,
      radii,
      dimensions,
      sizing,
      layoutWidths,
      borders,
      opacity,
    ]) {
      expect(Object.isFrozen(scale)).toBe(true);
      expect(Object.values(scale).every(Number.isFinite)).toBe(true);
      expect(Object.values(scale).every((value) => value >= 0)).toBe(true);
    }
  });

  it('retains strongly typed public keys', () => {
    const spacingToken: SpacingToken = 'space12';
    const radiusToken: RadiusToken = 'radius28';
    const dimensionToken: DimensionToken = 'controlHeight44';
    const sizingToken: SizingToken = 'size44';
    const layoutWidthToken: LayoutWidthToken = 'content';
    const borderToken: BorderToken = 'focusRingWidth';
    const opacityToken: OpacityToken = 'opacityDisabled';
    expect([
      spacing[spacingToken],
      radii[radiusToken],
      dimensions[dimensionToken],
      sizing[sizingToken],
      layoutWidths[layoutWidthToken],
      borders[borderToken],
      opacity[opacityToken],
    ]).toEqual([12, 28, 44, 44, 352, 2, 0.4]);
  });
});

describe('foundation-token public barrel', () => {
  it('re-exports runtime objects without copying them', () => {
    const directBorders = jest.requireActual<
      typeof import('../src/design-system/tokens/borders')
    >('../src/design-system/tokens/borders');
    const directColors = jest.requireActual<
      typeof import('../src/design-system/tokens/colors')
    >('../src/design-system/tokens/colors');
    const directDimensions = jest.requireActual<
      typeof import('../src/design-system/tokens/dimensions')
    >('../src/design-system/tokens/dimensions');
    const directOpacity = jest.requireActual<
      typeof import('../src/design-system/tokens/opacity')
    >('../src/design-system/tokens/opacity');
    const directRadii = jest.requireActual<
      typeof import('../src/design-system/tokens/radii')
    >('../src/design-system/tokens/radii');
    const directSpacing = jest.requireActual<
      typeof import('../src/design-system/tokens/spacing')
    >('../src/design-system/tokens/spacing');
    const directSizing = jest.requireActual<
      typeof import('../src/design-system/tokens/sizing')
    >('../src/design-system/tokens/sizing');
    const directLayout = jest.requireActual<
      typeof import('../src/design-system/tokens/layout')
    >('../src/design-system/tokens/layout');
    const directTypography = jest.requireActual<
      typeof import('../src/design-system/tokens/typography')
    >('../src/design-system/tokens/typography');
    expect(borders).toBe(directBorders.borders);
    expect(colors).toBe(directColors.colors);
    expect(dimensions).toBe(directDimensions.dimensions);
    expect(opacity).toBe(directOpacity.opacity);
    expect(radii).toBe(directRadii.radii);
    expect(spacing).toBe(directSpacing.spacing);
    expect(sizing).toBe(directSizing.sizing);
    expect(layoutWidths).toBe(directLayout.layoutWidths);
    expect(typography).toBe(directTypography.typography);
    expect(fontAssets).toBe(directTypography.fontAssets);
    expect(fontProvenance).toBe(directTypography.fontProvenance);
  });
});
