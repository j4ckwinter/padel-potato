# Phase 01 Deferred Items

## Toolchain

- **Expo compatibility recommendation drift (observed 2026-09-18):** `npx expo install --check` now recommends `expo ~57.0.24` and `@expo/metro-runtime ~57.0.16`, while the human-approved and previously verified Phase 1 matrix pins `expo 57.0.23` and `@expo/metro-runtime 57.0.15`. Plan 01-04 did not change dependencies. Reconcile through a separately approved toolchain update rather than silently altering the approved lockfile.
