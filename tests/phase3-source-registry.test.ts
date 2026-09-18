import { describe, expect, it } from '@jest/globals';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {
  phase3Families,
  phase3SourceEvidence,
} from '../src/design-system/components/sourceRegistry';

const FAMILY_SOURCES = [
  ['button', 'Button', '482a7222-5a3b-8086-8008-a60ea01107a5', 9],
  ['iconButton', 'Icon Button', '482a7222-5a3b-8086-8008-a60eda8bf731', 6],
  ['favourite', 'Favourite', 'ab02a31f-1852-80be-8008-a6fb4b80c769', 2],
  ['field', 'Field', '482a7222-5a3b-8086-8008-a60edc77a99f', 12],
  ['choiceChip', 'Choice Chip', '482a7222-5a3b-8086-8008-a61b1055dd19', 8],
  ['checkbox', 'Checkbox', '482a7222-5a3b-8086-8008-a61e92e286a2', 4],
  ['dayTimeSelector', 'Day Time Selector', '482a7222-5a3b-8086-8008-a62580c2b764', 6],
  ['socialSignInButton', 'Social Sign-In Button', '482a7222-5a3b-8086-8008-a61e90365f95', 8],
  ['authDivider', 'Auth Divider', '482a7222-5a3b-8086-8008-a61e93b191ff', 1],
  ['bottomNavigation', 'Bottom Navigation', '482a7222-5a3b-8086-8008-a61a5487bd61', 5],
  ['segmentedControl', 'Segmented Control', '482a7222-5a3b-8086-8008-a60ede25d147', 4],
  ['appHeader', 'App Header', '482a7222-5a3b-8086-8008-a61da61c2e7f', 9],
  ['sectionHeader', 'Section Header', '482a7222-5a3b-8086-8008-a608c3bde79a', 1],
] as const;

const evidencePath = path.resolve(
  'design-spec/components/phase-3-components.json',
);
const registryPath = path.resolve(
  'src/design-system/components/sourceRegistry.ts',
);

describe('Phase 3 source registry', () => {
  it('retains the exact 13-family, 75-record inventory in source order', () => {
    expect(phase3SourceEvidence.familyCount).toBe(13);
    expect(phase3SourceEvidence.recordCount).toBe(75);
    expect(phase3Families.map(({ key, name, sourceId, recordCount }) => ({
      key,
      name,
      sourceId,
      recordCount,
    }))).toEqual(FAMILY_SOURCES.map(([key, name, sourceId, count]) => ({
      key, name, sourceId, recordCount: count,
    })));

    const recordIds: string[] = [];
    for (const family of phase3Families) {
      expect(family.records.map((record) => record.sourceIndex)).toEqual(
        family.records.map((_, index) => index),
      );
      for (const record of family.records) {
        recordIds.push(record.id);
        expect(record.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u,
        );
        expect(record.mainInstanceId).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u,
        );
        expect(record.active).toBe(true);
      }
    }
    expect(recordIds).toHaveLength(75);
    expect(new Set(recordIds).size).toBe(75);
  });

  it('retains only the approved metadata and fractional geometry normalizations', () => {
    const favourite = phase3Families.find((family) => family.key === 'favourite');
    const iconButton = phase3Families.find((family) => family.key === 'iconButton');
    expect(favourite?.records.map((record) => record.normalizedTuple)).toEqual([
      { checked: true },
      { checked: false },
    ]);
    expect(iconButton?.records.at(-1)?.originalTuple).toEqual({
      Size: '44',
      State: 'Default',
      Icon: 'Value 2',
    });
    expect(iconButton?.records.at(-1)?.normalizedTuple).toEqual({
      size: 44,
      state: 'default',
      icon: 'notification',
    });

    const geometryNormalizations: Array<{
      metrics: { normalization: string | null; normalized: { width: number } };
    }> = [];
    for (const family of phase3Families) {
      for (const record of family.records) {
        if (record.metrics.normalization !== null) geometryNormalizations.push(record);
      }
    }
    expect(geometryNormalizations.length).toBeGreaterThan(0);
    expect(new Set(geometryNormalizations.map((record) => record.metrics.normalization))).toEqual(
      new Set(['fractional 352/390 serialization cleanup']),
    );
    expect(geometryNormalizations.every((record) => [352, 390].includes(record.metrics.normalized.width))).toBe(true);
  });

  it('retains exact component metrics and fixed Button typography', () => {
    const button = phase3Families.find((family) => family.key === 'button');
    const canonical = button?.records.find(
      (record) => record.id === '482a7222-5a3b-8086-8008-a60ea006c15d',
    );
    expect(canonical?.metrics).toEqual(expect.objectContaining({
      raw: { width: 160, height: 48 },
      normalized: { width: 160, height: 48 },
      radii: [24, 24, 24, 24],
      opacity: 1,
      layout: {
        mode: 'flex',
        gap: { rowGap: 0, columnGap: 8 },
        padding: { p1: 0, p2: 16, p3: 0, p4: 16 },
      },
    }));
    expect(canonical?.metrics.typography).toEqual([
      expect.objectContaining({
        text: 'Button label',
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: 0,
      }),
    ]);
  });

  it('deep-freezes every runtime registry layer and imports no build-time evidence', () => {
    expect(Object.isFrozen(phase3SourceEvidence)).toBe(true);
    expect(Object.isFrozen(phase3Families)).toBe(true);
    expect(Object.isFrozen(phase3Families[0])).toBe(true);
    expect(Object.isFrozen(phase3Families[0].records)).toBe(true);
    expect(Object.isFrozen(phase3Families[0].records[0].metrics)).toBe(true);

    const registrySource = fs.readFileSync(registryPath, 'utf8');
    expect(registrySource).not.toMatch(
      /(?:from|require\()\s*['"][^'"]*(?:phase-3-components\.json|design-source|\.penpot)|readFileSync|parseZip|https?:\/\//u,
    );
  });
});

describe('Phase 3 evidence validation', () => {
  it('matches deterministic regeneration and all controlled rejections', () => {
    expect(fs.existsSync(evidencePath)).toBe(true);
    const result = spawnSync(
      process.execPath,
      ['scripts/validate-phase-3-components.mjs', '--self-test'],
      { cwd: path.resolve('.'), encoding: 'utf8' },
    );
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain(
      'Phase 3 evidence valid: revision 296, 13 families, 75 active records',
    );
    expect(result.stdout).toContain('controlled rejections passed');
  });

  it('keeps the retained evidence hash aligned with the runtime registry', () => {
    const committed = JSON.parse(fs.readFileSync(evidencePath, 'utf8')) as {
      contentSha256: string;
    };
    expect(committed.contentSha256).toBe(phase3SourceEvidence.contentSha256);
  });
});
