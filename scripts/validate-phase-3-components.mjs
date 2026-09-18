import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  EVIDENCE_PATH,
  FAMILY_SOURCES,
  PAGE_ID,
  REGISTRY_PATH,
  REVISION,
  generatePhase3Outputs,
} from './extract-phase-3-components.mjs';
import { EXPECTED_FILE_ID, parseZip } from './penpot-source.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

function payloadHash(evidence) {
  const { contentSha256: _contentSha256, ...payload } = evidence;
  return sha256(JSON.stringify(payload));
}

function withinRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function assertFixedEvidencePath(root, candidate) {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(resolvedRoot, candidate);
  const expected = path.resolve(resolvedRoot, EVIDENCE_PATH);
  assert(withinRoot(resolvedRoot, resolvedCandidate), `unsafe evidence path escapes the repository root: ${candidate}`);
  assert(resolvedCandidate === expected, `unsafe evidence path differs from the fixed Phase 3 evidence path: ${candidate}`);
  return resolvedCandidate;
}

function assertPlainObject(value, label) {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object`);
}

function validateInventory(evidence, expected) {
  assert(evidence.schemaVersion === 1, `evidence schema version differs: ${evidence.schemaVersion}`);
  assertPlainObject(evidence.source, 'evidence source');
  assert(evidence.source.fileId === EXPECTED_FILE_ID, `evidence file identity differs: ${evidence.source.fileId}`);
  assert(evidence.source.pageId === PAGE_ID, `evidence page identity differs: ${evidence.source.pageId}`);
  assert(evidence.source.revision === REVISION, `evidence revision differs: ${evidence.source.revision}`);
  assert(evidence.source.canonicalPath === 'design-source/padel-potato UI Concepts.penpot', `unsafe or unexpected canonical source path: ${evidence.source.canonicalPath}`);
  const sourcePath = path.resolve(repoRoot, evidence.source.canonicalPath);
  assert(withinRoot(repoRoot, sourcePath), `canonical source path escapes repository root: ${evidence.source.canonicalPath}`);
  assert(evidence.source.archiveSha256 === expected.source.archiveSha256, 'canonical archive hash differs');
  assert(evidence.familyCount === 13, `family count differs: ${evidence.familyCount}`);
  assert(evidence.recordCount === 75, `record count differs: ${evidence.recordCount}`);
  assert(Array.isArray(evidence.families) && evidence.families.length === 13, 'family inventory must contain exactly 13 entries');

  const allRecordIds = [];
  for (let familyIndex = 0; familyIndex < FAMILY_SOURCES.length; familyIndex += 1) {
    const source = FAMILY_SOURCES[familyIndex];
    const family = evidence.families[familyIndex];
    const expectedFamily = expected.families[familyIndex];
    assertPlainObject(family, `family ${familyIndex}`);
    assert(family.key === source.key && family.name === source.name, `family order/name differs at index ${familyIndex}`);
    assert(family.sourceId === source.sourceId, `family source ID differs for ${source.name}`);
    assert(family.kind === source.kind, `family kind differs for ${source.name}`);
    assert(family.recordCount === source.count, `family record count differs for ${source.name}`);
    assert(Array.isArray(family.records) && family.records.length === source.count, `family record inventory differs for ${source.name}`);
    for (let recordIndex = 0; recordIndex < family.records.length; recordIndex += 1) {
      const record = family.records[recordIndex];
      const expectedRecord = expectedFamily.records[recordIndex];
      assertPlainObject(record, `${source.name} record ${recordIndex}`);
      assert(record.id === expectedRecord.id, `${source.name} record order/ID differs at index ${recordIndex}`);
      assert(UUID_PATTERN.test(record.id) && UUID_PATTERN.test(record.mainInstanceId), `${source.name} contains an abbreviated or invalid UUID`);
      assert(record.sourceIndex === recordIndex, `${source.name} sourceIndex differs at index ${recordIndex}`);
      assert(record.active === true, `deleted/inactive record is not allowed: ${record.id}`);
      assert(JSON.stringify(record.originalTuple) === JSON.stringify(expectedRecord.originalTuple), `original tuple differs for ${record.id}`);
      assert(JSON.stringify(record.normalizedTuple) === JSON.stringify(expectedRecord.normalizedTuple), `unapproved normalized tuple differs for ${record.id}`);
      assert(JSON.stringify(record.metrics) === JSON.stringify(expectedRecord.metrics), `component metrics differ for ${record.id}`);
      allRecordIds.push(record.id);
    }
  }
  assert(allRecordIds.length === 75 && new Set(allRecordIds).size === 75, 'record IDs must be exactly 75 unique full UUIDs');
  assert(JSON.stringify(evidence.normalizationPolicy) === JSON.stringify(expected.normalizationPolicy), 'normalization policy differs');
}

export function validatePhase3Evidence({
  evidence,
  evidenceText,
  root = repoRoot,
  requireByteIdentity = true,
} = {}) {
  assertPlainObject(evidence, 'Phase 3 evidence');
  const generated = generatePhase3Outputs({ root });
  validateInventory(evidence, generated.evidence);
  assert(typeof evidence.contentSha256 === 'string' && /^[0-9a-f]{64}$/u.test(evidence.contentSha256), 'evidence content hash is invalid');
  assert(evidence.contentSha256 === payloadHash(evidence), 'evidence content hash differs from its payload');
  assert(evidence.contentSha256 === generated.evidence.contentSha256, 'evidence content hash differs from deterministic regeneration');
  if (requireByteIdentity) {
    assert(evidenceText === generated.evidenceText, 'committed evidence differs byte-for-byte from deterministic regeneration');
    const registryText = fs.readFileSync(path.join(root, REGISTRY_PATH), 'utf8');
    assert(registryText === generated.registryText, 'runtime registry differs byte-for-byte from deterministic regeneration');
  }
  return evidence;
}

function rehash(evidence) {
  evidence.contentSha256 = payloadHash(evidence);
}

export function expectEvidenceRejection(sourceEvidence, mutate, pattern = /./u) {
  const copy = structuredClone(sourceEvidence);
  mutate(copy);
  rehash(copy);
  let message = '';
  try {
    validatePhase3Evidence({
      evidence: copy,
      evidenceText: `${JSON.stringify(copy, null, 2)}\n`,
      requireByteIdentity: false,
    });
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assert(message && pattern.test(message), `controlled evidence rejection did not fail as expected: ${message || 'no error'}`);
}

function runSelfTests(expected) {
  expectEvidenceRejection(expected, (copy) => { copy.source.fileId = '00000000-0000-0000-0000-000000000000'; }, /file identity/u);
  expectEvidenceRejection(expected, (copy) => { copy.source.pageId = '../outside'; }, /page identity/u);
  expectEvidenceRejection(expected, (copy) => { copy.source.revision = 295; }, /revision/u);
  expectEvidenceRejection(expected, (copy) => { copy.source.canonicalPath = '../outside.penpot'; }, /canonical source path/u);
  expectEvidenceRejection(expected, (copy) => { copy.families[0].sourceId = copy.families[1].sourceId; }, /family source ID/u);
  expectEvidenceRejection(expected, (copy) => { copy.families[0].records.pop(); }, /record inventory/u);
  expectEvidenceRejection(expected, (copy) => { copy.families[0].records.push(structuredClone(copy.families[0].records[0])); }, /record inventory/u);
  expectEvidenceRejection(expected, (copy) => { copy.families[0].records[1].id = copy.families[0].records[0].id; }, /record order\/ID/u);
  expectEvidenceRejection(expected, (copy) => { copy.families[0].records.reverse(); }, /record order\/ID|sourceIndex/u);
  expectEvidenceRejection(expected, (copy) => { copy.families[0].records[0].active = false; }, /deleted\/inactive/u);
  expectEvidenceRejection(expected, (copy) => { copy.families[0].records[0].normalizedTuple.style = 'secondary'; }, /normalized tuple/u);
  expectEvidenceRejection(expected, (copy) => { copy.families[2].records[0].normalizedTuple = { property1: 'selected' }; }, /normalized tuple/u);

  const badHash = structuredClone(expected);
  badHash.contentSha256 = '0'.repeat(64);
  let hashRejected = false;
  try {
    validatePhase3Evidence({ evidence: badHash, requireByteIdentity: false });
  } catch (error) {
    hashRejected = /content hash/u.test(error instanceof Error ? error.message : String(error));
  }
  assert(hashRejected, 'controlled evidence hash drift was not rejected');

  let pathRejected = false;
  try {
    assertFixedEvidencePath(repoRoot, '../phase-3-components.json');
  } catch (error) {
    pathRejected = /unsafe evidence path/u.test(error instanceof Error ? error.message : String(error));
  }
  assert(pathRejected, 'controlled unsafe evidence path was not rejected');

  const archiveBytes = fs.readFileSync(path.join(repoRoot, 'design-source', 'padel-potato UI Concepts.penpot'));
  let boundsRejected = false;
  try {
    parseZip(archiveBytes, { maxArchiveBytes: 1 });
  } catch (error) {
    boundsRejected = /archive size exceeds/u.test(error instanceof Error ? error.message : String(error));
  }
  assert(boundsRejected, 'controlled oversized archive was not rejected');
}

function main() {
  const args = process.argv.slice(2);
  const suppliedIndex = args.indexOf('--evidence');
  if (suppliedIndex >= 0) {
    assert(args[suppliedIndex + 1], '--evidence requires a path');
    assertFixedEvidencePath(repoRoot, args[suppliedIndex + 1]);
  }
  const evidenceFile = assertFixedEvidencePath(repoRoot, EVIDENCE_PATH);
  const evidenceText = fs.readFileSync(evidenceFile, 'utf8');
  let evidence;
  try {
    evidence = JSON.parse(evidenceText);
  } catch (error) {
    throw new Error(`Phase 3 evidence is invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  validatePhase3Evidence({ evidence, evidenceText });
  if (args.includes('--self-test')) runSelfTests(evidence);
  console.log(`Phase 3 evidence valid: revision ${REVISION}, 13 families, 75 active records${args.includes('--self-test') ? '; controlled rejections passed' : ''}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`Phase 3 component validation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
