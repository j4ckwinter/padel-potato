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
export const EVIDENCE_PATH = 'design-spec/components/phase-4-components.json';
export const REGISTRY_PATH = 'src/design-system/components/phase4SourceRegistry.ts';

export const FAMILY_SOURCES = Object.freeze([
  Object.freeze({ key: 'avatar', name: 'Avatar', sourceId: '482a7222-5a3b-8086-8008-a60fcc2bf6a2', count: 5 }),
  Object.freeze({ key: 'avatarGroup', name: 'Avatar Group', sourceId: '482a7222-5a3b-8086-8008-a60f7e527b9d', count: 5 }),
  Object.freeze({ key: 'avatarPicker', name: 'Avatar Picker', sourceId: '482a7222-5a3b-8086-8008-a6265a9ac857', count: 4 }),
  Object.freeze({ key: 'statusChip', name: 'Status Chip', sourceId: '482a7222-5a3b-8086-8008-a60fcef69ad7', count: 7 }),
  Object.freeze({ key: 'stepProgress', name: 'Step Progress', sourceId: '482a7222-5a3b-8086-8008-a6243bcc3463', count: 4 }),
  Object.freeze({ key: 'playerItem', name: 'Player Item', sourceId: '482a7222-5a3b-8086-8008-a60fd2e43204', count: 6 }),
  Object.freeze({ key: 'gameCard', name: 'Game Card', sourceId: '482a7222-5a3b-8086-8008-a6100d35e8ef', count: 5 }),
  Object.freeze({ key: 'notificationRow', name: 'Notification Row', sourceId: '482a7222-5a3b-8086-8008-a6101117dfd4', count: 6 }),
  Object.freeze({ key: 'settingsRow', name: 'Settings Row', sourceId: '482a7222-5a3b-8086-8008-a61b708e9d2e', count: 9 }),
  Object.freeze({ key: 'statTile', name: 'Stat Tile', sourceId: '482a7222-5a3b-8086-8008-a61bebc50714', count: 6 }),
  Object.freeze({ key: 'scoreResultBlock', name: 'Score Result Block', sourceId: '482a7222-5a3b-8086-8008-a61c4979950c', count: 6 }),
  Object.freeze({ key: 'playerPreferencesCard', name: 'Player Preferences Card', sourceId: 'ab02a31f-1852-80be-8008-a6fde66e54b7', count: 2 }),
  Object.freeze({ key: 'bannerToast', name: 'Banner Toast', sourceId: '482a7222-5a3b-8086-8008-a610135158ee', count: 4 }),
  Object.freeze({ key: 'emptyState', name: 'Empty State', sourceId: '482a7222-5a3b-8086-8008-a610159eb57a', count: 3 }),
  Object.freeze({ key: 'illustratedCard', name: 'Illustrated Card', sourceId: '482a7222-5a3b-8086-8008-a6187034754b', count: 4 }),
]);

export const DELETED_COMPONENT_IDS = Object.freeze([
  '482a7222-5a3b-8086-8008-a60f56c8ddb2',
  '482a7222-5a3b-8086-8008-a60f570fe711',
  '482a7222-5a3b-8086-8008-a60f575670fa',
  '482a7222-5a3b-8086-8008-a60f579b1bef',
  '482a7222-5a3b-8086-8008-a60f57e139a2',
  '482a7222-5a3b-8086-8008-a62517efe154',
  '482a7222-5a3b-8086-8008-a62518a227b0',
  '482a7222-5a3b-8086-8008-a6251976aff6',
  '482a7222-5a3b-8086-8008-a6251aadddfd',
]);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

function withinRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function fixedPath(root, relativePath, label) {
  const resolvedRoot = path.resolve(root);
  const candidate = path.resolve(resolvedRoot, relativePath);
  const expected = path.resolve(resolvedRoot, relativePath);
  assert(withinRoot(resolvedRoot, candidate), `unsafe ${label} path escapes the repository root: ${relativePath}`);
  assert(candidate === expected, `unsafe ${label} path differs from the fixed Phase 4 path: ${relativePath}`);
  return candidate;
}

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
  if (familyKey === 'playerPreferencesCard') {
    assert(
      properties.length === 1 && properties[0].name === 'Property 1',
      'Player Preferences Card normalization source changed',
    );
    const mapping = {
      'Content=Full': 'full',
      'Content=Profile': 'profile',
    };
    const content = mapping[properties[0].value];
    assert(content, `Player Preferences Card Property 1 value changed: ${properties[0].value}`);
    return { content };
  }

  return Object.fromEntries(properties.map(({ name, value }) => {
    const normalizedName = familyKey === 'avatar' && name === 'State'
      ? 'presence'
      : lowerCamel(name);
    const normalizedValue = /^(?:0|[1-9][0-9]*)$/u.test(value)
      ? Number(value)
      : lowerCamel(value);
    return [normalizedName, normalizedValue];
  }));
}

function normalizedDimension(value) {
  for (const expected of [328, 350, 352, 390]) {
    if (Math.abs(value - expected) < 1e-9) return expected;
  }
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

function basicMetrics(data) {
  const rawWidth = data.width;
  const rawHeight = data.height;
  const width = normalizedDimension(rawWidth);
  const height = normalizedDimension(rawHeight);
  return {
    raw: { width: rawWidth, height: rawHeight },
    normalized: { width, height },
    normalization: rawWidth === width && rawHeight === height
      ? null
      : 'fractional 328/350/352/390 serialization cleanup',
    radii: [data.r1 ?? 0, data.r2 ?? 0, data.r3 ?? 0, data.r4 ?? 0],
    opacity: data.opacity ?? 1,
    fills: data.fills ?? [],
    strokes: data.strokes ?? [],
  };
}

function recordMetrics(shape, shapeById, familyKey) {
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

  const metrics = {
    ...basicMetrics(shape.data),
    layout: {
      mode: shape.data.layout ?? null,
      gap: shape.data.layoutGap ?? null,
      padding: shape.data.layoutPadding ?? null,
    },
    typography,
  };

  if (familyKey !== 'avatar') return metrics;

  const namedChildren = new Map((shape.data.shapes ?? []).map((childId) => {
    const child = shapeById.get(childId);
    assert(child, `Avatar descendant is missing: ${childId}`);
    return [child.name, child];
  }));
  const avatar = namedChildren.get('Photo');
  const initials = namedChildren.get('Initials');
  const presence = namedChildren.get('Presence');
  assert(avatar?.data.type === 'circle', 'Avatar named visible child differs');
  assert(initials?.data.type === 'text', 'Avatar initials child differs');
  assert(presence?.data.type === 'circle', 'Avatar presence child differs');
  assert(avatar.data.width === avatar.data.height, 'Avatar visible child is not square');
  assert(presence.data.width === presence.data.height, 'Avatar presence child is not square');

  return {
    ...metrics,
    avatar: {
      id: avatar.id,
      name: avatar.name,
      ...basicMetrics(avatar.data),
      offset: {
        x: avatar.data.x - shape.data.x,
        y: avatar.data.y - shape.data.y,
      },
    },
    initials: {
      id: initials.id,
      name: initials.name,
      ...basicMetrics(initials.data),
      typography: typographyFromContent(initials.data.content),
    },
    presence: {
      id: presence.id,
      name: presence.name,
      ...basicMetrics(presence.data),
      offsetFromAvatar: {
        x: presence.data.x - avatar.data.x,
        y: presence.data.y - avatar.data.y,
      },
    },
  };
}

function assertActive(component) {
  assert(
    component.data.deleted !== true && component.data.deletedAt == null,
    `deleted component record is not allowed: ${component.id}`,
  );
  assert(!DELETED_COMPONENT_IDS.includes(component.id), `deleted legacy record is not allowed: ${component.id}`);
}

export function generatePhase4Outputs({ root = repoRoot } = {}) {
  const archivePath = fixedPath(
    root,
    'design-source/padel-potato UI Concepts.penpot',
    'source archive',
  );
  const archiveBytes = fs.readFileSync(archivePath);
  const index = buildSourceIndex(parseZip(archiveBytes));
  assert(index.file.id === EXPECTED_FILE_ID, `Phase 4 source file differs: ${index.file.id}`);
  assert(index.file.revn === REVISION, `Phase 4 source revision differs: ${index.file.revn}`);
  assert(
    index.pages.some((page) => page.id === PAGE_ID && page.name === '02 Components'),
    `Phase 4 components page is missing: ${PAGE_ID}`,
  );

  const shapeById = new Map(index.shapes.map((shape) => [shape.id, shape]));
  const componentByMainInstance = new Map(
    index.components.map((component) => [component.data.mainInstanceId, component]),
  );

  const families = FAMILY_SOURCES.map((source) => {
    const setShape = shapeById.get(source.sourceId);
    assert(
      setShape?.data.isVariantContainer === true,
      `component set is missing or no longer a variant container: ${source.sourceId}`,
    );
    const components = setShape.data.shapes.map((mainInstanceId) => {
      const component = componentByMainInstance.get(mainInstanceId);
      assert(component, `component set child has no component record: ${mainInstanceId}`);
      assert(
        component.data.variantId === source.sourceId,
        `component record points at the wrong family: ${component.id}`,
      );
      return component;
    });
    assert(
      components.length === source.count,
      `${source.name} record count differs: expected ${source.count}, received ${components.length}`,
    );
    assert(
      new Set(components.map((component) => component.id)).size === components.length,
      `${source.name} contains duplicate component IDs`,
    );

    return {
      key: source.key,
      name: source.name,
      kind: 'set',
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
          sourceName: component.name,
          originalTuple: tupleObject(originalProperties),
          normalizedTuple: normalizeTuple(source.key, originalProperties),
          metrics: recordMetrics(shape, shapeById, source.key),
        };
      }),
    };
  });

  const recordCount = families.reduce((count, family) => count + family.records.length, 0);
  assert(families.length === 15, `Phase 4 family count differs: ${families.length}`);
  assert(recordCount === 76, `Phase 4 active record count differs: ${recordCount}`);

  const activeIds = new Set(families.flatMap((family) => family.records.map(({ id }) => id)));
  for (const deletedId of DELETED_COMPONENT_IDS) {
    assert(!activeIds.has(deletedId), `deleted legacy record entered active evidence: ${deletedId}`);
  }

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
      metadata: ['Player Preferences Card Property 1=Content=Full|Profile -> content=full|profile'],
      geometry: ['fractional 328/350/352/390 serialization cleanup'],
      avatar: ['named Photo child supplies visual diameter; 64x64 root retained as wrapper evidence'],
    },
    excludedComponentIds: DELETED_COMPONENT_IDS,
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
  return `/* This file is generated by scripts/extract-phase-4-components.mjs. */

const deepFreeze = <T>(value: T): Readonly<T> => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
};

export const phase4SourceEvidence = deepFreeze(${literal} as const);

export const phase4SourceIdentity = phase4SourceEvidence.source;
export const phase4Families = phase4SourceEvidence.families;
export const avatarRecords = phase4Families[0].records;
export const avatarSizes = Object.freeze([32, 40, 48, 56] as const);
export const avatarPresences = Object.freeze(['online', 'away', 'offline'] as const);
`;
}

export function writePhase4Outputs({ root = repoRoot, evidence = true, registry = true } = {}) {
  const outputs = generatePhase4Outputs({ root });
  if (evidence) {
    const outputPath = fixedPath(root, EVIDENCE_PATH, 'evidence output');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, outputs.evidenceText);
  }
  if (registry) {
    const outputPath = fixedPath(root, REGISTRY_PATH, 'registry output');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, outputs.registryText);
  }
  return outputs;
}

function main() {
  const args = process.argv.slice(2);
  const outputs = generatePhase4Outputs();
  if (args.includes('--write')) writePhase4Outputs();
  else if (args.includes('--write-registry')) writePhase4Outputs({ evidence: false });
  else if (args.includes('--check')) {
    assert(
      outputs.evidence.familyCount === 15 && outputs.evidence.recordCount === 76,
      'Phase 4 inventory check failed',
    );
  } else {
    process.stdout.write(outputs.evidenceText);
    return;
  }
  console.log(
    `Phase 4 extraction valid: revision ${REVISION}, 15 families, 76 active records, sha256 ${outputs.evidence.contentSha256}`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(
      `Phase 4 component extraction failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}
