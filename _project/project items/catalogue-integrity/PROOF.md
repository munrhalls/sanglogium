# Catalogue integrity proof — slice membership

**Date:** 2026-09-29
**Sanity dataset:** `production` (read-only audit + guard; no writes were needed)

## Verify table (live, re-runnable)

| slice | visible | BELONGS | accepted | VIOLATION | AMBIGUOUS | V1 | V2 |
|---|---|---|---|---|---|---|---|
| headphones | 185 | 185 | 0 | 0 | 0 | 0 | 0 |
| audio-electronics | 234 | 234 | 0 | 0 | 0 | 0 | 0 |
| accessories | 288 | 288 | 0 | 0 | 0 | 0 | 0 |

**PASS: all slices clean (parity OK)** — exit code 0.

Parity = in-memory visible count == production GROQ predicate
`count(catalogueLocationKeys[@ in $keys]) > 0` for each slice's unrolled subtree.

## Before -> after (per proof-*.json)

| slice | before | after | moved | removed | accepted | backup |
|---|---|---|---|---|---|---|
| headphones | 185 vis / 0 viol / 0 amb | 185 / 0 / 0 | 0 | 0 | 0 | none (no writes) |
| audio-electronics | 234 / 0 / 0 | 234 / 0 / 0 | 0 | 0 | 0 | none |
| accessories | 288 / 0 / 0 | 288 / 0 / 0 | 0 | 0 | 0 | none |

## Accepted "keep" products

None — the review sheet had zero rows. Every product visible on a slice page
had >=2 independent agreeing signals (schema-gated fields, data/<slice>
frontmatter, filterAttributes.category, name keywords), so no human
adjudication was required.

**Aperio** (`MrEMtYwMtrFDGWmRnTDN2e`, "Aperio - GoldenSound Edition"):
verdict BELONGS on headphones — fieldVote/datasetVote/categoryVote all
`headphones`, nameVote null. Keys: Headphones (`ugyeto8653n495dpf89nzoar`),
Open-Back (`o7c6baiuobsr7ni2y2vf22sh`). Not moved or removed.

## Backups

None — `--write` was never run; no product was modified (review sheet empty).

## Re-run

```
node --env-file=.env.local scripts/catalogue-integrity/verify.mjs
```

Exits 0 only if every slice has VIOLATION = 0, AMBIGUOUS = 0, V1 = 0, V2 = 0
and parity passed.

## Scope exclusion

This proof covers **slice-level** membership only: whether each product's
`catalogueLocationKeys` intersect the right top-level slice subtree. It does
NOT cover leaf-level placement — e.g. a product missing from its correct
leaf (Aperio absent from the Electrostatic leaf) still counts as BELONGS here.
