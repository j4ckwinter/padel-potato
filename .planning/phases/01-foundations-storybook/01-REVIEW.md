---
phase: 01-foundations-storybook
reviewed: 2026-09-18T11:21:18Z
depth: standard
files_reviewed: 44
files_reviewed_list:
  - .gitignore
  - .nvmrc
  - .rnstorybook/index.tsx
  - .rnstorybook/main.ts
  - .rnstorybook/preview.tsx
  - .rnstorybook/storybook.requires.ts
  - app.json
  - App.tsx
  - assets/fonts/inter-4.1.provenance.json
  - assets/fonts/Inter-Bold.ttf
  - assets/fonts/Inter-Regular.ttf
  - assets/fonts/Inter-SemiBold.ttf
  - assets/fonts/OFL.txt
  - design-spec/deviations.json
  - design-spec/penpot-foundations.json
  - design-spec/references/foundations/capture.json
  - design-spec/references/foundations/foundations-page.png
  - design-spec/toolchain-compatibility.json
  - design-spec/web-storybook-verification.md
  - eslint.config.js
  - metro.config.js
  - package.json
  - scripts/smoke-storybook-web.mjs
  - scripts/validate-penpot-evidence.mjs
  - scripts/validate-toolchain-compatibility.mjs
  - scripts/validate-web-storybook-verification.mjs
  - src/design-system/fonts/FoundationFontGate.tsx
  - src/design-system/foundations/FoundationGallery.stories.tsx
  - src/design-system/foundations/FoundationGallery.tsx
  - src/design-system/foundations/FoundationsSmoke.stories.tsx
  - src/design-system/tokens/borders.ts
  - src/design-system/tokens/colors.ts
  - src/design-system/tokens/dimensions.ts
  - src/design-system/tokens/index.ts
  - src/design-system/tokens/opacity.ts
  - src/design-system/tokens/radii.ts
  - src/design-system/tokens/spacing.ts
  - src/design-system/tokens/typography.ts
  - tests/color-typography-tokens.test.ts
  - tests/foundations-smoke.test.tsx
  - tests/foundations-story.test.tsx
  - tests/scale-tokens.test.ts
  - tests/typography.test.tsx
  - tsconfig.json
findings:
  critical: 1
  warning: 2
  info: 0
  total: 3
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-09-18T11:21:18Z
**Depth:** standard
**Files Reviewed:** 44
**Status:** issues_found

## Summary

The foundation tokens, font provenance, Storybook catalogue, and focused tests are internally consistent, and the submitted typecheck, lint, and 41 tests pass. The release gate is nevertheless capable of approving a dependency tree that no longer matches its approved evidence, and two portability/lifecycle gaps weaken the repeatability claimed by the phase.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: Compatibility validation never compares evidence with the repository being shipped

**Classification:** BLOCKER

**File:** `C:/Users/jackw/Documents/dev/padel/scripts/validate-toolchain-compatibility.mjs:160-170`

**Issue:** The validator reads only `design-spec/toolchain-compatibility.json` and compares that document with constants embedded in the same script. It never reads `package.json` or `package-lock.json`, and it never queries the installed top-level tree. Consequently, changing a Storybook package, adding an unapproved direct dependency, or allowing the lockfile to resolve a different version leaves this validator green. The final closure command's separate `npm ls --all --json` invocation proves only that npm can form a valid tree; it does not compare that tree with `approvedVersions`. This breaks the exact-package/version approval boundary and can falsely approve unreviewed dependencies.

**Fix:** Read the live manifest and lockfile in this validator and compare their direct and resolved versions with the approved inventory. Reject unexpected direct dependencies as well as missing or substituted ones. For example:

```js
const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);
const lockfile = JSON.parse(
  await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'),
);

const liveDirect = new Map(
  Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }),
);

for (const [name, version] of approvedVersions) {
  assert(liveDirect.get(name) === version, `${name} differs from its approval`);
  assert(
    lockfile.packages[`node_modules/${name}`]?.version === version,
    `${name} lockfile resolution differs from its approval`,
  );
}
```

Also compare the complete live direct-dependency key set with the recorded `directDependencies` and `directDevDependencies` collections so additions cannot bypass review.

## Warnings

### WR-01: The advertised cleanup guarantee does not cover interruption or spawn failure

**Classification:** WARNING

**File:** `C:/Users/jackw/Documents/dev/padel/scripts/smoke-storybook-web.mjs:34-69,194-196`

**Issue:** Cleanup runs only through the async `finally` block. `SIGINT`, `SIGTERM`, and an abrupt parent shutdown are not handled, so cancelling the smoke can leave the detached POSIX Expo process group alive. In addition, a spawn failure can leave `child.pid` undefined; the POSIX branch then calls `process.kill(-child.pid, ...)`, which throws an argument error and masks the original launch failure. This contradicts the script's "always cleans up" acceptance guarantee and can leak a Metro/Expo listener in CI or local development.

**Fix:** Guard `child.pid` before attempting process-group termination, register one idempotent cleanup function for `SIGINT`, `SIGTERM`, `uncaughtException`, and normal completion, and remove handlers once cleanup finishes. Preserve the original spawn error when no child PID was created.

### WR-02: Compatibility evidence was generated on a different Node major than the pinned project runtime

**Classification:** WARNING

**File:** `C:/Users/jackw/Documents/dev/padel/.nvmrc:1`; `C:/Users/jackw/Documents/dev/padel/design-spec/toolchain-compatibility.json:49-53`

**Issue:** The repository pins Node `22.13.1`, but the clean probe and all retained compatibility evidence were produced on Node `v24.20.0`. The validator only checks that the evidence contains some semantic Node version, so it accepts this mismatch. A developer following `.nvmrc` is therefore using a runtime for which the claimed clean install, Expo Doctor result, web smoke, and process behavior were not actually exercised.

**Fix:** Run the compatibility probe and full closure gate under the `.nvmrc` version and record that matching version, or change the project pin through the approval process. Add a validator assertion that normalizes an optional leading `v` and requires `probe.nodeVersion` to equal `.nvmrc`.

---

_Reviewed: 2026-09-18T11:21:18Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
