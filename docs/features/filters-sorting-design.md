# Filters, sorting, pagination — design

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

  (a reference's value is its id)
-> per category: controls + options

END OF DERIVE PRODUCTS DATA -> CONTROLS AND OPTIONS
```

**MAP** — execution flow step - file

| step | file |
|---|---|
| 1. an editor picks the filter fields in the CMS, which creates the picklist | `features/product-filtering/schema/filterPicklist.ts` |
| 2. read the products and the picklist from the CMS | `features/product-filtering/adapters/sanity/readProductsAndPicklist.ts` |
| 3. for each picklist field, gather its values per category (a reference counts as its id) | `features/product-filtering/core/rules/deriveControlsAndOptions.ts` |
| 4. for each picklist field, pick a control from its values:<br>no values -> no control<br>every value a number -> range<br>otherwise -> checkbox | same file |
| 5. return each category's controls and options | same file |

## Proof - Derive controls and options

```
start of proof: derive products data -> controls and options

fake input:
  picklist: farm, grown, price, size
  apple:   category fruit, farm ref(sunny, "Sunny Farm"), grown [organic], price 3, size small
  pear:    category fruit, farm ref(hill, "Hill Farm"), grown [organic, local], price 5, size large
  mango:   category fruit, farm ref(sunny, "Sunny Farm"), grown [imported], price 4, size small
  spinach: category veg, farm ref(hill, "Hill Farm"), grown [organic], price 9

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
  fake input -> derive, verbatim -> controls + options

check:
  output === expected (options in first-seen order)

end of proof
```

## Derive 2 - labels

```
start of derive 2

options -> auto-label (humanized, or referenced doc title) -> optional override -> labels map
-> per category: labels map

end of derive 2
```

Proof: not written yet.

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
config = controls + options + labels, scoped per category (controls and options, derive 2, derive 3)
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

labels map -> null override renders auto-label, non-null renders override
controls + options + counts -> interactive elements (checkbox, slider, toggle, sort, size, page)
user interaction -> URL only (nuqs, shallow: false, startTransition)
filter / sort / size change -> the same URL write sets page = 1
URL -> server component -> re-render

end of client component
```
