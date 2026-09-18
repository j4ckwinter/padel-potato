import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it, jest } from '@jest/globals';

import {
  borders,
  borderSources,
  colors,
  colorSources,
  type BorderToken,
  dimensions,
  dimensionSources,
  type DimensionToken,
  fontAssets,
  fontProvenance,
  opacity,
  opacitySources,
  type OpacityToken,
  radii,
  radiusSources,
  type RadiusToken,
  spacing,
  spacingSources,
  type SpacingToken,
  typography,
  typographySources,
} from '../src/design-system/tokens';

type ScaleCategory =
  | 'spacing'
  | 'radii'
  | 'dimensions'
  | 'borderWidths'
  | 'opacities';

type FoundationCategory = ScaleCategory | 'colors' | 'typography';

type ManifestRecord = {
  name: string;
  resolvedValue: unknown;
  sourceId: string;
  fileId: string;
  pageId: string;
};

type Manifest = {
  fileId: string;
  pageId: string;
  sourceRevision: number;
  categories: Record<FoundationCategory, ManifestRecord[]>;
};

type TokenSource = {
  designName: string;
  sourceId: string;
  fileId: string;
  pageId: string;
  revision: number;
};

const manifest = JSON.parse(
  readFileSync(join(process.cwd(), 'design-spec/penpot-foundations.json'), 'utf8'),
) as Manifest;

/**
 * Penpot scalar names become lower camel case by splitting on every run of
 * non-alphanumeric characters. Numeric segments remain exact: `space.12`
 * becomes `space12` and `control.height.40` becomes `controlHeight40`.
 */
const tokenKey = (designName: string) => {
  const [first = '', ...rest] = designName
    .split(/[^A-Za-z0-9]+/u)
    .filter(Boolean);
  return `${first.charAt(0).toLowerCase()}${first.slice(1)}${rest
    .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
    .join('')}`;
};

const assertScaleContract = (
  category: ScaleCategory,
  expectedCount: number,
  values: Readonly<Record<string, number>>,
  sources: Readonly<Record<string, TokenSource>>,
) => {
  const records = manifest.categories[category];
  const expectedKeys = records.map(({ name }) => tokenKey(name));
  const expectedValues = records.map(({ resolvedValue }) => Number(resolvedValue));

  expect(records).toHaveLength(expectedCount);
  expect(new Set(records.map(({ name }) => name)).size).toBe(expectedCount);
  expect(new Set(expectedKeys).size).toBe(expectedCount);
  expect(Object.keys(values)).toEqual(expectedKeys);
  expect(Object.values(values)).toEqual(expectedValues);
  expect(Object.keys(sources)).toEqual(expectedKeys);

  records.forEach((record, index) => {
    const key = expectedKeys[index];
    expect(sources[key]).toEqual({
      designName: record.name,
      sourceId: record.sourceId,
      fileId: manifest.fileId,
      pageId: manifest.pageId,
      revision: manifest.sourceRevision,
    });
    expect(Object.isFrozen(sources[key])).toBe(true);
  });

  expect(Object.values(values).every(Number.isFinite)).toBe(true);
  expect(Object.values(values).every((value) => value >= 0)).toBe(true);
  expect(Object.isFrozen(values)).toBe(true);
  expect(Object.isFrozen(sources)).toBe(true);
};

describe('Penpot layout measurement scale contracts', () => {
  it('publishes all 8 spacing tokens in exact manifest order', () => {
    assertScaleContract('spacing', 8, spacing, spacingSources);
    const token: SpacingToken = 'space12';
    expect(spacing[token]).toBe(12);
  });

  it('publishes all 6 radius tokens in exact manifest order', () => {
    assertScaleContract('radii', 6, radii, radiusSources);
    const token: RadiusToken = 'radius28';
    expect(radii[token]).toBe(28);
  });

  it('publishes all 4 dimension tokens in exact manifest order', () => {
    assertScaleContract('dimensions', 4, dimensions, dimensionSources);
    const token: DimensionToken = 'controlHeight44';
    expect(dimensions[token]).toBe(44);
  });

  it('uses one deterministic collision-rejecting semantic-name rule', () => {
    expect(tokenKey('space.12')).toBe('space12');
    expect(tokenKey('control.height.40')).toBe('controlHeight40');

    for (const category of Object.keys(manifest.categories) as ScaleCategory[]) {
      const normalized = manifest.categories[category].map(({ name }) => tokenKey(name));
      expect(new Set(normalized).size).toBe(normalized.length);
    }
  });
});

describe('Penpot border and opacity scale contracts', () => {
  it('publishes both border-width tokens in exact manifest order', () => {
    assertScaleContract('borderWidths', 2, borders, borderSources);
    expect(Object.values(borders).every(Number.isInteger)).toBe(true);
    const token: BorderToken = 'focusRingWidth';
    expect(borders[token]).toBe(2);
  });

  it('publishes the opacity token with its exact fractional value', () => {
    assertScaleContract('opacities', 1, opacity, opacitySources);
    expect(Object.values(opacity).every((value) => value <= 1)).toBe(true);
    const token: OpacityToken = 'opacityDisabled';
    expect(opacity[token]).toBe(0.4);
  });
});

describe('foundation-token public barrel', () => {
  it('exposes all seven categories and their provenance without copying objects', () => {
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
    const directTypography = jest.requireActual<
      typeof import('../src/design-system/tokens/typography')
    >('../src/design-system/tokens/typography');

    expect(borders).toBe(directBorders.borders);
    expect(borderSources).toBe(directBorders.borderSources);
    expect(colors).toBe(directColors.colors);
    expect(colorSources).toBe(directColors.colorSources);
    expect(dimensions).toBe(directDimensions.dimensions);
    expect(dimensionSources).toBe(directDimensions.dimensionSources);
    expect(opacity).toBe(directOpacity.opacity);
    expect(opacitySources).toBe(directOpacity.opacitySources);
    expect(radii).toBe(directRadii.radii);
    expect(radiusSources).toBe(directRadii.radiusSources);
    expect(spacing).toBe(directSpacing.spacing);
    expect(spacingSources).toBe(directSpacing.spacingSources);
    expect(typography).toBe(directTypography.typography);
    expect(typographySources).toBe(directTypography.typographySources);
    expect(fontAssets).toBe(directTypography.fontAssets);
    expect(fontProvenance).toBe(directTypography.fontProvenance);
  });

  it('retains exact manifest coverage for every public category', () => {
    expect(Object.values(colors)).toEqual(
      manifest.categories.colors.map(({ resolvedValue }) => resolvedValue),
    );
    expect(Object.keys(typography)).toHaveLength(manifest.categories.typography.length);
    assertScaleContract('spacing', 8, spacing, spacingSources);
    assertScaleContract('radii', 6, radii, radiusSources);
    assertScaleContract('dimensions', 4, dimensions, dimensionSources);
    assertScaleContract('borderWidths', 2, borders, borderSources);
    assertScaleContract('opacities', 1, opacity, opacitySources);
  });
});
