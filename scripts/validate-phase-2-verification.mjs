import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VERIFICATION_PATH = 'design-spec/phase-2-verification.md';
const ALLOWED_NATIVE_STATUSES = new Set(['deferred-to-phase-5', 'device-evidence']);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function parseNativeEvidenceTable(markdown) {
  const section = markdown.match(/## Native Device Evidence\s+([\s\S]*?)(?=\n## |$)/u)?.[1];
  assert(section, 'device-evidence status requires a Native Device Evidence section');
  const rows = section.split(/\r?\n/u)
    .filter((line) => /^\|/u.test(line.trim()))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length === 5 && !/^[-: ]+$/u.test(cells[0]));
  assert(rows.length >= 3, 'native evidence table must include a header plus iOS and Android rows');
  assert(JSON.stringify(rows[0].map((cell) => cell.toLowerCase())) === JSON.stringify(['platform', 'device', 'os version', 'tested at', 'evidence']), 'native evidence table header is invalid');
  const evidenceRows = rows.slice(1);
  assert(evidenceRows.length === 2, 'native evidence table must contain exactly iOS and Android rows');
  assert(JSON.stringify(evidenceRows.map((row) => row[0].toLowerCase()).sort()) === JSON.stringify(['android', 'ios']), 'native evidence must cover iOS and Android');
  return evidenceRows;
}

function validateEvidencePath(repoRoot, relativePath) {
  assert(relativePath && !path.isAbsolute(relativePath), 'native evidence path must be repository-relative');
  assert(!relativePath.split(/[\\/]/u).includes('..'), 'native evidence path must not traverse directories');
  const evidenceRoot = path.resolve(repoRoot, 'design-spec/references/native');
  const resolved = path.resolve(repoRoot, relativePath);
  const relative = path.relative(evidenceRoot, resolved);
  assert(relative && !relative.startsWith('..') && !path.isAbsolute(relative), 'native evidence path must stay within design-spec/references/native');
  assert(fs.statSync(resolved).isFile(), `native evidence file does not exist: ${relativePath}`);
}

export function validatePhase2Verification({ markdown, repoRoot }) {
  assert(markdown.startsWith('# Phase 2 Verification\n'), 'verification title is missing');
  assert(markdown.includes('- Preserved accessible name: `Long-content action`'), 'long-content accessible name is stale or missing');
  assert(markdown.includes('that the `Long-content action` remains reachable'), 'native checklist long-content action is stale or missing');
  assert(!markdown.includes('Preserved accessible name: `Activate example`'), 'interactive-only CTA leaked into boundary evidence');
  const status = markdown.match(/^- Native 200% text and assistive-technology spot-check: \*\*([^*]+)\*\*$/mu)?.[1];
  assert(status && ALLOWED_NATIVE_STATUSES.has(status), 'native verification status must be device-evidence or deferred-to-phase-5');

  const unsupportedClaim = /(?:native|ios|android|voiceover|talkback)[^\n]{0,80}(?:\*\*)?(?:pass(?:ed)?|verified|approved|complete)(?:\*\*)?/iu;
  if (status === 'deferred-to-phase-5') {
    assert(markdown.includes('Status: `deferred-to-phase-5`'), 'deferred native status marker is missing');
    assert(markdown.includes('This record does not claim iOS or Android layout'), 'native deferral disclaimer is missing');
    assert(!unsupportedClaim.test(markdown), 'verification contains unsupported native-pass language');
  } else {
    const rows = parseNativeEvidenceTable(markdown);
    for (const [platform, device, osVersion, testedAt, evidencePath] of rows) {
      assert(device.length >= 3, `${platform} device identity is missing`);
      assert(osVersion.length >= 2, `${platform} OS version is missing`);
      assert(!Number.isNaN(Date.parse(testedAt)) && /(?:Z|[+-]\d{2}:\d{2})$/u.test(testedAt), `${platform} tested-at timestamp is invalid`);
      validateEvidencePath(repoRoot, evidencePath.replaceAll('`', ''));
    }
  }
  return { nativeStatus: status };
}

function expectFailure(label, markdown, repoRoot) {
  let error;
  try { validatePhase2Verification({ markdown, repoRoot }); } catch (caught) { error = caught; }
  assert(error, `controlled verification rejection did not fail: ${label}`);
}

function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const markdown = fs.readFileSync(path.join(repoRoot, VERIFICATION_PATH), 'utf8');
  const result = validatePhase2Verification({ markdown, repoRoot });
  expectFailure('unsupported status', markdown.replace('**deferred-to-phase-5**', '**pass**'), repoRoot);
  expectFailure('unsupported native pass claim', `${markdown}\nNative iOS verification passed.\n`, repoRoot);
  expectFailure('unsubstantiated device evidence', markdown.replaceAll('deferred-to-phase-5', 'device-evidence'), repoRoot);
  console.log(`Phase 2 verification valid: native status ${result.nativeStatus}; controlled rejections passed`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`Phase 2 verification validation failed: ${error.message}`); process.exitCode = 1; }
}
