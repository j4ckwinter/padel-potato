import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const output = mkdtempSync(join(tmpdir(), 'padel-native-export-'));
execFileSync(
  'npx',
  [
    'expo',
    'export',
    '--platform',
    'android',
    '--platform',
    'ios',
    '--source-maps',
    '--output-dir',
    output,
  ],
  { env: { ...process.env, STORYBOOK_ENABLED: 'false' }, stdio: 'inherit' },
);
for (const platform of ['android', 'ios']) {
  const directory = join(output, '_expo', 'static', 'js', platform);
  const maps = readdirSync(directory).filter((file) => file.endsWith('.map'));
  assert.equal(maps.length, 1, `${platform} emits one application source map`);
  const map = JSON.parse(readFileSync(join(directory, maps[0]), 'utf8'));
  assert(
    map.sources.some((source) => source.endsWith('src/app/_layout.tsx')),
    `${platform} exports the product root`,
  );
  assert(
    map.sources.some((source) =>
      source.endsWith('src/features/notifications/localNotifications.ts'),
    ),
    `${platform} includes the local notification adapter`,
  );
  for (const source of map.sources) {
    assert(
      !/\.rnstorybook\/|node_modules\/(?:@storybook\/|storybook\/)/u.test(
        source,
      ),
      `${platform} excludes Storybook: ${source}`,
    );
    assert(
      !source.includes('DevicePushTokenAutoRegistration'),
      `${platform} excludes remote push registration: ${source}`,
    );
  }
}
console.log(
  `Native exports verified. Android and iOS contain product routes and local notifications, with no Storybook or remote push registration. Artifacts: ${output}`,
);
