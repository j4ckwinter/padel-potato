import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND_SOURCES, FILE_ID, ICON_SOURCES, PAGE_ID, REVISION, generateAssetOutputs } from './export-penpot-assets.mjs';

const SHA = /^[a-f0-9]{64}$/;
const FORBIDDEN = /<script|<style|foreignObject|\son[a-z]+\s*=|(?:href|src)="https?:|xlink:href|<image|javascript:/i;
const ALLOWED_TAGS = new Set(['svg', 'path', 'rect', 'ellipse']);
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function resolveInside(repoRoot, relative, expectedRoot, extension) {
  assert(typeof relative === 'string' && !path.isAbsolute(relative), `unsafe absolute path: ${relative}`);
  assert(!relative.split(/[\\/]/).includes('..'), `unsafe traversing path: ${relative}`);
  assert(path.extname(relative) === extension, `unexpected extension: ${relative}`);
  const allowed = path.resolve(repoRoot, expectedRoot);
  const resolved = path.resolve(repoRoot, relative);
  const rel = path.relative(allowed, resolved);
  assert(rel && !rel.startsWith('..') && !path.isAbsolute(rel), `path outside fixed root: ${relative}`);
  return resolved;
}

function validateSvg(xml, record) {
  assert(!FORBIDDEN.test(xml), `${record.name} contains unsafe or external SVG content`);
  assert(!/\bid="([^"]+)"[\s\S]*\bid="\1"/.test(xml), `${record.name} contains duplicate ids`);
  for (const match of xml.matchAll(/<\/?([A-Za-z][\w:-]*)\b/g)) assert(ALLOWED_TAGS.has(match[1]), `${record.name} has unsupported tag ${match[1]}`);
  const viewBox = xml.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number);
  assert(viewBox?.length === 4 && viewBox.every(Number.isFinite), `${record.name} has invalid viewBox`);
  assert(viewBox[2] === 20 && viewBox[3] === 20, `${record.name} canvas must be 20x20`);
  assert(/stroke-width="1\.75"/.test(xml), `${record.name} has no authored 1.75 stroke`);
  assert(xml.includes('currentColor'), `${record.name} normalized paint is not semantic`);
}

export function validateAssetEvidence({ manifest, repoRoot }) {
  assert(manifest?.schemaVersion === 1, 'schemaVersion must be 1');
  assert(manifest.fileId === FILE_ID, 'wrong file identity');
  assert(manifest.pageId === PAGE_ID, 'wrong page identity');
  assert(manifest.revision === REVISION, 'wrong source revision');
  assert(Array.isArray(manifest.icons) && manifest.icons.length === 18, 'icon inventory must contain exactly 18 records');
  assert(Array.isArray(manifest.brands) && manifest.brands.length === 2, 'brand inventory must contain exactly two records');
  assert(JSON.stringify(manifest.icons.map((x) => x.name)) === JSON.stringify(ICON_SOURCES.map((x) => x[0])), 'icon inventory order or names changed');
  assert(JSON.stringify(manifest.brands.map((x) => x.name)) === JSON.stringify(BRAND_SOURCES.map((x) => x[0])), 'brand inventory order or names changed');
  assert(new Set(manifest.icons.map((x) => x.name)).size === 18, 'duplicate icon name');
  assert(new Set(manifest.icons.map((x) => x.sourceId)).size === 18, 'duplicate icon sourceId');
  for (const [index, record] of manifest.icons.entries()) {
    const expected = ICON_SOURCES[index];
    assert(record.sourceId === expected[2] && record.sourceNodeId === expected[3], `${record.name} source identity changed`);
    const raw = fs.readFileSync(resolveInside(repoRoot, record.rawPath, 'design-spec/assets/raw', '.svg'));
    const normalized = fs.readFileSync(resolveInside(repoRoot, record.normalizedPath, 'design-spec/assets/normalized', '.svg'));
    assert(SHA.test(record.rawSha256) && sha256(raw) === record.rawSha256, `${record.name} raw hash mismatch`);
    assert(SHA.test(record.normalizedSha256) && sha256(normalized) === record.normalizedSha256, `${record.name} normalized hash mismatch`);
    validateSvg(normalized.toString('utf8'), record);
  }
  for (const [index, record] of manifest.brands.entries()) {
    const expected = BRAND_SOURCES[index];
    assert(record.sourceId === expected[2] && record.sourceNodeId === expected[3], `${record.name} source identity changed`);
    assert(record.width === expected[4] && record.height === expected[5], `${record.name} ratio changed`);
    for (const [field, fixedRoot] of [['rawPath', 'design-spec/assets/raw'], ['normalizedPath', 'design-spec/assets/normalized'], ['referencePath', 'design-spec/references/components']]) {
      const bytes = fs.readFileSync(resolveInside(repoRoot, record[field], fixedRoot, '.png'));
      assert(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), `${record.name} is not PNG`);
      const hashField = field === 'referencePath' ? 'referenceSha256' : field === 'rawPath' ? 'rawSha256' : 'normalizedSha256';
      assert(SHA.test(record[hashField]) && sha256(bytes) === record[hashField], `${record.name} ${field} hash mismatch`);
    }
  }
  return true;
}

function expectFailure(label, manifest, repoRoot, mutate) {
  const copy = structuredClone(manifest); mutate(copy); let error;
  try { validateAssetEvidence({ manifest: copy, repoRoot }); } catch (caught) { error = caught; }
  assert(error, `controlled rejection did not fail: ${label}`);
}

function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'design-spec/assets/penpot-assets.json'), 'utf8'));
  validateAssetEvidence({ manifest, repoRoot });
  expectFailure('revision', manifest, repoRoot, (copy) => { copy.revision = 291; });
  expectFailure('page', manifest, repoRoot, (copy) => { copy.pageId = '../outside'; });
  expectFailure('duplicate', manifest, repoRoot, (copy) => { copy.icons[1].name = copy.icons[0].name; });
  expectFailure('reorder', manifest, repoRoot, (copy) => { copy.icons.reverse(); });
  expectFailure('traversal', manifest, repoRoot, (copy) => { copy.icons[0].rawPath = '../add.svg'; });
  expectFailure('hash', manifest, repoRoot, (copy) => { copy.icons[0].rawSha256 = '0'.repeat(64); });
  const regenerated = generateAssetOutputs({ repoRoot, write: false });
  assert(regenerated.manifestText === `${JSON.stringify(manifest, null, 2)}\n`, 'manifest regeneration is not byte-identical');
  assert(regenerated.registryText === fs.readFileSync(path.join(repoRoot, 'src/design-system/assets/generated/iconRegistry.ts'), 'utf8'), 'registry regeneration is not byte-identical');
  console.log('Penpot assets valid: 18 icons, 2 brand lockups; controlled rejections and deterministic regeneration passed');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`Penpot asset validation failed: ${error.message}`); process.exitCode = 1; }
}
