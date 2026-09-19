# Filters & Sorting — Campaign Plan

## Milestone 1 — Data-layer correctness proof

Done =
- [ ] (a) deterministic, never-flaky: zero wrongly-included items across
  every option, every pair, all edge cases, the median case
- [ ] (b) human has read the Arrange step and confirmed the expected
  results are real, not just a green pass
- [ ] (c) human has directly compared the input data (filter options +
  inventory) and the expected-result subsets across all three checkpoints
  — this proof, Milestone 2's real-data run, and the live frontend —
  confirmed identical, zero drift anywhere

Refactor `11-single-option-subset-proof.mjs` and
`12-two-option-combination-matrix-proof.mjs` so the Arrange step (expected
result per option, per pair) is dead-simple to read. Decide and establish
the filters-and-sorting feature's root folder, and move these into its
`__tests__/`.

## Milestone 2 — Real CMS data integrity

Done =
- [ ] (a) a human directly runs the human-verified Milestone 1 proof
  against the two real artifacts — actual filter options and the actual
  CMS product catalog (per slice)
- [ ] (b) zero wrongly-included items confirmed by direct human check — no
  citation, no trusting a prior "sourced" claim about the data
