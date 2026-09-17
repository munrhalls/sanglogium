# Headphones Filters+Sorting — Devin task specs

Root epic: sang-logium-0bi — EPIC Headphones Filters Sorting (not executable itself — upstream rollup only).

| Beads issue | File | Depends on |
|---|---|---|
| sang-logium-axd | `sang-logium-axd - Block non-belonging products in slice.md` | — |
| sang-logium-0bi.1 | `sang-logium-0bi.1 - Range sliders bind to true data min-max.md` | axd |
| sang-logium-0bi.2 | `sang-logium-0bi.2 - Hide zero-match filter options.md` | axd |
| sang-logium-0bi.3 | `sang-logium-0bi.3 - Regroup amplifier-portable filters.md` | — |
| sang-logium-0bi.4 | `sang-logium-0bi.4 - Quiet the brand search field outline.md` | — |
| sang-logium-0bi.5 | `sang-logium-0bi.5 - Coherent Bluetooth codec casing.md` | — |
| sang-logium-0bi.6 | `sang-logium-0bi.6 - Sidebar scroll bottom breathing room.md` | — |
| sang-logium-0bi.7 | `sang-logium-0bi.7 - Every sort option must visibly reorder.md` | axd |

Issues with no dependency listed can run on separate Devin instances in parallel right now. The three depending on axd should not be dispatched until axd's Phase 2 is confirmed done (they'd be reasoning over data axd is actively correcting).

Each file: PLAN (grounded in direct checks, not assumptions) + PHASES (each self-contained, with scope, do-not-touch, steps, acceptance criteria, done signal). Devin should treat each phase as its own unit of work — never take on a whole file in one pass.
