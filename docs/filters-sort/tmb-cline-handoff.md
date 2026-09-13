# Handoff: sang-logium-tmb — audit sourcing-phase issues for stale schema references

**For: cline (deepseek). Beads-hygiene task only. No code, no schema, no git
changes — you are reading and correcting `bd` issue text, nothing else.
If you're unsure whether something counts as stale, don't guess — append a
note flagging it and move on. Guessing wrong here misleads the sourcing
agents that read these issues next.**

## Why this exists

Tonight (2026-09-13) the filterAttributes schema for all 3 catalogue slices
was completed and committed. Several beads issues still describe the
pre-schema-work state (missing fields, old field names) because their text
was written before that work happened. An agent reading a stale issue could
waste real work re-deriving something already done, or worse, source data
against field names that no longer exist. `sang-logium-1xs.9.20`,
`1xs.13.1`, `1xs.14.1`, `1xs.13`, and `1xs.14` were already corrected this
way tonight — **use those 5 issues as your worked examples** of the exact
pattern to follow (`bd show` each one to see it: a corrected CURRENT STATUS
in the DESCRIPTION, plus an append-note that explicitly supersedes any old
NOTES claim it would otherwise contradict).

## Ground truth to check against (read these, don't guess)

- `docs/filters-sort/schema-headphones.md`, `should-be-accessories.md`,
  `should-be-audio-electronics.md` — the target field lists.
- `docs/filters-sort/headphones-filterattributes-migration.md`,
  `accessories-filterattributes-migration.md`,
  `audio-electronics-filterattributes-migration.md` — the actual rename
  mappings and current schema state, with completeness tables.
- `sanity-cms/schemaTypes/productType.ts` — the actual committed schema, if
  you need to confirm a field name exists.

**Renamed field names to check for** (old → new; an issue mentioning the
left column instead of the right one is a stale reference):

- Headphones: `backDesign`→`acousticDesign`, `connector`→`cableTermination`,
  `noiseCancelling`→`anc`.
- Accessories: `accessoryType`'s vocab `cable/adapter/interconnect/eartip/
  earpad/stand/case/care` → the 9-value taxonomy in the migration doc.
- Audio-electronics: `deviceType`'s vocab `headphone-amp/dac-amp-combo/
  dongle-dac/dap` → the 9-value Product Category taxonomy; `outputs`' old
  vocab (`6.35mm/4.4mm/4-pin-xlr/rca-line-out`) → the 5-value taxonomy.

## Exactly which 8 issues to audit (scope — don't wander beyond this list)

1. `sang-logium-1xs.9.3` — Headphones sourcing: HiFiMan
2. `sang-logium-1xs.9.6` — Headphones sourcing: Bowers & Wilkins
3. `sang-logium-1xs.9.11` — Headphones sourcing: Soundcore
4. `sang-logium-1xs.9.13` — Headphones sourcing: JBL
5. `sang-logium-1xs.9.16` — Headphones sourcing: FiiO
6. `sang-logium-1xs.9.18` — Headphones sourcing: Moondrop
7. `sang-logium-1xs.13.2` — Audio-electronics: thematic sourcing groups
8. `sang-logium-1xs.14.2` — Accessories: thematic sourcing groups

## Per-issue procedure

1. `bd show <id>`.
2. Check its DESCRIPTION and NOTES against the ground-truth docs above for
   any of the renamed field names/vocab (old column), or any claim that a
   slice's schema is missing/incomplete (all 3 are now complete).
3. If clean: do nothing. Don't add a "checked, no issues" note — that's
   noise, not signal, and this repo's response-formatting rule already
   asks for lean output.
4. If the DESCRIPTION itself is wrong (e.g. an acceptance test literally
   names an old field): use `bd update <id> --body-file <tmpfile>` with the
   corrected text — preserve every line that isn't wrong, change only
   what's actually stale. Never regenerate a whole description from
   scratch.
5. If only NOTES contains a stale claim (historical record — don't erase
   it): `bd note <id> "..."` with a short, clearly-labeled correction that
   states what's stale above it and what's true instead, exactly like the
   5 worked examples.
6. If genuinely unclear: `bd note <id> "..."` flagging the specific
   question, and move to the next issue. Do not block on it.

## When done

One final `bd note` on `sang-logium-tmb` itself: a short list of which of
the 8 had corrections made vs. were already clean. Then stop — no summary
document, no other files.
