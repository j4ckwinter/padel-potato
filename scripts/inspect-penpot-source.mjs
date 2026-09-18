import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_LIMITS,
  buildSourceIndex,
  canonicalManifestText,
  inspectSource,
  parseZip,
  querySource,
  validateManifestText,
} from './penpot-source.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(repoRoot, 'design-source', 'padel-potato UI Concepts.penpot');
const manifestPath = path.join(repoRoot, 'design-spec', 'penpot-source.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function expectRejection(label, operation, pattern) {
  let message = '';
  try {
    operation();
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assert(message && pattern.test(message), `${label} was not rejected as expected; received: ${message || 'no error'}`);
}

function findCentralHeaders(bytes) {
  const offsets = [];
  for (let offset = 0; offset <= bytes.length - 46; offset += 1) {
    if (bytes.readUInt32LE(offset) === 0x02014b50) {
      offsets.push(offset);
      offset += 45 + bytes.readUInt16LE(offset + 28) + bytes.readUInt16LE(offset + 30) + bytes.readUInt16LE(offset + 32);
    }
  }
  return offsets;
}

function overwriteCentralName(bytes, headerOffset, name) {
  const length = bytes.readUInt16LE(headerOffset + 28);
  assert(Buffer.byteLength(name) === length, 'controlled central-directory name must preserve byte length');
  bytes.write(name, headerOffset + 46, length, 'utf8');
}

function runSelfTests(sourceBytes, manifestText) {
  const headers = findCentralHeaders(sourceBytes);
  assert(headers.length > 2, 'controlled rejection fixture has too few entries');

  const duplicate = Buffer.from(sourceBytes);
  const headerByLength = new Map();
  let duplicatePair;
  for (const header of headers) {
    const length = duplicate.readUInt16LE(header + 28);
    if (headerByLength.has(length)) {
      duplicatePair = [headerByLength.get(length), header];
      break;
    }
    headerByLength.set(length, header);
  }
  assert(duplicatePair, 'controlled rejection fixture has no equal-length paths');
  const [firstHeader, sameLengthHeader] = duplicatePair;
  const firstLength = duplicate.readUInt16LE(firstHeader + 28);
  const firstName = duplicate.toString('utf8', firstHeader + 46, firstHeader + 46 + firstLength);
  overwriteCentralName(duplicate, sameLengthHeader, firstName);
  expectRejection('duplicate ZIP path', () => parseZip(duplicate), /duplicate ZIP path/i);

  const traversal = Buffer.from(sourceBytes);
  const traversalLength = traversal.readUInt16LE(headers[0] + 28);
  overwriteCentralName(traversal, headers[0], `../${'a'.repeat(traversalLength - 3)}`);
  expectRejection('path traversal', () => parseZip(traversal), /unsafe ZIP path/i);

  const compression = Buffer.from(sourceBytes);
  compression.writeUInt16LE(99, headers[0] + 10);
  expectRejection('unsupported compression', () => parseZip(compression), /compression method/i);

  expectRejection('truncated header', () => parseZip(sourceBytes.subarray(0, 12)), /truncated|end of central directory/i);

  const offset = Buffer.from(sourceBytes);
  offset.writeUInt32LE(0xffffff00, headers[0] + 42);
  expectRejection('out-of-bounds local offset', () => parseZip(offset), /offset|bounds/i);

  expectRejection('entry count limit', () => parseZip(sourceBytes, { ...DEFAULT_LIMITS, maxEntries: 1 }), /entry count/i);
  expectRejection('compressed size limit', () => parseZip(sourceBytes, { ...DEFAULT_LIMITS, maxCompressedBytes: 1 }), /compressed size/i);
  expectRejection('uncompressed size limit', () => parseZip(sourceBytes, { ...DEFAULT_LIMITS, maxUncompressedBytes: 1 }), /uncompressed size/i);

  const manifest = JSON.parse(manifestText);
  const checksumDrift = structuredClone(manifest);
  checksumDrift.archive.sha256 = '0'.repeat(64);
  expectRejection('checksum drift', () => validateManifestText(sourceBytes, `${JSON.stringify(checksumDrift, null, 2)}\n`), /checksum|manifest differs/i);

  const revisionDrift = structuredClone(manifest);
  revisionDrift.file.revision -= 1;
  expectRejection('revision drift', () => validateManifestText(sourceBytes, `${JSON.stringify(revisionDrift, null, 2)}\n`), /revision|manifest differs/i);

  const missingPage = structuredClone(manifest);
  missingPage.pages = missingPage.pages.filter((page) => page.name !== '02 Components');
  expectRejection('missing required page', () => validateManifestText(sourceBytes, `${JSON.stringify(missingPage, null, 2)}\n`), /required page|manifest differs/i);
}

function usage() {
  return [
    'Usage: node scripts/inspect-penpot-source.mjs [mode]',
    '  (no args)                 Print canonical source identity and inventory',
    '  --list pages|components  List stable page or component records',
    '  --query <uuid|name>       Find exact UUID or exact design name',
    '  --page <uuid|name>        Find an exact page',
    '  --shape <uuid|name>       Find an exact shape',
    '  --component <uuid|name>   Find an exact component',
    '  --write                   Regenerate design-spec/penpot-source.json',
    '  --check                   Check archive bytes and manifest deterministically',
    '  --self-test               Run controlled malformed-archive rejections',
  ].join('\n');
}

function valueAfter(args, flag) {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
  return value;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log(usage());
    return;
  }

  const sourceBytes = fs.readFileSync(sourcePath);
  const archive = parseZip(sourceBytes);
  const index = buildSourceIndex(archive);
  const manifestText = canonicalManifestText(sourceBytes, index);

  if (args.includes('--write')) {
    fs.writeFileSync(manifestPath, manifestText);
    console.log('Updated design-spec/penpot-source.json');
  }
  if (args.includes('--check')) {
    validateManifestText(sourceBytes, fs.readFileSync(manifestPath, 'utf8'));
    console.log('Canonical Penpot source manifest matches the archive.');
  }
  if (args.includes('--self-test')) {
    runSelfTests(sourceBytes, manifestText);
    console.log('Controlled malformed-archive rejections passed.');
  }

  const list = valueAfter(args, '--list');
  const query = valueAfter(args, '--query');
  const page = valueAfter(args, '--page');
  const shape = valueAfter(args, '--shape');
  const component = valueAfter(args, '--component');
  if (list) {
    assert(list === 'pages' || list === 'components', '--list supports only pages or components');
    console.log(JSON.stringify(list === 'pages' ? index.pages : index.components, null, 2));
  } else if (query || page || shape || component) {
    const kind = page ? 'page' : shape ? 'shape' : component ? 'component' : undefined;
    const value = page ?? shape ?? component ?? query;
    const matches = querySource(index, value, kind);
    if (matches.length === 0) throw new Error(`No exact ${kind ?? 'record'} match for ${JSON.stringify(value)}`);
    console.log(JSON.stringify(matches, null, 2));
  } else if (!args.includes('--write') && !args.includes('--check') && !args.includes('--self-test')) {
    console.log(JSON.stringify(inspectSource(sourceBytes, index), null, 2));
  }
}

try {
  main();
} catch (error) {
  console.error(`Penpot source inspection failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
