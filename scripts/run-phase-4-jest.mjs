import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COMMAND = 'npm test -- --runInBand';
const RESULT_PATH = 'design-spec/phase-4-jest-results.json';
const FOCUSED_SUITES = Object.freeze([
  'tests/phase4-source-registry.test.ts',
  'tests/phase4-artwork.test.tsx',
  'tests/identity-status-progress-components.test.tsx',
  'tests/content-components.test.tsx',
  'tests/feedback-card-components.test.tsx',
  'tests/phase4-story-contracts.test.tsx',
]);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const countAssertions = (assertions) => {
  const counts = { total: assertions.length, passed: 0, failed: 0, pending: 0, todo: 0 };
  for (const assertion of assertions) {
    if (assertion.status === 'passed') counts.passed += 1;
    else if (assertion.status === 'failed') counts.failed += 1;
    else if (assertion.status === 'pending' || assertion.status === 'disabled') counts.pending += 1;
    else if (assertion.status === 'todo') counts.todo += 1;
    else throw new Error(`Unsupported Jest assertion status: ${assertion.status}`);
  }
  return counts;
};

const normalizePath = (repoRoot, absolutePath) => path.relative(repoRoot, absolutePath).split(path.sep).join('/');

function normalizeResult(repoRoot, rawResult) {
  assert(rawResult.success === true, 'Jest JSON did not report success');
  const byPath = new Map(rawResult.testResults.map((suite) => [normalizePath(repoRoot, suite.name), suite]));
  const focusedSuites = FOCUSED_SUITES.map((suitePath) => {
    const suite = byPath.get(suitePath);
    assert(suite, `Jest JSON is missing focused suite: ${suitePath}`);
    const tests = countAssertions(suite.assertionResults ?? []);
    assert(tests.total > 0 && tests.passed === tests.total, `Focused suite did not pass completely: ${suitePath}`);
    return { path: suitePath, success: true, tests };
  });

  return {
    schemaVersion: 1,
    command: COMMAND,
    success: true,
    suites: {
      total: rawResult.numTotalTestSuites,
      passed: rawResult.numPassedTestSuites,
      failed: rawResult.numFailedTestSuites,
      pending: rawResult.numPendingTestSuites,
      runtimeError: rawResult.numRuntimeErrorTestSuites,
    },
    tests: {
      total: rawResult.numTotalTests,
      passed: rawResult.numPassedTests,
      failed: rawResult.numFailedTests,
      pending: rawResult.numPendingTests,
      todo: rawResult.numTodoTests,
    },
    snapshots: {
      total: rawResult.snapshot?.total,
      matched: rawResult.snapshot?.matched,
      unmatched: rawResult.snapshot?.unmatched,
      updated: rawResult.snapshot?.updated,
      unchecked: rawResult.snapshot?.unchecked,
    },
    focusedSuites,
  };
}

function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'phase-4-jest-'));
  const rawResultPath = path.join(temporaryDirectory, 'jest-results.json');
  try {
    const run = process.platform === 'win32'
      ? spawnSync(
          process.env.ComSpec ?? 'cmd.exe',
          ['/d', '/s', '/c', `npm test -- --runInBand --json --outputFile="${rawResultPath}"`],
          { cwd: repoRoot, stdio: 'inherit' },
        )
      : spawnSync(
          'npm',
          ['test', '--', '--runInBand', '--json', `--outputFile=${rawResultPath}`],
          { cwd: repoRoot, stdio: 'inherit' },
        );
    if (run.error) throw run.error;
    if (run.status !== 0) {
      process.exitCode = run.status ?? 1;
      return;
    }

    const normalized = normalizeResult(repoRoot, JSON.parse(fs.readFileSync(rawResultPath, 'utf8')));
    const resultPath = path.join(repoRoot, RESULT_PATH);
    const stagedResultPath = `${resultPath}.tmp`;
    fs.writeFileSync(stagedResultPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
    fs.renameSync(stagedResultPath, resultPath);
    console.log(`Phase 4 Jest result published: ${normalized.suites.total} suites, ${normalized.tests.total} tests`);
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`Phase 4 Jest run failed: ${error.message}`);
  process.exitCode = 1;
}
