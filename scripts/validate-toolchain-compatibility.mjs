import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const evidenceUrl = new URL('../design-spec/toolchain-compatibility.json', import.meta.url);

const approvedVersions = new Map([
  ['expo', '57.0.23'],
  ['react', '19.2.3'],
  ['react-native', '0.86.3'],
  ['react-dom', '19.2.3'],
  ['@expo/metro-runtime', '57.0.15'],
  ['expo-font', '57.0.4'],
  ['jest-expo', '57.0.5'],
  ['storybook', '10.5.0'],
  ['@storybook/react-native', '10.5.0'],
  ['@storybook/react', '10.5.0'],
  ['@storybook/react-native-ui', '10.5.0'],
  ['@storybook/react-native-theming', '10.5.0'],
  ['@storybook/react-native-ui-common', '10.5.0'],
  ['@storybook/addon-ondevice-controls', '10.5.0'],
  ['@storybook/addon-ondevice-actions', '10.5.0'],
  ['@storybook/addon-ondevice-backgrounds', '10.5.0'],
  ['@gorhom/bottom-sheet', '5.2.14'],
  ['react-native-reanimated', '4.5.1'],
  ['react-native-gesture-handler', '2.32.0'],
  ['react-native-safe-area-context', '5.7.0'],
  ['react-native-worklets', '0.10.1'],
  ['@react-native-community/datetimepicker', '9.1.0'],
  ['@react-native-community/slider', '5.2.0'],
]);

const storybookPackages = new Set([
  'storybook',
  '@storybook/react-native',
  '@storybook/react',
  '@storybook/react-native-ui',
  '@storybook/react-native-theming',
  '@storybook/react-native-ui-common',
  '@storybook/addon-ondevice-controls',
  '@storybook/addon-ondevice-actions',
  '@storybook/addon-ondevice-backgrounds',
]);

const nativePeerVersions = new Map([
  ['@gorhom/bottom-sheet', '5.2.14'],
  ['react-native-reanimated', '4.5.1'],
  ['react-native-gesture-handler', '2.32.0'],
  ['react-native-safe-area-context', '5.7.0'],
  ['react-native-worklets', '0.10.1'],
  ['@react-native-community/datetimepicker', '9.1.0'],
  ['@react-native-community/slider', '5.2.0'],
]);

const expectedProbeCommands = {
  install: 'npm install',
  dependencyTree: 'npm ls --all --json',
  expoInstallCheck: 'npx expo install --check',
  expoDoctor: 'npx expo-doctor@latest',
};

function fail(message) {
  throw new Error(`Toolchain compatibility evidence invalid: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function entriesToMap(entries, label) {
  assert(Array.isArray(entries), `${label} must be an array`);
  const result = new Map();
  for (const row of entries) {
    assert(row && typeof row.name === 'string' && typeof row.version === 'string', `${label} has an invalid row`);
    assert(!result.has(row.name), `${label} contains duplicate ${row.name}`);
    result.set(row.name, row.version);
  }
  return result;
}

function validateApprovedPackages(evidence) {
  const approved = entriesToMap(evidence.approvedPackages, 'approvedPackages');
  assert(approved.size === approvedVersions.size, `approvedPackages must contain exactly ${approvedVersions.size} rows`);
  for (const [name, version] of approvedVersions) {
    assert(approved.get(name) === version, `approved package ${name} must be ${version}`);
  }
  for (const row of evidence.approvedPackages) {
    assert(typeof row.npmUrl === 'string' && row.npmUrl.startsWith('https://www.npmjs.com/package/'), `${row.name} lacks an npm link`);
    assert(typeof row.repository === 'string' && row.repository.length > 0, `${row.name} lacks official repository metadata`);
    assert(Number.isInteger(row.weeklyDownloads) && row.weeklyDownloads >= 0, `${row.name} lacks a weekly-download signal`);
    assert(row.deprecated === null, `${row.name} is deprecated`);
    assert(row.lifecycleScripts && typeof row.lifecycleScripts === 'object' && !Array.isArray(row.lifecycleScripts), `${row.name} lacks lifecycle-script metadata`);
  }
  assert(evidence.approval?.response === 'approved', 'human approval response must be recorded as approved');
  assert(evidence.approval?.packageCount === 23, 'approval must be scoped to exactly 23 packages');
  assert(evidence.approval?.scope === 'exact-package-version-matrix-only', 'approval scope must reject substitutions and additions');
}

function validateDirectInventory(evidence) {
  const dependencies = entriesToMap(evidence.directDependencies, 'directDependencies');
  const devDependencies = entriesToMap(evidence.directDevDependencies, 'directDevDependencies');
  const inventory = new Map([...dependencies, ...devDependencies]);
  assert(inventory.size === dependencies.size + devDependencies.size, 'a package occurs in both direct dependency collections');
  for (const [name, version] of approvedVersions) {
    assert(inventory.get(name) === version, `${name}@${version} is absent from the direct inventory`);
  }
  assert(inventory.get('react-native-web') === '0.21.2', 'react-native-web must be the Expo-resolved 0.21.2');
  assert(inventory.get('react-native-svg') === '15.15.4', 'react-native-svg must be the Expo-resolved 15.15.4');
  assert(inventory.get('cross-env') === '10.1.0', 'cross-env must be 10.1.0');
  assert(inventory.get('@testing-library/react-native') === '14.0.1', 'React Native Testing Library must be 14.0.1');
  assert(inventory.get('prettier') === '3.9.7', 'Prettier must be 3.9.7');
  assert(inventory.has('typescript') && inventory.has('@types/react'), 'Expo template TypeScript packages must be recorded');
  assert(inventory.has('eslint') && inventory.has('eslint-config-expo'), 'Expo template lint packages must be recorded');
  assert(!inventory.has('@storybook/react-native-web-vite'), 'the deferred Vite framework must not be installed');
  assert(!inventory.has('expo-template-storybook'), 'the rejected Storybook template must not be installed');
  for (const name of storybookPackages) {
    assert(inventory.get(name) === '10.5.0', `${name} must be pinned to 10.5.0`);
  }
  for (const [name, version] of nativePeerVersions) {
    assert(inventory.get(name) === version, `${name} must use Expo-aligned version ${version}`);
  }
}

function validateProbe(evidence) {
  assert(typeof evidence.probe?.timestamp === 'string' && !Number.isNaN(Date.parse(evidence.probe.timestamp)), 'probe timestamp is missing');
  assert(typeof evidence.probe?.nodeVersion === 'string' && /^v?\d+\.\d+\.\d+$/.test(evidence.probe.nodeVersion), 'Node version is missing');
  assert(evidence.probe?.disposableDirectory === true, 'probe must be identified as disposable');
  for (const [key, command] of Object.entries(expectedProbeCommands)) {
    const result = evidence.probe?.commands?.[key];
    assert(result?.command === command, `${key} command must be recorded exactly`);
    assert(result?.exitCode === 0, `${key} did not exit successfully`);
    assert(typeof result?.stdoutAssertion === 'string' && result.stdoutAssertion.length > 0, `${key} lacks a stdout assertion`);
  }
  assert(evidence.probe.commands.install.mode === 'normal', 'install must use normal peer resolution');
  assert(evidence.probe.commands.expoInstallCheck.stdoutAssertion.includes('Dependencies are up to date'), 'Expo install check success text is absent');
  assert(evidence.probe.commands.expoDoctor.stdoutAssertion.includes('21/21 checks passed'), 'Expo Doctor must record 21/21 checks passed');
  assert(Array.isArray(evidence.dependencyTree) && evidence.dependencyTree.length > 0, 'dependency-tree evidence is missing');
  const tree = entriesToMap(evidence.dependencyTree, 'dependencyTree');
  for (const [name, version] of approvedVersions) {
    assert(tree.get(name) === version, `dependency tree does not prove ${name}@${version}`);
  }
  for (const [name, version] of tree) {
    if (storybookPackages.has(name)) assert(version === '10.5.0', `mixed Storybook patch detected: ${name}@${version}`);
  }
  const safeguards = evidence.safeguards;
  assert(safeguards?.force === false, 'force install is forbidden');
  assert(safeguards?.legacyPeerDeps === false, 'legacy peer resolution is forbidden');
  assert(safeguards?.overrides === false, 'dependency overrides are forbidden');
  assert(safeguards?.expoDoctorExclusions === false, 'Expo Doctor exclusions are forbidden');
  assert(safeguards?.unresolvedDependencyWarnings === false, 'unresolved dependency warnings are forbidden');
}

async function main() {
  let evidence;
  try {
    evidence = JSON.parse(await readFile(evidenceUrl, 'utf8'));
  } catch (error) {
    fail(`cannot read ${fileURLToPath(evidenceUrl)}: ${error.message}`);
  }
  assert(evidence.schemaVersion === 1, 'schemaVersion must be 1');
  validateApprovedPackages(evidence);
  validateDirectInventory(evidence);
  validateProbe(evidence);
  console.log(`Validated exact ${approvedVersions.size}-package approval and clean Expo/Storybook probe.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
