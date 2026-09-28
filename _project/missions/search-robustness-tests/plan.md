# Mission: Search critical-journey robustness tests

Objective (bar, not task): search's real matching/pagination behavior is proven correct
against the live catalogue — professional 8+/10, no mocked data layer standing in for
reality. Functionality only, no UX/visual scope.

## Intelligence gathered

- Data layer: `sanity-cms/lib/products/searchProducts.ts` — `searchProductsAutocomplete`
  (autocomplete overlay, min 2 chars, top 6) and `searchProductsFull` (results page,
  GROQ `match` on name/sku/brand/specs/overview, JS-side relevance scoring, in-memory
  pagination clamped to the last valid page). Both swallow all errors internally and
  return an empty result — a real Sanity outage looks identical to "no products found."
- `lib/catalogue/detectSearchRedirect.ts` sends generic product-type/feature terms
  (e.g. "headphones", "closed-back") to a filtered category page instead of `/search`.
- **Gap found:** `searchProductsFull`'s `sort` parameter is accepted but never applied —
  every result is always ordered by the internal relevance score regardless of the
  caller's requested sort (e.g. price). Flagged to the human directly; not fixed or
  tested here since it's a distinct defect from matching robustness (separate milestone).
- **Gap found & closed:** `store/__tests__/unit/searchParams.spec.ts` imports
  `@/lib/catalogue/searchParams` and `@/lib/catalogue/filterParams` — neither file exists
  anywhere in the repo. `store/__tests__/unit/searchProducts.spec.ts` mocks `sanityFetch`
  and asserts GROQ query shapes (`order(score desc, ...)`, a 3-call pagination clamp)
  that don't match the real implementation (always `order(_id asc)`, single fetch,
  JS-side re-sort). Both are phantom/false-positive coverage — removed, replaced by
  `store/__tests__/integration/searchRobustness.spec.ts`, which calls the real functions
  against the live public Sanity CDN (no token needed, read-only) instead of mocking.

## Milestone

One milestone, one issue: `sang-logium-3kk` — Search: prove critical-journey matching
is professionally robust.
