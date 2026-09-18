import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { describe, expect, test } from '@jest/globals';

const root = path.resolve(__dirname, '..');

describe('Phase 2 verification evidence', () => {
  test('accepts only explicit native deferral or concrete device evidence', () => {
    const result = spawnSync(process.execPath, ['scripts/validate-phase-2-verification.mjs'], {
      cwd: root,
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('native status deferred-to-phase-5');
    expect(result.stdout).toContain('controlled rejections passed');
  });
});
