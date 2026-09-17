# sang-logium-0bi.1 — [Headphones] Range sliders: bind to true data min/max

Parent: sang-logium-0bi. Depends on: sang-logium-axd (must be done first — true min/max must be computed over the corrected product set).

Beads goal (do not restate/duplicate elsewhere):
Impedance, Sensitivity, Frequency Response, and Cable Length slider min/max must equal the true min/max across actual product data; a human-runnable oracle must independently confirm it.

## Verified ground truth / grounded hypothesis (from direct code read this session)
- `FilterSidebar.tsx`'s own prop comment states: "RangeControl falls back to `facetConfig.ts`'s hardcoded min/max" when the `rangeBounds` prop has no entry for a given facet id.
- The real headphones page (`page.tsx`) passes `rangeBounds={facets.ranges}`, where `facets` comes from `sanity-cms/lib/products/getFilterFacets.ts`.
- **Hypothesis, not yet confirmed — confirm in Phase 1**: `getFilterFacets.ts` may not compute a live range for every facet (e.g. `frequencyResponse`, `cableLength`), silently falling back to `facetConfig.ts`'s hardcoded numbers for just those — which would exactly explain why the reported values (25 Hz max, 0.2m cable) look implausible while others look more plausible. Do not assume this is the root cause until Phase 1 confirms it against the actual files.
- User-reported current display values to check against, not to trust as final: Impedance 3–520 Ω, Sensitivity 89–128 dB/mW, Frequency Response 2–25 Hz, Cable Length 0.2m.

## Phase 1 — Investigate + build the oracle
Scope: read `sanity-cms/lib/products/getFilterFacets.ts` and `facetConfig.ts` (path: wherever `RangeControl` in `FilterControls.tsx` imports its hardcoded fallback from). Read-only for these two; new file for the oracle.
Steps:
1. Confirm or refute the hypothesis above by reading the two files directly — determine exactly which of the 4 facets (if any) get a real computed range vs. a hardcoded fallback.
2. Write a new standalone script, `lib/filter-sort/__tests__/10-range-facet-min-max-oracle.mjs`, following the existing pattern in `08-*`/`09-*` (same `sanityRaw.mjs` import, same "Run: node --env-file=.env.local ..." header comment). It must independently query Sanity for the headphones VFS-scoped product set (reuse the exact VFS-scope logic from `09-*`, don't re-derive it differently) and compute the true min and max, plus which product holds each, for: impedance, sensitivity, frequency response, and cable length.
3. Run it. Record the actual true min/max per spec.
Do not touch: any FilterSidebar/filter component, `getFilterFacets.ts`, `facetConfig.ts` (read-only in this phase).
Acceptance criteria:
- [ ] Root cause confirmed or refuted, in writing, citing the exact lines/logic in `getFilterFacets.ts`/`facetConfig.ts`.
- [ ] `10-range-facet-min-max-oracle.mjs` exists, runs, and prints true min/max (+ which product) for all 4 specs.
Done signal: paste the oracle's terminal output.

## Phase 2 — Fix the binding
Scope: whichever of `getFilterFacets.ts` / `facetConfig.ts` Phase 1 identified as the actual source of the wrong values. Do not touch the oracle script from Phase 1 except to re-run it.
Steps:
1. Make all 4 sliders' bounds derive from the same live-computed path already used for the specs that work correctly (no separate hardcoded path for any of the 4).
2. Re-run Phase 1's oracle; re-check the live `/products/headphones` sidebar's displayed min/max for all 4 sliders against it.
Do not touch: any facet unrelated to these 4, any other filter/sort logic, any Sanity document.
Acceptance criteria:
- [ ] All 4 sliders' displayed min/max match the oracle's output exactly (1:1).
- [ ] No other facet's displayed range changed.
Done signal: side-by-side of oracle output vs. the 4 sliders' displayed bounds, showing an exact match.
