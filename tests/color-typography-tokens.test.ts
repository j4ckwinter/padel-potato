import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';

import {
  colorSources,
  colors,
  type ColorToken,
} from '../src/design-system/tokens/colors';
import {
  fontAssets,
  fontProvenance,
  typography,
  typographySources,
  type TypographyToken,
} from '../src/design-system/tokens/typography';

type ManifestRecord = {
  name: string;
  resolvedValue: unknown;
  sourceId: string;
};

type Manifest = {
  fileId: string;
  pageId: string;
  sourceRevision: number;
  categories: {
    colors: ManifestRecord[];
    typography: ManifestRecord[];
  };
};

type FontProvenance = {
  assets: Array<{
    path: string;
    postScriptName: string;
    runtimeFamily: string;
    sha256: string;
    weight: number;
  }>;
};

const manifest = JSON.parse(
  readFileSync(join(process.cwd(), 'design-spec/penpot-foundations.json'), 'utf8'),
) as Manifest;

const retainedFontProvenance = JSON.parse(
  readFileSync(join(process.cwd(), 'assets/fonts/inter-4.1.provenance.json'), 'utf8'),
) as FontProvenance;

const tableOffset = (font: Buffer, wantedTag: string) => {
  const tableCount = font.readUInt16BE(4);
  for (let index = 0; index < tableCount; index += 1) {
    const recordOffset = 12 + index * 16;
    if (font.toString('ascii', recordOffset, recordOffset + 4) === wantedTag) {
      return font.readUInt32BE(recordOffset + 8);
    }
  }
  throw new Error(`Missing ${wantedTag} table`);
};

const postScriptName = (font: Buffer) => {
  const offset = tableOffset(font, 'name');
  const recordCount = font.readUInt16BE(offset + 2);
  const stringsOffset = offset + font.readUInt16BE(offset + 4);

  for (let index = 0; index < recordCount; index += 1) {
    const recordOffset = offset + 6 + index * 12;
    const platformId = font.readUInt16BE(recordOffset);
    const nameId = font.readUInt16BE(recordOffset + 6);
    if (platformId !== 3 || nameId !== 6) continue;

    const length = font.readUInt16BE(recordOffset + 8);
    const valueOffset = stringsOffset + font.readUInt16BE(recordOffset + 10);
    const bytes = font.subarray(valueOffset, valueOffset + length);
    return bytes.swap16().toString('utf16le');
  }

  throw new Error('Missing Windows PostScript name record');
};

const expectedColors = {
  accent: '#ade533',
  border: '#edede8',
  canvas: '#fbf8f0',
  danger: '#ffd6d6',
  deep: '#384540',
  info: '#d6edfa',
  ink: '#0e1716',
  muted: '#636b6e',
  olive: '#636657',
  surface: '#ffffff',
  surfaceAccent: '#d1f28a',
  surfaceMuted: '#f0f0eb',
  textSecondary: '#3b4742',
  warning: '#ffeb9e',
  focusRing: '#ADE533',
} as const;

const expectedTypography = {
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'normal',
    lineHeight: 16.8,
    letterSpacing: 0,
  },
  bodyStrong: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    fontWeight: '400',
    fontStyle: 'normal',
    lineHeight: 13.2,
    letterSpacing: 0,
  },
  display: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    fontStyle: 'normal',
    lineHeight: 33.6,
    letterSpacing: 0,
  },
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'normal',
    lineHeight: 21.6,
    letterSpacing: 0,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 14.4,
    letterSpacing: 0,
  },
  micro: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 12,
    letterSpacing: 0,
  },
  section: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    fontWeight: '700',
    fontStyle: 'normal',
    lineHeight: 24,
    letterSpacing: 0,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 25,
    fontWeight: '700',
    fontStyle: 'normal',
    lineHeight: 30,
    letterSpacing: 0,
  },
} as const;

const colorManifestNames = [
  'color.accent',
  'color.border',
  'color.canvas',
  'color.danger',
  'color.deep',
  'color.info',
  'color.ink',
  'color.muted',
  'color.olive',
  'color.surface',
  'color.surfaceAccent',
  'color.surfaceMuted',
  'color.textSecondary',
  'color.warning',
  'focus.ring.color',
] as const;

const typographyManifestNames = [
  'Body',
  'Body Strong',
  'Caption',
  'Display',
  'Heading',
  'Label',
  'Micro',
  'Section',
  'Title',
] as const;

describe('Penpot color contract', () => {
  it('publishes exactly the reviewed 15 semantic colors in manifest order', () => {
    expect(Object.keys(colors)).toEqual(Object.keys(expectedColors));
    expect(colors).toEqual(expectedColors);
    expect(manifest.categories.colors.map(({ name }) => name)).toEqual(
      colorManifestNames,
    );
    expect(manifest.categories.colors.map(({ resolvedValue }) => resolvedValue)).toEqual(
      Object.values(colors),
    );
  });

  it('keeps immutable provenance beside every color', () => {
    expect(Object.keys(colorSources)).toEqual(Object.keys(colors));
    Object.values(colorSources).forEach((source) => {
      expect(source).toEqual(
        expect.objectContaining({
          fileId: manifest.fileId,
          pageId: manifest.pageId,
          revision: manifest.sourceRevision,
        }),
      );
      expect(Object.isFrozen(source)).toBe(true);
    });
    expect(Object.isFrozen(colors)).toBe(true);
    expect(Object.isFrozen(colorSources)).toBe(true);
  });

  it('derives its public token type from the immutable export', () => {
    const token: ColorToken = 'accent';
    expect(colors[token]).toBe('#ade533');
  });
});

describe('Penpot typography contract', () => {
  it('publishes exactly the reviewed 9 native text styles in manifest order', () => {
    expect(Object.keys(typography)).toEqual(Object.keys(expectedTypography));
    expect(typography).toEqual(expectedTypography);
    expect(manifest.categories.typography.map(({ name }) => name)).toEqual(
      typographyManifestNames,
    );
  });

  it('maps every style to its source record and exact authored family and weight', () => {
    expect(Object.keys(typographySources)).toEqual(Object.keys(typography));
    Object.values(typographySources).forEach((source) => {
      expect(source).toEqual(
        expect.objectContaining({
          sourceFamily: 'Inter',
          fileId: manifest.fileId,
          pageId: manifest.pageId,
          revision: manifest.sourceRevision,
        }),
      );
      expect(Object.isFrozen(source)).toBe(true);
    });
    expect(Object.isFrozen(typography)).toBe(true);
    expect(Object.values(typography).every(Object.isFrozen)).toBe(true);
    expect(Object.isFrozen(typographySources)).toBe(true);
  });

  it('exposes only authoritative local assets for all authored weights', () => {
    expect(Object.keys(fontAssets)).toEqual([
      'Inter_400Regular',
      'Inter_600SemiBold',
      'Inter_700Bold',
    ]);
    expect(fontProvenance).toEqual(
      expect.objectContaining({
        family: 'Inter',
        version: '4.1',
        license: 'SIL Open Font License 1.1',
        archiveSha256:
          '9883fdd4a49d4fb66bd8177ba6625ef9a64aa45899767dde3d36aa425756b11e',
      }),
    );
  });

  it('retains verified official binaries with the declared embedded weights', () => {
    expect(retainedFontProvenance.assets).toHaveLength(3);

    retainedFontProvenance.assets.forEach((asset) => {
      const font = readFileSync(join(process.cwd(), asset.path));
      expect(createHash('sha256').update(font).digest('hex')).toBe(asset.sha256);
      expect(font.readUInt16BE(tableOffset(font, 'OS/2') + 4)).toBe(asset.weight);
      expect(postScriptName(font)).toBe(asset.postScriptName);
      expect(Object.keys(fontAssets)).toContain(asset.runtimeFamily);
    });

    expect(readFileSync(join(process.cwd(), 'assets/fonts/OFL.txt'), 'utf8')).toContain(
      'SIL OPEN FONT LICENSE Version 1.1',
    );
  });

  it('derives its public token type from the immutable export', () => {
    const token: TypographyToken = 'bodyStrong';
    expect(typography[token].fontWeight).toBe('600');
  });
});
