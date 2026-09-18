import crypto from 'node:crypto';
import zlib from 'node:zlib';

export const CANONICAL_ARCHIVE_PATH = 'design-source/padel-potato UI Concepts.penpot';
export const EXPECTED_FILE_ID = 'c514c1fb-1cda-8125-8008-a606253a77a3';
export const EXPECTED_REVISION = 296;
export const REQUIRED_PAGES = Object.freeze([
  Object.freeze({ id: '482a7222-5a3b-8086-8008-a6072bd7e924', name: '01 Foundations' }),
  Object.freeze({ id: '482a7222-5a3b-8086-8008-a6073072bbb1', name: '02 Components' }),
  Object.freeze({ id: '482a7222-5a3b-8086-8008-a608ebaf11cd', name: '03 Product Screens' }),
]);

export const DEFAULT_LIMITS = Object.freeze({
  maxArchiveBytes: 64 * 1024 * 1024,
  maxEntries: 10_000,
  maxEntryCompressedBytes: 32 * 1024 * 1024,
  maxEntryUncompressedBytes: 32 * 1024 * 1024,
  maxCompressedBytes: 64 * 1024 * 1024,
  maxUncompressedBytes: 256 * 1024 * 1024,
});

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const SUPPORTED_METHODS = new Set([0, 8]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function mergeLimits(overrides) {
  const limits = { ...DEFAULT_LIMITS, ...overrides };
  for (const [name, value] of Object.entries(limits)) {
    assert(Number.isSafeInteger(value) && value > 0, `${name} must be a positive safe integer`);
  }
  return limits;
}

function assertRange(bytes, offset, length, label) {
  assert(Number.isSafeInteger(offset) && Number.isSafeInteger(length) && offset >= 0 && length >= 0, `${label} has an invalid byte range`);
  assert(offset <= bytes.length && length <= bytes.length - offset, `${label} is out of bounds`);
}

function findEndOfCentralDirectory(bytes) {
  const minimum = Math.max(0, bytes.length - 65_557);
  for (let offset = bytes.length - 22; offset >= minimum; offset -= 1) {
    if (bytes.readUInt32LE(offset) !== EOCD_SIGNATURE) continue;
    const commentLength = bytes.readUInt16LE(offset + 20);
    if (offset + 22 + commentLength === bytes.length) return offset;
  }
  throw new Error('ZIP end of central directory is missing or truncated');
}

function validateArchivePath(value) {
  assert(value.length > 0 && !value.includes('\0'), 'unsafe ZIP path: empty or NUL-bearing');
  assert(!value.includes('\\'), `unsafe ZIP path uses a backslash: ${JSON.stringify(value)}`);
  assert(!value.startsWith('/') && !/^[A-Za-z]:/.test(value), `unsafe ZIP path is absolute: ${JSON.stringify(value)}`);
  const segments = value.split('/');
  assert(segments.every((segment, index) => segment !== '.' && segment !== '..' && (segment !== '' || index === segments.length - 1)), `unsafe ZIP path contains traversal or empty segments: ${JSON.stringify(value)}`);
}

let crcTable;
function crc32(bytes) {
  if (!crcTable) {
    crcTable = Array.from({ length: 256 }, (_, value) => {
      let result = value;
      for (let bit = 0; bit < 8; bit += 1) result = (result & 1) ? 0xedb88320 ^ (result >>> 1) : result >>> 1;
      return result >>> 0;
    });
  }
  let result = 0xffffffff;
  for (const byte of bytes) result = crcTable[(result ^ byte) & 0xff] ^ (result >>> 8);
  return (result ^ 0xffffffff) >>> 0;
}

export function parseZip(bytes, limitOverrides = {}) {
  assert(Buffer.isBuffer(bytes), 'ZIP source must be a Buffer');
  const limits = mergeLimits(limitOverrides);
  assert(bytes.length <= limits.maxArchiveBytes, `ZIP archive size exceeds ${limits.maxArchiveBytes} bytes`);
  assert(bytes.length >= 22, 'ZIP archive is truncated before its end of central directory');

  const eocdOffset = findEndOfCentralDirectory(bytes);
  const disk = bytes.readUInt16LE(eocdOffset + 4);
  const centralDisk = bytes.readUInt16LE(eocdOffset + 6);
  const diskEntries = bytes.readUInt16LE(eocdOffset + 8);
  const entryCount = bytes.readUInt16LE(eocdOffset + 10);
  const centralSize = bytes.readUInt32LE(eocdOffset + 12);
  const centralOffset = bytes.readUInt32LE(eocdOffset + 16);
  assert(disk === 0 && centralDisk === 0 && diskEntries === entryCount, 'multi-disk ZIP archives are not supported');
  assert(entryCount !== 0xffff && centralSize !== 0xffffffff && centralOffset !== 0xffffffff, 'ZIP64 archives are not supported');
  assert(entryCount <= limits.maxEntries, `ZIP entry count exceeds ${limits.maxEntries}`);
  assertRange(bytes, centralOffset, centralSize, 'ZIP central directory');
  assert(centralOffset + centralSize <= eocdOffset, 'ZIP central directory overlaps its end record');

  const entries = [];
  const byPath = new Map();
  let offset = centralOffset;
  let totalCompressedBytes = 0;
  let totalUncompressedBytes = 0;
  for (let index = 0; index < entryCount; index += 1) {
    assertRange(bytes, offset, 46, `central directory header ${index}`);
    assert(bytes.readUInt32LE(offset) === CENTRAL_SIGNATURE, `central directory header ${index} is truncated or malformed`);
    const flags = bytes.readUInt16LE(offset + 8);
    const method = bytes.readUInt16LE(offset + 10);
    const crc = bytes.readUInt32LE(offset + 16);
    const compressedSize = bytes.readUInt32LE(offset + 20);
    const uncompressedSize = bytes.readUInt32LE(offset + 24);
    const nameLength = bytes.readUInt16LE(offset + 28);
    const extraLength = bytes.readUInt16LE(offset + 30);
    const commentLength = bytes.readUInt16LE(offset + 32);
    const diskStart = bytes.readUInt16LE(offset + 34);
    const localOffset = bytes.readUInt32LE(offset + 42);
    const headerLength = 46 + nameLength + extraLength + commentLength;
    assertRange(bytes, offset, headerLength, `central directory entry ${index}`);
    assert((flags & 0x1) === 0, `encrypted ZIP entry is not supported at index ${index}`);
    assert(SUPPORTED_METHODS.has(method), `unsupported ZIP compression method ${method} at index ${index}`);
    assert(diskStart === 0, `ZIP entry ${index} refers to another disk`);
    assert(compressedSize !== 0xffffffff && uncompressedSize !== 0xffffffff && localOffset !== 0xffffffff, `ZIP64 entry ${index} is not supported`);
    assert(compressedSize <= limits.maxEntryCompressedBytes, `ZIP entry compressed size exceeds ${limits.maxEntryCompressedBytes} bytes`);
    assert(uncompressedSize <= limits.maxEntryUncompressedBytes, `ZIP entry uncompressed size exceeds ${limits.maxEntryUncompressedBytes} bytes`);
    totalCompressedBytes += compressedSize;
    totalUncompressedBytes += uncompressedSize;
    assert(totalCompressedBytes <= limits.maxCompressedBytes, `ZIP aggregate compressed size exceeds ${limits.maxCompressedBytes} bytes`);
    assert(totalUncompressedBytes <= limits.maxUncompressedBytes, `ZIP aggregate uncompressed size exceeds ${limits.maxUncompressedBytes} bytes`);

    const archivePath = bytes.toString('utf8', offset + 46, offset + 46 + nameLength);
    validateArchivePath(archivePath);
    assert(!byPath.has(archivePath), `duplicate ZIP path: ${archivePath}`);
    assertRange(bytes, localOffset, 30, `local header for ${archivePath}`);
    assert(bytes.readUInt32LE(localOffset) === LOCAL_SIGNATURE, `local header offset for ${archivePath} is invalid`);
    const localFlags = bytes.readUInt16LE(localOffset + 6);
    const localMethod = bytes.readUInt16LE(localOffset + 8);
    const localNameLength = bytes.readUInt16LE(localOffset + 26);
    const localExtraLength = bytes.readUInt16LE(localOffset + 28);
    assert(localFlags === flags && localMethod === method, `local header metadata differs for ${archivePath}`);
    assertRange(bytes, localOffset + 30, localNameLength + localExtraLength, `local name for ${archivePath}`);
    const localPath = bytes.toString('utf8', localOffset + 30, localOffset + 30 + localNameLength);
    assert(localPath === archivePath, `local and central paths differ for ${archivePath}`);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    assertRange(bytes, dataOffset, compressedSize, `compressed data for ${archivePath}`);

    const entry = Object.freeze({ archivePath, method, crc, compressedSize, uncompressedSize, dataOffset });
    entries.push(entry);
    byPath.set(archivePath, entry);
    offset += headerLength;
  }
  assert(offset === centralOffset + centralSize, 'ZIP central directory size does not match its entries');

  function readEntry(pathOrEntry) {
    const entry = typeof pathOrEntry === 'string' ? byPath.get(pathOrEntry) : pathOrEntry;
    assert(entry, `ZIP entry does not exist: ${String(pathOrEntry)}`);
    const compressed = bytes.subarray(entry.dataOffset, entry.dataOffset + entry.compressedSize);
    const output = entry.method === 0 ? Buffer.from(compressed) : zlib.inflateRawSync(compressed, { maxOutputLength: limits.maxEntryUncompressedBytes });
    assert(output.length === entry.uncompressedSize, `uncompressed size differs for ${entry.archivePath}`);
    assert(crc32(output) === entry.crc, `CRC checksum differs for ${entry.archivePath}`);
    return output;
  }

  return Object.freeze({ entries: Object.freeze(entries), byPath, entryCount, totalCompressedBytes, totalUncompressedBytes, readEntry });
}

function parseJsonEntry(archive, entry) {
  let value;
  try {
    value = JSON.parse(archive.readEntry(entry).toString('utf8'));
  } catch (error) {
    throw new Error(`invalid JSON in ${entry.archivePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
  assert(value && typeof value === 'object' && !Array.isArray(value), `JSON record is not an object: ${entry.archivePath}`);
  return value;
}

function stableRecord(kind, entry, data, page) {
  return Object.freeze({
    kind,
    archivePath: entry.archivePath,
    id: typeof data.id === 'string' ? data.id : null,
    name: typeof data.name === 'string' ? data.name : null,
    pageId: page?.id ?? (typeof data.pageId === 'string' ? data.pageId : null),
    pageName: page?.name ?? null,
    data,
  });
}

export function buildSourceIndex(archive) {
  const rootCandidates = archive.entries.filter((entry) => /^files\/[^/]+\.json$/.test(entry.archivePath));
  assert(rootCandidates.length === 1, `expected one Penpot file record, found ${rootCandidates.length}`);
  const file = parseJsonEntry(archive, rootCandidates[0]);
  assert(typeof file.id === 'string' && UUID_PATTERN.test(file.id), 'Penpot file record has no valid UUID');

  const escapedFileId = file.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pagePattern = new RegExp(`^files/${escapedFileId}/pages/([0-9a-f-]+)\\.json$`, 'i');
  const shapePattern = new RegExp(`^files/${escapedFileId}/pages/([0-9a-f-]+)/([0-9a-f-]+)\\.json$`, 'i');
  const categoryPattern = new RegExp(`^files/${escapedFileId}/(components|colors|typographies|media)/([0-9a-f-]+)\\.json$`, 'i');
  const pages = [];
  const pageById = new Map();
  for (const entry of archive.entries) {
    const match = entry.archivePath.match(pagePattern);
    if (!match) continue;
    const data = parseJsonEntry(archive, entry);
    assert(data.id === match[1] && typeof data.name === 'string', `invalid page record: ${entry.archivePath}`);
    const page = stableRecord('page', entry, data);
    pages.push(page);
    pageById.set(page.id, page);
  }
  pages.sort((a, b) => (a.data.index ?? 0) - (b.data.index ?? 0) || a.id.localeCompare(b.id));

  const shapes = [];
  const components = [];
  const records = [...pages];
  const counts = { shapes: 0, components: 0, colors: 0, typographies: 0, media: 0, thumbnails: 0, other: 0 };
  for (const entry of archive.entries) {
    let match = entry.archivePath.match(shapePattern);
    if (match) {
      const page = pageById.get(match[1]);
      assert(page, `shape belongs to an unknown page: ${entry.archivePath}`);
      const record = stableRecord('shape', entry, parseJsonEntry(archive, entry), page);
      shapes.push(record);
      records.push(record);
      counts.shapes += 1;
      continue;
    }
    match = entry.archivePath.match(categoryPattern);
    if (match) {
      const singular = match[1] === 'typographies' ? 'typography' : match[1].slice(0, -1);
      const record = stableRecord(singular, entry, parseJsonEntry(archive, entry));
      records.push(record);
      counts[match[1]] += 1;
      if (match[1] === 'components') components.push(record);
      continue;
    }
    if (entry.archivePath.includes('/thumbnails/')) counts.thumbnails += 1;
    else if (entry !== rootCandidates[0] && !entry.archivePath.match(pagePattern)) counts.other += 1;
  }
  shapes.sort((a, b) => a.archivePath.localeCompare(b.archivePath));
  components.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '') || a.id.localeCompare(b.id));
  records.sort((a, b) => a.archivePath.localeCompare(b.archivePath));

  return Object.freeze({ archive, file, pages: Object.freeze(pages), shapes: Object.freeze(shapes), components: Object.freeze(components), records: Object.freeze(records), counts: Object.freeze(counts) });
}

function publicRecord(record, includeData = false) {
  const result = {
    kind: record.kind,
    id: record.id,
    name: record.name,
    pageId: record.pageId,
    pageName: record.pageName,
    archivePath: record.archivePath,
  };
  if (includeData) result.data = record.data;
  return result;
}

export function querySource(index, value, kind) {
  assert(typeof value === 'string' && value.length > 0, 'query value must be non-empty');
  const matches = index.records.filter((record) => (!kind || record.kind === kind) && (record.id === value || record.name === value));
  return matches.map((record) => publicRecord(record, true));
}

function buildManifest(sourceBytes, index) {
  const { archive, file } = index;
  const pageShapeCounts = new Map(index.pages.map((page) => [page.id, 0]));
  for (const shape of index.shapes) pageShapeCounts.set(shape.pageId, (pageShapeCounts.get(shape.pageId) ?? 0) + 1);
  return {
    schemaVersion: 1,
    canonicalPath: CANONICAL_ARCHIVE_PATH,
    archive: {
      format: 'Penpot ZIP export',
      byteLength: sourceBytes.length,
      sha256: sha256(sourceBytes),
      entryCount: archive.entryCount,
      totalCompressedBytes: archive.totalCompressedBytes,
      totalUncompressedBytes: archive.totalUncompressedBytes,
    },
    file: {
      id: file.id,
      name: file.name,
      revision: file.revn,
      version: file.version,
      modifiedAt: file.modifiedAt,
      teamId: file.teamId,
      projectId: file.projectId,
      features: [...(file.features ?? [])].sort(),
      hasMediaTrimmed: file.hasMediaTrimmed,
      metadata: file.metadata ?? {},
    },
    pages: index.pages.map((page) => ({ id: page.id, name: page.name, index: page.data.index, shapeCount: pageShapeCounts.get(page.id) })),
    inventory: { ...index.counts },
  };
}

function validateCanonicalIdentity(manifest) {
  assert(manifest.file.id === EXPECTED_FILE_ID, `canonical file ID differs: ${manifest.file.id}`);
  assert(manifest.file.revision === EXPECTED_REVISION, `canonical revision differs: ${manifest.file.revision}`);
  assert(manifest.file.hasMediaTrimmed === false, 'canonical source unexpectedly has trimmed media');
  for (const required of REQUIRED_PAGES) {
    assert(manifest.pages.some((page) => page.id === required.id && page.name === required.name), `required page is missing or renamed: ${required.name} (${required.id})`);
  }
}

export function canonicalManifestText(sourceBytes, index = buildSourceIndex(parseZip(sourceBytes))) {
  const manifest = buildManifest(sourceBytes, index);
  validateCanonicalIdentity(manifest);
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

export function validateManifestText(sourceBytes, manifestText) {
  let committed;
  try {
    committed = JSON.parse(manifestText);
  } catch (error) {
    throw new Error(`committed source manifest is invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  validateCanonicalIdentity(committed);
  const expectedText = canonicalManifestText(sourceBytes);
  assert(manifestText === expectedText, 'committed source manifest differs from the canonical archive (checksum, revision, structure, or inventory drift)');
  return committed;
}

export function inspectSource(sourceBytes, index = buildSourceIndex(parseZip(sourceBytes))) {
  const manifest = buildManifest(sourceBytes, index);
  validateCanonicalIdentity(manifest);
  return manifest;
}
