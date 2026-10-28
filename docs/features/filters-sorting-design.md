# Filters, sorting, pagination — design

Scope: the whole filter, sort and pagination flow, from the CMS to the shopper's screen, as chunks built and proven one at a time, foundation up. Paths are relative to `features/product-filtering/` unless they start with `studio/` or `features/products/`.

## Flow

```
owner's act in Studio
-> [V0] picklist document + product documents, in the CMS
-> [V1] controls and options, on the server
-> [V2] labelled controls and options
-> [V3] filter state: the URL decoded against V2
-> [V4] counts and product list
-> [V5] sidebar, chips, sort bar on screen
-> user input -> URL -> back into V3
```

Backend: V0 to V4. It ends in two plain values, `CatalogueFacets` and the product query. Frontend: V4 to the screen, and the URL write.

## Progress

Order is forced: each chunk's entry is the previous chunk's exit. A chunk is done when its proof passes. Next: prove 1.

| # | chunk | files | code | proof |
|---|---|---|---|---|
| 1 | picklist (CMS) + products data -> controls and options | below | live | none |
| 2 | controls and options + curated texts (CMS) -> labelled controls and options | `core/rules/applyOptionLabels.ts`, `core/definitions/optionLabelOverrides.ts` | live with a code table; the move to the CMS is decided, not built | none |
| 3 | labelled controls + URL -> filter state | `url/filterSortParams.ts`, `core/rules/sanitizeFilterState.ts` | exists, not read | none |
| 4 | labelled controls + filter state -> counts and product list | `core/rules/facetCounts.ts`, `adapters/sanity/buildProductQuery.ts`, `features/products/adapters/sanity/getProductsByVfsKeys.ts` | exists, not read | none |
| 5 | counts + product list -> sidebar, chips, sort bar | `ui/FilterSidebar.tsx`, `ui/FilterControls.tsx`, `ui/ActiveFilterChips.tsx`, `ui/SortBar.tsx` | exists, not read | none |
| 6 | user input -> URL | `state/useFilterParam.ts` | exists, not read | none |

Not placed yet: sort, pagination, search, the product grid. Each is checked against the chunks above before its chunk is written.

## Proof rule

- A proof runs one chunk alone on a small fake input in the real format with alien content.
- The expected output is written by hand, not by the code.
- The input's real format is checked once against the real CMS.
- A chunk's proof input is the previous chunk's expected output, written once.
- Pixels are judged by an eye once.
- Nothing else counts as proof: no click-through, no mocks, no unit test per function, no whole-page snapshots.

## 1. picklist (CMS) + products data -> controls and options

```
picklist (CMS) + products data -> controls and options

In steps:
1. product filterAttributes fields, minus brand, in stock, price -> the picklist's choices in Studio
2. owner's picks -> filterPicklist document
3. filterPicklist + products data -> facet set: which controls exist
4. facet set + products data -> kind, options, bounds per control
```

| step | file |
|---|---|
| 1. The choices are the leaf paths of `filterAttributes` (nested fields as `a.b`), minus brand, in stock, price | `schema/filterPicklistType.ts`, `studio/schema.ts`, `studio/structure.ts`, `features/products/schema/productFilterAttributes/index.ts` |
| 2. The owner fills three lists, one per slice | the document is data in the dataset, no file |
| 3. The picklist is read with the products (cached 300 s; a failed read means no picks). Facet set = brand, in stock, plus the picks. A picked field's id and URL key come from its name; its group is "More filters". A control's name comes from its field name | `adapters/sanity/fetchPicklist.ts`, `queries/getFilterFacets.ts`, `core/rules/buildFacetSet.ts`, `core/rules/facetKey.ts` |
| 4. Kind, options and bounds come from the data; no values, no control. An option's text comes from its value (words split, acronyms upper-cased) | `core/rules/fieldInventory.ts`, `core/rules/deriveControl.ts`, `core/rules/deriveOptions.ts`, `core/rules/humanizeFacetValue.ts`, `core/rules/projectFacets.ts` |
| Temporary: brand, in stock, the two groups and `wearingStyle` stay until later chunks own them | `core/definitions/awaitingLaterChunks.ts` |
| Proof (not written): a fake picklist and four fake products in real format, alien content; the expected controls and options written by hand | not written |
