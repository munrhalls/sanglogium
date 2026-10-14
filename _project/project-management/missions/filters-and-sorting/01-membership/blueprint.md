# Blueprint — filters & sorting — membership

## 1. Slice membership

Membership is editorial: `catalogueLocationKeys` is the product's own
placement, and no independent machine-readable "what am I" field exists.
So belonging is settled by human review of complete lists — not by a
second query that would only self-agree.

- [x] 1.1 Zero non-belonging products in each slice.
  Means: print each slice's products (name, brand). Human reads the lists.
  Pass: nothing a shopper would call out of place.

- [x] 1.2 Zero missing products in each slice.
  Means: print all products not in the slice. Human reads for items that
  belong there. Pass: none found.

- [x] 1.3 Zero duplicates within each slice.
  Means: per slice, count returned `_id`s vs count distinct `_id`s.
  Pass: equal. (Also assert slice size < 1000 — the query's `0...1000`
  cap would silently hide products.)

## Gaps / dismissals

- **G1 (1.1–1.2):** no independent membership oracle exists — `catalogueLocationKeys` is both the selector and the declaration. 1.1–1.2 are therefore human-review proofs by nature, not mechanical ones; that's a stated limitation, not a gap to fill.
