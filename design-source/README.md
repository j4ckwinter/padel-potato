# Canonical Penpot design snapshot

`padel-potato UI Concepts.penpot` is the canonical design source for routine planning, extraction, implementation, and verification. It is a structured Penpot ZIP export tracked with Git LFS, so agents can inspect exact pages, components, shapes, tokens, and metadata without a live Penpot connection.

The current snapshot is revision 296 of file `c514c1fb-1cda-8125-8008-a606253a77a3`. Its byte length, SHA-256 checksum, source metadata, page inventory, and record counts are pinned in `design-spec/penpot-source.json`.

## Commands

- `npm run design:inspect` prints the source identity and inventory.
- `npm run design:inspect -- --list pages` lists all pages.
- `npm run design:inspect -- --list components` lists all component records.
- `npm run design:inspect -- --query "Button"` finds records by exact UUID or exact design name. Use `--page`, `--shape`, or `--component` to constrain the record kind.
- `npm run validate:design-source` validates the archive, compares its derived manifest byte-for-byte with the committed manifest, and runs controlled malformed-archive rejection tests. It does not modify files or require network access.
- `npm run design:refresh` deliberately regenerates the manifest after the canonical export is replaced.

## Replacing the snapshot

1. Export the complete Penpot file without trimming media.
2. Replace `design-source/padel-potato UI Concepts.penpot` using that exact filename.
3. Run `npm run design:inspect` and confirm the file ID and required Foundations, Components, and Product Screens pages.
4. Run `npm run design:refresh` to accept the new revision, checksum, byte length, and inventory into `design-spec/penpot-source.json`.
5. Run `npm run validate:design-source` and review the snapshot and manifest together before committing both.

The revision identifies Penpot's logical file version. The SHA-256 checksum identifies the exact exported bytes; a changed checksum is never accepted silently, even when the revision is unchanged. The manifest is deterministic and contains no generation timestamp or machine-specific absolute path.

Live Penpot MCP access is optional. It may be used to check whether the live file is newer before exporting a replacement, but it is not required for routine extraction, planning, implementation, or source validation. Historical Phase 1 and Phase 2 MCP evidence remains the truthful provenance for those completed phases and must not be rewritten.

Source inspection proves what the design archive contains. It does not prove native rendering fidelity: iOS and Android Storybook output must still be compared with retained design references, with intentional platform deviations recorded.
