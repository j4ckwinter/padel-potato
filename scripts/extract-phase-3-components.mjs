import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  EXPECTED_FILE_ID,
  buildSourceIndex,
  parseZip,
} from './penpot-source.mjs';

export const REVISION = 296;
export const PAGE_ID = '482a7222-5a3b-8086-8008-a6073072bbb1';
export const EVIDENCE_PATH = 'design-spec/components/phase-3-components.json';
export const REGISTRY_PATH = 'src/design-system/components/sourceRegistry.ts';

export const FAMILY_SOURCES = Object.freeze([
  Object.freeze({ key: 'button', name: 'Button', sourceId: '482a7222-5a3b-8086-8008-a60ea01107a5', count: 9, kind: 'set' }),
  Object.freeze({ key: 'iconButton', name: 'Icon Button', sourceId: '482a7222-5a3b-8086-8008-a60eda8bf731', count: 6, kind: 'set' }),
  Object.freeze({ key: 'favourite', name: 'Favourite', sourceId: 'ab02a31f-1852-80be-8008-a6fb4b80c769', count: 2, kind: 'set' }),
  Object.freeze({ key: 'field', name: 'Field', sourceId: '482a7222-5a3b-8086-8008-a60edc77a99f', count: 12, kind: 'set' }),
  Object.freeze({ key: 'choiceChip', name: 'Choice Chip', sourceId: '482a7222-5a3b-8086-8008-a61b1055dd19', count: 8, kind: 'set' }),
  Object.freeze({ key: 'checkbox', name: 'Checkbox', sourceId: '482a7222-5a3b-8086-8008-a61e92e286a2', count: 4, kind: 'set' }),
  Object.freeze({ key: 'dayTimeSelector', name: 'Day Time Selector', sourceId: '482a7222-5a3b-8086-8008-a62580c2b764', count: 6, kind: 'set' }),
  Object.freeze({ key: 'socialSignInButton', name: 'Social Sign-In Button', sourceId: '482a7222-5a3b-8086-8008-a61e90365f95', count: 8, kind: 'set' }),
  Object.freeze({ key: 'authDivider', name: 'Auth Divider', sourceId: '482a7222-5a3b-8086-8008-a61e93b191ff', count: 1, kind: 'singleton' }),
  Object.freeze({ key: 'bottomNavigation', name: 'Bottom Navigation', sourceId: '482a7222-5a3b-8086-8008-a61a5487bd61', count: 5, kind: 'set' }),
  Object.freeze({ key: 'segmentedControl', name: 'Segmented Control', sourceId: '482a7222-5a3b-8086-8008-a60ede25d147', count: 4, kind: 'set' }),
  Object.freeze({ key: 'appHeader', name: 'App Header', sourceId: '482a7222-5a3b-8086-8008-a61da61c2e7f', count: 9, kind: 'set' }),
  Object.freeze({ key: 'sectionHeader', name: 'Section Header', sourceId: '482a7222-5a3b-8086-8008-a608c3bde79a', count: 1, kind: 'singleton' }),
]);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(repoRoot, 'design-source', 'padel-potato UI Concepts.penpot');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const lowerCamel = (value) => {
  const words = value.trim().split(/[^A-Za-z0-9]+/u).filter(Boolean);
  assert(words.length > 0, `cannot normalize an empty source value: ${JSON.stringify(value)}`);
  return words
    .map((word, index) => {
      const lowered = word.toLowerCase();
      return index === 0 ? lowered : `${lowered[0].toUpperCase()}${lowered.slice(1)}`;
    })
    .join('');
};

const tupleObject = (properties) => Object.fromEntries(
  properties.map(({ name, value }) => [name, value]),
);

function normalizeTuple(familyKey, properties) {
  if (familyKey === 'favourite') {
    assert(properties.length === 1 && properties[0].name === 'Property 1', 'Favourite normalization source changed');
    assert(['Default', 'Selected'].includes(properties[0].value), 'Favourite Property 1 value changed');
    return { checked: properties[0].value === 'Selected' };
  }

  return Object.fromEntries(properties.map(({ name, value }) => {
    const normalizedName = lowerCamel(name);
    const sourceValue = familyKey === 'iconButton' && name === 'Icon' && value === 'Value 2'
      ? 'Notification'
      : value;
    const numericValue = /^(?:0|[1-9][0-9]*)$/u.test(sourceValue)
      ? Number(sourceValue)
      : lowerCamel(sourceValue);
    return [normalizedName, numericValue];
  }));
}

function normalizedDimension(value) {
  if (Math.abs(value - 352) < 1e-9) return 352;
  if (Math.abs(value - 390) < 1e-9) return 390;
  return value;
}

function typographyFromContent(content) {
  const entries = [];
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (typeof node.text === 'string') {
      entries.push({
        text: node.text,
        fontFamily: node.fontFamily ?? null,
        fontSize: node.fontSize == null ? null : Number(node.fontSize),
        fontWeight: node.fontWeight == null ? null : Number(node.fontWeight),
        lineHeight: node.lineHeight == null ? null : Number(node.lineHeight),
        letterSpacing: node.letterSpacing == null ? null : Number(node.letterSpacing),
        fills: node.fills ?? [],
      });
    }
    for (const child of node.children ?? []) visit(child);
  };
  visit(content);
  return entries;
}

function recordMetrics(shape, shapeById) {
  const typography = [];
  const visit = (candidate) => {
    if (candidate.data.type === 'text') {
      typography.push(...typographyFromContent(candidate.data.content));
    }
    for (const childId of candidate.data.shapes ?? []) {
      const child = shapeById.get(childId);
      assert(child, `component descendant is missing: ${childId}`);
      visit(child);
    }
  };
  visit(shape);

  const data = shape.data;
  const rawWidth = data.width;
  const rawHeight = data.height;
  const width = normalizedDimension(rawWidth);
  const height = normalizedDimension(rawHeight);
  return {
    raw: { width: rawWidth, height: rawHeight },
    normalized: { width, height },
    normalization: rawWidth === width && rawHeight === height
      ? null
      : 'fractional 352/390 serialization cleanup',
    radii: [data.r1 ?? 0, data.r2 ?? 0, data.r3 ?? 0, data.r4 ?? 0],
    opacity: data.opacity ?? 1,
    layout: {
      mode: data.layout ?? null,
      gap: data.layoutGap ?? null,
      padding: data.layoutPadding ?? null,
    },
    fills: data.fills ?? [],
    strokes: data.strokes ?? [],
    typography,
  };
}

function assertActive(component) {
  const data = component.data;
  assert(data.deleted !== true && data.deletedAt == null, `deleted component record is not allowed: ${component.id}`);
}

export function generatePhase3Outputs({ root = repoRoot } = {}) {
  const archiveBytes = fs.readFileSync(path.join(root, 'design-source', 'padel-potato UI Concepts.penpot'));
  const index = buildSourceIndex(parseZip(archiveBytes));
  assert(index.file.id === EXPECTED_FILE_ID, `Phase 3 source file differs: ${index.file.id}`);
  assert(index.file.revn === REVISION, `Phase 3 source revision differs: ${index.file.revn}`);
  assert(index.pages.some((page) => page.id === PAGE_ID && page.name === '02 Components'), `Phase 3 components page is missing: ${PAGE_ID}`);

  const shapeById = new Map(index.shapes.map((shape) => [shape.id, shape]));
  const componentById = new Map(index.components.map((component) => [component.id, component]));
  const componentByMainInstance = new Map(index.components.map((component) => [component.data.mainInstanceId, component]));

  const families = FAMILY_SOURCES.map((source) => {
    let components;
    if (source.kind === 'set') {
      const setShape = shapeById.get(source.sourceId);
      assert(setShape?.data.isVariantContainer === true, `component set is missing or no longer a variant container: ${source.sourceId}`);
      components = setShape.data.shapes.map((mainInstanceId) => {
        const component = componentByMainInstance.get(mainInstanceId);
        assert(component, `component set child has no component record: ${mainInstanceId}`);
        assert(component.data.variantId === source.sourceId, `component record points at the wrong family: ${component.id}`);
        return component;
      });
    } else {
      const component = componentById.get(source.sourceId);
      assert(component && component.data.variantId == null, `singleton component is missing or unexpectedly variant-backed: ${source.sourceId}`);
      components = [component];
    }
    assert(components.length === source.count, `${source.name} record count differs: expected ${source.count}, received ${components.length}`);
    assert(new Set(components.map((component) => component.id)).size === components.length, `${source.name} contains duplicate component IDs`);

    return {
      key: source.key,
      name: source.name,
      kind: source.kind,
      sourceId: source.sourceId,
      recordCount: source.count,
      records: components.map((component, sourceIndex) => {
        assertActive(component);
        const shape = shapeById.get(component.data.mainInstanceId);
        assert(shape, `component main instance is missing: ${component.data.mainInstanceId}`);
        const originalProperties = component.data.variantProperties ?? [];
        return {
          id: component.id,
          mainInstanceId: component.data.mainInstanceId,
          sourceIndex,
          active: true,
          originalTuple: tupleObject(originalProperties),
          normalizedTuple: normalizeTuple(source.key, originalProperties),
          metrics: recordMetrics(shape, shapeById),
        };
      }),
    };
  });

  const recordCount = families.reduce((count, family) => count + family.records.length, 0);
  assert(families.length === 13, `Phase 3 family count differs: ${families.length}`);
  assert(recordCount === 75, `Phase 3 active record count differs: ${recordCount}`);

  const payload = {
    schemaVersion: 1,
    source: {
      canonicalPath: 'design-source/padel-potato UI Concepts.penpot',
      archiveSha256: sha256(archiveBytes),
      fileId: EXPECTED_FILE_ID,
      pageId: PAGE_ID,
      pageName: '02 Components',
      revision: REVISION,
    },
    normalizationPolicy: {
      metadata: [
        'Favourite Property 1 -> checked',
        'Icon Button Value 2 -> notification',
      ],
      geometry: ['fractional 352/390 serialization cleanup'],
    },
    familyCount: families.length,
    recordCount,
    families,
  };
  const contentSha256 = sha256(JSON.stringify(payload));
  const evidence = { ...payload, contentSha256 };
  const evidenceText = `${JSON.stringify(evidence, null, 2)}\n`;
  const registryText = renderRegistry(evidence);
  return { evidence, evidenceText, registryText };
}

function renderRegistry(evidence) {
  const literal = JSON.stringify(evidence, null, 2);
  return `/* This file is generated by scripts/extract-phase-3-components.mjs. */

const deepFreeze = <T>(value: T): Readonly<T> => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
};

export const phase3SourceEvidence = deepFreeze(${literal} as const);

export const phase3SourceIdentity = phase3SourceEvidence.source;
export const phase3Families = phase3SourceEvidence.families;
export const buttonRecords = phase3Families[0].records;
export const buttonStyles = Object.freeze(['primary', 'secondary', 'destructive', 'ghost'] as const);
export const buttonSizes = Object.freeze([40, 48] as const);
`;
}

export function writePhase3Outputs({ root = repoRoot, evidence = true, registry = true } = {}) {
  const outputs = generatePhase3Outputs({ root });
  if (evidence) {
    const outputPath = path.join(root, EVIDENCE_PATH);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, outputs.evidenceText);
  }
  if (registry) {
    const outputPath = path.join(root, REGISTRY_PATH);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, outputs.registryText);
  }
  return outputs;
}

function main() {
  const args = process.argv.slice(2);
  const outputs = generatePhase3Outputs();
  if (args.includes('--write')) writePhase3Outputs();
  else if (args.includes('--write-registry')) writePhase3Outputs({ evidence: false });
  else if (args.includes('--check')) {
    assert(outputs.evidence.familyCount === 13 && outputs.evidence.recordCount === 75, 'Phase 3 inventory check failed');
  } else {
    process.stdout.write(outputs.evidenceText);
    return;
  }
  console.log(`Phase 3 extraction valid: revision ${REVISION}, 13 families, 75 active records, sha256 ${outputs.evidence.contentSha256}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`Phase 3 component extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
