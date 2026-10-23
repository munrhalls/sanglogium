# Filters, sorting, pagination — design

## Build time

```
start of CMS

products data -> available fields -> filter picklist
filter picklist -> field type -> control type (derived, override optional)
filter picklist -> values per field -> options (numeric: min, max, step)
options -> auto-label (humanized, or referenced doc title) -> optional override -> labels map

products data -> available fields -> sort picklist
sort picklist -> value type per field, asc/desc -> one control + options
options -> auto-label (A→Z, Low→High, Old→New) -> optional override -> labels map

products data -> index (id + filter/sort fields, no card data)

config = controls + options + labels, scoped per category
page size options + default = constants in code

CMS publish -> rebuild index + config

end of CMS
```

## Request

```
start of server component

user URL -> parse -> validate against config (drop unknown fields/values)
validated state -> evaluator(index, config, state)

evaluator, one pure JS function:
  filter + search -> matches
  matches -> sort (stable tie-breaker: _id; relevance only when searching)
  matches -> total, facet counts
  total, size -> page options = ceil(total / size)
  matches -> slice(page, size) -> page ids

page ids -> live fetch card data (price, stock) -> products grid props
config + counts + page options -> controls props

reset rules:
  filter / sort / size change -> page = 1
  page > last -> last

end of server component
```

## Client

```
start of client component

config labels -> null override renders auto-label, non-null renders override
controls + options -> interactive elements (checkbox, slider, toggle, sort, size, page)
user interaction -> URL only (nuqs, shallow: false, startTransition)
URL -> server component -> re-render

end of client component
```
