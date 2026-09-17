# sang-logium-0bi.7 — [Headphones] Every sort option must visibly reorder

Parent: sang-logium-0bi. Depends on: sang-logium-axd (sort correctness must be evaluated against the corrected product set).

Beads goal (do not restate/duplicate elsewhere):
Selecting any sort option must produce a visible, correct reordering of the product list. Determine the correct should-be set of sort options from real data — do not just patch toward "runs without erroring."

## Verified ground truth (from direct code read this session)
- `page.tsx` line 78: `const { orderClause, whereClause, params: queryParams } = buildProductQuery(state);` — `orderClause` (from `lib/catalogue/buildProductQuery.ts`) is what actually drives result order.
- `SortBar.tsx` renders `SortDropdown` (`app/components/features/filters/SortDropdown.tsx`) — not yet read; this is where the list of offered sort options lives.
- Not yet confirmed: which specific sort options currently no-op, or why. This must be established systematically (Phase 1), not assumed.

## Phase 1 — Systematic per-option audit (investigate only, no fixes yet)
Scope: read-only + live testing on the already-running dev server. Read `SortDropdown.tsx` and `buildProductQuery.ts`'s order-clause logic.
Steps:
1. Enumerate every sort option currently offered in `SortDropdown.tsx`.
2. For each option, on a filtered subset with more than a handful of products (so a real reorder would be visible), select it and record: does the visible order change at all, and if so, is it correct for what the option claims (e.g. "Price: Low to High" actually ascending by price)?
3. For every option that fails either check, find its root cause by reading `buildProductQuery.ts`'s handling of that specific order value — do not guess; trace it (e.g. wrong/missing field reference, a field that's null/identical across the current data, a mismatched option-value string).
Do not touch: no code changes in this phase.
Acceptance criteria:
- [ ] A table: every sort option, pass/fail, and (for failures) the specific root cause traced in code.
Done signal: post that table as this phase's output.

## Phase 2 — Fix per root cause, and settle the should-be option set
Scope: `buildProductQuery.ts` and/or `SortDropdown.tsx`, per what Phase 1 found. If Phase 1 finds an option that cannot be made meaningful from real data (e.g. the underlying field is genuinely absent/non-differentiating for this catalogue), do not force a fake fix — flag it for a human decision on whether that option should exist at all, rather than silently removing or silently leaving it broken.
Do not touch: any filter (non-sort) logic, `getFilterFacets.ts`, any FilterSidebar component.
Acceptance criteria:
- [ ] Every sort option remaining in the dropdown demonstrably reorders correctly, re-verified live (repeat Phase 1's per-option check after the fix).
- [ ] Any option that could not be made correct from real data is explicitly flagged with a reason, not silently shipped either way.
Done signal: the same per-option table from Phase 1, re-run, showing pass for everything still offered.
