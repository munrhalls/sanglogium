# Search UX — sanglogium implementation audit

Tracked by `sang-logium-d5m.2` — [Search] Audit: current search vs. gathered standards  
Part of `sang-logium-d5m` — EPIC Search UX

## Method

- Live app at `http://localhost:3000` (dev server running on :3000).
- One batched Playwright session across three breakpoints: mobile (390×844), tablet (820×1180), desktop (1280×720).
- Each query was entered as a real `?q=` URL and the result-page DOM was read.
- Raw evidence JSON: `/tmp/sanglogium-search-ux/sanglogium-audit-1789452215147.json`
- Intelligence source: `docs/search-ux/intelligence.md` (Baymard 8 query types + NN/g 6 findings).

The ratings below are grounded directly in those two standards. `Pass` means the behaviour matches the standard for the query; `Partial` means it works for a narrow case or returns plausible but sub-optimal results; `Fail` means it does not meet the standard.

## Snapshot — query type vs. standard

| Query type | Test query | Result count | First result | vs. Baymard/NN/g standard | Rating |
|---|---|---:|---|---|---|
| Exact | `Sennheiser HD 800S` | 3 | EPZ-HD800-ELVL Replacement Ear Pads for Sennheiser HD800 and HD800S Elite Velour | Exact product should be #1; accessories should not outrank the product itself. | Partial |
| Exact/typo | `hd800s` | 4 | EPZ-HD800-ELVL Replacement Ear Pads for Sennheiser HD800 and HD800S Elite Velour | Baymard: must handle phonetic misspellings, alternate names and concatenated model numbers. The actual HD 800S is not returned. | Fail |
| Product type | `headphones` | 368 | Ear Pads for Audeze LCD Series Headphones | Baymard: auto-redirect to category on 1:1 match, return filter/sort on results. No redirect, no filter, accessories dominate. | Partial |
| Feature | `closed-back headphones` | 27 | Celestee Headphones | Baymard: searched attributes should auto-apply as filters. No filter auto-applied; mixed open-back and earpads in list. | Partial |
| Use case | `headphones for running` | 13 | DM-01 Desktop DAC/Amp | Baymard: use-case queries should tag products by occasion/activity. Returns DACs and amps, not running headphones. | Fail |
| Abbreviation/symbol | `IEM` | 111 | Reference In-Ear Headphones | Baymard: must map abbreviations to full terms. Correctly returns in-ear products. | Pass |
| Compatibility | `headphones for iPhone 15` | 2 | iFi GO bar Kensei | Baymard: must show compatibility details/suggest accessories. Returns two DACs, no headphone, no compatibility filter. | Fail |
| Symptom | `headphones with more bass` | 40 | Replacement Earpads for Focal Headphones | Baymard: symptom queries should return relevant product types and link buying guides. Keyword-only, no guide. | Partial |
| Non-product | `return policy` | 0 | — | Baymard: search should surface policies/FAQs. Returns empty product search with category links. | Fail |

Counts and product order were identical across mobile, tablet and desktop viewports. The only UI difference was how the search box is exposed (desktop input in the header, mobile trigger in the bottom action bar that opens a full-screen overlay).

## Snapshot — NN/g standards

| NN/g finding | Observed behaviour | Rating |
|---|---|---|
| 1. First-query success is the make-or-break moment. | Exact model and abbreviation work. Feature, use-case, compatibility and symptom queries return keyword-driven, mixed or irrelevant results. First-query success for the high-failure audio-retail categories is low. | Partial |
| 2. Search must be a visible, simple, global box on every page. | Input visible on desktop/tablet; mobile has a persistent trigger and overlay. Placeholder is generic "Search products...". | Pass |
| 3. Search suggestions must lead to a good result. | Autocomplete for `HD 800` returns 6 relevant product suggestions with price and brand, plus a "View all results" link. No attribute/category suggestions; no-match state is a dead end. | Partial |
| 4. Filters/facets must be domain-appropriate and predictable. | Search results have no filter or facet UI. | Fail |
| 5. No-results pages need clear recovery paths. | Empty state says "No products found", keeps query in the page heading, offers four category links and a "Browse all products" link. No spelling correction, no related queries, no non-product results. | Partial |
| 6. On mobile, prefer batched filtering with an explicit Apply action. | No filters at all, so this pattern is not available. | Fail |

## Observed query details

### Exact
- `Sennheiser HD 800S` → 3 products: replacement ear pads first, then the actual HD 800S headphone, then Meze 109 PRO.
- `hd800s` → 4 products: all accessories, no HD 800S headphone.

### Product type
- `headphones` → 368 products. Top results: ear pads, cleaning kit, headphone stand, in-ear headphones. No auto-redirect to `/products/headphones` and no filter panel.

### Feature
- `closed-back headphones` → 27 products. Top results include legitimate closed-back models (Celestee, ATH-W2022, SJY Horizon, 99 Classics, HDB 630, ATH-M50x) but also unrelated open-back and earpad products. No "Closed-back" filter is pre-applied or offered.

### Use case
- `headphones for running` → 13 products, all desktop/portable DACs, amps and DAPs (DM-01, SA-2, Matrix TS-1, M21, PA10, BX2 Magnum, YUKI, GO Blu). No running/sports headphones.

### Abbreviation
- `IEM` → 111 products. Correctly surfaces in-ear monitors and related accessories, with IEMs in the first two positions.

### Compatibility
- `headphones for iPhone 15` → 2 products: both iFi GO bar Kensei portable DACs. No headphones, no iPhone 15 filter, no compatibility note.

### Symptom
- `headphones with more bass` → 40 products. Mostly ear pads, in-ear/open-back headphones and DACs. No "more bass" or sound-signature filter, no buying guide.

### Non-product
- `return policy` → 0 products. Page shows "We couldn’t find any products matching “return policy”", four category buttons (Headphones, IEMs, Audio Electronics, Accessories) and a "Browse all products" link. No policy page or FAQ is returned.

## Autocomplete

- Triggered at 2+ characters (`MIN_QUERY_LENGTH` in source).
- For `HD 800`, six product suggestions appear immediately, with the target product first.
- The dropdown contains only product suggestions (no brand, category or attribute suggestions) and a "View all results” link.
- If a typed query has no matching products, the overlay shows only "No products match ‘…’" with no recovery suggestions.

## Mobile/tablet notes

- **Mobile (390×844):** the search trigger is in the bottom action bar. Tapping it opens a full-screen dialog with an input and a zero-query panel. The autocomplete overlay works and lists the same six product suggestions.
- **Tablet (820×1180) / desktop (1280×720):** the search input is in the header. Results, counts and product order are identical to mobile.
- No breakpoint exposes filters on the search results page.

## Why the behaviour happens (source cross-check only)

`sanity-cms/lib/products/searchProducts.ts` implements `searchProductsFull` with a single GROQ `match` against `name`, `sku`, `brand.name`, `specifications[].value` and `overviewFields[].value`, using the term `query*` (trailing wildcard only). It:

- has no query-type detection;
- has no phonetic, synonym or space-normalisation handling;
- has no filter/facet auto-apply;
- has no non-product (policy/FAQ) index;
- has no result ranking that prioritises the product over accessories for exact model queries.

This matches the observed keyword-only, mixed-result behaviour.

## Overall rating

| Dimension | Rating |
|---|---|
| Exact model/SKU search | Partial |
| Product-type search | Partial |
| Feature/use-case/compatibility/symptom search | Fail / Partial |
| Abbreviation handling | Pass |
| Non-product search | Fail |
| Search discoverability | Pass |
| Autocomplete quality | Partial |
| Filter/facet support | Fail |
| No-results recovery | Partial |
| Mobile search UX | Partial |

Sanglogium’s current search is functional for exact-name and simple-abbreviation queries, but it falls short of the audio-retail standard on the query types that are most likely to fail industry-wide: feature, use case, compatibility, symptom and non-product. The absence of filters on the search results page means users cannot recover from a broad keyword result set, which is especially painful on mobile.

## Recommendations for the spec stage

1. **Exact-query ranking:** score full-name matches above accessory names and SKUs; return the exact product first.
2. **Query-type handling:** detect feature, use-case, compatibility and symptom terms and either auto-apply filters or show a relevant buying guide.
3. **Filter/facets on search results:** add domain-specific filters (form factor, driver type, open/closed back, impedance, connectivity, price, brand) with batch-apply on mobile.
4. **Suggestions:** add attribute, brand and category suggestions, and a useful empty-state with related queries.
5. **Non-product search:** index policy/FAQ/support content or surface a prominent support link for non-product queries.
