import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { describe, expect, test } from '@jest/globals';

import { iconNames, iconRegistry } from '../src/design-system/assets/generated/iconRegistry';

const expectedIconNames = [
  'add', 'back', 'calendar', 'check', 'chevron', 'clock', 'close', 'court', 'eye',
  'filter', 'home', 'location', 'notification', 'overflow', 'players', 'profile',
  'search', 'warning',
] as const;

const root = path.resolve(__dirname, '..');

describe('Penpot asset evidence', () => {
  test('retains the exact revision-292 icon inventory in Penpot order', () => {
    expect(iconNames).toEqual(expectedIconNames);
    expect(Object.keys(iconRegistry)).toEqual(expectedIconNames);
    for (const name of expectedIconNames) {
      const record = iconRegistry[name];
      expect(record.fileId).toBe('c514c1fb-1cda-8125-8008-a606253a77a3');
      expect(record.pageId).toBe('482a7222-5a3b-8086-8008-a6073072bbb1');
      expect(record.revision).toBe(292);
      expect(record.viewBox).toHaveLength(4);
      expect(record.viewBox.slice(2)).toEqual([20, 20]);
      expect(record.rawSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(record.normalizedSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(record.xml).toContain('stroke-width="1.75"');
      expect(record.xml).toContain('currentColor');
      expect(record.xml).not.toMatch(/(?:href|src)="https?:|<script|foreignObject|on\w+=/i);
    }
  });

  test('retains both authored lockup ratios and local reference evidence', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'design-spec/assets/penpot-assets.json'), 'utf8'));
    expect(manifest.brands.map((brand: { name: string }) => brand.name)).toEqual(['brand-lockup', 'brand-lockup-stacked']);
    expect(manifest.brands.map((brand: { width: number; height: number }) => [brand.width, brand.height])).toEqual([[300, 72], [300, 56]]);
    for (const brand of manifest.brands) {
      expect(fs.existsSync(path.join(root, brand.rawPath))).toBe(true);
      expect(fs.existsSync(path.join(root, brand.normalizedPath))).toBe(true);
      expect(fs.existsSync(path.join(root, brand.referencePath))).toBe(true);
    }
  });

  test('validator runs controlled tamper rejections and deterministic regeneration', () => {
    const result = spawnSync(process.execPath, ['scripts/validate-penpot-assets.mjs'], { cwd: root, encoding: 'utf8' });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('controlled rejections and deterministic regeneration passed');
  });
});
