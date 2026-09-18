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
export const OUTPUT_ROOT = 'design-spec/assets/phase-3';

export const VECTOR_SOURCES = Object.freeze([
  Object.freeze({
    key: 'heart',
    output: 'heart.svg',
    componentId: 'ab02a31f-1852-80be-8008-a6fb4b6d6c28',
    mainInstanceId: 'ab02a31f-1852-80be-8008-a6fb4b0ee385',
    groupId: 'ab02a31f-1852-80be-8008-a6fb4b29b8b1',
    childIds: Object.freeze([
      'ab02a31f-1852-80be-8008-a6fb4b2b84cf',
      'ab02a31f-1852-80be-8008-a6fb4b2c42fc',
    ]),
    paints: Object.freeze(['#384540']),
    pathCount: 1,
  }),
  Object.freeze({
    key: 'google',
    output: 'google.svg',
    componentId: '482a7222-5a3b-8086-8008-a61e8cd600f5',
    mainInstanceId: '482a7222-5a3b-8086-8008-a61e8c7d1bea',
    groupId: '482a7222-5a3b-8086-8008-a61e8c9e36b1',
    childIds: Object.freeze([
      '482a7222-5a3b-8086-8008-a61e8c9e36b2',
      '482a7222-5a3b-8086-8008-a61e8c9e36b3',
      '482a7222-5a3b-8086-8008-a61e8c9e36b4',
      '482a7222-5a3b-8086-8008-a61e8c9e36b5',
      '482a7222-5a3b-8086-8008-a61e8c9e36b6',
    ]),
    paints: Object.freeze(['#4285f4', '#34a853', '#fbbc05', '#ea4335']),
    pathCount: 4,
  }),
  Object.freeze({
    key: 'apple',
    output: 'apple.svg',
    componentId: '482a7222-5a3b-8086-8008-a61e8ebdd214',
    mainInstanceId: '482a7222-5a3b-8086-8008-a61e8e22e75b',
    groupId: '482a7222-5a3b-8086-8008-a61e8e4c6652',
    childIds: Object.freeze([
      '482a7222-5a3b-8086-8008-a61e8e4c6653',
      '482a7222-5a3b-8086-8008-a61e8e4c6654',
      '482a7222-5a3b-8086-8008-a61e8e4c6655',
    ]),
    paints: Object.freeze(['#0e1716', '#0e1716']),
    pathCount: 2,
  }),
]);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

function loadSource(root = repoRoot) {
  const archivePath = path.join(root, CANONICAL_ARCHIVE_PATH);
  const archiveBytes = fs.readFileSync(archivePath);
  const index = buildSourceIndex(parseZip(archiveBytes));
  assert(index.file.id === EXPECTED_FILE_ID, `Phase 3 artwork source file differs: ${index.file.id}`);
  assert(index.file.revn === REVISION, `Phase 3 artwork source revision differs: ${index.file.revn}`);
  assert(
    index.pages.some((page) => page.id === PAGE_ID && page.name === '02 Components'),
    `Phase 3 artwork page is missing: ${PAGE_ID}`,
  );
  return {
    archiveBytes,
    index,
    shapeById: new Map(index.shapes.map((shape) => [shape.id, shape])),
    componentById: new Map(index.components.map((component) => [component.id, component])),
  };
}

function assertFixedOutput(root, relative) {
  assert(typeof relative === 'string' && !path.isAbsolute(relative), `unsafe absolute output path: ${relative}`);
  assert(!relative.split(/[\\/]/u).includes('..'), `unsafe traversing output path: ${relative}`);
  const allowed = path.resolve(root, OUTPUT_ROOT);
  const resolved = path.resolve(allowed, relative);
  const relation = path.relative(allowed, resolved);
  assert(relation && !relation.startsWith('..') && !path.isAbsolute(relation), `output path escapes ${OUTPUT_ROOT}: ${relative}`);
  return resolved;
}

function assertExactIds(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} source IDs differ`);
}

function vectorOutput(source, context) {
  const component = context.componentById.get(source.componentId);
  assert(component, `${source.key} component is missing: ${source.componentId}`);
  assert(component.data.deleted !== true && component.data.deletedAt == null, `${source.key} component is deleted`);
  assert(component.data.mainInstanceId === source.mainInstanceId, `${source.key} main instance differs`);

  const group = context.shapeById.get(source.groupId);
  assert(group?.pageId === PAGE_ID, `${source.key} group is missing from the Components page`);
  assert(group.data.type === 'group', `${source.key} source is no longer a group`);
  assert(group.data.width === 20 && group.data.height === 20, `${source.key} source is no longer 20 by 20`);
  assertExactIds(group.data.shapes ?? [], source.childIds, `${source.key} child`);

  const children = source.childIds.map((id) => {
    const shape = context.shapeById.get(id);
    assert(shape, `${source.key} child is missing: ${id}`);
    return shape;
  });
  const [background, ...paths] = children;
  assert(background.data.type === 'rect' && background.data.svgAttrs?.fill === 'none', `${source.key} background profile differs`);
  assert(paths.length === source.pathCount && paths.every((shape) => shape.data.type === 'path'), `${source.key} path profile differs`);

  const paints = paths.map((shape) => shape.data.fills?.[0]?.fillColor ?? shape.data.strokes?.[0]?.strokeColor);
  assertExactIds(paints, source.paints, `${source.key} paint`);
  const elements = paths.map((shape) => {
    assert(typeof shape.data.content === 'string' && shape.data.content.length > 0, `${source.key} path data is missing`);
    const fill = shape.data.fills?.[0]?.fillColor;
    const stroke = shape.data.strokes?.[0];
    if (fill) {
      assert((shape.data.strokes ?? []).length === 0, `${source.key} filled path gained a stroke`);
      return `  <path d="${shape.data.content}" fill="${fill}" />`;
    }
    assert(stroke?.strokeWidth === 1.75, `${source.key} stroke width differs`);
    assert((shape.data.fills ?? []).length === 0, `${source.key} stroked path gained a fill`);
    return `  <path d="${shape.data.content}" fill="none" stroke="${stroke.strokeColor}" stroke-width="${stroke.strokeWidth}" stroke-linejoin="round" />`;
  });

  const { x, y, width, height } = group.data.selrect ?? {};
  assert([x, y, width, height].every(Number.isFinite), `${source.key} viewBox is invalid`);
  const provenance = `${EXPECTED_FILE_ID}/${PAGE_ID}/${source.componentId}/${source.groupId}@${REVISION}`;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="${x} ${y} ${width} ${height}">\n` +
      `  <!-- Penpot ${provenance} -->\n${elements.join('\n')}\n</svg>\n`,
    'utf8',
  );
}

export function generateVectorOutputs({ root = repoRoot } = {}) {
  const context = loadSource(root);
  return new Map(VECTOR_SOURCES.map((source) => [source.output, vectorOutput(source, context)]));
}

function writeOutputs(root, outputs) {
  fs.mkdirSync(path.join(root, OUTPUT_ROOT), { recursive: true });
  for (const [relative, bytes] of outputs) fs.writeFileSync(assertFixedOutput(root, relative), bytes);
}

function checkOutputs(root, outputs, extension) {
  const outputRoot = path.join(root, OUTPUT_ROOT);
  assert(fs.existsSync(outputRoot), `Phase 3 artwork output directory is missing: ${OUTPUT_ROOT}`);
  const expected = [...outputs.keys()].filter((name) => name.endsWith(extension)).sort();
  const actual = fs.readdirSync(outputRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => entry.name)
    .sort();
  assertExactIds(actual, expected, `${extension} output inventory`);
  for (const [relative, bytes] of outputs) {
    if (!relative.endsWith(extension)) continue;
    const checkedIn = fs.readFileSync(assertFixedOutput(root, relative));
    assert(bytes.equals(checkedIn), `${relative} differs from deterministic revision-${REVISION} bytes`);
  }
}

function main() {
  const args = process.argv.slice(2);
  assert(args.length === 1, 'expected exactly one mode: --write-vectors or --check-vectors');
  const vectors = generateVectorOutputs();
  if (args[0] === '--write-vectors') writeOutputs(repoRoot, vectors);
  else if (args[0] === '--check-vectors') checkOutputs(repoRoot, vectors, '.svg');
  else throw new Error(`unsupported mode: ${args[0]}`);
  const hashes = [...vectors].map(([name, bytes]) => `${name}=${sha256(bytes)}`).join(', ');
  console.log(`Phase 3 vectors valid: revision ${REVISION}; ${hashes}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`Phase 3 artwork extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
