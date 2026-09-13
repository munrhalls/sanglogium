# Headphones `filterAttributes` rename migration

D0 deliverable for `sang-logium-1xs.9.20` (Adapt Sanity headphones
filterAttributes schema). Records the field renames made to
`sanity-cms/schemaTypes/productType.ts` in commit `42f8ee16`, and the data
migration that moves existing headphones product documents from the old field
names to the new ones so that "a value that existed under the old field
name/shape still reads correctly under the new one" (AC bullet 3).

The schema itself is complete (AC bullets 1–2). This note exists so the schema
descriptions' "see … migration note" pointers are not dangling, and so the
rename mapping is recorded in one place.

## Renames

| Old field | New field | Old type / vocab | New type / vocab | Value mapping |
|---|---|---|---|---|
| `backDesign` | `acousticDesign` | `string`: `open`, `closed`, `semi-open` | `array<string>`: `open-back`, `closed-back`, `semi-open` | `open`→`open-back`, `closed`→`closed-back`, `semi-open`→`semi-open` (wrapped as a single-element array) |
| `connector` | `cableTermination` | `array<string>`: `3.5mm`, `6.35mm`, `4.4mm-balanced`, `4-pin-xlr`, `2.5mm`, `usb-c`, `mmcx`, `2-pin`, `fixed-cable` | `array<string>`: `3.5mm`, `2.5mm-balanced`, `4.4mm-balanced`, `4-pin-xlr`, `6.35mm`, `usb-c`, `mmcx`, `2-pin`, `fixed-cable` | `2.5mm`→`2.5mm-balanced`; every other value 1:1 |
| `noiseCancelling` | `anc` | `boolean` | `string` enum: `anc`, `passive`, `none` | `true`→`anc`; `false`→ derived from `backDesign`/`acousticDesign` (see below) |

Notes:

- `backDesign` was a **string** in the old schema; `acousticDesign` is an
  **array**. The migrate step therefore wraps the mapped value in an array.
- `connector`→`cableTermination` is a name change plus one vocabulary change:
  the old `2.5mm` value is renamed `2.5mm-balanced`. (The schema description
  formerly said `2.5mm-balanced` + `6.35mm` were "added"; `6.35mm` was already
  present in the old list — only `2.5mm`→`2.5mm-balanced` is a real
  change. This doc is the corrected record.)

### `noiseCancelling` boolean → `anc` enum (lossy)

A boolean cannot express `schema-headphones.md`'s three-way distinction
(`anc` / `passive` / `none`). The migration uses this deterministic rule:

- `true` → `anc`.
- `false` → `passive` unless the document's `backDesign`/`acousticDesign` is
  `open`/`open-back`/`semi-open`, in which case `none`.

This is a best-effort heuristic for un-sourced legacy POC data; the per-brand
sourcing issues (`sang-logium-1xs.9.2` and siblings) are the authoritative
source for `anc` and will overwrite it where they have already run. The
migration never overwrites an already-present `anc`/`acousticDesign`/
`cableTermination` value — when the new field already exists it only removes
the orphaned old field.

## Not in scope of this migration (flag)

Two further shape changes were made in the same schema commit but are **not**
part of AC bullet 3's rename list, so this migration deliberately does not
touch them:

- `wearingStyle`: `string` → `array<string>`.
- `driverType`: `string` → `array<string>` (and vocabulary extended with
  `amt`, `bone-conduction`, `electret`).

Docs that only carry the old *shape* of these fields (e.g. a legacy string
`driverType`) are left for the sourcing passes to re-write under the new
shape; they are not re-keyed here.

## Migration tooling

`sanity-cms/utils/migrations/headphonesFilterAttributesRename/`

- `migrate.mjs` — dry-run by default; `--write` applies. Prints a per-document
  diff, backs up each document's prior `filterAttributes` to
  `sanity-cms/backups/` before writing, then `set`s the new fields and
  `unset`s the old ones.
- `getClient.mjs` — same token split as the other migrations
  (`SANITY_API_READ_TOKEN` read / `SANITY_STUDIO_READ_WRITE` write).

## Verification

- AC bullet 4 (non-headphones unaffected) **confirmed**: the new
  headphones-only fields (`acousticDesign`, `cableTermination`, `anc`,
  `batteryLifeHours`, `bluetoothCodecs`, `driverConfigBucket`, `sourcing`,
  etc.) appear on **zero** non-headphones documents in the production dataset.
- Live dataset at time of writing: 187 headphones-category docs carry >=1
  legacy field — 134 old-only (migrate: set new + unset old), 53 both
  (unset orphaned old fields only), 0 new-only.
- **Excluded (left untouched, flagged for separate follow-up)**: 16 docs carry
  a legacy field but are not in the headphones category.
  - 1 genuine non-headphones doc: `TEAC UD-701N` (audio-electronics) has a
    stray `connector: ["4-pin-xlr"]` — pre-existing data error, not migrated.
  - 15 real headphones missing their `filterAttributes.category` metadata
    (`Focal Clear`, `HD 800S`, `Hifiman Sundara`, `Audeze LCD-X`, etc.) — they
    carry `backDesign` only and are missing the category marker, a separate
    data-quality bug to resolve before their legacy fields can be safely
    migrated.

