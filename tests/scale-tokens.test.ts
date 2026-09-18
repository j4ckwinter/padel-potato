import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';

import {
  borders,
  borderSources,
  type BorderToken,
} from '../src/design-system/tokens/borders';
import {
  dimensions,
  dimensionSources,
  type DimensionToken,
} from '../src/design-system/tokens/dimensions';
import {
  opacity,
  opacitySources,
  type OpacityToken,
} from '../src/design-system/tokens/opacity';
import {
  radii,
  radiusSources,
  type RadiusToken,
} from '../src/design-system/tokens/radii';
import {
  spacing,
  spacingSources,
  type SpacingToken,
} from '../src/design-system/tokens/spacing';

type ScaleCategory =
  | 'spacing'
  | 'radii'
  | 'dimensions'
  | 'borderWidths'
  | 'opacities';

type ManifestRecord = {
  name: string;
  resolvedValue: string;
  sourceId: string;
  fileId: string;
  pageId: string;
};

type Manifest = {
  fileId: string;
  pageId: string;
  sourceRevision: number;
  categories: Record<ScaleCategory, ManifestRecord[]>;
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
