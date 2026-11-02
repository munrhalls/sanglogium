# Filters, sorting, pagination — design

Scope: the filter, sort and pagination flow, from the CMS to the shopper's screen. Chunks are built and proven one at a time, in the order below. Each chunk's input is the previous chunk's output. Paths are relative to `features/product-filtering/` unless they start with `studio/`, `features/products/` or `tests/`.

## Progress

Next: chunk 2 step 2 (the code that applies the curated texts) is not built; step 1, the labels document, is. Chunks 6 to 8 need a way to render components in a test; none is merged.

| # | chunk | side | proof |
|---|---|---|---|
| 0 | CMS data -> what filtering and sorting read | upstream | passed 2026-10-31 |
| 1 | picklist (CMS) + products data -> controls and options | backend | steps 1 to 3 passed 2026-10-31; steps 4 to 7 checked on live data only |
| 2 | controls and options + curated texts (CMS) -> labelled controls and options | backend | none |
| 3 | URL + labelled controls -> filter state | backend | none (the 2026-10-28 proof was deleted 2026-10-31) |
| 4 | labelled controls + filter state -> counts and bounds | backend | none (the 2026-10-28 proof was deleted 2026-10-31) |
| 5 | filter state + labelled controls -> the page's products and their total | backend | none (the 2026-10-28 proof was deleted 2026-10-31) |
| 6 | counts and bounds -> sidebar and chips on screen | frontend | none |
| 7 | sort and page state -> sort bar and page links on screen | frontend | none |
| 8 | user input -> URL | frontend | none |


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

## 0. CMS data -> what filtering and sorting read

Four questions were put to the live data, in this order. One script answered all four. Questions b and d are answered by `tests/product-filtering/picklistLabelsRealData.test.ts` (chunk 1 below), and one kind and one spelling per field by `tests/products`. Two runs on unchanged data print the same text.

| # | question (the owner's words, 2026-10-29) | answer and what proves it |
|---|---|---|
| a | "is the CMS data fully consistent relative to filtering/sorting needs? yes/no. If no or yes is unproven/brittle - solve that first. Regardless of answer - achieve simplest/minimalest (physics thinking) proof of CMS consistency vs filter/sort needs first." | No. Each rule of the script is a thing the filter or sort code reads: name, price, in stock, brand, sort numbers, the product's slice (the 1000-product fetch cap and one kind per field were cut on 2026-10-31: the cap is a limit of the code, and one kind per field is `tests/products` rule 1). First run broke three: stored filter price in dollars on 24 products, three audio fields mixing kinds (11 products), 12 groups of values differing only by case. Fixed in code: one price source (`price_data.unit_amount`). Fixed in the data on 2026-10-29 (655 products, applied by the owner): the stored filter price removed, the three audio fields set to one kind, the two GUSTARD DACs set to `["mqa"]` (their spec sheets list MQA and no Hi-Res Audio logo). The proof now prints 0 broken, the same on two runs |
| b | "is picklist, every field of it, proven and grounded in cms data? yes/no" | No at first: `deviceType` and `accessoryType` sat in the wrong slice's schema file, so the picklist could not offer two of its own 36 picks. Moved to their own slices (the data decides: 216 of 221 audio-electronics products hold the first, 258 of 259 accessories the second). Now yes: every pick is offered by the schema, held by products, and draws a control |
| c | "Is the step from picklist to derived controls and options proven and grounded in CMS data - every field of it? Purely the derive step: stored values -> control kind, options, bounds." | Yes. For each of the 52 offered fields (72 when first run), the expected control, options and bounds are read straight from the raw products and compared with what chunk 1 derives (every class is hit: checkbox from text and from lists, on/off, range from numbers and from lists, none because empty, none because mixed). Checked that it can fail: lowering a range's upper bound by one made 11 fields fail |
| d | "Is every field Studio offers actually able to produce a control on real data?" | No at first: 4 offered fields (`speedsSupported`, `furnitureType`, `cleaningProductType`, `formatCompatibility`) were held by no product, so they could never draw a control. Removed from the schema; nothing stored is lost, since no product held them. Now yes: the rule "every offered field is held by a product" printed 4 broken before and 0 after; since 2026-11-01 it is question 2 of `tests/product-filtering/picklistLabelsRealData.test.ts`. |

## 1. picklist (CMS) + products data -> controls and options

```
picklist (CMS) + products data -> controls and options

In steps:
1. the owner's signed closed list of product fields per slice, and the three together for all products -> the picklist's choices in Studio (brand, price and stock are the document's read-only always-on list)
2. owner's picks, in the owner's order (drag to reorder) -> filterPicklist document
3. filterPicklist + products data -> the picks and the products, read together
4. picks -> selected facets: one per pick, each with an id, a name and a group
5. products data -> inventory: per field, its kinds, distinct values and number span
6. selected facets + inventory -> a kind, options and bounds per facet
7. picks with no kind are dropped, and brand and in stock are added -> the facet set, what the sidebar can draw
```

| step | file |
|---|---|
| 1. Each slice's list offers the owner's signed closed list of fields (nested fields as `a.b`), each held by a product of the slice. The all-products list (the `/products` page) offers the three lists together, once each. Brand, price and stock are the document's read-only `alwaysOn` list: never a pick, offered to the sections lists as heading targets | `schema/pickableFields.ts`, `schema/filterPicklistType.ts`, `studio/schema.ts`, `studio/structure.ts` |
| 2. The owner fills the three slice lists and drags them into order; the all-products list starts empty (so `/products` has the always-on controls only) and the owner adds picks to it the same way. `alwaysOn` is set once by a data write | the document is data in the dataset, no file |
| Sorting lives in the same document, in its own Studio group "Sorting" next to "Filters": `sortAlwaysOn` (price and name, read-only, set once by a data write) and one list per scope (`sortHeadphones`, `sortAudioElectronics`, `sortAccessories`, `sortAllProducts`), the owner's sort picks in the owner's order. Each list offers only the signed fields that hold one plain number per product (a list or a text has no single value to order by); all products offers the three together. The lists start empty. A field may be a filter, a sort, both or neither. The shop does not read the sorting lists yet: chunk 7 still fixes the sort list in code | `schema/pickableFields.ts` (`SORTABLE`), `schema/filterPicklistType.ts` |
| Proof of steps 1 to 3, the picklist itself, redesigned and passed 2026-11-01 (one script with the proof of chunk 2, one snapshot of the live data): the stored picklist is valid (both always-on lists hold names; every stored pick is a name, offered for its list, once); every offered field, filter or sort, is held by a product of its scope and offered once; every always-on field is held by every product; every offered sort field is a plain number wherever a product holds it; every product is in a slice. Left out on purpose: what the Studio form shows (read-only lists, groups, sortable rows: a hand check; "starts empty" cannot matter, an initial value only applies when a document is created), a second copy of the offer lists (the offer is the code), and "one document" (readers use the fixed id) | `tests/product-filtering/picklistLabelsRealData.test.ts` |

## 2. controls and options + curated texts (CMS) -> labelled controls and options

```
controls and options + curated texts (CMS) -> labelled controls and options

In steps:
1. owner's curated texts -> the CMS (rows of field, optional value, text)
2. controls and options + curated texts -> names and option texts
```

| step | file |
|---|---|
| 1. The owner opens Filter labels in Studio: one section per scope, named in a heading: the three catalogue slices (headphones, audio electronics, accessories) and all products (the `/products` page); in each, a Filters part (the scope's controls, collapsed; opening one lists the options that scope holds) and a Sorting part (one name line per sort: the always-on sorts, then the owner's sort picks). A line shows the stored value and an input whose grey text is the automatic wording. Typing stores one row (a field, an optional value, none for the control's name, and the text) in the CMS, so no deploy is needed; emptying the line removes the row; no row means the automatic wording. A row has no scope, so a control or option that several scopes share is one row, shown with the same wording in each section. A sort is named by its field's control-name row, the same row the filter control of that field uses, so a field that is both a control and a sort shows one name in both parts. The page is drawn from the shop's own read (`GET /api/filter-labels-map`, cached like the facet read), so it lists what the shop will show. The owner never types a field or a value, so Studio has no row rule; a row that names nothing (a product's value changed since) is ignored by the labels map | `schema/filterLabelsType.ts`, `schema/FilterLabelsInput.tsx`, `schema/labelRows.ts`, `app/api/filter-labels-map/route.ts`, `studio/schema.ts`, `studio/structure.ts` |
| 2. The raw map holds, per slice and control (the always-on fields plus the slice's picks), the sorted distinct values the slice's products hold; a missing, null or blank value is never an option. The labels map gives each control and each option one text: the curated one when a non-empty row names it, else the automatic one (a field path as words; true/false as Yes/No; a number as it is; text with capitals as it is, other text as readable words). Both are computed from the products, the picklist and the rows; only the rows are stored. A slice is the products at its catalogue root or below; the all-products scope is the products of the three slices together, with the picks the owner chose for `/products` (none until the owner adds some). The page of step 1 draws one section per scope: that scope's controls, each with the options that scope holds, sorted, with the automatic texts. A label key has no scope, so a control or option that several scopes share is one row, shown in each section. All products is a scope of its own because the owner may pick there a field that no slice picks, and that field needs a section to be labelled in. Sort names are computed apart from the labels map: `core/rules/sortFields.ts` lists each scope's sort fields (the always-on sorts, then the scope's sort picks, each once) and `core/rules/buildSortLabels.ts` names them with the labels map's own rule on fields that have no options (a sort has no options of its own); the filter rules do not change. | `core/rules/buildRawMap.ts`, `core/rules/buildLabelsMap.ts`, `core/rules/sliceByCatalogue.ts`, `core/rules/listControlLabels.ts`, `core/types/optionMaps.ts`, `queries/getControlLabels.ts`, `adapters/sanity/optionMapData.ts`, `adapters/sanity/fetchOptionMapData.ts`, `core/definitions/picklist.ts`, `core/rules/sortFields.ts`, `core/rules/buildSortLabels.ts` |
| Proof of steps 1 and 2, the same script: the curated rows are unique on field and value (a row that names nothing is not a failure); the raw map equals a second walk over the products, with the controls in the owner's order and each value once, sorted; the labels map names every control and option of the raw map once and every sort once, each with a non-empty text; the Studio list is exactly the maps (per scope its controls, options and sorts); and fixtures in the real format with alien content give the hand-written raw map, labels, sort names, slicing, read path (a missing document, absent and empty lists, a pick only on all products, a product in no slice) and row writer. Before judging it runs each of its nine data questions once on a planted break, so it cannot pass by being vacuous. Not proven by script: the page's rendering in Studio | `tests/product-filtering/picklistLabelsRealData.test.ts` |

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
| Temporary: brand values are checked later, against the counted brands, so this chunk is finished after chunk 4 | `features/products/queries/getListingPage.ts` |
| Proof: not written. The 2026-10-28 proof was deleted on 2026-10-31, because its input format is chunk 2's to change; it is written again when this chunk is rebuilt | not written |

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
| Proof: not written. The 2026-10-28 proof was deleted on 2026-10-31, because its input format is chunk 2's to change; it is written again when this chunk is rebuilt | not written |

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
| 2. The total counts the products that pass | `features/products/adapters/sanity/getProductsByVfsKeys.ts` |
| 3. A page that is not a whole number from 1 up is page 1; a page past the end becomes the last page; the window is cut into chunks | `features/products/core/rules/pageWindow.ts`, `features/products/queries/getListingPage.ts`, `features/products/adapters/sanity/getProductsByVfsKeys.ts` |
| Proof: not written. The 2026-10-28 proof was deleted on 2026-10-31, because its input format is chunk 2's to change; it is written again when this chunk is rebuilt | not written |

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

## 7. sort and page state -> sort bar and page links on screen

```
sort and page state -> sort bar and page links on screen

In steps:
1. the fixed sort list -> sort choices
2. total + page -> page links
```

| step | file |
|---|---|
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
| Proof: not written. Given a control and an input, the URL string equals the expected one | not written |
