import { readFile } from "node:fs/promises";

const evidenceUrl = new URL(
  "../design-spec/toolchain-compatibility.json",
  import.meta.url,
);
const packageJsonUrl = new URL("../package.json", import.meta.url);
const packageLockUrl = new URL("../package-lock.json", import.meta.url);
const nvmrcUrl = new URL("../.nvmrc", import.meta.url);

const approvedVersions = new Map([
  ["expo", "57.0.24"],
  ["react", "19.2.3"],
  ["react-native", "0.86.3"],
  ["react-dom", "19.2.3"],
  ["@expo/metro-runtime", "57.0.16"],
  ["expo-font", "57.0.4"],
  ["jest-expo", "57.0.5"],
  ["storybook", "10.5.0"],
  ["@storybook/react-native", "10.5.0"],
  ["@storybook/react", "10.5.0"],
  ["@storybook/react-native-ui", "10.5.0"],
  ["@storybook/react-native-theming", "10.5.0"],
  ["@storybook/react-native-ui-common", "10.5.0"],
  ["@storybook/addon-ondevice-controls", "10.5.0"],
  ["@storybook/addon-ondevice-actions", "10.5.0"],
  ["@storybook/addon-ondevice-backgrounds", "10.5.0"],
  ["@gorhom/bottom-sheet", "5.2.14"],
  ["react-native-reanimated", "4.5.1"],
  ["react-native-gesture-handler", "2.32.0"],
  ["react-native-safe-area-context", "5.7.0"],
  ["react-native-worklets", "0.10.1"],
  ["@react-native-community/datetimepicker", "9.1.0"],
  ["@react-native-community/slider", "5.2.0"],
]);

const storybookPackages = new Set([
  "storybook",
  "@storybook/react-native",
  "@storybook/react",
  "@storybook/react-native-ui",
  "@storybook/react-native-theming",
  "@storybook/react-native-ui-common",
  "@storybook/addon-ondevice-controls",
  "@storybook/addon-ondevice-actions",
  "@storybook/addon-ondevice-backgrounds",
]);

const nativePeerVersions = new Map([
  ["@gorhom/bottom-sheet", "5.2.14"],
  ["react-native-reanimated", "4.5.1"],
  ["react-native-gesture-handler", "2.32.0"],
  ["react-native-safe-area-context", "5.7.0"],
  ["react-native-worklets", "0.10.1"],
  ["@react-native-community/datetimepicker", "9.1.0"],
  ["@react-native-community/slider", "5.2.0"],
]);

const expectedProbeCommands = {
  install: "npm install",
  dependencyTree: "npm ls --all --json",
  expoInstallCheck: "npx expo install --check",
  expoDoctor: "npx expo-doctor@latest",
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
    assert(
      row && typeof row.name === "string" && typeof row.version === "string",
      `${label} has an invalid row`,
    );
    assert(!result.has(row.name), `${label} contains duplicate ${row.name}`);
    result.set(row.name, row.version);
  }
  return result;
}

function objectToMap(value, label) {
  assert(
    value && typeof value === "object" && !Array.isArray(value),
    `${label} must be an object`,
  );
  const result = new Map();
  for (const [name, version] of Object.entries(value)) {
    assert(typeof version === "string", `${label}.${name} must be a string`);
    result.set(name, version);
  }
  return result;
}

function validateExactInventory(actual, expected, actualLabel, expectedLabel) {
  for (const name of actual.keys()) {
    assert(
      expected.has(name),
      `${actualLabel} contains unexpected direct dependency ${name}`,
    );
  }
  assert(
    actual.size === expected.size,
    `${actualLabel} contains ${actual.size} packages but ${expectedLabel} contains ${expected.size}`,
  );
  for (const [name, version] of expected) {
    assert(
      actual.has(name),
      `${actualLabel} is missing ${name} recorded in ${expectedLabel}`,
    );
    assert(
      actual.get(name) === version,
      `${actualLabel} has ${name}@${actual.get(name)} but ${expectedLabel} records ${version}`,
    );
  }
}

function validateApprovedPackages(evidence) {
  const approved = entriesToMap(evidence.approvedPackages, "approvedPackages");
  assert(
    approved.size === approvedVersions.size,
    `approvedPackages must contain exactly ${approvedVersions.size} rows`,
  );
  for (const [name, version] of approvedVersions) {
    assert(
      approved.get(name) === version,
      `approved package ${name} must be ${version}`,
    );
  }
  for (const row of evidence.approvedPackages) {
    assert(
      typeof row.npmUrl === "string" &&
        row.npmUrl.startsWith("https://www.npmjs.com/package/"),
      `${row.name} lacks an npm link`,
    );
    assert(
      typeof row.repository === "string" && row.repository.length > 0,
      `${row.name} lacks official repository metadata`,
    );
    assert(
      Number.isInteger(row.weeklyDownloads) && row.weeklyDownloads >= 0,
      `${row.name} lacks a weekly-download signal`,
    );
    assert(row.deprecated === null, `${row.name} is deprecated`);
    assert(
      row.lifecycleScripts &&
        typeof row.lifecycleScripts === "object" &&
        !Array.isArray(row.lifecycleScripts),
      `${row.name} lacks lifecycle-script metadata`,
    );
  }
  assert(
    evidence.approval?.response === "approved",
    "human approval response must be recorded as approved",
  );
  assert(
    evidence.approval?.packageCount === 23,
    "approval must be scoped to exactly 23 packages",
  );
  assert(
    evidence.approval?.scope === "exact-package-version-matrix-only",
    "approval scope must reject substitutions and additions",
  );
  assert(
    evidence.approval?.patchUpdate?.response === "approved",
    "Expo patch update approval must be recorded",
  );
  assert(
    evidence.approval?.patchUpdate?.expo === "57.0.24",
    "Expo patch approval must be limited to 57.0.24",
  );
  assert(
    evidence.approval?.patchUpdate?.metroRuntime === "57.0.16",
    "Metro runtime patch approval must be limited to 57.0.16",
  );
}

function validateDirectInventory(evidence) {
  const dependencies = entriesToMap(
    evidence.directDependencies,
    "directDependencies",
  );
  const devDependencies = entriesToMap(
    evidence.directDevDependencies,
    "directDevDependencies",
  );
  const inventory = new Map([...dependencies, ...devDependencies]);
  assert(
    inventory.size === dependencies.size + devDependencies.size,
    "a package occurs in both direct dependency collections",
  );
  for (const [name, version] of approvedVersions) {
    assert(
      inventory.get(name) === version,
      `${name}@${version} is absent from the direct inventory`,
    );
  }
  assert(
    inventory.get("react-native-web") === "0.21.2",
    "react-native-web must be the Expo-resolved 0.21.2",
  );
  assert(
    inventory.get("react-native-svg") === "15.15.4",
    "react-native-svg must be the Expo-resolved 15.15.4",
  );
  assert(inventory.get("cross-env") === "10.1.0", "cross-env must be 10.1.0");
  assert(
    inventory.get("@testing-library/react-native") === "14.0.1",
    "React Native Testing Library must be 14.0.1",
  );
  assert(inventory.get("prettier") === "3.9.7", "Prettier must be 3.9.7");
  assert(
    inventory.has("typescript") && inventory.has("@types/react"),
    "Expo template TypeScript packages must be recorded",
  );
  assert(
    inventory.has("eslint") && inventory.has("eslint-config-expo"),
    "Expo template lint packages must be recorded",
  );
  assert(
    !inventory.has("@storybook/react-native-web-vite"),
    "the deferred Vite framework must not be installed",
  );
  assert(
    !inventory.has("expo-template-storybook"),
    "the rejected Storybook template must not be installed",
  );
  for (const name of storybookPackages) {
    assert(
      inventory.get(name) === "10.5.0",
      `${name} must be pinned to 10.5.0`,
    );
  }
  for (const [name, version] of nativePeerVersions) {
    assert(
      inventory.get(name) === version,
      `${name} must use Expo-aligned version ${version}`,
    );
  }
}

function validateLiveInventory(evidence, packageJson, lockfile) {
  const recordedDependencies = entriesToMap(
    evidence.directDependencies,
    "directDependencies",
  );
  const recordedDevDependencies = entriesToMap(
    evidence.directDevDependencies,
    "directDevDependencies",
  );
  const liveDependencies = objectToMap(
    packageJson.dependencies ?? {},
    "package.json dependencies",
  );
  const liveDevDependencies = objectToMap(
    packageJson.devDependencies ?? {},
    "package.json devDependencies",
  );

  validateExactInventory(
    liveDependencies,
    recordedDependencies,
    "package.json dependencies",
    "directDependencies",
  );
  validateExactInventory(
    liveDevDependencies,
    recordedDevDependencies,
    "package.json devDependencies",
    "directDevDependencies",
  );

  const lockRoot = lockfile.packages?.[""];
  assert(lockRoot, "package-lock.json is missing its root package record");
  const lockDependencies = objectToMap(
    lockRoot.dependencies ?? {},
    "package-lock root dependencies",
  );
  const lockDevDependencies = objectToMap(
    lockRoot.devDependencies ?? {},
    "package-lock root devDependencies",
  );
  validateExactInventory(
    lockDependencies,
    liveDependencies,
    "package-lock root dependencies",
    "package.json dependencies",
  );
  validateExactInventory(
    lockDevDependencies,
    liveDevDependencies,
    "package-lock root devDependencies",
    "package.json devDependencies",
  );

  const liveDirect = new Map([...liveDependencies, ...liveDevDependencies]);
  assert(
    liveDirect.size === liveDependencies.size + liveDevDependencies.size,
    "package.json lists a package in both dependencies and devDependencies",
  );
  for (const [name, declaredVersion] of liveDirect) {
    const resolvedVersion =
      lockfile.packages?.[`node_modules/${name}`]?.version;
    assert(
      resolvedVersion,
      `package-lock.json has no top-level resolution for ${name}`,
    );
    assert(
      resolvedVersion === declaredVersion,
      `package-lock.json resolves ${name}@${resolvedVersion}, expected exact ${declaredVersion}`,
    );
  }

  for (const [name, approvedVersion] of approvedVersions) {
    assert(
      liveDirect.get(name) === approvedVersion,
      `package.json has ${name}@${liveDirect.get(name)}, approval requires ${approvedVersion}`,
    );
    assert(
      lockfile.packages?.[`node_modules/${name}`]?.version === approvedVersion,
      `package-lock.json resolution for ${name} differs from approved ${approvedVersion}`,
    );
  }
}

function normalizeNodeVersion(version) {
  return version.trim().replace(/^v/u, "");
}

function validateProbe(evidence, pinnedNodeVersion) {
  assert(
    typeof evidence.probe?.timestamp === "string" &&
      !Number.isNaN(Date.parse(evidence.probe.timestamp)),
    "probe timestamp is missing",
  );
  assert(
    typeof evidence.probe?.nodeVersion === "string" &&
      /^v?\d+\.\d+\.\d+$/.test(evidence.probe.nodeVersion),
    "Node version is missing",
  );
  assert(
    normalizeNodeVersion(evidence.probe.nodeVersion) === pinnedNodeVersion,
    `probe Node ${evidence.probe.nodeVersion} does not match .nvmrc ${pinnedNodeVersion}`,
  );
  assert(
    evidence.probe?.disposableDirectory === true,
    "probe must be identified as disposable",
  );
  for (const [key, command] of Object.entries(expectedProbeCommands)) {
    const result = evidence.probe?.commands?.[key];
    assert(
      result?.command === command,
      `${key} command must be recorded exactly`,
    );
    assert(result?.exitCode === 0, `${key} did not exit successfully`);
    assert(
      typeof result?.stdoutAssertion === "string" &&
        result.stdoutAssertion.length > 0,
      `${key} lacks a stdout assertion`,
    );
  }
  assert(
    evidence.probe.commands.install.mode === "normal",
    "install must use normal peer resolution",
  );
  assert(
    evidence.probe.commands.expoInstallCheck.stdoutAssertion.includes(
      "Dependencies are up to date",
    ),
    "Expo install check success text is absent",
  );
  assert(
    evidence.probe.commands.expoDoctor.stdoutAssertion.includes(
      "21/21 checks passed",
    ),
    "Expo Doctor must record 21/21 checks passed",
  );
  assert(
    Array.isArray(evidence.dependencyTree) &&
      evidence.dependencyTree.length > 0,
    "dependency-tree evidence is missing",
  );
  const tree = entriesToMap(evidence.dependencyTree, "dependencyTree");
  for (const [name, version] of approvedVersions) {
    assert(
      tree.get(name) === version,
      `dependency tree does not prove ${name}@${version}`,
    );
  }
  for (const [name, version] of tree) {
    if (storybookPackages.has(name))
      assert(
        version === "10.5.0",
        `mixed Storybook patch detected: ${name}@${version}`,
      );
  }
  const safeguards = evidence.safeguards;
  assert(safeguards?.force === false, "force install is forbidden");
  assert(
    safeguards?.legacyPeerDeps === false,
    "legacy peer resolution is forbidden",
  );
  assert(safeguards?.overrides === false, "dependency overrides are forbidden");
  assert(
    safeguards?.expoDoctorExclusions === false,
    "Expo Doctor exclusions are forbidden",
  );
  assert(
    safeguards?.unresolvedDependencyWarnings === false,
    "unresolved dependency warnings are forbidden",
  );
  assert(
    evidence.patchRefresh?.command ===
      "npm install --save-exact expo@57.0.24 @expo/metro-runtime@57.0.16",
    "patch refresh command is missing",
  );
  assert(
    evidence.patchRefresh?.dependencyTreeExitCode === 0,
    "refreshed dependency tree did not exit successfully",
  );
  assert(
    evidence.patchRefresh?.expoInstallCheck === "Dependencies are up to date",
    "refreshed Expo install check is missing",
  );
  assert(
    evidence.patchRefresh?.expoDoctor ===
      "21/21 checks passed. No issues detected!",
    "refreshed Expo Doctor result is missing",
  );
  assert(
    typeof evidence.patchRefresh?.timestamp === "string" &&
      !Number.isNaN(Date.parse(evidence.patchRefresh.timestamp)),
    "patch refresh timestamp is missing",
  );
  const pinnedVerification = evidence.pinnedRuntimeVerification;
  assert(
    normalizeNodeVersion(pinnedVerification?.nodeVersion ?? "") ===
      pinnedNodeVersion,
    `closure verification Node ${pinnedVerification?.nodeVersion} does not match .nvmrc ${pinnedNodeVersion}`,
  );
  assert(
    pinnedVerification?.dependencyTreeExitCode === 0,
    "pinned-runtime dependency tree did not pass",
  );
  assert(
    pinnedVerification?.expoInstallCheck === "Dependencies are up to date",
    "pinned-runtime Expo install check is missing",
  );
  assert(
    pinnedVerification?.expoDoctor ===
      "21/21 checks passed. No issues detected!",
    "pinned-runtime Expo Doctor result is missing",
  );
  assert(
    pinnedVerification?.typecheckExitCode === 0,
    "pinned-runtime typecheck did not pass",
  );
  assert(
    pinnedVerification?.lintExitCode === 0,
    "pinned-runtime lint did not pass",
  );
  assert(
    pinnedVerification?.testSuites === 5 && pinnedVerification?.tests === 41,
    "pinned-runtime Jest result must record 5 suites and 41 tests",
  );
  assert(
    pinnedVerification?.storybookWebSmoke === "passed",
    "pinned-runtime Storybook web smoke did not pass",
  );
  assert(
    pinnedVerification?.penpotEvidenceValidation === "passed",
    "pinned-runtime Penpot evidence validation did not pass",
  );
  assert(
    pinnedVerification?.webVerificationValidation === "passed",
    "pinned-runtime web verification validation did not pass",
  );
  assert(
    typeof pinnedVerification?.timestamp === "string" &&
      !Number.isNaN(Date.parse(pinnedVerification.timestamp)),
    "pinned-runtime verification timestamp is missing",
  );
}

function expectFailure(label, action, pattern) {
  let message = "";
  try {
    action();
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assert(
    message && pattern.test(message),
    `controlled rejection "${label}" did not fail as expected; received: ${message || "no error"}`,
  );
}

function runControlledRejections(
  evidence,
  packageJson,
  lockfile,
  pinnedNodeVersion,
) {
  expectFailure(
    "unexpected direct dependency",
    () => {
      const changedPackageJson = structuredClone(packageJson);
      changedPackageJson.dependencies["unapproved-package"] = "1.0.0";
      validateLiveInventory(evidence, changedPackageJson, lockfile);
    },
    /unexpected direct dependency unapproved-package/u,
  );
  expectFailure(
    "substituted lockfile resolution",
    () => {
      const changedLockfile = structuredClone(lockfile);
      changedLockfile.packages["node_modules/react"].version = "0.0.0";
      validateLiveInventory(evidence, packageJson, changedLockfile);
    },
    /package-lock\.json resolves react@0\.0\.0/u,
  );
  expectFailure(
    "mismatched pinned runtime",
    () => validateProbe(evidence, `${pinnedNodeVersion}-mismatch`),
    /does not match \.nvmrc/u,
  );
}

async function main() {
  let evidence;
  let packageJson;
  let lockfile;
  let pinnedNodeVersion;
  try {
    [evidence, packageJson, lockfile, pinnedNodeVersion] = await Promise.all([
      ...[evidenceUrl, packageJsonUrl, packageLockUrl].map(async (url) =>
        JSON.parse(await readFile(url, "utf8")),
      ),
      readFile(nvmrcUrl, "utf8").then(normalizeNodeVersion),
    ]);
  } catch (error) {
    fail(`cannot read live toolchain inputs: ${error.message}`);
  }
  assert(evidence.schemaVersion === 1, "schemaVersion must be 1");
  validateApprovedPackages(evidence);
  validateDirectInventory(evidence);
  validateLiveInventory(evidence, packageJson, lockfile);
  assert(
    /^\d+\.\d+\.\d+$/.test(pinnedNodeVersion),
    ".nvmrc must contain an exact Node version",
  );
  validateProbe(evidence, pinnedNodeVersion);
  runControlledRejections(evidence, packageJson, lockfile, pinnedNodeVersion);
  console.log(
    `Validated live manifest and lockfile against the exact ${approvedVersions.size}-package approval and clean Expo/Storybook probe; controlled rejections passed.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
