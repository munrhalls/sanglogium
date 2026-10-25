# Filters, sorting, pagination — design

## Live (request time)

The flow the shopper's page runs now. The owner picks the filter fields in the CMS; the page reads the picklist together with the products, builds the facet set, decodes the URL against it and draws the sidebar.

**MAP** — execution flow step - file

| step | file |
|---|---|
| 1. the owner picks, in Studio, per slice (headphones, audio-electronics, accessories), the product fields that become filter controls; the offered fields are every `filterAttributes` field name of the product schema (nested ones as leaf paths) except brand, in stock and price, which stay fixed in code | `features/product-filtering/schema/filterPicklistType.ts` (listed in `studio/schema.ts`, opened from `studio/structure.ts`) |
| 2. read the picklist document and the slice's products together, both cached for 300 s, so a pick reaches the page within 5 minutes without a deploy; a missing document or a failed picklist read means no picked controls | `features/product-filtering/adapters/sanity/fetchPicklist.ts` and `features/product-filtering/adapters/sanity/fetchFacetProducts.ts` (cache in `features/product-filtering/adapters/sanity/catalogueCache.ts`), called from `features/product-filtering/queries/getFilterFacets.ts` |
| 3. the facet set is the fixed brand and in stock plus the picked fields; each facet's id, which is also its URL key, is a fixed function of the field name | `features/product-filtering/core/rules/buildFacetSet.ts`, `features/product-filtering/core/rules/facetKey.ts` |
| 4. label, group, unit and `showWhen` come from the code table when it has an entry, otherwise a humanized label in the group "More filters" | `features/product-filtering/core/definitions/facetSelector.ts` |
| 5. a field draws a control only if its products have values; kind, options and bounds come from product data only | `features/product-filtering/core/rules/fieldInventory.ts`, `features/product-filtering/core/rules/deriveControl.ts`, `features/product-filtering/core/rules/projectFacets.ts` |
| 6. decode the URL from the raw query once the facet set is known: a checkbox control is a list, a boolean a flag, a range `<key>Min` / `<key>Max`; a key that is not a control of this facet set is ignored and shows the full list | `loadFacetFilterState` in `features/product-filtering/url/filterSortParams.ts` |
| 7. the sidebar draws the groups of the facet set, including "More filters" | `features/product-filtering/ui/FilterSidebar.tsx` |

## Later — derive, store, request pipeline

Everything below is a later step that no page calls yet: the build-time derive chunks, the artifact store and the request-time evaluator over the flat index stay here as the design, wired in when a page calls them. Where derive needs the picklist it reads the same document `features/product-filtering/adapters/sanity/fetchPicklist.ts` reads.

## Derive (build time)

Derive is four chunks, each with its own entry, exit and proof. A chunk's exit shape is the next chunk's entry shape, defined once.

## Derive products data -> controls and options

```
START OF DERIVE PRODUCTS DATA -> CONTROLS AND OPTIONS

products data + picklist (the fields an editor chose as filters, stored in the CMS)
-> per category, per picklist field, the field's values:

  no values             ->  no control
  every value a number  ->  range     min / max
  otherwise             ->  checkbox  options = distinct values, first seen order

-> per category: controls + options

END OF DERIVE PRODUCTS DATA -> CONTROLS AND OPTIONS
```

**MAP** — execution flow step - file

| step | file |
|---|---|
| 1. an editor picks the filter fields in the CMS, which creates the picklist | `features/product-filtering/schema/filterPicklistType.ts` (listed in `studio/schema.ts`, opened from `studio/structure.ts`) |
| 2. read the product documents and the picklist document from the CMS — derive's CMS reader is built when derive is wired in; the picklist is the same document `features/product-filtering/adapters/sanity/fetchPicklist.ts` reads | built with the wiring |
| 3. shape them for derive: one entry per product per catalogue key it sits under, holding its filter attributes (unset ones dropped); the picklist is its list of field names | `features/product-filtering/core/rules/shapeProductsForDerive.ts` |
| 4. for each picklist field, gather its values per category | `features/product-filtering/core/rules/deriveControlsAndOptions.ts` |
| 5. a value that points to another document is cut down to that document's id, so every product pointing at the same document gives the same value (one option) | same file |
| 6. for each picklist field, pick a control from its values:<br>no values -> no control<br>every value a number -> range<br>otherwise -> checkbox | same file |
| 7. return each category's controls and options | same file |

## Proof - products data -> controls and options

```
start of proof: derive products data -> controls and options

fake CMS documents (one file each, as the CMS read returns them):
  picklist.json: fields farm, grown, price, size
  apple.json:    catalogue key fruit, filter attributes: farm ref(sunny, "Sunny Farm"), grown [organic], price 3, size small
  pear.json:     catalogue key fruit, filter attributes: farm ref(hill, "Hill Farm"), grown [organic, local], price 5, size large
  mango.json:    catalogue key fruit, filter attributes: farm ref(sunny, "Sunny Farm"), grown [imported], price 4, size small
  spinach.json:  catalogue key veg, filter attributes: farm ref(hill, "Hill Farm"), grown [organic], price 9

expected (written by hand):
  fruit:
    farm: checkbox -> sunny, hill
    grown: checkbox -> organic, local, imported
    price: range -> min 3, max 5
    size: checkbox -> small, large
  veg:
    farm: checkbox -> hill
    grown: checkbox -> organic
    price: range -> min 9, max 9
    (no size control: no veg product has a size)

run:
  fake CMS documents -> shape -> derive -> controls + options

check:
  output === expected (options in first-seen order)

end of proof
```

**MAP** — proof step - file

| step | file |
|---|---|
| 1. the fake CMS documents: the picklist and four products | `tests/product-filtering/backend/fakeCms/*.json` |
| 2. load the documents, the way the CMS read returns them | `tests/product-filtering/backend/productsDataToDerivedControlsAndOptions.test.ts` |
| 3. shape them for derive | `features/product-filtering/core/rules/shapeProductsForDerive.ts` |
| 4. run derive on the shaped products and picklist | `features/product-filtering/core/rules/deriveControlsAndOptions.ts` |
| 5. print the output | `tests/product-filtering/backend/productsDataToDerivedControlsAndOptions.test.ts` |
| 6. compare the output to the expected, written by hand in the test, options in first-seen order | same file |

The proof covers flow steps 3-7. Flow steps 1-2 (the editor creating the picklist, the fetch from the CMS) are not proved: the fake files stand in for what the fetch returns.

## Derive controls and options -> labels

```
START OF DERIVE CONTROLS AND OPTIONS -> LABELS

controls + options per category (the exit of the chunk above)
+ option text overrides (a table kept in code)
-> per control, its name: the field name, humanized
-> per checkbox option, its text:

  an override exists for that field and value  ->  the override
  otherwise                                     ->  the value as text, humanized

-> per category: controls, each with a name, each checkbox option with its text

END OF DERIVE CONTROLS AND OPTIONS -> LABELS
```

**MAP** — execution flow step - file

| step | file |
|---|---|
| 1. a developer lists the option text that humanizing can't produce, because the value alone can't spell it out | `features/product-filtering/core/definitions/optionLabelOverrides.ts` |
| 2. each control gets a name, its field name humanized, because a field name is not for reading (wearingStyle -> Wearing Style) | `features/product-filtering/core/rules/deriveLabels.ts`, using `features/product-filtering/core/rules/humanizeFacetValue.ts` |
| 3. each checkbox option gets its text: the override for its field and value, else its value written as text and humanized, so true / false work too | same file |
| 4. return each category's controls with their names and option text | same file |

## Proof - Derive labels

```
start of proof: derive controls and options -> labels

fake derived controls (one file, in the exit shape of the chunk above):
  fruit: farm [sunny, hill], fresh [true, false], grown [organic, local, imported], grownIn [open-field, glasshouse], price range 3 to 5, size [small, large]
  veg:   farm [hill], grown [organic], price range 9 to 9
fake override table (in the test): grown / imported -> "Imported from abroad"

expected (written by hand):
  fruit:
    farm: name Farm; Sunny, Hill
    fresh: name Fresh; True, False
    grown: name Grown; Organic, Local, Imported from abroad
    grownIn: name Grown In; Open Field, Glasshouse
    price: name Price, range 3 to 5
    size: name Size; Small, Large
  veg:
    farm: name Farm; Hill
    grown: name Grown; Organic
    price: name Price, range 9 to 9

run:
  fake derived controls + fake override table -> labels

check:
  output === expected (options in input order, each with its value and its text)

end of proof
```

**MAP** — proof step - file

| step | file |
|---|---|
| 1. the fake derived controls | `tests/product-filtering/backend/fakeDerivedControls.json` |
| 2. the fake override table, standing in for the real one | `tests/product-filtering/backend/controlsAndOptionsToLabels.test.ts` |
| 3. load the fake derived controls | same file |
| 4. run labels on the fake controls and the fake override table | `features/product-filtering/core/rules/deriveLabels.ts` |
| 5. print the output | `tests/product-filtering/backend/controlsAndOptionsToLabels.test.ts` |
| 6. compare the output to the expected, written by hand in the test, options in input order | same file |

The proof covers flow steps 2-4. Flow step 1 (a developer editing the real table, and the real table being the default) is not proved: the fake table stands in.

## Derive 3 - sort

```
start of derive 3

products data -> available fields -> sort picklist
sort picklist -> value type per field, asc/desc -> one control + options
options -> auto-label (A→Z, Low→High, Old→New) -> optional override -> labels map
sort config includes a default (used when the URL has no sort)
-> per category: sort control + options + labels + default

end of derive 3
```

Proof: not written yet.

## Derive 4 - flat index

```
start of derive 4

products data -> flat index (one flat row per product: id + filter/sort fields, no card data)
price / stock in the index = snapshot of the last rebuild
-> flat index

end of derive 4
```

Proof: not written yet.

## Derive output

```
config = controls with their names + options with their text, scoped per category (controls and options, labels, derive 3)
config + flat index (derive 4) -> output
```

## Store (build time)

```
start of store

derive output + build timestamp -> artifact
artifact = one atomic object with a build timestamp (index + config swap together)
write rule: never overwrite a newer artifact with an older one (rebuilds can finish out of order)
build -> writes the first artifact (the webhook only refreshes it); the store is durable
CMS publish -> webhook -> derive -> store (no redeploy)

end of store
```

## Proof - Store

```
start of proof: store -> derive output + timestamp -> stored artifact

fake input: artifacts A (built 10:00), B (built 10:05), C (built 09:55)

run, in order, on an empty store:
  write A -> stored is A (the seed)
  write B -> stored is B
  write C (finishes late) -> stored is still B

check:
  stored === expected after each write
  stored index and stored config come from the same artifact

end of proof
```

## Request

```
start of server component

route category -> its own id + its descendants' ids (from the category tree) -> base filter set
user URL -> parse -> validate against the route category's config (drop unknown fields/values)
base filter set + URL state + flat index + config -> evaluator
base filter: the row's category value(s) overlap the set (always on, not a user filter)

evaluator, one pure JS function:

  one pass over the flat index, per product: which active filters it fails
    fails none -> matches
    fails none or only filter F -> counts toward F's options
  no value for a range field -> fails an active range filter
  pass yields: matches + counts

  then, on the matches:
    sort (tie-breaker: _id; no value for the sort field -> last)
    total
    total, size -> page options = max(1, ceil(total / size)) (zero matches = one empty page)
    page > last -> page = last
    slice(page, size) -> page ids

page ids -> live fetch card data (price, stock; ids the fetch doesn't return are skipped) -> products grid props
config + counts + page options -> controls props

end of server component
```

## Counts

```
count(option of field F) = products with that option that pass all active filters except F's own
zero count -> shown, disabled
selected option -> never disabled, even at zero count (so it can be unselected)
counts = request-time overlay on the static config
```

## Client

```
start of client component

control names + option text -> printed as given
controls + options + counts -> interactive elements (checkbox, slider, toggle, sort, size, page)
user interaction -> URL only (nuqs, shallow: false, startTransition)
filter / sort / size change -> the same URL write sets page = 1
URL -> server component -> re-render

end of client component
```
