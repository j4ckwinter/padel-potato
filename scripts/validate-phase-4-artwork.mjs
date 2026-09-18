import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MANIFEST_OUTPUT,
  MEDIA_SOURCES,
  OUTPUT_ROOT,
  PAGE_ID,
  PLACEMENTS,
  REVISION,
  ensureSafeLocalPath,
  generateArtworkOutputs,
  sha256,
} from './extract-phase-4-artwork.mjs';
import { EXPECTED_FILE_ID } from './penpot-source.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestRelative = `${OUTPUT_ROOT}/${MANIFEST_OUTPUT}`;
const runtimeRelative = 'src/design-system/components/generated/phase4Artwork.tsx';

const runtimeContracts = Object.freeze([
  Object.freeze({ exportName: 'NoGamesEmptyStateArtwork', testId: 'empty-state-no-games', size: 96, path: 'design-spec/assets/phase-4/mascot-no-games.webp' }),
  Object.freeze({ exportName: 'NoNotificationsEmptyStateArtwork', testId: 'empty-state-no-notifications', size: 96, path: 'design-spec/assets/phase-3/mascot-wave.webp' }),
  Object.freeze({ exportName: 'NoPlayersEmptyStateArtwork', testId: 'empty-state-no-players', size: 96, path: 'design-spec/assets/phase-3/mascot-search.webp' }),
  Object.freeze({ exportName: 'NextGameIllustratedCardArtwork', testId: 'illustrated-card-next-game', size: 80, path: 'design-spec/assets/phase-3/mascot-wave.webp' }),
  Object.freeze({ exportName: 'MatchResultIllustratedCardArtwork', testId: 'illustrated-card-match-result', size: 80, path: 'design-spec/assets/phase-4/mascot-match-result.webp' }),
  Object.freeze({ exportName: 'InvitePlayersIllustratedCardArtwork', testId: 'illustrated-card-invite-players', size: 80, path: 'design-spec/assets/phase-3/mascot-profile.webp' }),
  Object.freeze({ exportName: 'GameCreatedIllustratedCardArtwork', testId: 'illustrated-card-game-created', size: 80, path: 'design-spec/assets/phase-4/mascot-game-created.webp' }),
]);

const canonicalManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, manifestRelative), 'utf8'));

function validateManifest(manifest, root) {
  assert.deepEqual(manifest.source, { fileId: EXPECTED_FILE_ID, pageId: PAGE_ID, revision: REVISION }, 'artwork source identity differs');
  assert.equal(manifest.media?.length, 6, 'artwork media inventory must contain exactly six entries');
  assert.equal(manifest.placements?.length, 7, 'artwork placement inventory must contain exactly seven entries');
  assert.deepEqual(manifest, canonicalManifest, 'artwork manifest differs from the fixed source contract');
  assert.equal(new Set(manifest.media.map((entry) => entry.source.mediaRecordId)).size, 6, 'media record identities must be unique');
  assert.equal(new Set(manifest.placements.map((entry) => entry.key)).size, 7, 'placement identities must be unique');

  for (const entry of manifest.media) {
    const resolved = ensureSafeLocalPath(root, entry.path);
    assert(fs.existsSync(resolved), `artwork file is missing: ${entry.path}`);
    const bytes = fs.readFileSync(resolved);
    assert.equal(sha256(bytes), entry.sha256, `artwork hash differs: ${entry.path}`);
    assert.equal(bytes.length, entry.bytes, `artwork byte length differs: ${entry.path}`);
    assert.deepEqual(entry.profile, { local: true, mime: 'image/webp', width: 1254, height: 1254 }, `artwork profile differs: ${entry.path}`);
    assert(bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP', `artwork is not WebP: ${entry.path}`);
  }

  const expectedPaths = MEDIA_SOURCES.map((source) => source.path);
  assert.deepEqual(manifest.media.map((entry) => entry.path), expectedPaths, 'artwork paths differ from the six fixed destinations');
  assert.deepEqual(manifest.placements.map((entry) => entry.key), PLACEMENTS.map((entry) => entry.key), 'artwork placement order differs');
  const mediaByKey = new Map(manifest.media.map((entry) => [entry.key, entry]));
  for (const placement of manifest.placements) {
    assert.equal(placement.path, mediaByKey.get(placement.media)?.path, `${placement.key} does not resolve to its declared media path`);
    assert([80, 96].includes(placement.renderSize.width) && placement.renderSize.width === placement.renderSize.height, `${placement.key} render geometry differs`);
  }

  const outputNames = fs.readdirSync(ensureSafeLocalPath(root, OUTPUT_ROOT), { withFileTypes: true }).map((entry) => {
    assert(entry.isFile(), `unexpected Phase 4 artwork directory entry: ${entry.name}`);
    return entry.name;
  }).sort();
  assert.deepEqual(outputNames, ['artwork-manifest.json', 'mascot-game-created.webp', 'mascot-match-result.webp', 'mascot-no-games.webp'], 'Phase 4 retained output inventory differs');
}

function runtimeFunctionSource(runtimeSource, exportName) {
  const marker = `export function ${exportName}(`;
  const start = runtimeSource.indexOf(marker);
  assert(start >= 0, `${exportName} runtime export is missing`);
  const next = runtimeSource.indexOf('\nexport function ', start + marker.length);
  return runtimeSource.slice(start, next >= 0 ? next : runtimeSource.length);
}

function validateRuntimeSource(runtimeSource) {
  assert(!/https?:|fetch\s*\(|XMLHttpRequest|\buri\s*:|\.penpot|penpot-source|artwork-manifest\.json/iu.test(runtimeSource), 'runtime source contains remote or source-evidence access');
  assert(!/IconName|from\s+['"][^'"]*(?:tokens|themes?)[^'"]*['"]/u.test(runtimeSource), 'runtime source expands a shared icon, token, or theme surface');
  assert(!/require\s*\(\s*(?!['"])/u.test(runtimeSource), 'runtime source contains a dynamic require');
  assert(!/export\s+(?:type|interface|const)\b/u.test(runtimeSource), 'runtime source exposes a generalized artwork API');
  const exportedFunctions = [...runtimeSource.matchAll(/export function (\w+)\(([^)]*)\)/gu)];
  assert(exportedFunctions.every((match) => match[2].trim().length === 0), 'runtime artwork exports must accept no caller input');
  assert.deepEqual(exportedFunctions.map((match) => match[1]), runtimeContracts.map((entry) => entry.exportName), 'runtime artwork exports differ from the closed family surface');
  const imports = [...runtimeSource.matchAll(/from ['"]([^'"]+)['"]/gu)].map((match) => match[1]);
  assert.deepEqual(imports, ['react-native'], 'runtime artwork imports are not closed to React Native');
  assert(runtimeSource.includes('accessibilityElementsHidden: true') && runtimeSource.includes('accessible: false') && runtimeSource.includes("importantForAccessibility: 'no-hide-descendants'"), 'runtime artwork is not uniformly decorative');

  for (const contract of runtimeContracts) {
    const source = runtimeFunctionSource(runtimeSource, contract.exportName);
    const required = `require('../../../../${contract.path}')`;
    assert.equal(source.split(required).length - 1, 1, `${contract.exportName} must own one literal local require`);
    assert(source.includes(`style={{ height: ${contract.size}, width: ${contract.size} }}`), `${contract.exportName} geometry differs`);
    assert(source.includes(`testID="phase4-artwork-${contract.testId}"`), `${contract.exportName} test identity differs`);
    assert(source.includes('{...decorative}'), `${contract.exportName} is not decorative`);
  }
  assert.equal([...runtimeSource.matchAll(/require\(['"][^'"]+['"]\)/gu)].length, 7, 'runtime source must contain exactly seven literal requires');
}

export function validateArtworkEvidence({ root = repoRoot, manifest, runtimeSource, verifyExtractor = true } = {}) {
  const loadedManifest = manifest ?? JSON.parse(fs.readFileSync(path.join(root, manifestRelative), 'utf8'));
  const loadedRuntime = runtimeSource ?? fs.readFileSync(path.join(root, runtimeRelative), 'utf8');
  validateManifest(loadedManifest, root);
  validateRuntimeSource(loadedRuntime);
  if (verifyExtractor) {
    const generated = generateArtworkOutputs({ root });
    assert.equal(generated.size, 4, 'extractor output count differs');
    for (const [name, bytes] of generated) {
      const retained = fs.readFileSync(path.join(root, OUTPUT_ROOT, name));
      assert(bytes.equals(retained), `${name} differs from deterministic extractor bytes`);
    }
  }
  return loadedManifest;
}

function isolatedFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'phase4-artwork-'));
  for (const relative of [...canonicalManifest.media.map((entry) => entry.path), manifestRelative, runtimeRelative]) {
    const destination = path.join(root, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, relative), destination);
  }
  return {
    root,
    manifest: structuredClone(canonicalManifest),
    runtimeSource: fs.readFileSync(path.join(repoRoot, runtimeRelative), 'utf8'),
  };
}

function expectFailure(label, mutate) {
  const fixture = isolatedFixture();
  try {
    const candidate = { manifest: fixture.manifest, runtimeSource: fixture.runtimeSource };
    mutate(candidate);
    let failure;
    try { validateArtworkEvidence({ root: fixture.root, ...candidate, verifyExtractor: false }); } catch (error) { failure = error; }
    assert(failure, `controlled rejection did not fail: ${label}`);
    console.log(`rejected ${label}: ${failure.message}`);
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
}

function runSelfTest() {
  const cases = [
    ['file identity', ({ manifest }) => { manifest.source.fileId = '00000000-0000-0000-0000-000000000000'; }],
    ['page identity', ({ manifest }) => { manifest.source.pageId = '00000000-0000-0000-0000-000000000000'; }],
    ['revision', ({ manifest }) => { manifest.source.revision = 295; }],
    ['changed media id', ({ manifest }) => { manifest.media[0].source.mediaRecordId = '00000000-0000-0000-0000-000000000000'; }],
    ['changed hash', ({ manifest }) => { manifest.media[0].sha256 = '0'.repeat(64); }],
    ['changed byte size', ({ manifest }) => { manifest.media[0].bytes += 1; }],
    ['changed profile', ({ manifest }) => { manifest.media[0].profile.width = 1; }],
    ['missing media', ({ manifest }) => { manifest.media.pop(); }],
    ['extra media', ({ manifest }) => { manifest.media.push(structuredClone(manifest.media[0])); }],
    ['missing placement', ({ manifest }) => { manifest.placements.pop(); }],
    ['extra placement', ({ manifest }) => { manifest.placements.push(structuredClone(manifest.placements[0])); }],
    ['reordered placement', ({ manifest }) => { [manifest.placements[0], manifest.placements[1]] = [manifest.placements[1], manifest.placements[0]]; }],
    ['unsafe traversal path', ({ manifest }) => { manifest.media[0].path = '../mascot.webp'; }],
    ['unsafe absolute path', ({ manifest }) => { manifest.media[0].path = path.resolve('outside.webp'); }],
    ['remote manifest path', ({ manifest }) => { manifest.media[0].path = 'https://example.invalid/mascot.webp'; }],
    ['changed reused path', ({ manifest }) => { manifest.media[1].path = 'design-spec/assets/phase-4/mascot-wave.webp'; }],
    ['remote runtime reference', (candidate) => { candidate.runtimeSource += '\nconst remote = { uri: "https://example.invalid/mascot.webp" };\n'; }],
    ['dynamic runtime require', (candidate) => { candidate.runtimeSource = `const artworkPath = '../../../../design-spec/assets/phase-4/mascot-no-games.webp';\n${candidate.runtimeSource.replace("require('../../../../design-spec/assets/phase-4/mascot-no-games.webp')", 'require(artworkPath)')}`; }],
    ['generalized runtime props', (candidate) => { candidate.runtimeSource = candidate.runtimeSource.replace('NoGamesEmptyStateArtwork()', 'NoGamesEmptyStateArtwork(props: { source: string })'); }],
    ['changed runtime geometry', (candidate) => { candidate.runtimeSource = candidate.runtimeSource.replace('style={{ height: 96, width: 96 }}', 'style={{ height: 95, width: 96 }}'); }],
    ['accessible runtime artwork', (candidate) => { candidate.runtimeSource = candidate.runtimeSource.replace('accessible: false', 'accessible: true'); }],
  ];
  for (const [label, mutate] of cases) expectFailure(label, mutate);
  console.log(`${cases.length} controlled rejections passed`);
}

function main() {
  const args = process.argv.slice(2);
  assert(args.length <= 1 && (args.length === 0 || args[0] === '--self-test'), 'usage: node scripts/validate-phase-4-artwork.mjs [--self-test]');
  validateArtworkEvidence();
  if (args[0] === '--self-test') runSelfTest();
  console.log('Phase 4 artwork validation passed');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`Phase 4 artwork validation failed: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; }
}
