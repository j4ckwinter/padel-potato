import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE_ID = 'c514c1fb-1cda-8125-8008-a606253a77a3';
const FOUNDATIONS_PAGE_ID = '482a7222-5a3b-8086-8008-a6072bd7e924';
const COMPONENTS_PAGE_ID = '482a7222-5a3b-8086-8008-a6073072bbb1';
const FOUNDATIONS_NODE_ID = '482a7222-5a3b-8086-8008-a6072c75ea94';
const CATEGORY_ORDER = ['borderWidths', 'colors', 'dimensions', 'opacities', 'radii', 'spacing', 'typography'];
const EXACT_COUNTS = { colors: 15, typography: 9 };
const NON_EMPTY_CATEGORIES = ['borderWidths', 'dimensions', 'opacities', 'radii', 'spacing'];
const DEVIATION_FIELDS = ['source', 'platform', 'reason', 'disposition'];

function compare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function assertSorted(values, label) {
  for (let index = 1; index < values.length; index += 1) {
    assert(compare(values[index - 1], values[index]) <= 0, `${label} is not deterministically sorted at "${values[index]}"`);
  }
}

function assertUnique(records, field, label) {
  const seen = new Set();
  for (const record of records) {
    const value = record[field];
    assert(isNonEmptyString(value), `${label} has an empty ${field}`);
    assert(!seen.has(value), `${label} has duplicate ${field} "${value}"`);
    seen.add(value);
  }
}

function assertSafeReference(repoRoot, referencePath) {
  assert(isNonEmptyString(referencePath), 'capture reference path is empty');
  assert(!path.isAbsolute(referencePath), `capture reference path is absolute: ${referencePath}`);
  assert(referencePath.split(path.posix.sep).every((segment) => segment !== '..'), `capture reference path escapes its evidence directory: ${referencePath}`);

  const allowedRoot = path.resolve(repoRoot, 'design-spec/references/foundations');
  const resolved = path.resolve(repoRoot, referencePath);
  const relative = path.relative(allowedRoot, resolved);
  assert(relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative), `capture reference path is outside design-spec/references/foundations/: ${referencePath}`);
  return resolved;
}

function validateCategory(name, records) {
  assert(Array.isArray(records), `category ${name} must be an array`);
  if (EXACT_COUNTS[name] !== undefined) {
    assert(records.length === EXACT_COUNTS[name], `category ${name} must contain exactly ${EXACT_COUNTS[name]} records; found ${records.length}`);
  }
  if (NON_EMPTY_CATEGORIES.includes(name)) assert(records.length > 0, `category ${name} must not be empty`);

  assertSorted(records.map((record) => record.name), `category ${name}`);
  assertUnique(records, 'name', `category ${name}`);
  assertUnique(records, 'sourceId', `category ${name}`);

  for (const record of records) {
    const label = `category ${name} record "${record.name}"`;
    assert(record.fileId === FILE_ID, `${label} has invalid fileId`);
    assert(record.pageId === FOUNDATIONS_PAGE_ID, `${label} has invalid pageId`);
    assert(isNonEmptyString(record.kind), `${label} has no kind`);
    assert(record.rawValue !== null && record.rawValue !== undefined, `${label} has no rawValue`);
    assert(record.resolvedValue !== null && record.resolvedValue !== undefined, `${label} has no resolvedValue`);
    assert(Array.isArray(record.aliases), `${label} aliases must be an array`);
    assert(Array.isArray(record.themes), `${label} themes must be an array`);

    if (name === 'typography') {
      assert(record.tokenSet === null, `${label} must not claim a token set`);
      assert(record.font && typeof record.font === 'object', `${label} has no font metrics`);
      for (const field of ['id', 'family', 'variantId', 'style']) assert(isNonEmptyString(record.font[field]), `${label} font.${field} is empty`);
      for (const field of ['weight', 'size', 'lineHeight', 'letterSpacing']) assert(Number.isFinite(record.font[field]), `${label} font.${field} is not numeric`);
    } else {
      assert(record.tokenSet?.id && record.tokenSet?.name, `${label} has incomplete token-set provenance`);
    }
  }
}

function validateComponentInventory(inventory) {
  assert(inventory?.pageId === COMPONENTS_PAGE_ID, 'component inventory has invalid pageId');
  assert(Array.isArray(inventory.records) && inventory.records.length > 0, 'component inventory must not be empty');
  assertSorted(inventory.records.map((record) => `${record.libraryPath}\0${record.name}`), 'component inventory');
  assertUnique(inventory.records, 'sourceId', 'component inventory');
  assertUnique(inventory.records, 'sourceNodeId', 'component inventory');

  for (const record of inventory.records) {
    const label = `component "${record.name}"`;
    assert(record.kind === 'component', `${label} has invalid kind`);
    assert(isNonEmptyString(record.libraryPath), `${label} has no libraryPath`);
    assert(record.fileId === FILE_ID, `${label} has invalid fileId`);
    assert(record.pageId === COMPONENTS_PAGE_ID, `${label} has invalid pageId`);
    assert(typeof record.isVariant === 'boolean', `${label} has invalid isVariant`);
    assert(Array.isArray(record.axes), `${label} axes must be an array`);
    assert(Array.isArray(record.variantSourceIds), `${label} variantSourceIds must be an array`);
    assertSorted(record.variantSourceIds, `${label} variant source IDs`);
    assert(new Set(record.variantSourceIds).size === record.variantSourceIds.length, `${label} has duplicate variant source IDs`);
    if (record.isVariant) assert(record.variantSourceIds.length > 0, `${label} has no variant source IDs`);
    for (const axis of record.axes) {
      assert(isNonEmptyString(axis.name), `${label} has an unnamed variant axis`);
      assert(Array.isArray(axis.values) && axis.values.length > 0, `${label} axis "${axis.name}" has no states`);
      assertSorted(axis.values, `${label} axis "${axis.name}"`);
      assert(new Set(axis.values).size === axis.values.length, `${label} axis "${axis.name}" has duplicate states`);
    }
  }
}

function validateDeviations(deviations, manifest) {
  assert(deviations?.schemaVersion === 1, 'deviations schemaVersion must be 1');
  assert(deviations.source?.fileId === manifest.fileId, 'deviations source fileId does not match manifest');
  assert(deviations.source?.pageId === manifest.pageId, 'deviations source pageId does not match manifest');
  assert(deviations.source?.revision === manifest.sourceRevision, 'deviations source revision does not match manifest');
  assert(JSON.stringify(deviations.requiredEntryFields) === JSON.stringify(DEVIATION_FIELDS), 'deviations requiredEntryFields contract is invalid');
  assert(Array.isArray(deviations.deviations), 'deviations must be an array');
  deviations.deviations.forEach((entry, index) => {
    for (const field of DEVIATION_FIELDS) {
      const value = entry[field];
      const completeObject = value && typeof value === 'object' && Object.keys(value).length > 0;
      assert(isNonEmptyString(value) || completeObject, `deviation ${index} is missing ${field}`);
    }
  });
}

function validateCapture(capture, manifest, repoRoot) {
  assert(capture?.schemaVersion === 1, 'capture schemaVersion must be 1');
  assert(capture.fileId === manifest.fileId, 'capture fileId does not match manifest');
  assert(capture.pageId === manifest.pageId, 'capture pageId does not match manifest');
  assert(capture.revision === manifest.sourceRevision, 'capture revision does not match manifest');
  assert(capture.capturedAt === manifest.capturedAt, 'capture timestamp does not match manifest');
  assert(capture.sourceNodeId === FOUNDATIONS_NODE_ID, 'capture source node is not the Foundations board');
  assert(capture.reference?.mimeType === 'image/png', 'capture reference must be image/png');
  assert(Number.isInteger(capture.reference.width) && capture.reference.width > 0, 'capture width is invalid');
  assert(Number.isInteger(capture.reference.height) && capture.reference.height > 0, 'capture height is invalid');
  assert(Number.isInteger(capture.reference.byteLength) && capture.reference.byteLength > 0, 'capture byteLength is invalid');
  assert(/^[a-f0-9]{64}$/.test(capture.reference.sha256), 'capture sha256 is malformed');

  const resolved = assertSafeReference(repoRoot, capture.reference.path);
  assert(fs.existsSync(resolved), `capture reference file does not exist: ${capture.reference.path}`);
  const bytes = fs.readFileSync(resolved);
  assert(bytes.length === capture.reference.byteLength, 'capture byteLength does not match the retained reference');
  assert(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'capture reference is not a PNG');
  assert(bytes.readUInt32BE(16) === capture.reference.width, 'capture PNG width does not match provenance');
  assert(bytes.readUInt32BE(20) === capture.reference.height, 'capture PNG height does not match provenance');
  assert(crypto.createHash('sha256').update(bytes).digest('hex') === capture.reference.sha256, 'capture sha256 does not match the retained reference');
}

export function validateEvidence({ manifest, capture, deviations, repoRoot }) {
  assert(manifest?.schemaVersion === 1, 'manifest schemaVersion must be 1');
  assert(manifest.fileId === FILE_ID, 'manifest has invalid authoritative fileId');
  assert(manifest.pageId === FOUNDATIONS_PAGE_ID, 'manifest has invalid authoritative pageId');
  assert(manifest.pageName === '01 Foundations', 'manifest has invalid authoritative page name');
  assert(Number.isInteger(manifest.sourceRevision) && manifest.sourceRevision > 0, 'manifest sourceRevision is invalid');
  assert(!Number.isNaN(Date.parse(manifest.capturedAt)), 'manifest capturedAt is invalid');
  assert(manifest.source?.tool === 'Penpot MCP Plugin API', 'manifest source tool is invalid');
  assert(manifest.source?.mode === 'read-only', 'manifest must record read-only extraction');
  assert(isNonEmptyString(manifest.source?.pluginVersion), 'manifest plugin version is missing');
  assert(JSON.stringify(manifest.categoryOrder) === JSON.stringify(CATEGORY_ORDER), 'manifest categoryOrder is invalid');
  assert(JSON.stringify(Object.keys(manifest.categories ?? {})) === JSON.stringify(CATEGORY_ORDER), 'manifest categories are not in deterministic order');

  for (const name of CATEGORY_ORDER) validateCategory(name, manifest.categories[name]);
  validateComponentInventory(manifest.componentInventory);
  validateCapture(capture, manifest, repoRoot);
  validateDeviations(deviations, manifest);
  return Object.fromEntries(CATEGORY_ORDER.map((name) => [name, manifest.categories[name].length]));
}

function expectFailure(label, mutate, evidence, pattern) {
  const copy = structuredClone(evidence);
  mutate(copy);
  let message = '';
  try {
    validateEvidence(copy);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assert(message && pattern.test(message), `controlled rejection "${label}" did not fail as expected; received: ${message || 'no error'}`);
}

function loadEvidence(repoRoot) {
  const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
  return {
    manifest: readJson('design-spec/penpot-foundations.json'),
    capture: readJson('design-spec/references/foundations/capture.json'),
    deviations: readJson('design-spec/deviations.json'),
    repoRoot,
  };
}

function runControlledRejections(evidence) {
  expectFailure('empty category', (copy) => { copy.manifest.categories.spacing = []; }, evidence, /category spacing/);
  expectFailure('duplicate name', (copy) => {
    copy.manifest.categories.colors[1].name = copy.manifest.categories.colors[0].name;
    copy.manifest.categories.colors.sort((a, b) => compare(a.name, b.name));
  }, evidence, /duplicate name/);
  expectFailure('duplicate source ID', (copy) => {
    copy.manifest.categories.spacing[1].sourceId = copy.manifest.categories.spacing[0].sourceId;
  }, evidence, /duplicate sourceId/);
  expectFailure('shuffled order', (copy) => { copy.manifest.categories.spacing.reverse(); }, evidence, /not deterministically sorted/);
  expectFailure('unsafe reference path', (copy) => { copy.capture.reference.path = '../outside.png'; }, evidence, /escapes its evidence directory|outside design-spec/);
  expectFailure('incomplete deviation', (copy) => {
    copy.deviations.deviations = [{ source: 'Penpot', platform: 'ios', reason: 'controlled rejection' }];
  }, evidence, /missing disposition/);
}

function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const evidence = loadEvidence(repoRoot);
  const counts = validateEvidence(evidence);
  runControlledRejections(evidence);
  console.log(
    `Penpot evidence valid: ${counts.colors} colors, ${counts.typography} typography styles, ` +
      `${counts.spacing} spacing, ${counts.radii} radii, ${counts.dimensions} dimensions, ` +
      `${counts.borderWidths} border widths, ${counts.opacities} opacity; controlled rejections passed`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`Penpot evidence validation failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
