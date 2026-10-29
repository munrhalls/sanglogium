# Filters, sorting, pagination — design

Scope: the filter, sort and pagination flow, from the CMS to the shopper's screen. Chunks are built and proven one at a time, in the order below. Each chunk's input is the previous chunk's output. Paths are relative to `features/product-filtering/` unless they start with `studio/`, `features/products/` or `tests/`.

## Progress

Next: apply the data migration (see 0). Chunk 2 waits for the owner to rule how the curated texts are stored. Chunks 6 to 8 need a way to render components in a test; none is merged.

| # | chunk | side | proof |
|---|---|---|---|
| 1 | picklist (CMS) + products data -> controls and options | backend | passed 2026-10-28 |
| 2 | controls and options + curated texts (CMS) -> labelled controls and options | backend | none |
| 3 | URL + labelled controls -> filter state | backend | passed 2026-10-28 (brand names are checked in chunk 4) |
| 4 | labelled controls + filter state -> counts and bounds | backend | passed 2026-10-28 |
| 5 | filter state + labelled controls -> the page's products and their total | backend | passed 2026-10-28 |
| 6 | counts and bounds -> sidebar and chips on screen | frontend | none |
| 7 | sort and page state -> sort bar and page links on screen | frontend | none |
| 8 | user input -> URL | frontend | none |

The backend starts at the CMS documents and ends at two values: `CatalogueFacets` (chunk 4) and the page of products (chunk 5). The frontend starts at those two values.

Not in this document yet: search results (they reuse chunks 1–4 through the filtering door) and the product grid.

## Step rule

- A step turns one input into one output. It is too big when it does another step's work, not when it holds many facts.
- A fact is written in one step only.

## Proof rule

- A proof runs one chunk alone on a small fake input in the real format, with alien content.
- Its input classes come from the schema's type table and the live data, not from guessing. The proof names them.
- It calls the code the page runs, never a copy.
- The expected output is written by hand, not by the code.
- A proof must be able to fail: break the code on purpose, the proof must fail, then restore it.
- A chunk's proof input is the previous chunk's expected output.
- Pixels are judged by an eye once.
- Nothing else counts: no click-through, no mocks, no test per function.

## 1. picklist (CMS) + products data -> controls and options

```
picklist (CMS) + products data -> controls and options

In steps:
1. product filterAttributes fields (shared plus the slice's own), minus brand, in stock, price and lists of objects -> the picklist's choices in Studio
2. owner's picks -> filterPicklist document
3. filterPicklist + products data -> the picks and the products, read together
4. picks -> selected facets: one per pick, each with an id, a name and a group
5. products data -> inventory: per field, its kinds, distinct values and number span
6. selected facets + inventory -> a kind, options and bounds per facet
7. picks with no kind are dropped, and brand and in stock are added -> the facet set, what the sidebar can draw
```

| step | file |
|---|---|
| 1. Each slice's list offers the leaf paths of the shared fields and of that slice's own fields (nested fields as `a.b`), minus brand, in stock, price and lists of objects | `schema/filterPicklistType.ts`, `studio/schema.ts`, `studio/structure.ts`, `schema/filterFieldPaths.ts`, `features/products/schema/productFilterAttributes/index.ts` |
| 2. The owner fills three lists, one per slice | the document is data in the dataset, no file |
| 3. The picklist is read with the products (cached 300 s; a failed read means no picks) | `adapters/sanity/fetchPicklist.ts`, `queries/getFilterFacets.ts` |
| 4. Selected facets are one per distinct pick (brand, in stock and price picks are dropped). A pick's id and URL key come from its name, its name is the field name split into capitalised words, its group is "More filters" | `core/rules/buildFacetSet.ts` (`selectionFor`, `humanizeAttribute`), `core/rules/facetKey.ts` |
| 5. For each field path the inventory holds the kinds stored (text, number, true/false, list, object), the distinct text and true/false values (sorted), and the smallest and largest number. A list counts as its items | `core/rules/fieldInventory.ts` |
| 6. The values decide the control: only true/false, an on/off control; only numbers, a range; only text, a checkbox with one option per value; anything else, none. An option's text is its value as readable words (the rule is in the header of `humanizeFacetValue.ts`) | `core/rules/projectFacets.ts`, `core/rules/deriveControl.ts`, `core/rules/deriveOptions.ts`, `core/rules/humanizeFacetValue.ts` |
| 7. A pick with no kind is not drawn. Brand and in stock are fixed in code with their control, because no stored field decides them: in stock is computed from the stock fields; brand has no option list, its names are counted from the products | `core/rules/buildFacetSet.ts`, `core/definitions/awaitingLaterChunks.ts` |
| Temporary: brand, in stock, the two groups and `wearingStyle` stay until later chunks own them | `core/definitions/awaitingLaterChunks.ts` |
| Proof, passed 2026-10-28: four fake products in real format with alien content, and the expected facet set written by hand; the slice's own picks used and a failed picklist read giving no picks; the field list of step 1 on a fake schema. The classes in the live data are listed by the real-data check. Not proven here: the brand names and `wearingStyle`, which are temporary | `tests/product-filtering/backend/picklistAndProductsToControlsAndOptions.test.ts`, `tests/product-filtering/backend/picklistPerSlice.test.ts`, `tests/product-filtering/backend/filterFieldPaths.test.ts`, `tests/product-filtering/pickablePathsRealData.test.ts` |

## 2. controls and options + curated texts (CMS) -> labelled controls and options

```
controls and options + curated texts (CMS) -> labelled controls and options

In steps:
1. owner's curated texts -> the CMS (shape not decided)
2. controls and options + curated texts -> names and option texts
```

| step | file |
|---|---|
| 1. The owner enters a text for a control name or an option. It lives in the CMS, so no deploy is needed | not built |
| 2. A curated text wins; without one, a control's name comes from its field name and an option's text from its value. It attaches inside chunk 1's code: option texts in `projectFacets.ts` (chunk 1 step 6) via `applyOptionLabels`, the control's name in `buildFacetSet.ts` (chunk 1 step 4). With no curated text both change nothing, so chunk 1's expected output stays true | `core/rules/applyOptionLabels.ts`, `core/definitions/optionLabelOverrides.ts` (this table in code goes when step 1 is built) |
| Proof: not written. Classes: text curated or not, for a control name and for an option. Source: the curated list | not written |

## 3. URL + labelled controls -> filter state

```
URL + labelled controls -> filter state

In steps:
1. controls -> one URL key per control
2. URL + keys -> raw state
3. raw state + controls -> clean state
```

| step | file |
|---|---|
| 1. A checkbox is a list, an on/off control is a flag, a range is `<id>Min` and `<id>Max`. Fixed keys: sort, minPrice, maxPrice, inStock, brand | `url/filterSortParams.ts` |
| 2. An unknown key is ignored, a bad sort falls back to the default, a price that is not a whole number is none | `url/filterSortParams.ts` |
| 3. A checkbox value that matches no option is dropped | `core/rules/sanitizeFilterState.ts`, `queries/getFilterFacets.ts` |
| Temporary: brand values are checked later, against the counted brands, so this chunk is finished after chunk 4 | `features/products/queries/getListingPage.ts` |
| Proof, passed 2026-10-28: a facet set in chunk 1's output format with one control of each kind (a checkbox with options, a checkbox without, a true/false control, a range, a checkbox whose kept option has capitals, a query-only one); three URLs: empty, valid, junk (bad sort, price that is not a whole number, a value that matches no option, an unknown key); the expected state written by hand | `tests/product-filtering/backend/urlToFilterState.test.ts` |

## 4. labelled controls + filter state -> counts and bounds

```
labelled controls + filter state -> counts and bounds

In steps:
1. each option and flag -> how many products it gives, with the other choices kept
2. each range -> the full span over the route's products
3. price and brand -> span and names
```

| step | file |
|---|---|
| 1. A product counts for an option when it matches every other choice, so the shopper sees what the option would give | `core/rules/facetCounts.ts` |
| 2. A range's bounds are never narrowed by the current choices, so its handle can always move back | `core/rules/facetCounts.ts` |
| 3. The price span, and brand names from the products' brands | `core/rules/facetCounts.ts` |
| The result is `CatalogueFacets`, returned by | `queries/getFilterFacets.ts` |
| Proof, passed 2026-10-28: chunk 3's facet set and four fake products (stock by its fields, by a stored flag, a brand with no brand document, a range, a checkbox with capitals); three states in chunk 3's output format: no choice, one choice, several choices across a checkbox list, a true/false control, a range and the price; the expected counts, bounds and brand names written by hand | `tests/product-filtering/backend/countsAndBounds.test.ts` |

## 5. filter state + labelled controls -> the page's products and their total

```
filter state + labelled controls -> the page's products and their total

In steps:
1. state + controls -> where and order clauses
2. clauses -> total count
3. page number -> the window of products
```

| step | file |
|---|---|
| 1. Price, in stock and one test per selected control narrow the products; the sort picks the order | `adapters/sanity/buildProductQuery.ts` |
| 2. The total counts the products that pass | `features/products/adapters/sanity/getProductsByVfsKeys.ts` |
| 3. A page that is not a whole number from 1 up is page 1; a page past the end becomes the last page; the window is cut into chunks | `features/products/core/rules/pageWindow.ts`, `features/products/queries/getListingPage.ts`, `features/products/adapters/sanity/getProductsByVfsKeys.ts` |
| Proof, passed 2026-10-28: five fake products in the real format (a text stored as a list in one product, a stock flag against the stock fields, a list with a capital) and a sixth outside the route; the real count and chunk functions run with the fetch swapped for the in-memory GROQ engine `groq-js` (installed with `sanity`); chunk 3's facet set and states; every sort value, every control kind alone, several choices and an unknown key, each with its expected ids and total written by hand; a window of the ordered products; the page rule on a page before, inside, past the end and not a whole number | `tests/product-filtering/backend/stateToProducts.test.ts` |

## 6. counts and bounds -> sidebar and chips on screen

```
counts and bounds -> sidebar and chips on screen

In steps:
1. groups -> headings, empty groups hidden
2. controls -> widgets with counts
3. active choices -> chips
```

| step | file |
|---|---|
| 1. Each group is drawn under its heading | `ui/FilterSidebar.tsx`, `ui/MobileFilterSheet.tsx` |
| 2. Checkbox list with counts (a zero count is greyed), on/off toggle, range slider over the full span | `ui/FilterControls.tsx`, `ui/FilterSection.tsx`, `ui/Checkbox.tsx`, `ui/DualRangeSlider.tsx`, `ui/ProgressiveFilterOptionList.tsx`, `core/rules/priceBounds.ts` (the span as slider bounds) |
| 3. Each active choice also shows as a chip | `ui/ActiveFilterChips.tsx` |
| Proof: not written. Render from a fixture `CatalogueFacets`, compare the text, look once. Classes: each control kind | not written |

## 7. sort and page state -> sort bar and page links on screen

```
sort and page state -> sort bar and page links on screen

In steps:
1. the fixed sort list -> sort choices
2. total + page -> page links
```

| step | file |
|---|---|
| 1. The sort list is fixed in code, because the data cannot provide it | `core/definitions/sortOptions.ts`, `ui/SortBar.tsx`, `ui/SortDropdown.tsx` |
| 2. Page links come from the total and the page | `features/products/ui/listing/Pagination.tsx` |
| Proof: not written. Code not yet read | not written |

## 8. user input -> URL

```
user input -> URL

In steps:
1. a control change -> its URL key
2. any filter or sort change -> page back to 1
3. "Clear all" -> every filter key removed
```

| step | file |
|---|---|
| 1. Each control writes only its own key | `state/useFilterParam.ts` |
| 2. A filter or sort change removes the page key | `state/useFilterParam.ts` |
| 3. Clear all removes every filter key | `state/useFilterParam.ts` |
| Proof: not written. Given a control and an input, the URL string equals the expected one | not written |
