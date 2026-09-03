# Filter + Sort End-State

## Data model

Two dedicated schema objects on `product`, separate from `overviewFields` /
`specifications` / `description`, exist only to feed filtering and sorting:

- `filterAttributes` — one field per facet.
- `sortAttributes` — `featuredPriority` + `popularity` ONLY.

## Source rule

The dedicated groups are the ONLY source filters/sorts read from.

Filter controls, the sort control, and the catalogue query read ONLY from these
dedicated groups plus the two natural sort fields. Free-text fields
(`overviewFields`, `specifications`, `description`) are never read for filtering
or sorting.

## Sort rule

sortAttributes holds only featuredPriority + popularity.

Price and date sorts read price_data / _createdAt. They are NOT copied into
`sortAttributes`.

## Completeness

Every product visible on `localhost:3000/products` has `filterAttributes` filled
for every facet applicable to its category, and a `featuredPriority` value.

## Chains

- facet <-> `filterAttributes` field <-> URL param <-> query predicate
- sort <-> URL value <-> backing field <-> order + tie-break

## Out of scope

Adding fields to `productType.ts` (L1). Measuring current data (L2). Any product
mutation. Final enum vocabularies (L1 owns those). How popularity is computed
(standalone issue).
