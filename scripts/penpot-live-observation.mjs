import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const OBSERVATION_PATH = 'design-spec/assets/penpot-live-observation.json';
const SUMMARY_PATH = '.planning/phases/02-primitives-assets-and-component-contracts/02-01-SUMMARY.md';
const FILE_ID = 'c514c1fb-1cda-8125-8008-a606253a77a3';
const PAGE_ID = '482a7222-5a3b-8086-8008-a6073072bbb1';
const REVISION = 292;
const OBSERVED_AT = '2026-09-18T14:36:23+01:00';
const EXTRACTION_COMMIT = '6c3268454f95087ab852c381daa82afb80c1a22b';

const assert = (ok, message) => { if (!ok) throw new Error(message); };
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

export function validateLiveObservation({ observation, observationBytes, repoRoot, expectedSources }) {
  assert(observation?.schemaVersion === 1, 'live observation schemaVersion must be 1');
  assert(observation.fileId === FILE_ID, 'live observation file identity changed');
  assert(observation.pageId === PAGE_ID, 'live observation page identity changed');
  assert(observation.pageName === '02 Components', 'live observation page name changed');
  assert(observation.revision === REVISION, 'live observation revision changed');
  assert(observation.sourceTool === 'Penpot MCP Plugin API 2.18.0', 'live observation source tool changed');
  assert(observation.observedAt === OBSERVED_AT && !Number.isNaN(Date.parse(observation.observedAt)), 'live observation timestamp changed or is invalid');
  assert(observation.timestampBasis?.path === SUMMARY_PATH, 'live observation timestamp source path changed');
  assert(observation.timestampBasis?.field === 'Performance.Completed', 'live observation timestamp source field changed');
  assert(observation.timestampBasis?.commit === EXTRACTION_COMMIT, 'live observation extraction commit changed');
  const summary = fs.readFileSync(path.join(repoRoot, SUMMARY_PATH), 'utf8');
  assert(summary.includes(`**Completed:** ${OBSERVED_AT}`), 'committed execution summary does not support observation timestamp');
  assert(summary.includes(`\`${EXTRACTION_COMMIT.slice(0, 7)}\``), 'committed execution summary does not identify extraction commit');
  assert(Array.isArray(observation.sources), 'live observation sources must be an array');
  assert(JSON.stringify(observation.sources) === JSON.stringify(expectedSources), 'live observation source identities changed');
  return { observedAt: observation.observedAt, path: OBSERVATION_PATH, sha256: sha256(observationBytes) };
}

export function loadValidatedObservation({ repoRoot, expectedSources }) {
  const absolutePath = path.join(repoRoot, OBSERVATION_PATH);
  const observationBytes = fs.readFileSync(absolutePath);
  const observation = JSON.parse(observationBytes.toString('utf8'));
  return validateLiveObservation({ observation, observationBytes, repoRoot, expectedSources });
}
