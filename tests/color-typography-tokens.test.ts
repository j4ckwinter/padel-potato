import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';

import { colors, type ColorToken } from '../src/design-system/tokens/colors';
import {
  fontAssets,
  fontProvenance,
  typography,
  type TypographyToken,
} from '../src/design-system/tokens/typography';

type FontProvenance = {
  assets: {
    path: string;
    postScriptName: string;
    runtimeFamily: string;
    sha256: string;
    weight: number;
  }[];
};
const retainedFontProvenance = JSON.parse(
  readFileSync(
    join(process.cwd(), 'assets/fonts/inter-4.1.provenance.json'),
    'utf8',
  ),
) as FontProvenance;

const tableOffset = (font: Buffer, wantedTag: string) => {
  const tableCount = font.readUInt16BE(4);
  for (let index = 0; index < tableCount; index += 1) {
    const recordOffset = 12 + index * 16;
    if (font.toString('ascii', recordOffset, recordOffset + 4) === wantedTag)
      return font.readUInt32BE(recordOffset + 8);
  }
  throw new Error(`Missing ${wantedTag} table`);
};

const postScriptName = (font: Buffer) => {
  const offset = tableOffset(font, 'name');
  const recordCount = font.readUInt16BE(offset + 2);
  const stringsOffset = offset + font.readUInt16BE(offset + 4);
  for (let index = 0; index < recordCount; index += 1) {
    const recordOffset = offset + 6 + index * 12;
    if (
      font.readUInt16BE(recordOffset) !== 3 ||
      font.readUInt16BE(recordOffset + 6) !== 6
    )
      continue;
    const length = font.readUInt16BE(recordOffset + 8);
    const valueOffset = stringsOffset + font.readUInt16BE(recordOffset + 10);
    return font
      .subarray(valueOffset, valueOffset + length)
      .swap16()
      .toString('utf16le');
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

describe('color token contract', () => {
  it('publishes the exact semantic palette as an immutable object', () => {
    expect(colors).toEqual(expectedColors);
    expect(Object.isFrozen(colors)).toBe(true);
    const token: ColorToken = 'accent';
    expect(colors[token]).toBe('#ade533');
  });
});

describe('typography token contract', () => {
  it('publishes the exact native text styles as immutable objects', () => {
    expect(typography).toEqual(expectedTypography);
    expect(Object.isFrozen(typography)).toBe(true);
    expect(Object.values(typography).every(Object.isFrozen)).toBe(true);
    const token: TypographyToken = 'bodyStrong';
    expect(typography[token].fontWeight).toBe('600');
  });

  it('exposes the licensed local Inter assets used at runtime', () => {
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
      }),
    );
  });

  it('retains verified font binaries with their declared embedded weights', () => {
    expect(retainedFontProvenance.assets).toHaveLength(3);
    for (const asset of retainedFontProvenance.assets) {
      const font = readFileSync(join(process.cwd(), asset.path));
      expect(createHash('sha256').update(font).digest('hex')).toBe(
        asset.sha256,
      );
      expect(font.readUInt16BE(tableOffset(font, 'OS/2') + 4)).toBe(
        asset.weight,
      );
      expect(postScriptName(font)).toBe(asset.postScriptName);
      expect(Object.keys(fontAssets)).toContain(asset.runtimeFamily);
    }
    expect(
      readFileSync(join(process.cwd(), 'assets/fonts/OFL.txt'), 'utf8'),
    ).toContain('SIL OPEN FONT LICENSE Version 1.1');
  });
});
