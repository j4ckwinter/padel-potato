import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CANONICAL_ARCHIVE_PATH, EXPECTED_FILE_ID, buildSourceIndex, parseZip } from './penpot-source.mjs';

export const REVISION = 296;
export const PAGE_ID = '482a7222-5a3b-8086-8008-a6073072bbb1';
export const OUTPUT_ROOT = 'design-spec/assets/phase-4';
export const MANIFEST_OUTPUT = 'artwork-manifest.json';

export const MEDIA_SOURCES = Object.freeze([
  Object.freeze({ key: 'noGames', path: `${OUTPUT_ROOT}/mascot-no-games.webp`, output: 'mascot-no-games.webp', disposition: 'phase4-extracted', mediaRecordId: 'c514c1fb-1cda-8125-8008-a60625a0cf2e', mediaId: 'c1d0e80c-1ff2-4c61-bc50-147e55d46615', mediaName: '53e3909aa121191b9613bc35d219051c62b07c20' }),
  Object.freeze({ key: 'wave', path: 'design-spec/assets/phase-3/mascot-wave.webp', disposition: 'phase3-reused', mediaRecordId: 'c514c1fb-1cda-8125-8008-a60625a0cf34', mediaId: 'b182ba2e-059e-48a6-82c3-f838818775a0', mediaName: 'e702fd124798d19abe908d7061bfb733ca665d58' }),
  Object.freeze({ key: 'search', path: 'design-spec/assets/phase-3/mascot-search.webp', disposition: 'phase3-reused', mediaRecordId: 'c514c1fb-1cda-8125-8008-a60625a0cf31', mediaId: 'a8b806ba-2ae5-4ccb-ae49-8f81d87534fe', mediaName: 'e445ec0d563359b642ce256643c1259fc89efe67' }),
  Object.freeze({ key: 'matchResult', path: `${OUTPUT_ROOT}/mascot-match-result.webp`, output: 'mascot-match-result.webp', disposition: 'phase4-extracted', mediaRecordId: 'c514c1fb-1cda-8125-8008-a60625a0cf30', mediaId: '0d5c2b58-10a6-4c5d-b194-9403f9423041', mediaName: '8dd5e7febb360b53ef4ef40b12a92ed6659bfb89' }),
  Object.freeze({ key: 'profile', path: 'design-spec/assets/phase-3/mascot-profile.webp', disposition: 'phase3-reused', mediaRecordId: 'c514c1fb-1cda-8125-8008-a60625a0cf33', mediaId: '3b4c67c1-ffea-4516-a8bf-ee5656e09ecd', mediaName: '0dea1183f8acc0519dfd0c099082030a130a5b41' }),
  Object.freeze({ key: 'gameCreated', path: `${OUTPUT_ROOT}/mascot-game-created.webp`, output: 'mascot-game-created.webp', disposition: 'phase4-extracted', mediaRecordId: 'c514c1fb-1cda-8125-8008-a60625a0cf32', mediaId: '190a6350-41fd-4120-9e43-c8998be2e66f', mediaName: '518415f5bed5f66da6e2d743f26b0c7e52c29280' }),
]);

export const NEW_MEDIA_SOURCES = Object.freeze(MEDIA_SOURCES.filter((source) => source.disposition === 'phase4-extracted'));

export const PLACEMENTS = Object.freeze([
  Object.freeze({ key: 'emptyStateNoGames', family: 'Empty State', propertyName: 'Content', propertyValue: 'No games', state: 'With action', renderSize: 96, media: 'noGames', componentId: '482a7222-5a3b-8086-8008-a61014763913', mainInstanceId: '482a7222-5a3b-8086-8008-a61013db2f5b', imageShapeId: '482a7222-5a3b-8086-8008-a617cde8d1d2' }),
  Object.freeze({ key: 'emptyStateNoNotifications', family: 'Empty State', propertyName: 'Content', propertyValue: 'No notifications', state: 'No action', renderSize: 96, media: 'wave', componentId: '482a7222-5a3b-8086-8008-a61014f19a5e', mainInstanceId: '482a7222-5a3b-8086-8008-a610147f696e', imageShapeId: '482a7222-5a3b-8086-8008-a617ce034385' }),
  Object.freeze({ key: 'emptyStateNoPlayers', family: 'Empty State', propertyName: 'Content', propertyValue: 'No players', state: 'With action', renderSize: 96, media: 'search', componentId: '482a7222-5a3b-8086-8008-a6101594d030', mainInstanceId: '482a7222-5a3b-8086-8008-a61014fab5fa', imageShapeId: '482a7222-5a3b-8086-8008-a617ce1c6004' }),
  Object.freeze({ key: 'illustratedCardNextGame', family: 'Illustrated Card', propertyName: 'Type', propertyValue: 'Next game', state: 'Default', renderSize: 80, media: 'wave', componentId: '482a7222-5a3b-8086-8008-a6186df77c83', mainInstanceId: '482a7222-5a3b-8086-8008-a6186d641359', imageShapeId: '482a7222-5a3b-8086-8008-a6186de3ed0b' }),
  Object.freeze({ key: 'illustratedCardMatchResult', family: 'Illustrated Card', propertyName: 'Type', propertyValue: 'Match result', state: 'Default', renderSize: 80, media: 'matchResult', componentId: '482a7222-5a3b-8086-8008-a6186e8e05ac', mainInstanceId: '482a7222-5a3b-8086-8008-a6186dff13db', imageShapeId: '482a7222-5a3b-8086-8008-a6186e7a1ef8' }),
  Object.freeze({ key: 'illustratedCardInvitePlayers', family: 'Illustrated Card', propertyName: 'Type', propertyValue: 'Invite players', state: 'Default', renderSize: 80, media: 'profile', componentId: '482a7222-5a3b-8086-8008-a6186f6404b0', mainInstanceId: '482a7222-5a3b-8086-8008-a6186e958b2e', imageShapeId: '482a7222-5a3b-8086-8008-a6186f47ff67' }),
  Object.freeze({ key: 'illustratedCardGameCreated', family: 'Illustrated Card', propertyName: 'Type', propertyValue: 'Game created', state: 'Default', renderSize: 80, media: 'gameCreated', componentId: '482a7222-5a3b-8086-8008-a618702cb23a', mainInstanceId: '482a7222-5a3b-8086-8008-a6186f6f0e49', imageShapeId: '482a7222-5a3b-8086-8008-a6187019b317' }),
]);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
export const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

export function ensureSafeLocalPath(root, relativePath) {
  assert(typeof relativePath === 'string' && relativePath.length > 0, 'artwork path must be non-empty');
  assert(!path.isAbsolute(relativePath), `artwork path must be relative: ${relativePath}`);
  assert(!/^[a-z][a-z\d+.-]*:/iu.test(relativePath), `artwork path must not be remote: ${relativePath}`);
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(root, relativePath);
  assert(resolved === resolvedRoot || resolved.startsWith(`${resolvedRoot}${path.sep}`), `artwork path escapes the repository root: ${relativePath}`);
  return resolved;
}

function fixedOutputPath(root, output) {
  const allowed = [...NEW_MEDIA_SOURCES.map((source) => source.output), MANIFEST_OUTPUT];
  assert(allowed.includes(output), `unlisted Phase 4 artwork output: ${output}`);
  return ensureSafeLocalPath(root, `${OUTPUT_ROOT}/${output}`);
}

function loadSource(root = repoRoot) {
  const archive = parseZip(fs.readFileSync(ensureSafeLocalPath(root, CANONICAL_ARCHIVE_PATH)));
  const index = buildSourceIndex(archive);
  assert(index.file.id === EXPECTED_FILE_ID, `Phase 4 artwork source file differs: ${index.file.id}`);
  assert(index.file.revn === REVISION, `Phase 4 artwork source revision differs: ${index.file.revn}`);
  assert(index.pages.some((page) => page.id === PAGE_ID && page.name === '02 Components'), `Phase 4 component page is missing: ${PAGE_ID}`);
  return { archive, componentById: new Map(index.components.map((entry) => [entry.id, entry])), mediaById: new Map(index.records.filter((entry) => entry.kind === 'medi').map((entry) => [entry.id, entry])), shapeById: new Map(index.shapes.map((entry) => [entry.id, entry])) };
}

function mediaBytes(source, context) {
  assert(MEDIA_SOURCES.includes(source), `unlisted Phase 4 media source: ${source?.key ?? 'unknown'}`);
  const media = context.mediaById.get(source.mediaRecordId);
  assert(media, `${source.key} media record is missing: ${source.mediaRecordId}`);
  assert(media.data.isLocal === true, `${source.key} media record is not local`);
  assert(media.data.mediaId === source.mediaId, `${source.key} object media ID differs`);
  assert(media.data.name === source.mediaName, `${source.key} media record name differs`);
  assert(media.data.mtype === 'image/webp' && media.data.width === 1254 && media.data.height === 1254, `${source.key} media record profile differs`);
  const archivePath = `objects/${source.mediaId}.webp`;
  const entry = context.archive.byPath.get(archivePath);
  assert(entry, `${source.key} local media object is missing: ${archivePath}`);
  const bytes = context.archive.readEntry(entry);
  assert(bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP', `${source.key} local media object is not a WebP`);
  return bytes;
}

function validatePlacement(placement, context, mediaByKey) {
  const media = mediaByKey.get(placement.media);
  assert(media, `${placement.key} references unknown fixed media: ${placement.media}`);
  const component = context.componentById.get(placement.componentId);
  assert(component, `${placement.key} component is missing: ${placement.componentId}`);
  assert(component.data.deleted !== true && component.data.deletedAt == null, `${placement.key} component is deleted`);
  assert(component.name === placement.family && component.pageId === PAGE_ID, `${placement.key} component ownership differs`);
  assert(component.data.mainInstanceId === placement.mainInstanceId, `${placement.key} main instance differs`);
  assert(JSON.stringify(component.data.variantProperties) === JSON.stringify([{ name: placement.propertyName, value: placement.propertyValue }, { name: 'State', value: placement.state }]), `${placement.key} component variant differs`);
  const shape = context.shapeById.get(placement.imageShapeId);
  assert(shape?.pageId === PAGE_ID && shape.data.parentId === placement.mainInstanceId, `${placement.key} image ownership differs`);
  assert(shape.data.width === placement.renderSize && shape.data.height === placement.renderSize, `${placement.key} image geometry differs`);
  const imageFills = (shape.data.fills ?? []).filter((fill) => fill.fillImage);
  assert(imageFills.length === 1, `${placement.key} must have exactly one local image fill`);
  const image = imageFills[0].fillImage;
  assert(image.id === media.mediaRecordId && image.name === media.mediaName, `${placement.key} image identity differs`);
  assert(image.mtype === 'image/webp' && image.width === 1254 && image.height === 1254, `${placement.key} image profile differs`);
}

function buildEvidence(root = repoRoot) {
  const context = loadSource(root);
  const mediaByKey = new Map(MEDIA_SOURCES.map((source) => [source.key, source]));
  assert(MEDIA_SOURCES.length === 6 && mediaByKey.size === 6, 'Phase 4 media inventory must contain six unique records');
  assert(PLACEMENTS.length === 7 && new Set(PLACEMENTS.map((placement) => placement.key)).size === 7, 'Phase 4 placement inventory must contain seven unique records');
  for (const placement of PLACEMENTS) validatePlacement(placement, context, mediaByKey);
  const bytesByKey = new Map(MEDIA_SOURCES.map((source) => [source.key, mediaBytes(source, context)]));
  assert(new Set([...bytesByKey.values()].map(sha256)).size === 6, 'Phase 4 media records contain duplicate bytes');
  for (const source of MEDIA_SOURCES.filter((candidate) => candidate.disposition === 'phase3-reused')) {
    const retained = fs.readFileSync(ensureSafeLocalPath(root, source.path));
    assert(bytesByKey.get(source.key).equals(retained), `${source.key} Phase 3 retained bytes differ from revision-${REVISION}`);
  }
  return { bytesByKey, mediaByKey };
}

export function expectedManifest(root = repoRoot) {
  const { bytesByKey, mediaByKey } = buildEvidence(root);
  return {
    schemaVersion: 1,
    source: { fileId: EXPECTED_FILE_ID, pageId: PAGE_ID, revision: REVISION },
    media: MEDIA_SOURCES.map((source) => { const bytes = bytesByKey.get(source.key); return { key: source.key, path: source.path, disposition: source.disposition, sha256: sha256(bytes), bytes: bytes.length, source: { mediaRecordId: source.mediaRecordId, mediaId: source.mediaId, mediaName: source.mediaName }, profile: { local: true, mime: 'image/webp', width: 1254, height: 1254 } }; }),
    placements: PLACEMENTS.map((placement) => ({ key: placement.key, family: placement.family, variant: { [placement.propertyName]: placement.propertyValue, State: placement.state }, renderSize: { width: placement.renderSize, height: placement.renderSize }, media: placement.media, path: mediaByKey.get(placement.media).path, source: { componentId: placement.componentId, mainInstanceId: placement.mainInstanceId, imageShapeId: placement.imageShapeId } })),
  };
}

export function generateNoGamesOutput({ root = repoRoot } = {}) {
  const { bytesByKey } = buildEvidence(root);
  const source = NEW_MEDIA_SOURCES[0];
  return new Map([[source.output, bytesByKey.get(source.key)]]);
}

export function generateArtworkOutputs({ root = repoRoot } = {}) {
  const { bytesByKey } = buildEvidence(root);
  const manifest = expectedManifest(root);
  const outputs = new Map(NEW_MEDIA_SOURCES.map((source) => [source.output, bytesByKey.get(source.key)]));
  outputs.set(MANIFEST_OUTPUT, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8'));
  assert(outputs.size === 4, 'Phase 4 generated output count differs');
  return outputs;
}

function writeOutputs(root, outputs) {
  fs.mkdirSync(ensureSafeLocalPath(root, OUTPUT_ROOT), { recursive: true });
  for (const [output, bytes] of outputs) fs.writeFileSync(fixedOutputPath(root, output), bytes);
}

function checkOutputs(root, outputs, aggregate) {
  if (aggregate) {
    const actual = fs.readdirSync(ensureSafeLocalPath(root, OUTPUT_ROOT), { withFileTypes: true }).map((entry) => { assert(entry.isFile(), `unexpected non-file Phase 4 artwork output: ${entry.name}`); return entry.name; }).sort();
    assert(JSON.stringify(actual) === JSON.stringify([...outputs.keys()].sort()), 'Phase 4 artwork output inventory differs');
  }
  for (const [output, bytes] of outputs) {
    const retained = fs.readFileSync(fixedOutputPath(root, output));
    assert(bytes.equals(retained), `${output} differs from deterministic revision-${REVISION} bytes`);
  }
}

function main() {
  const args = process.argv.slice(2);
  assert(args.length === 1, 'expected exactly one fixed write or check mode');
  let outputs;
  let aggregate = false;
  if (args[0] === '--write-no-games' || args[0] === '--check-no-games') outputs = generateNoGamesOutput();
  else if (args[0] === '--write' || args[0] === '--check') { outputs = generateArtworkOutputs(); aggregate = true; }
  else throw new Error(`unsupported mode: ${args[0]}`);
  if (args[0].startsWith('--write')) writeOutputs(repoRoot, outputs);
  else checkOutputs(repoRoot, outputs, aggregate);
  const hashes = [...outputs].map(([name, bytes]) => `${name}=${sha256(bytes)}`).join(', ');
  console.log(`Phase 4 artwork valid: revision ${REVISION}; ${hashes}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`Phase 4 artwork extraction failed: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; }
}
