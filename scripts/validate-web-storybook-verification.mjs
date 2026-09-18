import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import process from 'node:process';

const RECORD_PATH = 'design-spec/web-storybook-verification.md';
const DEVIATIONS_PATH = 'design-spec/deviations.json';
const REFERENCE_PATH =
  'design-spec/references/foundations/foundations-page.png';
const REQUIRED_STORIES = Object.freeze([
  'AllFoundations',
  'Colors',
  'Typography',
  'Spacing',
  'Radii',
  'Dimensions',
  'Borders',
  'Opacity',
]);

function fail(message) {
  throw new Error(message);
}

function assertExactKeys(value, expected, context) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    fail(`${context} fields must be exactly: ${wanted.join(', ')}`);
  }
}

function assertNonEmptyString(value, context) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(`${context} must be a non-empty string.`);
  }
}

function extractLedger(markdown) {
  const matches = [
    ...markdown.matchAll(/```verification-ledger\s*\r?\n([\s\S]*?)\r?\n```/gu),
  ];
  if (matches.length !== 1) {
    fail('Expected exactly one fenced verification-ledger JSON block.');
  }

  try {
    return JSON.parse(matches[0][1]);
  } catch (error) {
    fail(`verification-ledger is not valid JSON: ${error.message}`);
  }
}

function validateDeviation(entry, id) {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    fail(`Deviation ${id} must be an object.`);
  }
  for (const field of [
    'source',
    'platform',
    'reason',
    'disposition',
    'reviewer',
    'evidence',
  ]) {
    if (!(field in entry)) fail(`Deviation ${id} is missing ${field}.`);
    if (field !== 'source') assertNonEmptyString(entry[field], `Deviation ${id}.${field}`);
  }
  if (entry.source === null || entry.source === undefined) {
    fail(`Deviation ${id}.source must identify the Penpot source.`);
  }
  if (entry.platform !== 'web') {
    fail(`Deviation ${id}.platform must be web.`);
  }
}

async function main() {
  const [markdown, deviationsText, referenceBytes] = await Promise.all([
    readFile(RECORD_PATH, 'utf8'),
    readFile(DEVIATIONS_PATH, 'utf8'),
    readFile(REFERENCE_PATH),
  ]);
  const ledger = extractLedger(markdown);
  const deviationDocument = JSON.parse(deviationsText);

  assertExactKeys(
    ledger,
    [
      'schemaVersion',
      'launch',
      'reviewedAt',
      'reviewer',
      'viewport',
      'reference',
      'nativeAcceptanceDeferredToPhase5',
      'stories',
    ],
    'verification-ledger',
  );
  if (ledger.schemaVersion !== 1) fail('schemaVersion must be 1.');

  assertExactKeys(ledger.launch, ['command', 'url'], 'launch');
  if (ledger.launch.command !== 'npm run storybook:web') {
    fail('launch.command must be npm run storybook:web.');
  }
  assertNonEmptyString(ledger.launch.url, 'launch.url');
  const launchUrl = new URL(ledger.launch.url);
  if (
    launchUrl.protocol !== 'http:' ||
    !['127.0.0.1', 'localhost'].includes(launchUrl.hostname)
  ) {
    fail('launch.url must be an HTTP loopback URL.');
  }

  assertNonEmptyString(ledger.reviewedAt, 'reviewedAt');
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(
      ledger.reviewedAt,
    ) ||
    Number.isNaN(Date.parse(ledger.reviewedAt))
  ) {
    fail('reviewedAt must be a valid UTC ISO timestamp.');
  }
  assertNonEmptyString(ledger.reviewer, 'reviewer');

  assertExactKeys(ledger.viewport, ['width', 'height'], 'viewport');
  for (const dimension of ['width', 'height']) {
    if (!Number.isInteger(ledger.viewport[dimension]) || ledger.viewport[dimension] <= 0) {
      fail(`viewport.${dimension} must be a positive integer.`);
    }
  }

  assertExactKeys(ledger.reference, ['path', 'sha256'], 'reference');
  if (ledger.reference.path !== REFERENCE_PATH) {
    fail(`reference.path must be ${REFERENCE_PATH}.`);
  }
  if (!/^[a-f0-9]{64}$/u.test(ledger.reference.sha256)) {
    fail('reference.sha256 must be 64 lowercase hexadecimal characters.');
  }
  const actualHash = createHash('sha256').update(referenceBytes).digest('hex');
  if (ledger.reference.sha256 !== actualHash) {
    fail('reference.sha256 does not match the retained Penpot render.');
  }
  if (ledger.nativeAcceptanceDeferredToPhase5 !== true) {
    fail('nativeAcceptanceDeferredToPhase5 must be true.');
  }

  if (!Array.isArray(ledger.stories)) fail('stories must be an array.');
  if (ledger.stories.length !== REQUIRED_STORIES.length) {
    fail(`stories must contain exactly ${REQUIRED_STORIES.length} rows.`);
  }

  const deviations = new Map();
  if (!Array.isArray(deviationDocument.deviations)) {
    fail('design-spec/deviations.json deviations must be an array.');
  }
  for (const entry of deviationDocument.deviations) {
    assertNonEmptyString(entry?.id, 'deviation.id');
    if (deviations.has(entry.id)) fail(`Duplicate deviation ID: ${entry.id}`);
    deviations.set(entry.id, entry);
  }

  const seenStories = new Set();
  for (const story of ledger.stories) {
    assertExactKeys(
      story,
      [
        'name',
        'status',
        'errorOverlay',
        'specimenCoverage',
        'outcome',
        'deviationIds',
      ],
      'story row',
    );
    if (!REQUIRED_STORIES.includes(story.name)) {
      fail(`Unexpected story: ${story.name}`);
    }
    if (seenStories.has(story.name)) fail(`Duplicate story: ${story.name}`);
    seenStories.add(story.name);
    if (story.status !== 'complete') fail(`${story.name}.status must be complete.`);
    if (story.errorOverlay !== 'absent') {
      fail(`${story.name}.errorOverlay must be absent.`);
    }
    if (story.specimenCoverage !== 'complete') {
      fail(`${story.name}.specimenCoverage must be complete.`);
    }
    if (!['pass', 'deviations-recorded'].includes(story.outcome)) {
      fail(`${story.name}.outcome is invalid.`);
    }
    if (!Array.isArray(story.deviationIds)) {
      fail(`${story.name}.deviationIds must be an array.`);
    }
    if (new Set(story.deviationIds).size !== story.deviationIds.length) {
      fail(`${story.name}.deviationIds contains duplicates.`);
    }
    if (story.outcome === 'pass' && story.deviationIds.length !== 0) {
      fail(`${story.name} passes only with an empty deviationIds array.`);
    }
    if (story.outcome === 'deviations-recorded' && story.deviationIds.length === 0) {
      fail(`${story.name} must resolve at least one deviation.`);
    }
    for (const id of story.deviationIds) {
      const deviation = deviations.get(id);
      if (!deviation) fail(`${story.name} references unresolved deviation ${id}.`);
      validateDeviation(deviation, id);
    }
  }

  for (const requiredStory of REQUIRED_STORIES) {
    if (!seenStories.has(requiredStory)) fail(`Missing story: ${requiredStory}`);
  }

  console.log(
    `Web Storybook verification passed: ${ledger.stories.length} complete stories, ${actualHash}.`,
  );
}

main().catch((error) => {
  console.error(`Web Storybook verification failed: ${error.message}`);
  process.exitCode = 1;
});
