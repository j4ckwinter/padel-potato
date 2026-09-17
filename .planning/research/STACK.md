# Technology Stack

**Project:** Padel Potato — Expo/React Native design system and native Storybook
**Researched:** 2026-09-17
**Confidence:** MEDIUM — package versions and compatibility were cross-checked against Expo's versioned documentation, the npm registry, and Storybook's official repository. Penpot MCP workflow details are project-specific rather than publicly versioned.

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|---|---:|---|---|
| Node.js | `22.13.x` or later LTS | Local toolchain | Expo SDK 57 documents Node `22.13.x` as its minimum. Use a current Node 22 LTS patch and record it in `.nvmrc`/Volta rather than relying on a globally drifting Node version. |
| Expo | `~57.0.23` | Managed React Native runtime, Metro, native/web development | This is the current stable SDK patch in npm. Expo owns the React Native compatibility matrix, cross-platform Metro configuration, and local web target; do not compose an arbitrary React Native toolchain. |
| React Native | `0.86.3` | Native component runtime | SDK 57’s bundled-native-modules manifest pins this patch; it remains within the official SDK 57 line (`0.86`). Install through `npx expo install`, not a manual `npm install react-native@latest`. |
| React | `19.2.3` | Component model | Expo SDK 57’s supported React version. |
| TypeScript | `~5.9` (resolved by `expo install`) | Strict token, prop, variant, and story contracts | Expo has first-class TypeScript support. Extend `expo/tsconfig.base`; turn on `strict`; do not maintain a custom Babel TypeScript pipeline. |
| Metro via `expo/metro-config` | SDK-owned | Native + Expo web bundling | A single Expo Metro configuration is required so Storybook can wrap it and Expo web remains available. |

### Storybook and Catalogue

| Technology | Version | Purpose | Why |
|---|---:|---|---|
| `@storybook/react-native` | `10.6.0` | Authoritative on-device Storybook UI for iOS and Android | Current stable React Native Storybook. It runs as a React Native component through Metro, so stories exercise actual native layout, fonts, gestures, and interaction rather than an iframe approximation. |
| `storybook` | `10.6.0` | Shared Storybook core/tooling | Keep exactly the same major and preferably the same patch as the React Native package; Storybook explicitly warns against mixed majors. |
| `@storybook/addon-ondevice-controls` | `10.6.0` | Editable story args on device | Makes variants/states reviewable without product screens. |
| `@storybook/addon-ondevice-actions` | `10.6.0` | Event/action inspection on device | Demonstrates press and input behaviour in the catalogue. |
| `@storybook/addon-ondevice-backgrounds` | `10.6.0` | Light/dark or surface-context checking | Useful for validating tokens and component surfaces. |
| `@storybook/react-native-web-vite` | `10.6.0`, optional/deferred | Full browser-native Storybook framework | Do **not** add for this milestone. Native Storybook itself supports basic web and Expo must expose it locally. This Vite framework creates a second preview/build configuration and is only warranted if later requirements demand hosted docs or full web-addon parity. |
| `withStorybook` from `@storybook/react-native/withStorybook` | bundled with above | Metro wrapper and conditional Storybook entry | Use the current v10 entry-point swapping setup. Gate it with `STORYBOOK_ENABLED`; normal app bundles then exclude Storybook code. Use `cross-env@10.1.0` in npm scripts so the flag works in Windows PowerShell and POSIX shells. |

**Compatibility constraint:** `@storybook/react-native@10.6.0` peers on `react-native-reanimated@4.5.1` and `react-native-safe-area-context@5.8.0`. Expo 57.0.23 currently selects `react-native-reanimated@4.5.1` and `react-native-safe-area-context~5.7.0`; therefore initialize from the official Expo Storybook template or install Storybook first, then run `npx expo install --fix` and retain the generated lockfile. Validate with `npx expo-doctor` before implementation. Do not upgrade Reanimated independently.

### Database

| Technology | Version | Purpose | Why |
|---|---:|---|---|
| None in this milestone | — | — | The deliverable is a stateless component system. Backend, game records, and persistence are explicitly deferred. Keep stories supplied with typed fixtures rather than introducing data infrastructure. |

### Infrastructure and Visual Verification

| Technology | Version | Purpose | Why |
|---|---:|---|---|
| Expo Go / Expo development build | SDK 57-compatible | Android device/emulator and physical iPhone review | Supports the acceptance target without committing native project directories. Add a development build only if a later component requires a native dependency unsupported by Expo Go. |
| Expo web | SDK 57 | Local desktop-browser catalogue | Install Expo-aligned `react-dom@19.2.3`, `react-native-web~0.21.0`, and `@expo/metro-runtime~57.0.15`; launch with `npx expo start --web`. It is a convenience review target, not visual authority. |
| Penpot MCP | configured project integration | Design extraction, properties/variants, and reference renders | Treat outputs from the specified Penpot file/pages as the design authority. For each foundation/component story, retain the inspected Penpot node/reference render and compare it to captured iOS and Android Storybook renders; log intentional platform deviations. |
| Screenshot evidence directory | repository convention | Reviewable native visual verification | Store versioned, named evidence and a short comparison record; MCP-grounded human/agent review is more appropriate than adopting a browser-only screenshot test as the native acceptance mechanism. |

### Testing and Quality

| Library | Version | Purpose | When to Use |
|---|---:|---|---|
| `jest-expo` | `~57.0.5` | Expo-aware Jest preset and native-module mocks | Unit and focused component tests. Use the Expo-aligned range, installed with `npx expo install`. |
| Jest | Expo-resolved compatible release | Test runner | Run component/token tests in CI and locally. Let `jest-expo` determine the compatible version rather than pinning Jest 30 independently. |
| `@testing-library/react-native` | `14.0.1` | Accessibility-first component interaction tests | Test semantics, event handling, disabled/loading states, and token-driven content. It replaces deprecated `react-test-renderer` for React 19+. |
| `eslint` + `eslint-config-expo` | Expo template-aligned | Static quality checks | Retain Expo's generated lint configuration; avoid adding a competing React Native ESLint preset. |
| Prettier | `3.9.7` | Deterministic formatting | Add only as a formatting tool, with a shared script; it is not a substitute for lint/type checks. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|---|---|---|---|
| Application bootstrap | Expo SDK 57 managed project | React Native Community CLI / bare app | Adds native build and web configuration that does not advance a component-library milestone. Expo is already a project decision. |
| Native component workbench | `@storybook/react-native` v10 | Web-only Storybook with `@storybook/addon-react-native-web` | Browser rendering cannot be the authority for native iOS/Android layout and interaction. The addon is an older web adapter, whereas the v10 native Storybook offers an Expo-aware Metro workflow. |
| Browser catalogue | Expo web running native Storybook | Separate Vite Storybook from day one | Creates two configurations and a larger parity surface; requirements explicitly make browser review secondary. |
| Test renderer | React Native Testing Library | `react-test-renderer` | Expo documents the latter as deprecated because it does not support React 19+. |
| Native visual acceptance | Penpot-MCP-to-native Storybook render comparison | Browser snapshot tests as the sole gate | They can complement web compatibility but cannot prove iOS/Android fidelity. |
| Styling system | Typed React Native `StyleSheet`/style objects consuming local tokens | NativeWind/Tailwind, UI kit, or CSS-in-JS framework | The milestone must faithfully translate an existing Penpot system. A new abstraction/library would impose its own tokens, state conventions, and web constraints before the baseline exists. |
| iOS simulator on Windows | Physical iPhone plus Expo development server; macOS CI/reviewer for simulator checks | Attempting local iOS Simulator/Xcode on Windows | Expo documents that iOS Simulator is macOS-only. Windows can develop Android/web locally and use a physical iOS device or cloud build/distribution. |

## Installation

Use the Storybook Expo template as the safest bootstrap because it carries the Metro wrapper and generated story configuration. If bootstrapping manually, start with the Expo blank TypeScript template and let `expo install` resolve all Expo-owned versions.

```powershell
# Windows-friendly: initialize the official Expo + Storybook template
npx create-expo-app@latest PadelPotato --template expo-template-storybook
Set-Location PadelPotato

# Align Expo-managed runtime/web dependencies; never substitute npm @latest here
npx expo install react-dom react-native-web @expo/metro-runtime `
  react-native-reanimated react-native-gesture-handler react-native-safe-area-context

# Expo documents this Windows syntax for development-only test dependencies
npx expo install jest-expo jest @types/jest @testing-library/react-native "--" --dev

# Keep every Storybook package on the same verified patch
npm install --save-dev storybook@10.6.0 @storybook/react-native@10.6.0 `
  @storybook/addon-ondevice-controls@10.6.0 `
  @storybook/addon-ondevice-actions@10.6.0 `
  @storybook/addon-ondevice-backgrounds@10.6.0 cross-env@10.1.0 prettier@3.9.7

npx expo install --fix
npx expo-doctor
```

Use scripts equivalent to `cross-env STORYBOOK_ENABLED=true expo start`, `cross-env STORYBOOK_ENABLED=true expo start --web`, `jest`, `tsc --noEmit`, and `expo lint`. The generated Metro configuration must start with `getDefaultConfig` from `expo/metro-config` and export `withStorybook(config)`.

## Sources

- [Expo SDK 57 reference and compatibility matrix](https://docs.expo.dev/versions/v57.0.0/) — MEDIUM confidence (official, cross-checked with registry).
- [Expo web development](https://docs.expo.dev/workflow/web/) — MEDIUM confidence (official, cross-checked with SDK manifest).
- [Expo unit testing with Jest](https://docs.expo.dev/develop/unit-testing/) — MEDIUM confidence (official).
- [Expo iOS Simulator constraints](https://docs.expo.dev/workflow/ios-simulator/) — MEDIUM confidence (official).
- [React Native Storybook v10 repository/setup](https://github.com/storybookjs/react-native) — MEDIUM confidence (official project).
- [React Native Storybook documentation](https://storybookjs.github.io/react-native/docs/intro/) — MEDIUM confidence (official project).
- [npm registry: `@storybook/react-native` 10.6.0](https://www.npmjs.com/package/@storybook/react-native) — MEDIUM confidence after cross-checking peer dependencies and Expo’s SDK manifest.

## Version Verification Snapshot

Verified on 2026-09-17: `expo@57.0.23`, Expo SDK 57’s `react-native@0.86.3`, `react@19.2.3`, `react-dom@19.2.3`, `react-native-web~0.21.0`, `@expo/metro-runtime~57.0.15`, `react-native-reanimated@4.5.1`, `@storybook/react-native@10.6.0`, on-device addon packages `10.6.0`, `jest-expo@57.0.5`, and `@testing-library/react-native@14.0.1`. Re-run `npx expo install --fix`, `npx expo-doctor`, and `npm view` immediately before implementation if the lockfile is first generated after this research date.
