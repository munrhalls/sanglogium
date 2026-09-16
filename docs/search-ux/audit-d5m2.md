# Search UX — sanglogium implementation audit (d5m.2)

Tracked by `sang-logium-d5m.2` — [Search] Audit: current search vs. gathered standards
Part of `sang-logium-d5m` — EPIC Search UX

This is the functional d5m.2 audit deliverable. A later visual/perceptual redo is in `docs/search-ux/audit.md` (d5m.7), which also corrects the filter-scope framing.

## Method

- Live app at `http://localhost:3000` (already-running dev server on :3000; `npm run dev` was not started by this session).
- Batched Playwright sessions with headless Chromium from `playwright-core`.
- Viewports: mobile 390×844, tablet 820×1180, desktop 1280×720.
- The same 8 query types from `docs/search-ux/intelligence.md` were used.
- DOM text was captured via page text, locators and page URLs; no screenshots were taken.
- Raw captured evidence (24 breakpoint/query observations): `docs/search-ux/evidence/sanglogium-audit-d5m2-compact.json` (compact top-product view) and `/tmp/sanglogium-audit-d5m2-final.json` (full product lists, up to 24 per page).

Note: the shared dev server crashed several times during the batched session. Some desktop observations were loaded directly at `/search?q=...` after the form submit timed out or the browser page crashed; in every case the observed DOM/text is from the live app, not the source code.

## Functional snapshot

Counts and top products were identical across mobile, tablet and desktop except where the list is paginated.

| Query type | Test query | Result count | First product (live DOM) | Functional verdict vs. Baymard/NN/g |
|---|---|---:|---|---|
| Exact | `HD 800S` | 3 | Dekoni Audio EPZ-HD800-ELVL Replacement Ear Pads for Sennheiser HD800 and HD800S Elite Velour ($59.99) | **Partial**. The exact Sennheiser HD 800S appears, but an accessory outranks it. Baymard expects exact products to be first and accessories/cables to rank below. |
| Product type | `headphones` | 368 | Dekoni Audio Ear Pads for Audeze LCD Series Headphones ($17.49) | **Partial**. Returns many products, but the top results are ear pads, cleaning kits and stands. No 1:1 category redirect, no auto-applied category filter. |
| Feature | `closed-back headphones` | 27 | Focal Celestee Headphones ($999) | **Partial**. Returns real closed-back headphones, but the 27-result set also includes open-back models (e.g. SJY Zeph Open-Back Planar Magnetic Headphones) and ear pads, and no "Closed-back" filter is auto-applied. |
| Use case | `headphones for running` | 13 | Astell&Kern PA10 Headphone Amplifier ($499) on desktop; xDuoo DM-01 Desktop DAC/Amp ($279) on mobile/tablet | **Fail**. Returns desktop DACs, amps and streamers — no running/sport headphones. Baymard expects products to be tagged by occasion/activity and matching items to rank first. |
| Abbreviation/symbol | `IEM` | 111 | 64 Audio IEM Cleaning Tool 5-Pack ($14.99) on desktop; CrinEar Reference In-Ear Headphones ($349.99) on mobile/tablet | **Pass/Partial**. Correctly interprets the abbreviation and returns in-ear products, but the first result on desktop is an accessory, and there is no IEM category filter. |
| Compatibility | `headphones for iPhone 15` | 2 | iFi Audio GO bar Kensei Portable Hi-Res USB DAC and Preamp ($449) | **Fail**. Returns two DAC/preamps, no actual headphones and no compatibility note or adapter suggestion. |
| Symptom | `headphones with more bass` | 40 | 64 Audio U12t In-Ear Headphones ($1,999) on desktop; Dekoni Audio Replacement Earpads for Focal Headphones ($62.99) on mobile/tablet | **Partial**. Returns plausible bass-capable products, but the first mobile/tablet result is ear pads, the list mixes unrelated accessories, and there is no "more bass"/sound-signature filter or buying guide. |
| Non-product | `return policy` | 0 | — (empty state reads "No products found") | **Fail**. Baymard expects policies/FAQs to be surfaced; the site returns an empty product catalogue with only category links. |

## No-results and autocomplete observations

- **No-results state (non-product and zero-match queries):** `SearchEmpty.tsx` renders `No products found`, `We couldn't find any products matching "${query}"`, and four category links (Headphones, IEMs, Audio Electronics, Accessories) plus a `Browse all products` link. There is no spelling correction, no related query suggestion, and no policy/FAQ result.
- **Autocomplete:** triggered at 2+ characters (`MIN_QUERY_LENGTH = 2`). For `HD 800` it surfaces the target product first, plus five more product suggestions, each with brand and price, and a `View all results for ‘HD 800’ →` link. There are no category, brand or attribute suggestions. The no-match state is `No products match ‘…’` with no recovery links.

## Source-code cross-check (why the behaviour happens)

`sanity-cms/lib/products/searchProducts.ts` implements both `searchProductsAutocomplete` and `searchProductsFull` with a single GROQ `match` against `name`, `sku`, `brand.name`, `specifications[].value` and `overviewFields[].value`, using the term `query*` (trailing wildcard only). Key findings from reading the source *after* observation:

- There is no query-type/intent detection: every query is treated as a keyword search.
- There is no synonym/phonetic/space-normalisation beyond `deriveSpacedQuery`.
- There is no non-product (policy/FAQ) index.
- `scoreProduct` boosts full-name and starts-with matches, but because an accessory like the Dekoni ear pads contains `HD800 and HD800S` in its name it outranks the exact Sennheiser product.
- `SearchResults.tsx` simply displays `{totalCount} products` and `ProductGrid`; `SearchEmpty.tsx` only shows category links.
- The placeholder in `SearchField.tsx` is `Search headphones, IEMs, DACs...`, which is descriptive, but the desktop input is narrow and hidden on mobile behind `#mobile-search-trigger`.

This source cross-check matches the observed keyword-only, mixed-result behaviour.

## Grounded rating

Each dimension is scored 0–10 against the standard from `intelligence.md` and `verification-protocol.md`. The overall number is the mean.

| Dimension | Score | Justification |
|---|---:|---|
| Exact model/SKU search | 5 | Returns the target product but an accessory outranks it; no phonetic/concatenated handling observed. |
| Product type search | 4 | Returns results, but top items are accessories; no 1:1 category redirect or pre-applied filter. |
| Feature search | 5 | Many real matches, but no auto-filter and mixed irrelevant results. |
| Use case search | 2 | Returns DACs/amps instead of running/sport headphones; clear intent miss. |
| Abbreviation/symbol | 7 | Correctly maps `IEM` to in-ear products, but first result can be an accessory and no filter. |
| Compatibility search | 2 | Two DAC/preamps only; no headphones, no compatibility details. |
| Symptom search | 4 | Plausible products, but mixed accessories and no sound-signature filter/guide. |
| Non-product search | 2 | No policy/FAQ results; only empty product state. |
| Search discoverability | 7 | Box is visible on desktop, reachable via bottom trigger on mobile; narrow and hidden on mobile. |
| Autocomplete quality | 5 | Relevant product suggestions, no categories/attributes, no-match is a dead end. |
| Filter/facet support on `/search` | 2 | None on the search route. This is a known integration point with `sang-logium-3rv`; still, the current state scores low. |
| No-results recovery | 5 | Clear layout, query preserved, category links, but no spelling correction/related queries/non-product results. |
| Mobile/tablet/desktop consistency | 9 | Same counts and product ordering across breakpoints (within pagination). |

**Overall functional rating: 4.5/10.**

This is not a gut-feel number; it is the mean of the 13 scores above, each traced to a live query and a standard from the Intelligence findings.

## Scope note: filters are a `sang-logium-3rv` integration point

The current `/search` route does not use the `FilterSidebar`, `SortBar`, `ActiveFilterChips` or `buildProductQuery` helpers already present on `/products`. This is a missing integration with the in-progress filter/sort epic, not a search-engine-only defect. The low filter score above reflects the current user-visible state; the implementation fix belongs to the cross-epic integration.

## Recommendations for the spec stage (d5m.3)

1. **Exact-query ranking:** ensure the exact product outranks accessories by boosting name/SKU exact matches and penalising accessory names for exact model queries.
2. **Query-type detection:** detect feature, use-case, compatibility and symptom terms and either pre-apply filters (once 3rv lands) or show a guide.
3. **Filter integration:** wire the shared 3rv filter/sort components into `/search`.
4. **Suggestions:** add category/brand/attribute suggestions and a useful empty state.
5. **Non-product search:** index or hard-code policy/FAQ/support content for common queries.

## References

- `docs/search-ux/intelligence.md` — Baymard 8 query types and NN/g 6 findings
- `docs/search-ux/verification-protocol.md` — credibility rule
- `docs/search-ux/evidence/sanglogium-audit-d5m2-compact.json` — compact live evidence
- `docs/search-ux/audit.md` — d5m.7 visual/perceptual redo
- `sanity-cms/lib/products/searchProducts.ts`
- `app/(store)/search/SearchResults.tsx`
- `app/components/features/search/SearchEmpty.tsx`
- `app/components/layout/header/SearchField.tsx`
