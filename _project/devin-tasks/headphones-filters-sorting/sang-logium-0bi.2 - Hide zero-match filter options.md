# sang-logium-0bi.2 — [Headphones] Hide zero-match filter options

Parent: sang-logium-0bi. Depends on: sang-logium-axd (option counts must reflect the corrected product set first).

Beads goal (do not restate/duplicate elsewhere):
With no filters selected, no filter option that would return zero products should be shown.

## Verified ground truth (from direct code read this session)
- `FilterSidebar.tsx` receives pre-computed `checkboxCounts: Record<string, FacetOptionCount[]>` and `booleanCounts: Record<string, number>` as props (from `page.tsx`'s `getFilterFacets({ keys: descendantKeys, state: preState })`) and renders them via `CheckboxGroup`/`BooleanToggle` in `FilterControls.tsx`. It does not compute counts itself.
- Not yet confirmed (Phase 1 to check): whether zero-count options are already excluded at the `getFilterFacets.ts` computation and something else is re-adding them, or whether `getFilterFacets.ts` includes them by design and no filtering exists anywhere yet.

## Phase 1 — Investigate
Scope: read-only. Read `sanity-cms/lib/products/getFilterFacets.ts` and `FilterControls.tsx`'s `CheckboxGroup`/`BooleanToggle`.
Steps:
1. Determine exactly where in the pipeline a zero-count option currently survives to be rendered.
2. Confirm this must be checked specifically in the **default state (no filters active)** — a option can legitimately show 0 once other filters are active without being a bug; scope this fix to the no-filters-active case only, matching the acceptance test.
Acceptance criteria:
- [ ] Exact file + location identified where zero-count options should be filtered out.
Done signal: state the file/location and the plan for Phase 2 in one paragraph.

## Phase 2 — Implement
Scope: whichever file Phase 1 identified — prefer filtering at the `getFilterFacets.ts` computation (single source of truth) over filtering in each render component, unless Phase 1 finds a concrete reason that's wrong.
Do not touch: any range/price facet (this is about checkbox/boolean options only, per the acceptance test), any other category's facet behavior (audio-electronics, accessories) unless the fix is shared code — if shared, confirm the fix is correct for those categories too before proceeding.
Acceptance criteria:
- [ ] On `/products/headphones` with no filters active, every rendered checkbox/boolean option has a non-zero count.
- [ ] Selecting a filter that legitimately drives another option's live count to 0 still shows that option (this fix only applies to the default state).
Done signal: list of options visible before the fix vs. after, on a fresh `/products/headphones` load with no filters, showing the zero-count ones are gone.
