import { describe, expect, it } from '@jest/globals';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {
  phase4Families,
  phase4SourceEvidence,
} from '../src/design-system/components/phase4SourceRegistry';

const FAMILY_SOURCES = [
  ['avatar', 'Avatar', '482a7222-5a3b-8086-8008-a60fcc2bf6a2', 5],
  ['avatarGroup', 'Avatar Group', '482a7222-5a3b-8086-8008-a60f7e527b9d', 5],
  ['avatarPicker', 'Avatar Picker', '482a7222-5a3b-8086-8008-a6265a9ac857', 4],
  ['statusChip', 'Status Chip', '482a7222-5a3b-8086-8008-a60fcef69ad7', 7],
  ['stepProgress', 'Step Progress', '482a7222-5a3b-8086-8008-a6243bcc3463', 4],
  ['playerItem', 'Player Item', '482a7222-5a3b-8086-8008-a60fd2e43204', 6],
  ['gameCard', 'Game Card', '482a7222-5a3b-8086-8008-a6100d35e8ef', 5],
  ['notificationRow', 'Notification Row', '482a7222-5a3b-8086-8008-a6101117dfd4', 6],
  ['settingsRow', 'Settings Row', '482a7222-5a3b-8086-8008-a61b708e9d2e', 9],
  ['statTile', 'Stat Tile', '482a7222-5a3b-8086-8008-a61bebc50714', 6],
  ['scoreResultBlock', 'Score Result Block', '482a7222-5a3b-8086-8008-a61c4979950c', 6],
  ['playerPreferencesCard', 'Player Preferences Card', 'ab02a31f-1852-80be-8008-a6fde66e54b7', 2],
  ['bannerToast', 'Banner Toast', '482a7222-5a3b-8086-8008-a610135158ee', 4],
  ['emptyState', 'Empty State', '482a7222-5a3b-8086-8008-a610159eb57a', 3],
  ['illustratedCard', 'Illustrated Card', '482a7222-5a3b-8086-8008-a6187034754b', 4],
] as const;

const DELETED_COMPONENT_IDS = [
  '482a7222-5a3b-8086-8008-a60f56c8ddb2',
  '482a7222-5a3b-8086-8008-a60f570fe711',
  '482a7222-5a3b-8086-8008-a60f575670fa',
  '482a7222-5a3b-8086-8008-a60f579b1bef',
  '482a7222-5a3b-8086-8008-a60f57e139a2',
  '482a7222-5a3b-8086-8008-a62517efe154',
  '482a7222-5a3b-8086-8008-a62518a227b0',
  '482a7222-5a3b-8086-8008-a6251976aff6',
  '482a7222-5a3b-8086-8008-a6251aadddfd',
] as const;

const evidencePath = path.resolve('design-spec/components/phase-4-components.json');
const registryPath = path.resolve('src/design-system/components/phase4SourceRegistry.ts');

describe('Phase 4 source registry', () => {
  it('retains the exact 15-family, 76-record inventory in variant-container order', () => {
    expect(phase4SourceEvidence.familyCount).toBe(15);
    expect(phase4SourceEvidence.recordCount).toBe(76);
    expect(phase4Families.map(({ key, name, sourceId, recordCount }) => ({
      key,
      name,
      sourceId,
      recordCount,
    }))).toEqual(FAMILY_SOURCES.map(([key, name, sourceId, count]) => ({
      key,
      name,
      sourceId,
      recordCount: count,
    })));

    const recordIds: string[] = [];
    for (const family of phase4Families) {
      expect(family.records.map(({ sourceIndex }) => sourceIndex)).toEqual(
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
    expect(recordIds).toHaveLength(76);
    expect(new Set(recordIds).size).toBe(76);
    expect(recordIds).not.toEqual(expect.arrayContaining(DELETED_COMPONENT_IDS));
    expect(phase4SourceEvidence.excludedComponentIds).toEqual(DELETED_COMPONENT_IDS);
  });

  it('limits normalization to the approved preferences mapping and documented geometry cleanup', () => {
    const preferences = phase4Families.find(({ key }) => key === 'playerPreferencesCard');
    expect(preferences?.records.map(({ originalTuple, normalizedTuple }) => ({
      originalTuple,
      normalizedTuple,
    }))).toEqual([
      {
        originalTuple: { 'Property 1': 'Content=Profile' },
        normalizedTuple: { content: 'profile' },
      },
      {
        originalTuple: { 'Property 1': 'Content=Full' },
        normalizedTuple: { content: 'full' },
      },
    ]);

    expect(phase4SourceEvidence.normalizationPolicy.metadata).toEqual([
      'Player Preferences Card Property 1=Content=Full|Profile -> content=full|profile',
    ]);
    expect(phase4SourceEvidence.normalizationPolicy.geometry).toEqual([
      'fractional 328/350/352/390 serialization cleanup',
    ]);
  });

  it('retains raw wrapper and named-child Avatar geometry independently', () => {
    const avatar = phase4Families.find(({ key }) => key === 'avatar');
    expect(avatar?.records.map(({ normalizedTuple, metrics }) => ({
      size: normalizedTuple.size,
      wrapper: metrics.normalized,
      avatar: metrics.avatar.normalized,
      presence: metrics.presence.normalized,
      offset: metrics.presence.offsetFromAvatar,
    }))).toEqual([
      { size: 56, wrapper: { width: 64, height: 64 }, avatar: { width: 56, height: 56 }, presence: { width: 12, height: 12 }, offset: { x: 45, y: 45 } },
      { size: 48, wrapper: { width: 64, height: 64 }, avatar: { width: 48, height: 48 }, presence: { width: 12, height: 12 }, offset: { x: 37, y: 37 } },
      { size: 48, wrapper: { width: 64, height: 64 }, avatar: { width: 48, height: 48 }, presence: { width: 12, height: 12 }, offset: { x: 37, y: 37 } },
      { size: 40, wrapper: { width: 64, height: 64 }, avatar: { width: 40, height: 40 }, presence: { width: 10, height: 10 }, offset: { x: 31, y: 31 } },
      { size: 32, wrapper: { width: 64, height: 64 }, avatar: { width: 32, height: 32 }, presence: { width: 8, height: 8 }, offset: { x: 25, y: 25 } },
    ]);
  });

  it('deep-freezes every runtime layer and imports no retained or remote source', () => {
    expect(Object.isFrozen(phase4SourceEvidence)).toBe(true);
    expect(Object.isFrozen(phase4Families)).toBe(true);
    expect(Object.isFrozen(phase4Families[0])).toBe(true);
    expect(Object.isFrozen(phase4Families[0].records)).toBe(true);
    expect(Object.isFrozen(phase4Families[0].records[0].metrics.avatar)).toBe(true);

    const registrySource = fs.readFileSync(registryPath, 'utf8');
    expect(registrySource).not.toMatch(
      /(?:from|require\()\s*['"][^'"]*(?:phase-4-components\.json|design-source|\.penpot)|readFileSync|parseZip|https?:\/\//u,
    );
  });
});

describe('Phase 4 evidence validation', () => {
  it('matches deterministic regeneration and all controlled rejections', () => {
    expect(fs.existsSync(evidencePath)).toBe(true);
    const result = spawnSync(
      process.execPath,
      ['scripts/validate-phase-4-components.mjs', '--self-test'],
      { cwd: path.resolve('.'), encoding: 'utf8' },
    );
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain(
      'Phase 4 evidence valid: revision 296, 15 families, 76 active records',
    );
    expect(result.stdout).toContain('controlled rejections passed');
  });

  it('keeps retained evidence and runtime registry hashes aligned', () => {
    const committed = JSON.parse(fs.readFileSync(evidencePath, 'utf8')) as {
      contentSha256: string;
    };
    expect(committed.contentSha256).toBe(phase4SourceEvidence.contentSha256);
  });
});
