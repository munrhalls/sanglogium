# Filters, sorting, pagination — design

Paths are relative to `features/product-filtering/` unless they start with `studio/` or `features/products/`.

## Picklist -> sidebar

```
picklist (CMS) + products data -> filter controls in the sidebar

In steps:
1. product filterAttributes fields, minus brand, in stock, price -> the picklist's choices in Studio
2. owner's picks -> filterPicklist document
3. filterPicklist + products data -> facet set with controls, options, bounds
4. controls + options -> labelled controls and options (derived from name and value; curated where listed)
5. facet set + URL -> decoded filter state
6. labelled controls -> sidebar
```

| step | file |
|---|---|
| 1. The choices are the leaf paths of `filterAttributes` (nested fields as `a.b`), minus brand, in stock, price | `schema/filterPicklistType.ts`, `studio/schema.ts`, `studio/structure.ts`, `features/products/schema/productFilterAttributes/index.ts` |
| 2. The owner fills three lists, one per slice | the document is data in the dataset, no file |
| 3. The picklist is read with the products (cached 300 s; a failed read means no picks). Facet set = brand, in stock, plus the picks. A picked field's id and URL key come from its name; its group is "More filters". Control, options and bounds come from the data; no values, no control | `adapters/sanity/fetchPicklist.ts`, `queries/getFilterFacets.ts`, `core/rules/buildFacetSet.ts`, `core/rules/facetKey.ts`, `core/rules/fieldInventory.ts`, `core/rules/deriveControl.ts`, `core/rules/projectFacets.ts` |
| 4. A control's name comes from its field name; an option's text from its value (words split, acronyms upper-cased). A curated text replaces an option's text where the table lists one | `core/rules/buildFacetSet.ts`, `core/rules/deriveOptions.ts`, `core/rules/humanizeFacetValue.ts`, `core/rules/applyOptionLabels.ts`, `core/definitions/optionLabelOverrides.ts` |
| 5. The URL is decoded against the facet set; an unknown key is ignored | `url/filterSortParams.ts` |
| 6. The sidebar draws the groups | `ui/FilterSidebar.tsx` |
| Temporary: brand, in stock, the two groups and `wearingStyle` stay until later chunks own them | `core/definitions/awaitingLaterChunks.ts` |
| Decided, not built: the curated texts leave the code table and live in the CMS, so the owner edits them without a deploy | `core/definitions/optionLabelOverrides.ts` goes |
