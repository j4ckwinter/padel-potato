import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const required = (text, value, label = value) => assert(text.includes(value), `missing or stale ${label}`);

export function validatePhase3Verification({ verification, validation, packageJson, repoRoot }) {
  required(verification, '# Phase 3 Verification');
  for (const value of [
    'revision 296', '13 families', '75 records', 'Canonical', 'Variants', 'States',
    'Boundaries', 'Interactive', 'Expo web', 'secondary host evidence only',
    'Status: `deferred-to-phase-5`', 'iOS', 'Android', '200% font scale',
    'VoiceOver', 'TalkBack', 'This record does not claim native acceptance',
  ]) required(verification, value);
  assert(!/(?:native|ios|android|voiceover|talkback)[^\n]{0,80}(?:pass(?:ed)?|verified|approved|complete)/iu.test(verification), 'verification contains unsupported native-pass language');

  for (const command of [
    'npm run typecheck', 'npm run lint', 'npm test -- --runInBand',
    'npm run validate:design-source', 'node scripts/validate-phase-3-components.mjs',
    'node scripts/validate-phase-3-artwork.mjs',
    'node scripts/validate-phase-3-verification.mjs', 'npm run storybook:web:smoke',
  ]) required(verification, `\`${command}\``);
  assert((verification.match(/\| pass \|/gu) ?? []).length >= 8, 'verification must contain passing witnesses for every final command');
  required(verification, 'c0559548f953bc175be160b30f4769ede1167d05ef1677f6f1422ecdac2a1562', 'archive SHA-256');
  required(verification, '09519cb730349f2b2edf98079521085b5e6403df22766855055a405b7b7541a2', 'source evidence SHA-256');

  required(validation, 'status: complete');
  required(validation, 'nyquist_compliant: true');
  required(validation, 'wave_0_complete: true');
  required(validation, 'tests/form-components.test.tsx');
  required(validation, 'tests/authentication-components.test.tsx');
  assert(!validation.includes('tests/form-auth-components.test.tsx'), 'stale combined form/auth suite remains');
  assert(!validation.includes('pending'), 'validation still contains pending status');
  assert(!validation.includes('- [ ]'), 'validation still contains unchecked sign-off items');

  const scripts = packageJson.scripts ?? {};
  assert(scripts['validate:phase3-verification'] === 'node scripts/validate-phase-3-verification.mjs', 'validation script is missing or stale');
  for (const command of ['typecheck', 'lint', 'test -- --runInBand', 'validate:design-source', 'validate-phase-3-components.mjs', 'validate-phase-3-artwork.mjs', 'validate:phase3-verification', 'storybook:web:smoke']) {
    assert(scripts['verify:phase3']?.includes(command), `verify:phase3 omits ${command}`);
  }
  for (const relative of ['tests/form-components.test.tsx', 'tests/authentication-components.test.tsx', 'tests/phase3-story-contracts.test.tsx']) {
    assert(fs.statSync(path.join(repoRoot, relative)).isFile(), `declared witness missing: ${relative}`);
  }
  return { nativeStatus: 'deferred-to-phase-5', witnessCount: 8 };
}

function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');
  const result = validatePhase3Verification({
    verification: read('design-spec/phase-3-verification.md'),
    validation: read('.planning/phases/03-actions-forms-and-navigation-components/03-VALIDATION.md'),
    packageJson: JSON.parse(read('package.json')),
    repoRoot,
  });
  console.log(`Phase 3 verification valid: ${result.witnessCount} final witnesses; native status ${result.nativeStatus}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`Phase 3 verification validation failed: ${error.message}`); process.exitCode = 1; }
}
