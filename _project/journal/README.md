# Journal — index

Written 2026-09-15, at the user's request, during and after a working
session on the sanglogium filters/sorting system. Six files:

1. **`2026-09-15-session.md`** — this conversation, chronological, section
   by section. Includes the technical work, the beads-tracker findings, and
   a factual record of a distress episode partway through the session
   (section 9), with the crisis-resource responses given at the time.
2. **`filters-sorting-history.md`** — the filters/sorting system's git
   history, 2025-03-03 to 2026-09-15, 225 matching commits, with exact
   hashes/dates for every named milestone, a monthly commit-count table and
   gantt chart, and the current beads issue tree for `sang-logium-3rv`.
3. **`patterns-catalogue.md`** — 11 recurring technical/process patterns
   found across that history, each cited to specific commits, beads notes,
   or files read directly. Codebase-scoped only.
4. **`diagrams/headphones.md`**, **`diagrams/audio-electronics.md`**,
   **`diagrams/accessories.md`** — each category's current sidebar
   facet-group structure, with exact facet counts per group, verified by
   grep against the live config files.
5. **`diagrams/category-wiring.md`** — the specific before/after of this
   session's category-routing fix, and a separate diagram of the
   client/server dual-URL-parser-map bug found the same session.

## How these were checked

Every commit hash, date, author, and quoted commit message in these
documents was pulled directly from `git show`/`git log` during this
session, not recalled from memory. Every beads issue status/note quoted was
pulled directly from `bd show`, re-checked at least once against a fresh
call where a prior state might have changed. Every facet count and code
claim was verified by reading the named file or grepping it directly, with
the exact command noted inline where it matters. Where a document states a
diagnosis rather than a confirmed, independently-reproduced fact (the
hydration-warning cause; whether the dual-parser bug was ever seen live in
a browser), it says so at the point the claim is made, not as a blanket
disclaimer.

## What these do not contain

No claim about the person doing this work, their ability, or what any of
this "means" about them — that was deliberately removed from an earlier
draft at the user's explicit instruction. These files record what
happened and what the repository's own history shows, nothing else.
