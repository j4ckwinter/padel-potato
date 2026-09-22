import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

import { describe, expect, it } from '@jest/globals';

const root = process.cwd();
const designSystemRoot = join(root, 'src/design-system');
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.json']);

const sourceFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : sourceExtensions.has(extname(path)) ? [path] : [];
  });

describe('standalone design-system boundary', () => {
  it('contains no design-tool, evidence, source-record, or phase-registry coupling', () => {
    const forbidden = /design-source|design-spec|penpot|sourceRegistry|componentFixtures|phase\d+(?:Families|StoryContracts|Backstops|Definitions|Categories|SourceRegistry)|originalTuple|normalizedTuple|source record|generated evidence|visible provenance|\w+Families\s*\[\d+\]/iu;
    const violations = sourceFiles(designSystemRoot)
      .filter((file) => forbidden.test(readFileSync(file, 'utf8')))
      .map((file) => relative(root, file));
    expect(violations).toEqual([]);
  });

  it('exposes one verification command without obsolete extraction scripts', () => {
    const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    expect(packageJson.scripts.verify).toBe(
      'npm run typecheck && npm run lint && npm test -- --runInBand && npm run storybook:web:smoke',
    );
    expect(Object.keys(packageJson.scripts)).not.toEqual(
      expect.arrayContaining(['design:inspect', 'design:refresh', 'validate:design-source']),
    );
  });
});
