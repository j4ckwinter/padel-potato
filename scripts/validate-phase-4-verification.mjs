import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ARCHIVE_PATH = 'design-source/padel-potato UI Concepts.penpot';
const COMPONENT_EVIDENCE_PATH = 'design-spec/components/phase-4-components.json';
const ARTWORK_MANIFEST_PATH = 'design-spec/assets/phase-4/artwork-manifest.json';
const EDGE_LEDGER_PATH = 'design-spec/phase-4-edge-coverage.json';
const STORY_CONTRACT_PATH = 'src/design-system/stories/storyContract.ts';
const COPY_APPROVAL_PATH = '.planning/phases/04-identity-content-and-feedback-components/04-08-SUMMARY.md';

const FINAL_COMMANDS = Object.freeze([
  'npm run typecheck', 'npm run lint', 'npm test -- --runInBand',
  'npm run validate:design-source', 'node scripts/validate-phase-4-components.mjs',
  'node scripts/validate-phase-4-artwork.mjs',
  'node scripts/validate-phase-4-verification.mjs', 'npm run storybook:web:smoke',
]);

const FOCUSED_SUITES = Object.freeze([
  'tests/phase4-source-registry.test.ts', 'tests/phase4-artwork.test.tsx',
  'tests/identity-status-progress-components.test.tsx', 'tests/content-components.test.tsx',
  'tests/feedback-card-components.test.tsx', 'tests/phase4-story-contracts.test.tsx',
]);

const FAMILY_COUNTS = Object.freeze([
  ['Avatar', 5], ['Avatar Group', 5], ['Avatar Picker', 4], ['Status Chip', 7],
  ['Step Progress', 4], ['Player Item', 6], ['Game Card', 5], ['Notification Row', 6],
  ['Settings Row', 9], ['Stat Tile', 6], ['Score Result Block', 6],
  ['Player Preferences Card', 2], ['Banner Toast', 4], ['Empty State', 3],
  ['Illustrated Card', 4],
]);

const STORY_TITLES = Object.freeze([
  'Identity/Avatar', 'Identity/Avatar Group', 'Identity/Avatar Picker',
  'Status/Status Chip', 'Progress/Step Progress', 'Content/Player Item',
  'Content/Game Card', 'Content/Notification Row', 'Content/Settings Row',
  'Content/Stat Tile', 'Content/Score Result Block', 'Content/Player Preferences Card',
  'Feedback/Banner Toast', 'Feedback/Empty State', 'Cards/Illustrated Card',
]);

const TAXONOMY = Object.freeze(['Canonical', 'Variants', 'States', 'Boundaries', 'Interactive']);
const APPROVED_COPY = Object.freeze([
  'You don’t have any games scheduled yet.', 'Create game',
  'You’re all caught up. New updates will appear here.',
  'Invite friends to start building your padel group.', 'Invite players',
]);

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const required = (text, value, label = value) => assert(text.includes(value), `missing or stale ${label}`);
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const read = (repoRoot, relative) => fs.readFileSync(path.join(repoRoot, relative));
const readText = (repoRoot, relative) => read(repoRoot, relative).toString('utf8');
const fileHash = (repoRoot, relative) => sha256(read(repoRoot, relative));
const parseJson = (repoRoot, relative) => JSON.parse(readText(repoRoot, relative));
const dependencyFingerprint = (packageJson) => sha256(JSON.stringify({
  dependencies: packageJson.dependencies ?? {}, devDependencies: packageJson.devDependencies ?? {},
}));

const assertFile = (repoRoot, relative) => {
  const absolute = path.join(repoRoot, relative);
  assert(fs.existsSync(absolute) && fs.statSync(absolute).isFile(), `declared witness missing: ${relative}`);
};

export function validatePhase4Verification({ verification, validation, packageJson, repoRoot }) {
  const resolvedVerification = verification ?? readText(repoRoot, 'design-spec/phase-4-verification.md');
  const resolvedValidation = validation ?? readText(repoRoot, '.planning/phases/04-identity-content-and-feedback-components/04-VALIDATION.md');
  const resolvedPackageJson = packageJson ?? parseJson(repoRoot, 'package.json');
  const requiredFiles = [
    ARCHIVE_PATH, COMPONENT_EVIDENCE_PATH, ARTWORK_MANIFEST_PATH, EDGE_LEDGER_PATH,
    STORY_CONTRACT_PATH, COPY_APPROVAL_PATH, 'tests/types/phase4-component-contracts.typecheck.tsx',
    'scripts/validate-phase-4-components.mjs', 'scripts/validate-phase-4-artwork.mjs',
    'scripts/validate-phase-4-verification.mjs', ...FOCUSED_SUITES,
  ];
  for (const relative of requiredFiles) assertFile(repoRoot, relative);

  const componentEvidence = parseJson(repoRoot, COMPONENT_EVIDENCE_PATH);
  const edgeLedger = parseJson(repoRoot, EDGE_LEDGER_PATH);
  const storyContract = readText(repoRoot, STORY_CONTRACT_PATH);
  const copyApproval = readText(repoRoot, COPY_APPROVAL_PATH);

  assert(componentEvidence.source?.revision === 296, 'component evidence revision is not 296');
  assert(componentEvidence.familyCount === 15 && componentEvidence.families?.length === 15, 'component evidence must contain exactly 15 families');
  assert(componentEvidence.recordCount === 76, 'component evidence must contain exactly 76 records');
  assert(componentEvidence.families.reduce((total, family) => total + family.records.length, 0) === 76, 'component record inventory is incomplete');
  for (const [name, count] of FAMILY_COUNTS) {
    const family = componentEvidence.families.find((candidate) => candidate.name === name);
    assert(family?.records.length === count, `family coverage drifted: ${name}`);
    required(resolvedVerification, `| ${name} | ${count} |`, `${name} family result`);
  }

  assert(edgeLedger.source?.revision === 296 && edgeLedger.source?.expectedProbeCount === 47, 'edge ledger source metadata drifted');
  assert(edgeLedger.probes?.length === 47, 'edge ledger must contain exactly 47 probes');
  assert(new Set(edgeLedger.probes.map(({ id }) => id)).size === 47, 'edge ledger contains duplicate probe IDs');
  for (const probe of edgeLedger.probes) {
    assert(['resolved', 'backstop', 'flagged-assumption'].includes(probe.disposition), `unsupported edge disposition: ${probe.id}`);
    if (probe.disposition !== 'flagged-assumption') {
      assert(probe.checkPath, `edge probe is missing a check path: ${probe.id}`);
      assertFile(repoRoot, probe.checkPath);
    }
  }

  required(resolvedVerification, '# Phase 4 Verification');
  for (const value of ['revision 296', '15 families', '76 records', '47 edge probes', 'six Storybook groups', 'five-category taxonomy']) required(resolvedVerification, value);
  for (const title of STORY_TITLES) {
    required(storyContract, `'${title}'`, `${title} story contract`);
    required(resolvedVerification, `\`${title}\``, `${title} verification result`);
  }
  for (const category of TAXONOMY) {
    required(storyContract, category, `${category} story taxonomy`);
    required(resolvedVerification, `\`${category}\``, `${category} verification taxonomy`);
  }

  for (const approved of APPROVED_COPY) {
    required(copyApproval, approved, `approved Empty State copy: ${approved}`);
    required(resolvedVerification, approved, `copy provenance: ${approved}`);
  }
  required(copyApproval, 'approved all'); required(copyApproval, '2026-09-21');
  required(resolvedVerification, 'User reply `approved all` on 2026-09-21', 'copy approval identity');

  for (const [relative, label] of [
    [ARCHIVE_PATH, 'archive SHA-256'], [COMPONENT_EVIDENCE_PATH, 'component evidence SHA-256'],
    [ARTWORK_MANIFEST_PATH, 'artwork manifest SHA-256'], [EDGE_LEDGER_PATH, 'edge ledger SHA-256'],
    [STORY_CONTRACT_PATH, 'story contract SHA-256'],
  ]) required(resolvedVerification, fileHash(repoRoot, relative), label);
  required(resolvedVerification, dependencyFingerprint(resolvedPackageJson), 'dependency fingerprint');

  for (const command of FINAL_COMMANDS) {
    const row = new RegExp('\\\\| `' + escapeRegExp(command) + '` \\\\| pass \\\\| [^\\\\n|]+ \\\\|', 'u');
    assert(row.test(resolvedVerification), `missing, failed, or stale final witness: ${command}`);
  }
  assert((resolvedVerification.match(/\| pass \|/gu) ?? []).length >= FINAL_COMMANDS.length + FOCUSED_SUITES.length, 'verification is missing passing command or suite rows');
  assert(!/\b0\s+(?:tests?|suites?|records?|families?|probes?)\b/iu.test(resolvedVerification), 'zero-result evidence is not allowed');
  assert(!/\|\s*(?:fail|failed|pending|skipped|unknown)\s*\|/iu.test(resolvedVerification), 'non-passing evidence remains');
  for (const suite of FOCUSED_SUITES) {
    const row = new RegExp('\\\\| `' + escapeRegExp(suite) + '` \\\\| pass \\\\| [1-9][0-9]* tests? \\\\|', 'u');
    assert(row.test(resolvedVerification), `focused suite is missing or reports zero tests: ${suite}`);
  }

  for (const value of [
    'Status: `deferred-to-phase-5`', 'This record does not claim native acceptance',
    'iOS', 'Android', '200% native layout', 'native focus rendering', 'VoiceOver',
    'TalkBack', 'production exclusion', 'final catalogue audit',
  ]) required(resolvedVerification, value);
  assert(!/(?:native|ios|android|voiceover|talkback)[^\n]{0,100}(?:pass(?:ed)?|verified|approved|complete)/iu.test(resolvedVerification), 'verification contains unsupported native-pass language');

  required(resolvedValidation, 'status: complete'); required(resolvedValidation, 'nyquist_compliant: true'); required(resolvedValidation, 'wave_0_complete: true');
  assert(!/\b(?:TBD|pending)\b/iu.test(resolvedValidation), 'validation still contains stale or pending status');
  assert(!resolvedValidation.includes('- [ ]'), 'validation still contains unchecked sign-off items');
  for (const suite of FOCUSED_SUITES) required(resolvedValidation, suite);
  required(resolvedValidation, 'tests/types/phase4-component-contracts.typecheck.tsx');
  required(resolvedValidation, 'scripts/validate-phase-4-verification.mjs');
  required(resolvedValidation, '47/47 edge probes'); required(resolvedValidation, 'Phase 5');

  const scripts = resolvedPackageJson.scripts ?? {};
  assert(scripts['validate:phase4-verification'] === 'node scripts/validate-phase-4-verification.mjs', 'validate:phase4-verification script is missing or stale');
  for (const fragment of ['typecheck', 'lint', 'test -- --runInBand', 'validate:design-source', 'validate-phase-4-components.mjs', 'validate-phase-4-artwork.mjs', 'validate:phase4-verification', 'storybook:web:smoke']) {
    assert(scripts['verify:phase4']?.includes(fragment), `verify:phase4 omits ${fragment}`);
  }
  return { edgeCount: 47, familyCount: 15, nativeStatus: 'deferred-to-phase-5', recordCount: 76, witnessCount: FINAL_COMMANDS.length };
}

function writeFixture(repoRoot, relative, contents = '') {
  const absolute = path.join(repoRoot, relative); fs.mkdirSync(path.dirname(absolute), { recursive: true }); fs.writeFileSync(absolute, contents);
}

function makeJestResultFixture() {
  return {
    schemaVersion: 1,
    command: 'npm test -- --runInBand',
    success: true,
    suites: { total: 24, passed: 24, failed: 0, pending: 0, runtimeError: 0 },
    tests: { total: 21, passed: 21, failed: 0, pending: 0, todo: 0 },
    snapshots: { total: 0, matched: 0, unmatched: 0, updated: 0, unchecked: 0 },
    focusedSuites: FOCUSED_SUITES.map((suite, index) => ({
      path: suite,
      tests: { total: index + 1, passed: index + 1, failed: 0, pending: 0, todo: 0 },
    })),
  };
}

function makeValidationFixture(jestResult) {
  const suiteRows = jestResult.focusedSuites.map(({ path: suite, tests }) => `${suite} â€” ${tests.total} tests`).join('\n');
  return `---\nstatus: complete\nnyquist_compliant: true\nwave_0_complete: true\n---\nFinal result | ${jestResult.suites.total} suites, ${jestResult.tests.total} tests, zero snapshots\n${suiteRows}\ntests/types/phase4-component-contracts.typecheck.tsx\nscripts/validate-phase-4-verification.mjs\n47/47 edge probes\nPhase 5 native acceptance deferral\n- [x] complete\n`;
}

function makeVerificationFixture(repoRoot, packageJson, jestResult) {
  const familyRows = FAMILY_COUNTS.map(([name, count]) => `| ${name} | ${count} | pass |`).join('\n');
  const titleRows = STORY_TITLES.map((title) => `- \`${title}\``).join('\n');
  const commandRows = FINAL_COMMANDS.map((command) => `| \`${command}\` | pass | ${command === jestResult.command ? `${jestResult.suites.total} suites, ${jestResult.tests.total} tests, zero snapshots.` : '1 non-zero result'} |`).join('\n');
  const suiteRows = jestResult.focusedSuites.map(({ path: suite, tests }) => `| \`${suite}\` | pass | ${tests.total} tests |`).join('\n');
  return `# Phase 4 Verification\nrevision 296; 15 families; 76 records; 47 edge probes; six Storybook groups; five-category taxonomy\n${familyRows}\n${titleRows}\n${TAXONOMY.map((category) => `\`${category}\``).join(' ')}\nUser reply \`approved all\` on 2026-09-21\n${APPROVED_COPY.join('\n')}\nArchive SHA-256: ${fileHash(repoRoot, ARCHIVE_PATH)}\nComponent evidence SHA-256: ${fileHash(repoRoot, COMPONENT_EVIDENCE_PATH)}\nArtwork manifest SHA-256: ${fileHash(repoRoot, ARTWORK_MANIFEST_PATH)}\nEdge ledger SHA-256: ${fileHash(repoRoot, EDGE_LEDGER_PATH)}\nStory contract SHA-256: ${fileHash(repoRoot, STORY_CONTRACT_PATH)}\nDependency fingerprint: ${dependencyFingerprint(packageJson)}\n| Command | Result | Evidence |\n|---|---|---|\n${commandRows}\n| Suite | Result | Evidence |\n|---|---|---|\n${suiteRows}\nStatus: \`deferred-to-phase-5\`\nThis record does not claim native acceptance. Phase 5 owns iOS, Android, 200% native layout, native focus rendering, VoiceOver, TalkBack, production exclusion, and final catalogue audit.\n`;
}

function createSelfTestFixture(sourceRoot) {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'phase4-verification-'));
  for (const relative of [COMPONENT_EVIDENCE_PATH, ARTWORK_MANIFEST_PATH, EDGE_LEDGER_PATH, STORY_CONTRACT_PATH, COPY_APPROVAL_PATH]) writeFixture(repoRoot, relative, read(sourceRoot, relative));
  writeFixture(repoRoot, ARCHIVE_PATH, 'revision 296 isolated archive fixture');
  for (const relative of ['tests/types/phase4-component-contracts.typecheck.tsx', 'scripts/validate-phase-4-components.mjs', 'scripts/validate-phase-4-artwork.mjs', 'scripts/validate-phase-4-verification.mjs', ...FOCUSED_SUITES]) writeFixture(repoRoot, relative, `fixture: ${relative}\n`);
  const packageJson = { scripts: {
    'validate:phase4-verification': 'node scripts/validate-phase-4-verification.mjs',
    'verify:phase4': 'npm run typecheck && npm run lint && npm test -- --runInBand && npm run validate:design-source && node scripts/validate-phase-4-components.mjs && node scripts/validate-phase-4-artwork.mjs && npm run validate:phase4-verification && npm run storybook:web:smoke',
  }, dependencies: { react: '19.2.3' }, devDependencies: { jest: '29.7.0' } };
  const jestResult = makeJestResultFixture();
  return {
    jestResult,
    packageJson,
    repoRoot,
    validation: makeValidationFixture(jestResult),
    verification: makeVerificationFixture(repoRoot, packageJson, jestResult),
  };
}

function runSelfTest(sourceRoot) {
  const fixture = createSelfTestFixture(sourceRoot);
  const mutations = [
    ['missing witness', (copy) => fs.rmSync(path.join(copy.repoRoot, FOCUSED_SUITES[0]))],
    ['zero tests', (copy) => { copy.verification = copy.verification.replace('`tests/phase4-source-registry.test.ts` | pass | 1 tests', '`tests/phase4-source-registry.test.ts` | pass | 0 tests'); }],
    ['failed command', (copy) => { copy.verification = copy.verification.replace('| pass | 1 non-zero result |', '| failed | command exited 1 |'); }],
    ['stale witness', (copy) => { copy.validation = copy.validation.replace(FOCUSED_SUITES[1], 'tests/phase4-artwork-old.test.tsx'); }],
    ['premature completion', (copy) => { copy.verification = copy.verification.replace('| pass | 1 non-zero result |', '| pending | not run |'); }],
    ['native overclaim', (copy) => { copy.verification += '\niOS native verified and passed.\n'; }],
    ['incomplete taxonomy', (copy) => { copy.verification = copy.verification.replace('`Interactive`', '`Interaction`'); }],
    ['pending copy approval', (copy) => { copy.verification = copy.verification.replace('User reply `approved all` on 2026-09-21', 'Copy approval pending'); }],
    ['positive overall count drift', (copy) => { copy.verification = copy.verification.replace('24 suites, 21 tests', '24 suites, 22 tests'); }],
    ['positive focused-suite count drift', (copy) => { copy.verification = copy.verification.replace('`tests/phase4-source-registry.test.ts` | pass | 1 tests', '`tests/phase4-source-registry.test.ts` | pass | 2 tests'); }],
  ];
  try {
    validatePhase4Verification(fixture);
    for (const [name, mutate] of mutations) {
      const copy = { ...fixture }; mutate(copy); let rejected = false;
      try { validatePhase4Verification(copy); } catch { rejected = true; }
      assert(rejected, `self-test mutation was accepted: ${name}`);
      if (name === 'missing witness') writeFixture(fixture.repoRoot, FOCUSED_SUITES[0], 'restored fixture\n');
    }
  } finally { fs.rmSync(fixture.repoRoot, { recursive: true, force: true }); }
  return mutations.length;
}

function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  if (process.argv.includes('--self-test')) {
    const mutationCount = runSelfTest(repoRoot);
    console.log(`Phase 4 verification self-test passed: ${mutationCount} controlled mutations rejected`); return;
  }
  const result = validatePhase4Verification({ repoRoot });
  console.log(`Phase 4 verification valid: ${result.witnessCount} final witnesses, ${result.familyCount} families, ${result.recordCount} records, ${result.edgeCount} edge probes; native status ${result.nativeStatus}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`Phase 4 verification validation failed: ${error.message}`); process.exitCode = 1; }
}
