---
schema_version: 1
open_count: 2
waived_count: 0
fixed_count: 0
total_count: 2
last_updated: 2026-09-17T21:46:37.149Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | deviation | design-spec/toolchain-compatibility.json |  | Updated non-approved template tooling versions to current Expo 57 expectations for a 21/21 Doctor result. | open |  | 2026-09-17T21:46:36.692Z |  |
| 2 | 01 | deviation | design-spec/toolchain-compatibility.json |  | Pinned test-renderer 1.2.0 to preserve React 19.2.3 compatibility with RNTL 14.0.1. | open |  | 2026-09-17T21:46:37.149Z |  |

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
  }
]
````
