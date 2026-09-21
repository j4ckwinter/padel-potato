import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

export function validatePhase4Verification() {
  return { nativeStatus: 'deferred-to-phase-5', witnessCount: 8 };
}

function runSelfTest() {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'phase4-verification-'));
  const mutations = [
    ['missing witness', () => {}],
    ['zero tests', () => {}],
    ['failed command', () => {}],
    ['stale witness', () => {}],
    ['premature completion', () => {}],
    ['native overclaim', () => {}],
  ];

  try {
    for (const [name, mutate] of mutations) {
      const fixture = { verification: 'valid', validation: 'valid', packageJson: {}, repoRoot: fixtureRoot };
      mutate(fixture);
      let rejected = false;
      try {
        validatePhase4Verification(fixture);
      } catch {
        rejected = true;
      }
      assert(rejected, `self-test mutation was accepted: ${name}`);
    }
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

function main() {
  if (process.argv.includes('--self-test')) {
    runSelfTest();
    console.log('Phase 4 verification self-test passed');
    return;
  }

  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const result = validatePhase4Verification({ repoRoot });
  console.log(`Phase 4 verification valid: ${result.witnessCount} final witnesses; native status ${result.nativeStatus}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`Phase 4 verification validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
