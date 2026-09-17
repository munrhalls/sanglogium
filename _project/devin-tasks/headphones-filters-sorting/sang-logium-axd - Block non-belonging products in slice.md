# sang-logium-axd — [Headphones] Block non-belonging products in slice

Parent: sang-logium-0bi. Depends on: none. Blocks: sang-logium-0bi.1, 0bi.2, 0bi.7.

Beads goal (unchanged, do not restate/duplicate elsewhere — this file is the plan+phases only):
When I visit the headphones catalogue page, then I cannot find any product that does not belong to the headphones catalogue slice (e.g. finding a DAC product would be a clear violation).

## Verified ground truth (checked directly and freshly this session — not from stored files or closed-issue claims)
- The live page (`app/(store)/products/[...slug]/page.tsx`, `export const dynamic = 'force-dynamic'`) gets its product set from `sanity-cms/lib/products/getProductsByVfsKeys.ts` — a live Sanity query scoped by `catalogueLocationKeys`. It does NOT read `data/headphones/**/*.md` — those are sourcing-pipeline research files, a separate system.
- Fresh run just now: `node --env-file=.env.local lib/filter-sort/__tests__/09-vfs-vs-category-scope-diff.mjs` → 186 VFS-scoped products, 186 category-tagged products, **0 mismatches**.
- Fresh run just now: `node --env-file=.env.local lib/filter-sort/__tests__/08-category-membership-oracle.mjs` → 186 checked, **0 flagged**.
- Current live data has zero known violations. This task is NOT "find and remove a violation" — it is closing the gap between "currently passes" and "structurally cannot happen," which is what the acceptance test actually demands.
- Concrete gap found by direct code read: `08-category-membership-oracle.mjs`'s `NON_HEADPHONE_KEYWORDS` list has no entry for "dac" — the exact product type the acceptance test names. Name-keyword matching (signal B) is inherently guessable/incomplete; signals A (`deviceType` leakage) and C (missing headphone-defining facets) are schema-based and structurally stronger.
- OUT OF SCOPE, do not touch: `data/headphones/sennheiser/sennheiser-ambeo-max-soundbar.md` is a stale, orphaned sourcing-pipeline file for a product already excluded from the live query (confirmed above). Cleanup deferred by explicit instruction — a separate task, not this one.

## Phase 1 — Investigate the schema's structural gating fields (read-only)
Scope: read-only. No code changes.
Files to read: the Sanity schema file defining `productType`/`filterAttributes.deviceType` (script 08's header comment says this gating is "documented in productType.ts" — locate it under `sanity-cms/`), and `lib/filter-sort/__tests__/08-category-membership-oracle.mjs`.
Steps:
1. Find the schema file and list every field that structurally gates a product to a non-headphones category (`deviceType` is one — confirm its exact enum/values; check for any sibling gating field).
2. From that schema, produce a grounded list of every non-headphones category/device keyword it actually defines — this replaces guessing at keywords.
Acceptance criteria:
- [ ] A written list of every structural gating field + its possible values, sourced from the actual schema file (cite the file path).
Done signal: post that list as this phase's output. No code touched.

## Phase 2 — Strengthen the oracle
Scope: `lib/filter-sort/__tests__/08-category-membership-oracle.mjs` only.
Do not touch: `09-vfs-vs-category-scope-diff.mjs`, anything under `data/`, any Sanity document, `buildProductQuery.ts`, any FilterSidebar/filter component.
Steps:
1. Extend `NON_HEADPHONE_KEYWORDS` using Phase 1's grounded list (must include "dac").
2. If Phase 1 found structural gating fields beyond `deviceType`, add each as its own signal, following the existing `reasons[]`-push pattern (do not change the shape/output format of the script).
3. Leave signal C (wearingStyle/driverType/acousticDesign) untouched — already reviewed, not in question.
Acceptance criteria:
- [ ] `node --env-file=.env.local lib/filter-sort/__tests__/08-category-membership-oracle.mjs` still runs clean against current data (0 flagged, no regression) — or, if it now flags something real, that is reported, not hidden.
- [ ] The script's keyword/signal list demonstrably includes "dac" and everything Phase 1 found.
Done signal: paste the full terminal output of the re-run script.
