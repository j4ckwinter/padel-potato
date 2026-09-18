import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CANONICAL_ARCHIVE_PATH,
  EXPECTED_FILE_ID,
  buildSourceIndex,
  parseZip,
} from './penpot-source.mjs';

export const REVISION = 296;
export const PAGE_ID = '482a7222-5a3b-8086-8008-a6073072bbb1';
export const OUTPUT_ROOT = 'design-spec/assets/phase-4';

export const NEW_MEDIA_SOURCES = Object.freeze([
  Object.freeze({
    key: 'noGames',
    output: 'mascot-no-games.webp',
    componentId: '482a7222-5a3b-8086-8008-a61014763913',
    mainInstanceId: '482a7222-5a3b-8086-8008-a61013db2f5b',
    imageShapeId: '482a7222-5a3b-8086-8008-a617cde8d1d2',
    family: 'Empty State',
    propertyName: 'Content',
    propertyValue: 'No games',
    state: 'With action',
    renderSize: 96,
    mediaRecordId: 'c514c1fb-1cda-8125-8008-a60625a0cf2e',
    mediaId: 'c1d0e80c-1ff2-4c61-bc50-147e55d46615',
    mediaName: '53e3909aa121191b9613bc35d219051c62b07c20',
  }),
]);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

export const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

export function ensureSafeLocalPath(root, relativePath) {
  assert(typeof relativePath === 'string' && relativePath.length > 0, 'artwork path must be non-empty');
  assert(!path.isAbsolute(relativePath), `artwork path must be relative: ${relativePath}`);
  assert(!/^[a-z][a-z\d+.-]*:/iu.test(relativePath), `artwork path must not be remote: ${relativePath}`);
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(root, relativePath);
  assert(
    resolved === resolvedRoot || resolved.startsWith(`${resolvedRoot}${path.sep}`),
    `artwork path escapes the repository root: ${relativePath}`,
  );
  return resolved;
}

function fixedOutputPath(root, output) {
  assert(
    NEW_MEDIA_SOURCES.some((source) => source.output === output),
    `unlisted Phase 4 artwork output: ${output}`,
  );
  return ensureSafeLocalPath(root, `${OUTPUT_ROOT}/${output}`);
}

function loadSource(root = repoRoot) {
  const archivePath = ensureSafeLocalPath(root, CANONICAL_ARCHIVE_PATH);
  const archive = parseZip(fs.readFileSync(archivePath));
  const index = buildSourceIndex(archive);
  assert(index.file.id === EXPECTED_FILE_ID, `Phase 4 artwork source file differs: ${index.file.id}`);
  assert(index.file.revn === REVISION, `Phase 4 artwork source revision differs: ${index.file.revn}`);
  assert(
    index.pages.some((page) => page.id === PAGE_ID && page.name === '02 Components'),
    `Phase 4 component page is missing: ${PAGE_ID}`,
  );
  return {
    archive,
    componentById: new Map(index.components.map((component) => [component.id, component])),
    mediaById: new Map(index.records.filter((record) => record.kind === 'medi').map((media) => [media.id, media])),
    shapeById: new Map(index.shapes.map((shape) => [shape.id, shape])),
  };
}

function assertExactVariant(component, source) {
  const properties = component.data.variantProperties ?? [];
  assert(
    properties.length === 2 &&
      properties[0].name === source.propertyName &&
      properties[0].value === source.propertyValue &&
      properties[1].name === 'State' &&
      properties[1].value === source.state,
    `${source.key} component variant differs`,
  );
}

export function mediaOutput(source, context) {
  assert(NEW_MEDIA_SOURCES.includes(source), `unlisted Phase 4 media source: ${source?.key ?? 'unknown'}`);
  const component = context.componentById.get(source.componentId);
  assert(component, `${source.key} component is missing: ${source.componentId}`);
  assert(component.data.deleted !== true && component.data.deletedAt == null, `${source.key} component is deleted`);
  assert(component.name === source.family, `${source.key} component family differs`);
  assert(component.pageId === PAGE_ID, `${source.key} component is outside the Components page`);
  assert(component.data.mainInstanceId === source.mainInstanceId, `${source.key} main instance differs`);
  assertExactVariant(component, source);

  const shape = context.shapeById.get(source.imageShapeId);
  assert(shape?.pageId === PAGE_ID, `${source.key} image shape is missing from the Components page`);
  assert(shape.data.parentId === source.mainInstanceId, `${source.key} image parent differs`);
  assert(
    shape.data.width === source.renderSize && shape.data.height === source.renderSize,
    `${source.key} image is no longer ${source.renderSize} by ${source.renderSize}`,
  );
  const imageFills = (shape.data.fills ?? []).filter((fill) => fill.fillImage);
  assert(imageFills.length === 1, `${source.key} must have exactly one local image fill`);
  const image = imageFills[0].fillImage;
  assert(image.id === source.mediaRecordId, `${source.key} media record differs`);
  assert(image.name === source.mediaName, `${source.key} media name differs`);
  assert(
    image.mtype === 'image/webp' && image.width === 1254 && image.height === 1254,
    `${source.key} image profile differs`,
  );

  const media = context.mediaById.get(source.mediaRecordId);
  assert(media, `${source.key} media record is missing: ${source.mediaRecordId}`);
  assert(media.data.isLocal === true, `${source.key} media record is not local`);
  assert(media.data.mediaId === source.mediaId, `${source.key} object media ID differs`);
  assert(media.data.name === source.mediaName, `${source.key} media record name differs`);
  assert(
    media.data.mtype === 'image/webp' && media.data.width === 1254 && media.data.height === 1254,
    `${source.key} media record profile differs`,
  );

  const archivePath = `objects/${source.mediaId}.webp`;
  const entry = context.archive.byPath.get(archivePath);
  assert(entry, `${source.key} local media object is missing: ${archivePath}`);
  const bytes = context.archive.readEntry(entry);
  assert(
    bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP',
    `${source.key} local media object is not a WebP`,
  );
  return bytes;
}

export function generateNoGamesOutput({ root = repoRoot } = {}) {
  const source = NEW_MEDIA_SOURCES[0];
  return new Map([[source.output, mediaOutput(source, loadSource(root))]]);
}

function writeOutputs(root, outputs) {
  fs.mkdirSync(ensureSafeLocalPath(root, OUTPUT_ROOT), { recursive: true });
  for (const [output, bytes] of outputs) fs.writeFileSync(fixedOutputPath(root, output), bytes);
}

function checkOutputs(root, outputs) {
  for (const [output, bytes] of outputs) {
    const retained = fs.readFileSync(fixedOutputPath(root, output));
    assert(bytes.equals(retained), `${output} differs from deterministic revision-${REVISION} bytes`);
  }
}

function main() {
  const args = process.argv.slice(2);
  assert(
    args.length === 1 && (args[0] === '--write-no-games' || args[0] === '--check-no-games'),
    'usage: node scripts/extract-phase-4-artwork.mjs --write-no-games|--check-no-games',
  );
  const outputs = generateNoGamesOutput();
  if (args[0] === '--write-no-games') writeOutputs(repoRoot, outputs);
  else checkOutputs(repoRoot, outputs);
  const hashes = [...outputs].map(([name, bytes]) => `${name}=${sha256(bytes)}`).join(', ');
  console.log(`Phase 4 artwork valid: revision ${REVISION}; ${hashes}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`Phase 4 artwork extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
