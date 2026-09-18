---
schema_version: 1
open_count: 6
waived_count: 0
fixed_count: 0
total_count: 6
last_updated: 2026-09-18T14:07:56.252Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | deviation | design-spec/toolchain-compatibility.json |  | Updated non-approved template tooling versions to current Expo 57 expectations for a 21/21 Doctor result. | open |  | 2026-09-17T21:46:36.692Z |  |
| 2 | 01 | deviation | design-spec/toolchain-compatibility.json |  | Pinned test-renderer 1.2.0 to preserve React 19.2.3 compatibility with RNTL 14.0.1. | open |  | 2026-09-17T21:46:37.149Z |  |
| 3 | 01 | deviation | package.json |  | Storybook initializer proposed unapproved 10.6-era dependencies; exact approved 10.5.0 inventory was restored | open |  | 2026-09-17T22:07:47.176Z |  |
| 4 | 01 | deviation | package.json |  | Generic launcher is storybook:native because Expo Doctor rejects a storybook script that shadows the installed binary | open |  | 2026-09-17T22:07:47.642Z |  |
| 5 | 01 | deviation | tsconfig.json |  | Expo web normalized the TypeScript include list during startup | open |  | 2026-09-17T22:07:48.098Z |  |
| 6 | 02 | unrun-verify | design-spec/phase-2-verification.md |  | Native 200% font-scale, target clipping, VoiceOver, and TalkBack checks deferred to Phase 5 because no physical or remote native route was available. | open |  | 2026-09-18T14:07:56.252Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "01",
    "file": "design-spec/toolchain-compatibility.json",
    "line": null,
    "description": "Updated non-approved template tooling versions to current Expo 57 expectations for a 21/21 Doctor result.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-17T21:46:36.692Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "01",
    "file": "design-spec/toolchain-compatibility.json",
    "line": null,
    "description": "Pinned test-renderer 1.2.0 to preserve React 19.2.3 compatibility with RNTL 14.0.1.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-17T21:46:37.149Z",
    "resolved_at": null
  },
  {
    "id": 3,
    "kind": "deviation",
    "phase": "01",
    "file": "package.json",
    "line": null,
    "description": "Storybook initializer proposed unapproved 10.6-era dependencies; exact approved 10.5.0 inventory was restored",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-17T22:07:47.176Z",
    "resolved_at": null
  },
  {
    "id": 4,
    "kind": "deviation",
    "phase": "01",
    "file": "package.json",
    "line": null,
    "description": "Generic launcher is storybook:native because Expo Doctor rejects a storybook script that shadows the installed binary",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-17T22:07:47.642Z",
    "resolved_at": null
  },
  {
    "id": 5,
    "kind": "deviation",
    "phase": "01",
    "file": "tsconfig.json",
    "line": null,
    "description": "Expo web normalized the TypeScript include list during startup",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-17T22:07:48.098Z",
    "resolved_at": null
  },
  {
    "id": 6,
    "kind": "unrun-verify",
    "phase": "02",
    "file": "design-spec/phase-2-verification.md",
    "line": null,
    "description": "Native 200% font-scale, target clipping, VoiceOver, and TalkBack checks deferred to Phase 5 because no physical or remote native route was available.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-18T14:07:56.252Z",
    "resolved_at": null
  }
]
````
