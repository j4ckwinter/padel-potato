import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EXPECTED_FILE_ID } from './penpot-source.mjs';
import {
  APP_HEADER_MASCOT_REFERENCES,
  MASCOT_SOURCES,
  OUTPUT_ROOT,
  PAGE_ID,
  PRODUCT_PAGE_ID,
  REVISION,
  VECTOR_SOURCES,
  generateArtworkOutputs,
} from './extract-phase-3-artwork.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestRelative = `${OUTPUT_ROOT}/artwork-manifest.json`;
const runtimeRelative = 'src/design-system/components/generated/phase3Artwork.tsx';
const vectorProfiles = Object.freeze({
  heart: Object.freeze({ format: 'svg', width: 20, height: 20, viewBox: Object.freeze([1052, 1102, 20, 20]), pathCount: 1, paints: Object.freeze(['#384540']) }),
  google: Object.freeze({ format: 'svg', width: 20, height: 20, viewBox: Object.freeze([57, 4865, 20, 20]), pathCount: 4, paints: Object.freeze(['#4285f4', '#34a853', '#fbbc05', '#ea4335']) }),
  apple: Object.freeze({ format: 'svg', width: 20, height: 20, viewBox: Object.freeze([57, 4993, 20, 20]), pathCount: 2, paints: Object.freeze(['#0e1716', '#0e1716']) }),
});
const mascotProfile = Object.freeze({
  format: 'webp',
  mimeType: 'image/webp',
  sourceWidth: 1254,
  sourceHeight: 1254,
  renderWidth: 64,
  renderHeight: 64,
});
const runtimeExports = Object.freeze([
  'HeartArtwork',
  'GoogleProviderArtwork',
  'AppleProviderArtwork',
  'WaveHeaderMascot',
  'SearchHeaderMascot',
  'CreateHeaderMascot',
  'PlayersHeaderMascot',
  'ProfileHeaderMascot',
]);

const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

function ensureSafeLocalPath(root, relative) {
  assert.equal(typeof relative, 'string', 'artwork path must be a string');
  assert(!/^https?:\/\//iu.test(relative), `remote artwork path is forbidden: ${relative}`);
  assert(!path.isAbsolute(relative), `unsafe absolute artwork path: ${relative}`);
  assert(!relative.split(/[\\/]/u).includes('..'), `unsafe traversing artwork path: ${relative}`);
  const allowed = path.resolve(root, OUTPUT_ROOT);
  const resolved = path.resolve(root, relative);
  const relation = path.relative(allowed, resolved);
  assert(relation && !relation.startsWith('..') && !path.isAbsolute(relation), `artwork path escapes ${OUTPUT_ROOT}: ${relative}`);
  return resolved;
}

function expectedManifest(root) {
  const vectors = VECTOR_SOURCES.map((source) => {
    const relative = `${OUTPUT_ROOT}/${source.output}`;
    const bytes = fs.readFileSync(ensureSafeLocalPath(root, relative));
    return {
      key: source.key,
      path: relative,
      sha256: sha256(bytes),
      bytes: bytes.length,
      source: {
        componentId: source.componentId,
        mainInstanceId: source.mainInstanceId,
        groupId: source.groupId,
        childIds: [...source.childIds],
      },
      profile: structuredClone(vectorProfiles[source.key]),
    };
  });
  const mascots = MASCOT_SOURCES.map((source) => {
    const relative = `${OUTPUT_ROOT}/${source.output}`;
    const bytes = fs.readFileSync(ensureSafeLocalPath(root, relative));
    return {
      key: source.key,
      path: relative,
      sha256: sha256(bytes),
      bytes: bytes.length,
      source: {
        componentId: source.componentId,
        mainInstanceId: source.mainInstanceId,
        imageShapeId: source.imageShapeId,
        mediaRecordId: source.mediaRecordId,
        mediaId: source.mediaId,
        mediaName: source.mediaName,
      },
      profile: structuredClone(mascotProfile),
    };
  });
  const mascotByKey = new Map(mascots.map((entry) => [entry.key, entry]));
  const appHeaderReferences = APP_HEADER_MASCOT_REFERENCES.map((reference) => {
    const mascot = mascotByKey.get(reference.mascot);
    assert(mascot, `unknown fixed mascot reference: ${reference.mascot}`);
    return {
      ...reference,
      path: mascot.path,
      mediaRecordId: mascot.source.mediaRecordId,
      mediaId: mascot.source.mediaId,
    };
  });
  return {
    schemaVersion: 1,
    source: {
      fileId: EXPECTED_FILE_ID,
      pageId: PAGE_ID,
      productPageId: PRODUCT_PAGE_ID,
      revision: REVISION,
    },
    vectors,
    mascots,
    appHeaderReferences,
  };
}

function validateManifestShape(manifest, root) {
  assert.equal(manifest?.source?.fileId, EXPECTED_FILE_ID, 'wrong artwork file identity');
  assert.equal(manifest?.source?.pageId, PAGE_ID, 'wrong artwork page identity');
  assert.equal(manifest?.source?.productPageId, PRODUCT_PAGE_ID, 'wrong product page identity');
  assert.equal(manifest?.source?.revision, REVISION, 'wrong artwork revision');
  const entries = [...(manifest.vectors ?? []), ...(manifest.mascots ?? [])];
  assert.equal(entries.length, 8, 'artwork inventory must contain exactly eight entries');
  for (const entry of entries) {
    const resolved = ensureSafeLocalPath(root, entry.path);
    assert(fs.existsSync(resolved), `artwork file is missing: ${entry.path}`);
    const bytes = fs.readFileSync(resolved);
    assert.equal(sha256(bytes), entry.sha256, `artwork hash differs: ${entry.path}`);
    assert.equal(bytes.length, entry.bytes, `artwork byte length differs: ${entry.path}`);
  }
  assert.deepEqual(manifest, expectedManifest(root), 'artwork manifest differs from the fixed source contract');
  assert.equal(manifest.appHeaderReferences.length, 6, 'App Header reference count differs');
  assert.equal(new Set(manifest.appHeaderReferences.map((entry) => entry.path)).size, 5, 'App Header references must map six instances to five media outputs');
  const games = manifest.appHeaderReferences.filter((entry) => entry.key.startsWith('games'));
  assert(games.length === 2 && games.every((entry) => entry.mascot === 'search' && entry.path.endsWith('/mascot-search.webp')), 'Games headers must explicitly reuse Search artwork');
}

function svgPaths(xml) {
  return [...xml.matchAll(/<path\s+([^>]+)\/>/gu)].map((match) => ({
    d: match[1].match(/\bd="([^"]+)"/u)?.[1],
    paint: match[1].match(/\b(?:fill|stroke)="(#[a-f0-9]+)"/iu)?.[1],
  }));
}

function validateRuntimeSource(runtimeSource, manifest, root) {
  assert(!/https?:|fetch\s*\(|XMLHttpRequest|\.penpot|penpot-source|artwork-manifest\.json/iu.test(runtimeSource), 'runtime source contains remote or runtime source access');
  assert(!/IconName|from\s+['"][^'"]*(?:tokens|themes?)[^'"]*['"]/u.test(runtimeSource), 'runtime source expands a shared icon, token, or theme surface');
  assert(!/\buri\s*:|source\s*=\s*\{\s*\{/u.test(runtimeSource), 'runtime source permits a remote image source');
  assert(!/export\s+(?:type|interface|const)\b/u.test(runtimeSource), 'runtime source exposes a generalized artwork API');
  const exportedFunctions = [...runtimeSource.matchAll(/export function (\w+)\(([^)]*)\)/gu)];
  assert(exportedFunctions.every((match) => match[2].trim().length === 0), 'runtime artwork exports must accept no caller input');
  const exports = exportedFunctions.map((match) => match[1]);
  assert.deepEqual(exports, runtimeExports, 'runtime artwork exports differ from the closed family surface');
  const imports = [...runtimeSource.matchAll(/from ['"]([^'"]+)['"]/gu)].map((match) => match[1]);
  assert(imports.every((specifier) => specifier === 'react-native' || specifier === 'react-native-svg'), 'runtime artwork imports are not closed to native renderers');
  assert(runtimeSource.includes('accessibilityElementsHidden: true') && runtimeSource.includes('accessible: false') && runtimeSource.includes("importantForAccessibility: 'no-hide-descendants'"), 'runtime artwork is not uniformly decorative');

  for (const entry of manifest.vectors) {
    const xml = fs.readFileSync(ensureSafeLocalPath(root, entry.path), 'utf8');
    assert(runtimeSource.includes(`viewBox="${entry.profile.viewBox.join(' ')}"`), `${entry.key} runtime viewBox differs`);
    for (const vectorPath of svgPaths(xml)) {
      assert(vectorPath.d && runtimeSource.includes(`d="${vectorPath.d}"`), `${entry.key} runtime path geometry differs`);
      assert(vectorPath.paint && runtimeSource.includes(vectorPath.paint), `${entry.key} runtime paint differs`);
    }
  }
  for (const entry of manifest.mascots) {
    const filename = path.posix.basename(entry.path);
    const required = `require('../../../../design-spec/assets/phase-3/${filename}')`;
    assert.equal(runtimeSource.split(required).length - 1, 1, `${entry.key} runtime source must be one fixed local require`);
  }
}

export function validateArtworkEvidence({ root = repoRoot, manifest, runtimeSource, verifyExtractor = true } = {}) {
  const loadedManifest = manifest ?? JSON.parse(fs.readFileSync(path.join(root, manifestRelative), 'utf8'));
  const loadedRuntime = runtimeSource ?? fs.readFileSync(path.join(root, runtimeRelative), 'utf8');
  validateManifestShape(loadedManifest, root);
  validateRuntimeSource(loadedRuntime, loadedManifest, root);
  if (verifyExtractor) {
    const generated = generateArtworkOutputs({ root });
    assert.equal(generated.size, 8, 'extractor output count differs');
    for (const [name, bytes] of generated) {
      const retained = fs.readFileSync(path.join(root, OUTPUT_ROOT, name));
      assert(bytes.equals(retained), `${name} differs from deterministic extractor bytes`);
    }
  }
  return loadedManifest;
}

function isolatedFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'phase3-artwork-'));
  fs.mkdirSync(path.join(root, OUTPUT_ROOT), { recursive: true });
  for (const source of [...VECTOR_SOURCES, ...MASCOT_SOURCES]) {
    fs.copyFileSync(path.join(repoRoot, OUTPUT_ROOT, source.output), path.join(root, OUTPUT_ROOT, source.output));
  }
  fs.mkdirSync(path.dirname(path.join(root, runtimeRelative)), { recursive: true });
  fs.copyFileSync(path.join(repoRoot, runtimeRelative), path.join(root, runtimeRelative));
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, manifestRelative), 'utf8'));
  const runtimeSource = fs.readFileSync(path.join(repoRoot, runtimeRelative), 'utf8');
  return { root, manifest, runtimeSource };
}

function expectFailure(label, mutate) {
  const fixture = isolatedFixture();
  try {
    const candidate = { manifest: structuredClone(fixture.manifest), runtimeSource: fixture.runtimeSource };
    mutate(candidate);
    let failure;
    try {
      validateArtworkEvidence({ root: fixture.root, ...candidate, verifyExtractor: false });
    } catch (error) {
      failure = error;
    }
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
    ['changed hash', ({ manifest }) => { manifest.vectors[0].sha256 = '0'.repeat(64); }],
    ['unsafe traversal path', ({ manifest }) => { manifest.vectors[0].path = '../heart.svg'; }],
    ['unsafe absolute path', ({ manifest }) => { manifest.vectors[0].path = path.resolve('outside.svg'); }],
    ['remote path', ({ manifest }) => { manifest.vectors[0].path = 'https://example.invalid/heart.svg'; }],
    ['unsupported profile', ({ manifest }) => { manifest.vectors[0].profile.format = 'png'; }],
    ['changed source id', ({ manifest }) => { manifest.mascots[0].source.mediaId = '00000000-0000-0000-0000-000000000000'; }],
    ['missing inventory entry', ({ manifest }) => { manifest.mascots.pop(); }],
    ['extra inventory entry', ({ manifest }) => { manifest.mascots.push(structuredClone(manifest.mascots[0])); }],
    ['changed header mapping', ({ manifest }) => { manifest.appHeaderReferences[1].mascot = 'wave'; }],
    ['remote runtime reference', (candidate) => { candidate.runtimeSource += '\nconst remote = { uri: "https://example.invalid/mascot.webp" };\n'; }],
    ['runtime source access', (candidate) => { candidate.runtimeSource += '\nfetch("design.penpot.app");\n'; }],
    ['generic artwork export', (candidate) => { candidate.runtimeSource += '\nexport function Mascot(name: string) { return name; }\n'; }],
  ];
  for (const [label, mutate] of cases) expectFailure(label, mutate);
  console.log(`${cases.length} controlled rejections passed`);
}

function main() {
  const args = process.argv.slice(2);
  assert(args.length <= 1 && (args.length === 0 || args[0] === '--self-test'), 'usage: node scripts/validate-phase-3-artwork.mjs [--self-test]');
  validateArtworkEvidence();
  if (args[0] === '--self-test') runSelfTest();
  console.log('Phase 3 artwork validation passed');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`Phase 3 artwork validation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
