# Headphones filterAttributes rename migration

Data migration for `sang-logium-1xs.9.20` (AC bullet 3). Moves existing
headphones product documents off the superseded field names:

- `backDesign` → `acousticDesign`
- `connector` → `cableTermination`
- `noiseCancelling` (boolean) → `anc` (enum)

Full mapping and the `noiseCancelling` → `anc` heuristic are in
`docs/filters-sort/headphones-filterattributes-migration.md`.

## Run

```bash
cd sanity-cms/utils/migrations/headphonesFilterAttributesRename
node migrate.mjs            # dry run — no writes, prints per-document diff
node migrate.mjs --write    # back up each doc to sanity-cms/backups/, then apply
```

- Dry run first, always. Read the per-document `+ set` / `- unset` diff.
- `--write` backs up each document's prior `filterAttributes` to
  `sanity-cms/backups/backup_headphones_<id>_<timestamp>.json` before patching.
- When a document already has a new field (`acousticDesign` /
  `cableTermination` / `anc` — i.e. it was already sourced), the migration only
  removes the orphaned old fields and never overwrites the new value.
